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
    룰렛 회전 중
    DOM 재생성 방지
  */

  if(
    state.ui?.isSpinning &&
    target.innerHTML.trim()
  ){
    return;
  }

  const items =
    Array.isArray(
      state.items
    )
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

          <div
            class="
              roulette-card
              card-frame
            "
          >

            ${
              cap
                ? `

                  ${
                    cap.image
                      ? `
                        <img
                          class="
                            card-media
                            roulette-image
                          "
                          src="${cap.image}"
                          alt="${cap.name}"
                          draggable="false"
                          loading="lazy"
                          decoding="async"
                        />
                      `
                      : `
                        <div class="card-placeholder">
                          🧢
                        </div>
                      `
                  }

                  <div class="card-overlay">

                    <div class="card-title">
                      ${cap.name}
                    </div>

                  </div>

                `
                : `
                  <div class="card-placeholder">
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

          <div
            class="
              roulette-card
              card-frame
            "
          >

            ${
              swim
                ? `

                  ${
                    swim.image
                      ? `
                        <img
                          class="
                            card-media
                            roulette-image
                          "
                          src="${swim.image}"
                          alt="${swim.name}"
                          draggable="false"
                          loading="lazy"
                          decoding="async"
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
                      ${swim.name}
                    </div>

                  </div>

                `
                : `
                  <div class="card-placeholder">
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

  const activeCard =
    document.querySelector(
      ".cover-card.active .card-frame"
    );

  const fallbackCard =
    document.querySelector(
      ".cover-card .card-frame"
    );

  const coverCard =
    activeCard ||
    fallbackCard;

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

  const width =
    Math.round(
      coverCard.offsetWidth
    );

  if(width <= 0){
    return;
  }

  const radius =
    getComputedStyle(
      coverCard
    ).borderRadius;

  rouletteSlots.forEach(slot => {

    slot.style.width =
      `${width}px`;

    slot.style.flexShrink =
      "0";

  });

  rouletteCards.forEach(card => {

    card.style.width =
      `${width}px`;

    /*
      정사각형 유지
    */

    card.style.aspectRatio =
      "1 / 1";

    card.style.height =
      "auto";

    card.style.minHeight =
      `${width}px`;

    card.style.borderRadius =
      radius;

    card.style.position =
      "relative";

    card.style.overflow =
      "hidden";

    card.style.boxSizing =
      "border-box";

    card.style.flexShrink =
      "0";

  });

  /*
    media sync
  */

  const medias =
    document.querySelectorAll(
      ".roulette-image"
    );

  medias.forEach(media => {

    media.style.width =
      "100%";

    media.style.height =
      "100%";

    /*
      리스트와 동일하게
      정사각형 contain
    */

    media.style.objectFit =
      "contain";

    media.style.objectPosition =
      "center";

    media.style.padding =
      "10px";

    media.style.background =
      "linear-gradient(180deg,#f8fbff,#edf7ff)";

    media.style.display =
      "block";

    media.style.boxSizing =
      "border-box";

    media.style.userSelect =
      "none";

    media.style.webkitUserDrag =
      "none";

    media.style.pointerEvents =
      "none";

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

      cancelAnimationFrame(
        window.__rouletteResizeRAF
      );

      window.__rouletteResizeRAF =
        requestAnimationFrame(()=>{

          syncRouletteCardSize();

        });

    }
  );

  window.__rouletteResizeBound =
    true;

}
