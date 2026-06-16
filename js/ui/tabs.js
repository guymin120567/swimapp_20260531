// js/ui/tabs.js

import {
  getState,
  subscribe
} from "../state/state.js";

import {
  setActiveTab,
  setSpinning
} from "../state/actions.js";

import {
  renderRecords
} from "../features/records/renderRecords.js";

import {
  renderRoulette
} from "../features/roulette/renderRoulette.js";

import {
  renderCoverflow
} from "../features/coverflow/coverflow.js";

/* =========================
   INIT
========================= */

export function initTabs(){

  if(
    document.body.dataset.tabsBound
  ){
    return;
  }

  document.body.dataset.tabsBound =
    "true";

  document.addEventListener(
    "click",
    handleTabClick
  );

  /* =========================
     IOS SAFARI RECOVERY
  ========================= */

  window.addEventListener(
    "pageshow",
    cleanupSpinState
  );

  window.addEventListener(
    "focus",
    cleanupSpinState
  );

  document.addEventListener(
    "visibilitychange",
    ()=>{

      if(!document.hidden){

        cleanupSpinState();

      }

    }
  );

  subscribe(state => {

    syncTabs(
      state.ui?.activeTab
    );

  });

  syncTabs(
    getState().ui?.activeTab ||
    "roulette"
  );

}

/* =========================
   CLICK
========================= */

function handleTabClick(e){

  const button =
    e.target.closest(
      ".bottom-tab"
    );

  if(!button){
    return;
  }

  const state =
    getState();

  const hasSpinningDOM =
    document.querySelector(
      ".coverflow.spinning-lock"
    );

  const actuallySpinning =
    state.runtime?.isSpinning === true &&
    hasSpinningDOM;

  if(actuallySpinning){

    alert(
      "룰렛 진행 중입니다 🎲"
    );

    return;

  }

  const nextTab =
    button.dataset.tab;

  if(
    state.ui?.activeTab ===
    nextTab
  ){
    return;
  }

  setActiveTab(
    nextTab
  );

}

/* =========================
   CLEANUP SPIN
========================= */

function cleanupSpinState(){

  const spinning =
    document.querySelector(
      ".coverflow.spinning-lock"
    );

  if(spinning){
    return;
  }

  document
    .querySelectorAll(
      ".coverflow"
    )
    .forEach(flow => {

      flow.classList.remove(
        "spinning-lock",
        "dragging"
      );

      cancelAnimationFrame(
        flow._spinRAF
      );

      cancelAnimationFrame(
        flow._inertiaRAF
      );

      clearTimeout(
        flow._programmaticTimer
      );

      flow._isSpinning =
        false;

      flow._isProgrammatic =
        false;

      flow._isInertia =
        false;

    });

  setSpinning(false);

}

/* =========================
   SYNC
========================= */

function syncTabs(type){

  const tabs =
    document.querySelectorAll(
      ".bottom-tab"
    );

  tabs.forEach(tab => {

    tab.classList.toggle(

      "active",

      tab.dataset.tab === type

    );

  });

  const sections = {

    roulette:
      document.getElementById(
        "rouletteSection"
      ),

    inventory:
      document.getElementById(
        "listsSection"
      ),

    records:
      document.getElementById(
        "recordsSection"
      )

  };

  Object.entries(
    sections
  ).forEach(
    ([key, section]) => {

      if(!section){
        return;
      }

      section.hidden =
        key !== type;

    }
  );

  /* =========================
     RENDER
  ========================= */

  if(type === "roulette"){

    renderRoulette();

  }

  if(type === "inventory"){

    renderCoverflow();

  }

  if(type === "records"){

    renderRecords();

  }

}
