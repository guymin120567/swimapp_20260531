// js/features/coverflow/coverflow.js

import {
  getState
} from "../../state/state.js";

import {
  removeItem,
  setSelected
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

  bindSimpleSelect();

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

  clearTimeout(
    target._programmaticTimer
  );

  target._isProgrammatic =
    false;

  target.classList.remove(
    "dragging",
    "spinning-lock"
  );

  const state =
    getState();

  const items =
    (state.items || [])
      .filter(
        i => i.type === type
      );

  let selectedId =
    type === "cap"
      ? state.selection?.capId
      : state.selection?.swimId;

  /* =========================
     INVALID SELECT FIX
  ========================= */

  const selectedExists =
    items.some(
      i => i.id === selectedId
    );

  if(
    !selectedExists &&
    items.length
  ){

    selectedId =
      items[0].id;

    setSelected(
      type,
      selectedId
    );

  }

  /* =========================
     EMPTY
  ========================= */

  if(!items.length){

    target.innerHTML = `

      <div class="empty-coverflow">
        아직 아이템이 없습니다
      </div>

    `;

    target.dataset.signature =
      "";

    return;

  }

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

  const sameSignature =
    target.dataset.signature ===
    signature;

  target.dataset.signature =
    signature;

  target.classList.toggle(
    "is-simple",
    items.length <= 2
  );

  /* =========================
     FULL RENDER
  ========================= */

  if(!sameSignature){

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

  }

  /* =========================
     LAYOUT
  ========================= */

  requestAnimationFrame(()=>{

    applyEdgeSpacing(
      target
    );

    requestAnimationFrame(()=>{

      target._initialized =
        true;

      const cards = [
        ...target.querySelectorAll(
          ".cover-card"
        )
      ];

      /* =========================
         INDEX FIX
      ========================= */

      cards.forEach((card,index)=>{

        const badge =
          card.querySelector(
            ".card-index"
          );

        if(badge){

          badge.textContent =
            `${index + 1} / ${cards.length}`;

        }

      });

      const selectedCard =
        cards.find(
          card =>
            card.dataset.id ===
            selectedId
        );

      /* =========================
         SIMPLE MODE
      ========================= */

      if(
        items.length <= 2
      ){

        cards.forEach(card => {

          card.classList.remove(
            "active",
            "depth-1",
            "depth-2",
            "hidden"
          );

        });

        if(selectedCard){

          selectedCard.classList.add(
            "active"
          );

        }else if(cards[0]){

          cards[0].classList.add(
            "active"
          );

        }

        updateDepth(
          target
        );

        return;

      }

      /* =========================
         NORMAL MODE
      ========================= */

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
   SIMPLE SELECT
========================= */

function bindSimpleSelect(){

  if(
    window.__coverflowSimpleBound
  ){
    return;
  }

  document.addEventListener(
    "click",
    e => {

      const card =
        e.target.closest(
          ".cover-card"
        );

      if(!card){
        return;
      }

      const wrap =
        card.closest(
          ".coverflow"
        );

      if(!wrap){
        return;
      }

      if(
        !wrap.classList.contains(
          "is-simple"
        )
      ){
        return;
      }

      if(
        e.target.closest(
          ".delete-btn"
        )
      ){
        return;
      }

      const type =
        card.dataset.type;

      const id =
        card.dataset.id;

      const changed =
        setSelected(
          type,
          id
        );

      if(!changed){
        return;
      }

      wrap
        .querySelectorAll(
          ".cover-card"
        )
        .forEach(el => {

          el.classList.remove(
            "active"
          );

        });

      card.classList.add(
        "active"
      );

      updateDepth(
        wrap
      );

    }
  );

  window.__coverflowSimpleBound =
    true;

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

          e.preventDefault();

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

          requestAnimationFrame(()=>{

            renderCoverflow(
              wrap.dataset.type
            );

          });

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

      const cards =
        flow.querySelectorAll(
          ".cover-card"
        );

      if(
        cards.length <= 2
      ){
        return;
      }

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

    clearTimeout(
      i.flow._programmaticTimer
    );

    i.flow.classList.remove(
      "spinning-lock",
      "dragging"
    );

    i.flow._isProgrammatic =
      false;

    i.flow._isSpinning =
      false;

    if(
      i.flow.querySelectorAll(
        ".cover-card"
      ).length > 2
    ){

      snapToNearestCard(
        i.flow
      );

    }else{

      updateDepth(
        i.flow
      );

    }

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

          if(
            wrap.querySelectorAll(
              ".cover-card"
            ).length > 2
          ){

            snapToNearestCard(
              wrap,
              false
            );

          }

          updateDepth(
            wrap
          );

        });

    }
  );

  window.__coverflowResizeBound =
    true;

}
