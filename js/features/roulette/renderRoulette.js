// js/features/roulette/renderRoulette.js

import {
  getState
} from "../../state/state.js";

/* =========================
   RENDER
========================= */

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
    룰렛 회전 중 DOM 재생성 방지
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
                  ${
                    cap.image
                      ? `
                        <img
                          class="roulette-image"
                          src="${cap.image}"
                          alt="${cap.name}"
                          draggable="false"
                        />
                      `
                      : `
                        <div class="roulette-placeholder">
                          🧢
                        </div>
                      `
                  }

                  <div class="roulette-overlay">

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
                  ${
                    swim.image
                      ? `
                        <img
                          class="roulette-image"
                          src="${swim.image}"
                          alt="${swim.name}"
                          draggable="false"
                        />
                      `
                      : `
                        <div class="roulette-placeholder">
                          🏊
                        </div>
                      `
                  }

                  <div class="roulette-overlay">

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

  const rouletteSlots =
    document.querySelectorAll(
      ".roulette-slot"
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

  const rect =
    coverCard.getBoundingClientRect();

  /*
    hidden 상태 방어
  */

  if(
    rect.width <= 0
  ){
    return;
  }

  const width =
    Math.round(rect.width);

  const radius =
    getComputedStyle(
      coverCard
    ).borderRadius;

  rouletteSlots.forEach(slot => {

    slot.style.width =
      `${width}px`;

  });

  rouletteCards.forEach(card => {

    card.style.width =
      `${width}px`;

    card.style.height =
      `${width}px`;

    card.style.borderRadius =
      radius;

    card.style.position =
      "relative";

    card.style.overflow =
      "hidden";

  });

  const overlays =
    document.querySelectorAll(
      ".roulette-overlay"
    );

  overlays.forEach(overlay => {

    overlay.style.position =
      "absolute";

    overlay.style.left =
      "0";

    overlay.style.right =
      "0";

    overlay.style.bottom =
      "0";

    overlay.style.padding =
      "6px 8px";

    overlay.style.background =
      `
        linear-gradient(
          to top,
          rgba(20,50,80,.88),
          rgba(20,50,80,.0)
        )
      `;

    overlay.style.pointerEvents =
      "none";

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

    label.style.marginBottom =
      "8px";

    label.style.letterSpacing =
      "-0.02em";

    label.style.textAlign =
      "center";

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

    name.style.lineHeight =
      "1.3";

    name.style.whiteSpace =
      "nowrap";

    name.style.overflow =
      "hidden";

    name.style.textOverflow =
      "ellipsis";

    name.style.textAlign =
      "center";

    name.style.color =
      "#fff";

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

      requestAnimationFrame(()=>{

        syncRouletteCardSize();

      });

    }
  );

  window.__rouletteResizeBound =
    true;

}
