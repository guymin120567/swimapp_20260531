// js/core/controller.js

import {
  setState,
  defaultState,
  subscribe,
  getState
} from "../state/state.js";

import {
  renderLayout
} from "../ui/renderLayout.js";

import {
  loadState,
  saveState
} from "../../db/database.js";

import {
  initTabs
} from "../ui/tabs.js";

import {
  bindGlobal
} from "../ui/events.js";

import {
  renderRoulette
} from "../features/roulette/renderRoulette.js";

import {
  renderCoverflow
} from "../features/coverflow/coverflow.js";

// =========================
// CONTROLLER
// =========================

export function initController(){

  let saveTimer = null;

  function renderApp(){

    renderRoulette();

    renderCoverflow();

  }

  async function boot(){

    console.log(
      "BOOT START"
    );

    renderLayout();

    initTabs();

    bindGlobal();

    const saved =
      await loadState();

    let normalized =
      saved || defaultState;

    if(
      normalized?.data
    ){

      normalized = {

        items:[

          ...(normalized.data.caps || [])
            .map(item=>({

              ...item,

              type:"cap"

            })),

          ...(normalized.data.swimsuits || [])
            .map(item=>({

              ...item,

              type:"swim"

            }))

        ],

        records:
          normalized.data.records || [],

        selection:
          normalized.selection || {

            capId:null,

            swimId:null

          },

        ui:
          normalized.ui || {

            activeTab:"roulette",

            activeItemId:null,

            isSpinning:false

          }

      };

    }

    if(
      !Array.isArray(
        normalized.items
      )
    ){

      normalized.items = [];

    }

    // =========================
    // DEFAULT SELECTION
    // =========================

    const caps =
      normalized.items.filter(
        i => i.type === "cap"
      );

    const swims =
      normalized.items.filter(
        i => i.type === "swim"
      );

    if(
      !normalized.selection?.capId &&
      caps.length
    ){

      normalized.selection = {

        ...(normalized.selection || {}),

        capId:
          caps[0].id

      };

    }

    if(
      !normalized.selection?.swimId &&
      swims.length
    ){

      normalized.selection = {

        ...(normalized.selection || {}),

        swimId:
          swims[0].id

      };

    }

    subscribe(()=>{

      renderApp();

      clearTimeout(
        saveTimer
      );

      saveTimer =
        setTimeout(()=>{

          saveState(
            getState()
          );

        },200);

    });

    setState(
      normalized
    );

    console.log(
      "BOOT DONE"
    );

  }

  return {

    boot

  };

}
