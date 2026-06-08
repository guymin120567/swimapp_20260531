// js/features/coverflow/coverflow.js

import {
  getState
} from "../../state/state.js";

import {
  removeItem
} from "../../state/actions.js";

import {
  bindDrag,
  scrollToCard,
  updateDepth,
  snapToNearestCard
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

  bindDeleteEvents();

  bindSpinEvents();

  bindResize();

  requestAnimationFrame(()=>{

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

  cancelAnimationFrame(
    target._inertiaRAF
  );

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

  const signature =
    JSON.stringify({

      ids:
        items.map(i => ({
          id:i.id,
          image:i.image,
          name:i.name
        })),

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

  if(!items.length){

    target.innerHTML = `

      <div class="empty-coverflow">
        아직 아이템이 없습니다
      </div>

    `;

    return;

  }

  target.innerHTML =
    items.map((item,index) => {

      const isActive =
        item.id === selectedId;

      return `

        <div
          class="
            cover-card
            ${isActive ? "active" : ""}
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

            <div class="card-index">
              ${index + 1} / ${items.length}
            </div>

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

      `;

    }).join("");

  requestAnimationFrame(()=>{

    applyEdgeSpacing(
      target
    );

    requestAnimationFrame(()=>{

      target._initialized =
        true;

      const cards = [
        ...target.querySelectorAll(
          ".cover-card")
      ];

      const selectedCard =
        cards.find(
          card =>
            card.dataset.id ===
            selectedId
        );

      if(selectedCard){

        scrollToCard(
          target,
          selectedCard,
          false
        );

      }else{

        snapToNearestCard(
          target,
          false
        );

      }

      requestAnimationFrame(()=>{

        updateDepth(
          target
        );

      });

    });

  });

}

/* =========================
   DELETE
========================= */

function bindDeleteEvents(){

  document
    .querySelectorAll(".coverflow")
    .forEach(wrap => {

      if(
        wrap.dataset.deleteBound
      ){
        return;
      }

      wrap.dataset.deleteBound =
        "true";

      wrap.addEventListener(
        "pointerup",
        e => {

          const deleteBtn =
            e.target.closest(
              ".delete-btn"
            );

          if(!deleteBtn){
            return;
          }

          e.stopPropagation();

          if(
            !confirm(
              "삭제하시겠습니까?"
            )
          ){
            return;
          }

          removeItem(
            deleteBtn.dataset.id
          );

          renderCoverflow(
            wrap.dataset.type
          );

        }
      );

    });

}

/* =========================
   EDGE SPACING
========================= */

function applyEdgeSpacing(
  wrap
){

  const cards = [
    ...wrap.querySelectorAll(
      ".cover-card"
    )
  ];

  if(!cards.length){
    return;
  }

  const first =
    cards[0];

  const last =
    cards[cards.length - 1];

  const cardWidth =
    first.offsetWidth;

  const gap = 10;

  cards.forEach(card => {

    card.style.marginLeft =
      "0px";

    card.style.marginRight =
      "0px";

  });

  /* =========================
     SINGLE CARD
  ========================= */

  if(cards.length === 1){

    const side =
      Math.max(
        0,
        (
          wrap.clientWidth -
          cardWidth
        ) / 2
      );

    first.style.marginLeft =
      `${Math.round(side)}px`;

    first.style.marginRight =
      `${Math.round(side)}px`;

    return;

  }

  /* =========================
     DOUBLE CARD
  ========================= */

  if(cards.length === 2){

    const totalWidth =
      (cardWidth * 2) + gap;

    const remain =
      Math.max(
        0,
        (
          wrap.clientWidth -
          totalWidth
        ) / 2
      );

    first.style.marginLeft =
      `${Math.round(remain)}px`;

    last.style.marginRight =
      `${Math.round(remain)}px`;

    return;

  }

  /* =========================
     NORMAL
  ========================= */

  const side =
    Math.max(
      0,
      (
        wrap.clientWidth -
        cardWidth
      ) / 2
    );

  first.style.marginLeft =
    `${Math.round(side)}px`;

  last.style.marginRight =
    `${Math.round(side)}px`;

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

  window.addEventListener(
    "pagehide",
    forceCleanup
  );

  window.addEventListener(
    "blur",
    forceCleanup
  );

  window.addEventListener(
    "pointercancel",
    forceCleanup
  );

  document.addEventListener(
    "visibilitychange",
    ()=>{

      if(
        document.hidden
      ){

        forceCleanup();

      }

    }
  );

  window.__coverflowSpinBound =
    true;

}

/* =========================
   START SPIN
========================= */

function startSpin(){

  stopSpin();

  document
    .querySelectorAll(".coverflow")
    .forEach(flow => {

      flow.classList.add(
        "spinning-lock"
      );

      flow._isSpinning =
        true;

      let velocity = 0;

      let raf;

      const maxSpeed = 38;

      function tick(){

        if(
          !flow._isSpinning
        ){
          return;
        }

        velocity =
          Math.min(
            velocity + 0.9,
            maxSpeed
          );

        flow.scrollLeft +=
          velocity;

        raf =
          requestAnimationFrame(
            tick
          );

        flow._spinRAF =
          raf;

      }

      raf =
        requestAnimationFrame(
          tick
        );

      flow._spinRAF =
        raf;

      spinRAF.push({

        flow,
        raf

      });

    });

}

/* =========================
   STOP SPIN
========================= */

function stopSpin(){

  spinRAF.forEach(i => {

    cancelAnimationFrame(
      i.raf
    );

    cancelAnimationFrame(
      i.flow._spinRAF
    );

    cancelAnimationFrame(
      i.flow._inertiaRAF
    );

    i.flow.classList.remove(
      "spinning-lock",
      "dragging"
    );

    i.flow._isProgrammatic =
      false;

    i.flow._isSpinning =
      false;

    snapToNearestCard(
      i.flow
    );

  });

  spinRAF = [];

}

/* =========================
   FORCE CLEANUP
========================= */

function forceCleanup(){

  stopSpin();

}

/* =========================
   RESIZE
========================= */

function bindResize(){

  if(
    window.__coverflowResizeBound
  ){
    return;
  }

  window.addEventListener(
    "resize",
    ()=>{

      document
        .querySelectorAll(
          ".coverflow"
        )
        .forEach(wrap => {

          applyEdgeSpacing(
            wrap
          );

          snapToNearestCard(
            wrap,
            false
          );

          updateDepth(
            wrap
          );

        });

    }
  );

  window.__coverflowResizeBound =
    true;

}
