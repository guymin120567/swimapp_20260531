// js/features/coverflow/coverflow.js

import {
  getState
} from "../../state/state.js";

import {
  removeItem,
  setSelected,
  setSpinning
} from "../../state/actions.js";

import {
  bindDrag,
  scrollToCard,
  updateDepth,
  snapToNearestCard
} from "./drag.js";

import {
  queueRender
} from "../../render/renderQueue.js";

import {
  getCoverflow,
  getCoverCards
} from "../../shared/domCache.js";

let spinRAF = [];

/* =========================
   RENDER
========================= */

export function renderCoverflow(
  changedType = null
){

  const state =
    getState();

  if(
    state.runtime?.isSpinning
  ){
    return;
  }

  if(
    !changedType ||
    changedType === "cap"
  ){

    queueRender(
      "coverflow-cap",
      ()=>{

        renderType("cap");

      }
    );

  }

  if(
    !changedType ||
    changedType === "swim"
  ){

    queueRender(
      "coverflow-swim",
      ()=>{

        renderType("swim");

      }
    );

  }

  bindDeleteEvents();

  bindSpinEvents();

  bindResize();

  cancelAnimationFrame(
    window.__bindDragRAF
  );

  window.__bindDragRAF =
    requestAnimationFrame(()=>{

      const current =
        getState();

      if(
        current.runtime?.isSpinning
      ){
        return;
      }

      bindDrag();

    });

}

/* =========================
   TYPE
========================= */

function renderType(type){

  const target =
    getCoverflow(type);

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

    requestAnimationFrame(()=>{

      setSelected(
        type,
        selectedId
      );

    });

  }

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
          name:i.name,
          image:i.image || ""
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

  if(!sameSignature){

    target.innerHTML =
      items.map((item,index) => {

        return `

          <div
            class="cover-card"
            data-id="${item.id}"
            data-type="${type}"
          >

            <div class="card-frame">

              <div class="card-inner">

                <button
                  class="delete-btn"
                  data-action="delete"
                  data-id="${item.id}"
                  type="button"
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

          </div>

        `;

      }).join("");

  }

  requestAnimationFrame(()=>{

    applyEdgeSpacing(
      target
    );

    requestAnimationFrame(()=>{

      target._initialized =
        true;

      const cards =
        getCoverCards(target);

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
        wrap._deleteBound
      ){
        return;
      }

      wrap._deleteBound =
        true;

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

  if(
    wrap.clientWidth <= 0
  ){
    return;
  }

  const cards =
    getCoverCards(wrap);

  if(!cards.length){
    return;
  }

  cards.forEach(card => {

    card.style.marginLeft =
      "0px";

    card.style.marginRight =
      "0px";

  });

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

  setSpinning(true);

  document.body.dataset.lockTab =
    "true";

  document
    .querySelectorAll(".coverflow")
    .forEach(flow => {

      const cards =
        getCoverCards(flow);

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

          flow.scrollLeft = 2;

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
      getCoverCards(i.flow).length > 2
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

  setSpinning(false);

}

/* =========================
   FORCE CLEANUP
========================= */

function forceCleanup(){

  if(
    window.__forceCleaning
  ){
    return;
  }

  window.__forceCleaning =
    true;

  requestAnimationFrame(()=>{

    stopSpin();

    window.__forceCleaning =
      false;

  });

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

      cancelAnimationFrame(
        window.__coverResizeRAF
      );

      window.__coverResizeRAF =
        requestAnimationFrame(()=>{

          const state =
            getState();

          if(
            state.runtime?.isSpinning
          ){
            return;
          }

          document
            .querySelectorAll(
              ".coverflow"
            )
            .forEach(wrap => {

              applyEdgeSpacing(
                wrap
              );

              const cards =
                getCoverCards(wrap);

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

        });

    }
  );

  window.__coverflowResizeBound =
    true;

}
