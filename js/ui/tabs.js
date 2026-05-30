// js/ui/tabs.js

import {
  renderRoulette
} from "../features/roulette/renderRoulette.js";

import {
  renderCoverflow
} from "../features/coverflow/coverflow.js";

// =========================
// INIT
// =========================

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

  activateTab(
    "roulette"
  );

}

// =========================
// CLICK
// =========================

function handleTabClick(e){

  const button =
    e.target.closest(
      ".bottom-tab"
    );

  if(!button){
    return;
  }

  activateTab(
    button.dataset.tab
  );

}

// =========================
// ACTIVATE
// =========================

function activateTab(type){

  const tabs =
    document.querySelectorAll(
      ".bottom-tab"
    );

  tabs.forEach(tab=>{

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
    ([key,section])=>{

      if(!section){
        return;
      }

      section.hidden =
        key !== type;

    }
  );

  // =========================
  // RENDER
  // =========================

  if(type === "roulette"){

    renderRoulette();

  }

  if(type === "inventory"){

    renderCoverflow();

  }

}
