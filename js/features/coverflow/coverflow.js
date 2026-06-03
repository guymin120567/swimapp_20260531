// js/features/coverflow/coverflow.js

import {
  getState
} from "../../state/state.js";

import {
  setSelected,
  removeItem
} from "../../state/actions.js";

import {
  bindDrag
} from "./drag.js";

let spinRAF = [];

/* =========================
   RENDER
========================= */

export function renderCoverflow(
  changedType = null
){

  if(
    !changedType ||
    changedType === "cap"
  ){
    renderType("cap");
  }

  if(
    !changedType ||
    changedType === "swim"
  ){
    renderType("swim");
  }

  bindSelect();

  bindSpinEvents();

  requestAnimationFrame(() => {

    bindDrag();

  });

}

/* =========================
   TYPE
========================= */

function renderType(type){

  const target =
    document.querySelector(
      `.coverflow[data-type="${type}"]`
    );

  if(!target){
    return;
  }

  const state =
    getState();

  const items =
    (state.items || [])
      .filter(
        i => i.type === type
      );

  const selectedId =
    type === "cap"
      ? state.selection?.capId
      : state.selection?.swimId;

  /* =========================
     RENDER SIGNATURE
  ========================= */

  const signature =
    JSON.stringify({

      ids:
        items.map(i => i.id),

      selectedId

    });

  if(
    target.dataset.signature ===
    signature
  ){
    return;
  }

  target.dataset.signature =
    signature;

  /* =========================
     EMPTY FIX
  ========================= */

  if(!items.length){

    target.innerHTML = `

      <div class="empty-coverflow">
        아직 아이템이 없습니다
      </div>

    `;

    return;

  }

  target.innerHTML =
    items.map(item => `

      <div
        class="
          cover-card
          ${item.id === selectedId ? "active" : ""}
        "
        data-id="${item.id}"
        data-type="${type}"
      >

        <div class="card-inner">

          <button
            class="delete-btn"
            data-action="delete"
            data-id="${item.id}"
          >
            ×
          </button>

          ${
            item.image
              ? `
                <img
                  class="card-image"
                  src="${item.image}"
                  alt="${item.name}"
                  draggable="false"
                />
              `
              : `
                <div class="card-placeholder">
                  🏊
                </div>
              `
          }

          <div class="card-overlay">

            <div class="card-title">
              ${item.name}
            </div>

          </div>

        </div>

      </div>

    `).join("");

  requestAnimationFrame(() => {

    const active =
      target.querySelector(
        ".cover-card.active"
      );

    if(active){

      centerCard(
        target,
        active,
        false
      );

    }

  });

}

/* =========================
   CLICK
========================= */

function bindSelect(){

  document
    .querySelectorAll(".coverflow")
    .forEach(wrap => {

      if(
        wrap.dataset.bound
      ){
        return;
      }

      wrap.dataset.bound =
        "true";

      wrap.addEventListener(
        "click",
        e => {

          const deleteBtn =
            e.target.closest(
              ".delete-btn"
            );

          if(deleteBtn){

            const ok =
              confirm(
                "삭제하시겠습니까?"
              );

            if(!ok){
              return;
            }

            removeItem(
              deleteBtn.dataset.id
            );

            return;

          }

          const card =
            e.target.closest(
              ".cover-card"
            );

          if(!card){
            return;
          }

          const type =
            card.dataset.type;

          const id =
            card.dataset.id;

          /* =========================
             STATE
          ========================= */

          setSelected(
            type,
            id
          );

          /* =========================
             ACTIVE SYNC
          ========================= */

          wrap
            .querySelectorAll(
              ".cover-card"
            )
            .forEach(c => {

              c.classList.remove(
                "active"
              );

            });

          card.classList.add(
            "active"
          );

          /* =========================
             CENTER
          ========================= */

          wrap._isProgrammatic =
            true;

          requestAnimationFrame(() => {

wrap._isProgrammatic =
  true;

cancelAnimationFrame(
  wrap._inertiaRAF
);

centerCard(
  wrap,
  card
);

setTimeout(() => {

  wrap._isProgrammatic =
    false;

}, 420);

            setTimeout(() => {

              wrap._isProgrammatic =
                false;

            }, 420);

          });

        }
      );

    });

}

/* =========================
   SPIN EVENTS
========================= */

function bindSpinEvents(){

  if(
    window.__coverflowSpinBound
  ){
    return;
  }

  window.addEventListener(
    "spin-start",
    startSpin
  );

  window.addEventListener(
    "spin-stop",
    stopSpin
  );

  window.__coverflowSpinBound =
    true;

}

/* =========================
   START SPIN
========================= */

function startSpin(){

  stopSpin();

  const flows =
    document.querySelectorAll(
      ".coverflow"
    );

  flows.forEach(flow => {

    let velocity = 0;

    let raf = null;

    const maxSpeed =
      38;

    function tick(){

      velocity += 0.9;

      if(
        velocity > maxSpeed
      ){

        velocity =
          maxSpeed;

      }

      flow.scrollLeft +=
        velocity;

      raf =
        requestAnimationFrame(
          tick
        );

    }

    raf =
      requestAnimationFrame(
        tick
      );

    spinRAF.push({
      flow,
      raf
    });

  });

}

/* =========================
   STOP
========================= */

function stopSpin(){

  spinRAF.forEach(item => {

    cancelAnimationFrame(
      item.raf
    );

  });

  spinRAF = [];

  document
    .querySelectorAll(
      ".coverflow"
    )
    .forEach(flow => {

      const cards = [

        ...flow.querySelectorAll(
          ".cover-card"
        )

      ];

      if(
        !cards.length
      ){
        return;
      }

      const center =
        flow.scrollLeft +
        flow.clientWidth / 2;

      let closest =
        null;

      let minDist =
        Infinity;

      cards.forEach(card => {

        const cardCenter =
          card.offsetLeft +
          card.clientWidth / 2;

        const dist =
          Math.abs(
            center -
            cardCenter
          );

        if(
          dist < minDist
        ){

          minDist =
            dist;

          closest =
            card;

        }

      });

      if(!closest){
        return;
      }

      centerCard(
        flow,
        closest
      );

    });

}

/* =========================
   CENTER
========================= */

function centerCard(
  wrap,
  card,
  smooth = true
){

  const rawTarget =
    card.offsetLeft +
    card.clientWidth / 2 -
    wrap.clientWidth / 2;

  const maxScroll =
    wrap.scrollWidth -
    wrap.clientWidth;

  const target =
    Math.max(
      0,
      Math.min(
        rawTarget,
        maxScroll
      )
    );

  wrap.scrollTo({

    left:target,

    behavior:
      smooth
        ? "smooth"
        : "auto"

  });

}
