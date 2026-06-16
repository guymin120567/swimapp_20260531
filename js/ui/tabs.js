// js/ui/tabs.js

import {
  getState
} from "../state/state.js";

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

  activateTab(
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
    state.ui?.isSpinning === true &&
    hasSpinningDOM;

  if(actuallySpinning){

    alert(
      "룰렛 진행 중입니다 🎲"
    );

    return;

  }

  activateTab(
    button.dataset.tab
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

  if(!spinning){

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

        flow._isSpinning =
          false;

      });

  }

}

/* =========================
   ACTIVATE
========================= */

function activateTab(type){

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
