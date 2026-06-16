// js/features/roulette/roulette.js

import {
  renderCoverflow
} from "../coverflow/coverflow.js";

import {
  getState
} from "../../state/state.js";

import {
  setRouletteResult,
  setSpinning,
  addRecord,
  setSelected
} from "../../state/actions.js";

let spinTimeout = null;

let unlockTimeout = null;

/* =========================
   SPIN
========================= */

export async function spinAll(){

  const state =
    getState();

  if(
    state.runtime?.isSpinning
  ){
    return;
  }

  clearTimeout(
    spinTimeout
  );

  clearTimeout(
    unlockTimeout
  );

  spinTimeout = null;

  unlockTimeout = null;

  const caps =
    state.items.filter(
      i => i.type === "cap"
    );

  const swims =
    state.items.filter(
      i => i.type === "swim"
    );

  if(
    caps.length < 2
  ){

    alert(
      "수모를 최소 2개 이상 등록해주세요."
    );

    return;

  }

  if(
    swims.length < 2
  ){

    alert(
      "수영복을 최소 2개 이상 등록해주세요."
    );

    return;

  }

  const capSlot =
    document.querySelector(
      '.roulette-slot[data-type="cap"] .roulette-card'
    );

  const swimSlot =
    document.querySelector(
      '.roulette-slot[data-type="swim"] .roulette-card'
    );

  if(
    !capSlot ||
    !swimSlot
  ){
    return;
  }

  /* =========================
     PREPARE SLOT
  ========================= */

  prepareSpinSlot(
    capSlot
  );

  prepareSpinSlot(
    swimSlot
  );

  /* =========================
     CLEAR INERTIA
  ========================= */

  document
    .querySelectorAll(".coverflow")
    .forEach(wrap => {

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      clearTimeout(
        wrap._programmaticTimer
      );

      wrap._isProgrammatic =
        false;

      wrap.classList.remove(
        "dragging"
      );

    });

  setSpinning(true);

  const spinBtn =
    document.querySelector(
      "#rouletteSection .spin-btn"
    );

  if(spinBtn){

    spinBtn.disabled = true;

    spinBtn.blur();

  }

  capSlot.classList.remove(
    "winner"
  );

  swimSlot.classList.remove(
    "winner"
  );

  capSlot.classList.add(
    "spinning"
  );

  swimSlot.classList.add(
    "spinning"
  );

  window.dispatchEvent(
    new CustomEvent(
      "spin-start"
    )
  );

  let ticks = 0;

  const maxTicks = 30;

  let speed = 22;

  let finalCap =
    caps[0];

  let finalSwim =
    swims[0];

  const prevCapId =
    state.rouletteResult?.capId;

  const prevSwimId =
    state.rouletteResult?.swimId;

  const run = ()=>{

    const capCandidates =
      caps.filter(
        i => i.id !== prevCapId
      );

    const swimCandidates =
      swims.filter(
        i => i.id !== prevSwimId
      );

    finalCap =
      (
        capCandidates.length
          ? capCandidates
          : caps
      )[
        Math.floor(
          Math.random() *
          (
            capCandidates.length
              ? capCandidates.length
              : caps.length
          )
        )
      ];

    finalSwim =
      (
        swimCandidates.length
          ? swimCandidates
          : swims
      )[
        Math.floor(
          Math.random() *
          (
            swimCandidates.length
              ? swimCandidates.length
              : swims.length
          )
        )
      ];

    updateSlot(
      capSlot,
      finalCap
    );

    updateSlot(
      swimSlot,
      finalSwim
    );

    ticks++;

    if(ticks < 10){

      speed *= 1.05;

    }else if(
      ticks < 18
    ){

      speed *= 1.11;

    }else{

      speed *= 1.18;

    }

    if(
      ticks < maxTicks
    ){

      spinTimeout =
        setTimeout(
          run,
          speed
        );

    }else{

      spinTimeout = null;

      finish(
        finalCap,
        finalSwim
      );

    }

  };

  run();

  /* =========================
     FINISH
  ========================= */

  function finish(
    finalCap,
    finalSwim
  ){

    renderFinal(
      capSlot,
      finalCap
    );

    renderFinal(
      swimSlot,
      finalSwim
    );

    capSlot.classList.remove(
      "spinning"
    );

    swimSlot.classList.remove(
      "spinning"
    );

    capSlot.classList.add(
      "winner"
    );

    swimSlot.classList.add(
      "winner"
    );

    burst("cap");

    burst("swim");

    /* =========================
       RESULT
    ========================= */

    setRouletteResult(
      finalCap.id,
      finalSwim.id
    );

    /* =========================
       SYNC SELECTED
    ========================= */

    const changedCap =
      setSelected(
        "cap",
        finalCap.id
      );

    const changedSwim =
      setSelected(
        "swim",
        finalSwim.id
      );

    addRecord(
      finalCap.id,
      finalSwim.id
    );

    /* =========================
       UNLOCK
    ========================= */

    unlockTimeout =
      setTimeout(()=>{

        unlockTimeout =
          null;

        capSlot.classList.remove(
          "winner"
        );

        swimSlot.classList.remove(
          "winner"
        );

        document
          .querySelectorAll(
            ".coverflow"
          )
          .forEach(wrap => {

            wrap.classList.remove(
              "dragging",
              "spinning-lock"
            );

            wrap._isProgrammatic =
              false;

            cancelAnimationFrame(
              wrap._inertiaRAF
            );

            clearTimeout(
              wrap._programmaticTimer
            );

          });

        if(changedCap){

          renderCoverflow(
            "cap"
          );

        }

        if(changedSwim){

          renderCoverflow(
            "swim"
          );

        }

        if(spinBtn){

          spinBtn.disabled =
            false;

        }

        setSpinning(false);

        window.dispatchEvent(
          new CustomEvent(
            "spin-stop"
          )
        );

      },1800);

  }

}

