// js/features/roulette/renderRoulette.js

import {
  getState
} from "../../state/state.js";

export function renderRoulette(){

  const target =
    document.getElementById(
      "rouletteContent"
    );

  if(!target){
    return;
  }

  const state =
    getState();

  /*
    룰렛 돌리는 중에는
    DOM 재생성 금지
  */

  if(
    state.ui?.isSpinning &&
    target.innerHTML.trim()
  ){
    return;
  }

  const items =
    Array.isArray(state.items)
      ? state.items
      : [];

  const cap =
    items.find(
      i =>
        i.id ===
        state.rouletteResult?.capId
    ) || null;

  const swim =
    items.find(
      i =>
        i.id ===
        state.rouletteResult?.swimId
    ) || null;

  target.innerHTML = `
    <div class="block roulette-block">

      <div class="roulette-wrap">

        <!-- =========================
             CAP
        ========================== -->

        <div
          class="roulette-slot"
          data-type="cap"
        >

          <div class="roulette-label">
            🧢 수모
          </div>

          <div class="roulette-card">

            ${
              cap
                ? `
                  <img
                    class="roulette-image"
                    src="${cap.image || ""}"
                    alt="${cap.name}"
                    draggable="false"
                  />

                  <div class="card-overlay">

                    <div class="roulette-name">
                      ${cap.name}
                    </div>

                  </div>
                `
                : `
                  <div class="roulette-placeholder">
                    🧢
                  </div>
                `
            }

          </div>

        </div>

        <!-- =========================
             SWIM
        ========================== -->

        <div
          class="roulette-slot"
          data-type="swim"
        >

          <div class="roulette-label">
            🩳 수영복
          </div>

          <div class="roulette-card">

            ${
              swim
                ? `
                  <img
                    class="roulette-image"
                    src="${swim.image || ""}"
                    alt="${swim.name}"
                    draggable="false"
                  />

                  <div class="card-overlay">

                    <div class="roulette-name">
                      ${swim.name}
                    </div>

                  </div>
                `
                : `
                  <div class="roulette-placeholder">
                    🏊
                  </div>
                `
            }

          </div>

        </div>

      </div>

      <!-- =========================
           BUTTON
      ========================== -->

      <button
        class="spin-btn"
        data-action="spin"
        type="button"
      >
        오늘 뭐 입지 ?
      </button>

    </div>
  `;

  requestAnimationFrame(()=>{

    syncRouletteCardSize();

  });

}

/* =========================
   SIZE SYNC
========================= */

function syncRouletteCardSize(){

  const coverCard =
    document.querySelector(
      ".cover-card .card-inner"
    );

  const rouletteCards =
    document.querySelectorAll(
      ".roulette-card"
    );

  if(
    !coverCard ||
    !rouletteCards.length
  ){
    return;
  }

  const size =
    Math.round(
      coverCard.getBoundingClientRect()
        .width
    );

  rouletteCards.forEach(card => {

    card.style.width =
      `${size}px`;

    card.style.height =
      `${size}px`;

    card.style.borderRadius =
      "20px";

  });

  const labels =
    document.querySelectorAll(
      ".roulette-label"
    );

  labels.forEach(label => {

    label.style.fontSize =
      "11px";

    label.style.fontWeight =
      "700";

  });

  const names =
    document.querySelectorAll(
      ".roulette-name"
    );

  names.forEach(name => {

    name.style.fontSize =
      "11px";

    name.style.fontWeight =
      "700";

  });

}

/* =========================
   RESIZE
========================= */

if(
  !window.__rouletteResizeBound
){

  window.addEventListener(
    "resize",
    ()=>{

      syncRouletteCardSize();

    }
  );

  window.__rouletteResizeBound =
    true;

}
