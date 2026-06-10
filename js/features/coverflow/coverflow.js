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

  target._isInertia =
    false;

  target._depthTicking =
    false;

  target._initialized =
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

    target.classList.remove(
      "is-simple"
    );

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

  const isSimple =
    items.length <= 2;

  target.classList.toggle(
    "is-simple",
    isSimple
  );

  /* =========================
     FULL RENDER
  ========================= */

  if(!sameSignature){

    target.innerHTML =
      items.map((item,index) => {

        return `

          <div
            class="cover-card"
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

      if(!cards.length){
        return;
      }

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

      if(isSimple){

        target.scrollLeft = 0;

        cards.forEach(card => {

          card.classList.remove(
            "active",
            "depth-1",
            "depth-2",
            "hidden"
          );

        });

        requestAnimationFrame(()=>{

          updateDepth(
            target
          );

        });

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

          const cards = [
            ...wrap.querySelectorAll(
              ".cover-card"
            )
          ];

          const deletedCard =
            deleteBtn.closest(
              ".cover-card"
            );

          const deletedIndex =
            cards.indexOf(
              deletedCard
            );

          const remainCards =
            cards.filter(
              card =>
                card !== deletedCard
            );

          const fallback =
            remainCards[
              Math.max(
                0,
                deletedIndex - 1
              )
            ] ||
            remainCards[0];

          if(fallback){

            setSelected(
              wrap.dataset.type,
              fallback.dataset.id
            );

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

  cards.forEach(card => {

    card.style.marginLeft =
      "0px";

    card.style.marginRight =
      "0px";

  });

  /* =========================
     SINGLE
  ========================= */

  if(cards.length === 1){

    const card =
      cards[0];

    const side =
      Math.max(
        0,
        (
          wrap.clientWidth -
          card.offsetWidth
        ) / 2
      );

    card.style.marginLeft =
      `${Math.round(side)}px`;

    card.style.marginRight =
      `${Math.round(side)}px`;

    return;

  }

  /* =========================
     DOUBLE
  ========================= */

  if(cards.length === 2){

    const first =
      cards[0];

    const last =
      cards[1];

    const gap = 12;

    const totalWidth =
      first.offsetWidth +
      last.offsetWidth +
      gap;

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

    first.style.marginRight =
      `${gap}px`;

    last.style.marginRight =
      `${Math.round(remain)}px`;

    return;

  }

  /* =========================
     NORMAL
  ========================= */

  const first =
    cards[0];

  const last =
    cards[cards.length - 1];

  const side =
    Math.max(
      0,
      (
        wrap.clientWidth -
        first.offsetWidth
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

  document.body.dataset.lockTab =
    "true";

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

      flow._isInertia =
        false;

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

        const max =
          flow.scrollWidth -
          flow.clientWidth;

        if(
          flow.scrollLeft >= max
        ){

          flow.scrollLeft = 0;

        }

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

  document.body.dataset.lockTab =
    "false";

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

    i.flow._isInertia =
      false;

    i.flow._depthTicking =
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

      requestAnimationFrame(()=>{

        updateDepth(
          i.flow
        );

      });

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

      clearTimeout(
        window.__coverResizeTimer
      );

      window.__coverResizeTimer =
        setTimeout(()=>{

          document
            .querySelectorAll(
              ".coverflow"
            )
            .forEach(wrap => {

              applyEdgeSpacing(
                wrap
              );

              const cards =
                wrap.querySelectorAll(
                  ".cover-card"
                );

              if(
                cards.length > 2
              ){

                snapToNearestCard(
                  wrap,
                  false
                );

              }else{

                wrap.scrollLeft = 0;

              }

              requestAnimationFrame(()=>{

                updateDepth(
                  wrap
                );

              });

            });

        },120);

    }
  );

  window.__coverflowResizeBound =
    true;

}