/* =========================
   PREPARE SPIN SLOT
========================= */

function prepareSpinSlot(
  slot
){

  slot.innerHTML = `

    <div class="spin-image-wrap">

      <img
        class="
          roulette-image
          spinning-image
        "
        draggable="false"
      />

      <div class="spin-glow"></div>

    </div>

  `;

}

/* =========================
   UPDATE SLOT
========================= */

function updateSlot(
  slot,
  item
){

  const hasImage =
    item.image &&
    item.image.trim() !== "";

  let img =
    slot.querySelector(
      ".roulette-image"
    );

  let placeholder =
    slot.querySelector(
      ".roulette-placeholder"
    );

  /* =========================
     IMAGE MODE
  ========================= */

  if(hasImage){

    if(!img){

      slot.innerHTML = `

        <div class="spin-image-wrap">

          <img
            class="
              roulette-image
              spinning-image
            "
            draggable="false"
          />

          <div class="spin-glow"></div>

        </div>

      `;

      img =
        slot.querySelector(
          ".roulette-image"
        );

    }

    const currentSrc =
      img.getAttribute("src");

    if(
      currentSrc !== item.image
    ){

      img.src =
        item.image;

    }

    img.alt =
      item.name;

  }

  /* =========================
     PLACEHOLDER MODE
  ========================= */

  else{

    if(!placeholder){

      slot.innerHTML = `

        <div class="spin-image-wrap">

          <div class="roulette-placeholder">
            🏊
          </div>

          <div class="spin-glow"></div>

        </div>

      `;

    }

  }

}

/* =========================
   FINAL
========================= */

function renderFinal(
  slot,
  item
){

  const hasImage =
    item.image &&
    item.image.trim() !== "";

  slot.innerHTML = `

    ${
      hasImage
        ? `
          <img
            class="roulette-image"
            src="${item.image}"
            alt="${item.name}"
            draggable="false"
          />
        `
        : `
          <div class="roulette-placeholder">
            🏊
          </div>
        `
    }

    <div class="winner-glow"></div>

    <div class="card-overlay">

      <div class="roulette-name">
        ${item.name}
      </div>

    </div>

  `;

}

/* =========================
   CONFETTI
========================= */

function burst(type){

  const slot =
    document.querySelector(
      `.roulette-slot[data-type="${type}"] .roulette-card`
    );

  const fx =
    document.getElementById(
      "fx-layer"
    );

  if(
    !slot ||
    !fx
  ){
    return;
  }

  const rect =
    slot.getBoundingClientRect();

  const colors = [

    "#a78bfa",
    "#8b5cf6",
    "#7c3aed",
    "#c4b5fd",
    "#ffd700"

  ];

  const centerX =
    rect.left +
    rect.width / 2;

  const centerY =
    rect.top +
    rect.height * 0.32;

  const amount =
    window.innerWidth < 768
      ? 55
      : 90;

  for(
    let i = 0;
    i < amount;
    i++
  ){

    const el =
      document.createElement(
        "div"
      );

    el.className =
      "confetti";

    el.style.left =
      centerX + "px";

    el.style.top =
      centerY + "px";

    const spread =
      (Math.random() - 0.5);

    const dx =
      spread * (
        280 +
        Math.random() * 240
      );

    const dy =
      340 +
      Math.random() * 380;

    el.style.setProperty(
      "--dx",
      `${dx}px`
    );

    el.style.setProperty(
      "--dy",
      `${dy}px`
    );

    const lift =
      120 +
      Math.random() * 180;

    el.style.setProperty(
      "--lift",
      `${lift}px`
    );

    el.style.setProperty(
      "--rot",
      `${Math.random() * 1080}deg`
    );

    el.style.background =
      colors[
        Math.floor(
          Math.random() *
          colors.length
        )
      ];

    el.style.width =
      6 +
      Math.random() * 6 +
      "px";

    el.style.height =
      8 +
      Math.random() * 8 +
      "px";

    fx.appendChild(el);

    setTimeout(()=>{

      el.remove();

    },2600);

  }

}

/* =========================
   PAGE CLEANUP
========================= */

function cleanupRoulette(){

  clearTimeout(
    spinTimeout
  );

  clearTimeout(
    unlockTimeout
  );

  spinTimeout = null;

  unlockTimeout = null;

  setSpinning(false);

  document
    .querySelectorAll(
      ".coverflow"
    )
    .forEach(wrap => {

      wrap.classList.remove(
        "dragging",
        "spinning-lock"
      );

      wrap._isProgrammatic =
        false;

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      clearTimeout(
        wrap._programmaticTimer
      );

    });

  const spinBtn =
    document.querySelector(
      "#rouletteSection .spin-btn"
    );

  if(spinBtn){

    spinBtn.disabled =
      false;

  }

  window.dispatchEvent(
    new CustomEvent(
      "spin-stop"
    )
  );

}

window.addEventListener(
  "pagehide",
  cleanupRoulette
);

window.addEventListener(
  "blur",
  cleanupRoulette
);

document.addEventListener(
  "visibilitychange",
  ()=>{

    if(
      document.hidden
    ){

      cleanupRoulette();

    }

  }
);
