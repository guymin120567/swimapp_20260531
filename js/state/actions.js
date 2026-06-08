// js/state/actions.js

import {
  getState,
  setState
} from "./state.js";

/* =========================
   ADD ITEM
========================= */

export function addItem(
  item
){

  const state =
    getState();

  setState({

    items: [
      ...state.items,
      item
    ]

  });

}

/* =========================
   REMOVE ITEM
========================= */

export function removeItem(
  id
){

  const state =
    getState();

  const target =
    state.items.find(
      i => i.id === id
    );

  if(!target){
    return;
  }

  const nextItems =
    state.items.filter(
      i => i.id !== id
    );

  const nextSelection = {
    ...state.selection
  };

  /* =========================
     FALLBACK SELECT
  ========================= */

  if(
    target.type === "cap" &&
    state.selection.capId === id
  ){

    const caps =
      nextItems.filter(
        i => i.type === "cap"
      );

    const removedIndex =
      state.items
        .filter(i => i.type === "cap")
        .findIndex(
          i => i.id === id
        );

    const fallback =
      caps[
        Math.max(
          0,
          removedIndex - 1
        )
      ] || caps[0];

    nextSelection.capId =
      fallback
        ? fallback.id
        : null;

  }

  if(
    target.type === "swim" &&
    state.selection.swimId === id
  ){

    const swims =
      nextItems.filter(
        i => i.type === "swim"
      );

    const removedIndex =
      state.items
        .filter(i => i.type === "swim")
        .findIndex(
          i => i.id === id
        );

    const fallback =
      swims[
        Math.max(
          0,
          removedIndex - 1
        )
      ] || swims[0];

    nextSelection.swimId =
      fallback
        ? fallback.id
        : null;

  }

  setState({

    items:
      nextItems,

    selection:
      nextSelection

  });

}

/* =========================
   SELECT
========================= */

export function setSelected(
  type,
  id
){

  const state =
    getState();

  const exists =
    state.items.some(
      i =>
        i.id === id &&
        i.type === type
    );

  if(!exists){
    return false;
  }

  /* =========================
     CAP
  ========================= */

  if(type === "cap"){

    if(
      state.selection.capId === id
    ){
      return false;
    }

    setState({

      selection:{

        ...state.selection,
        capId:id

      }

    });

    return true;

  }

  /* =========================
     SWIM
  ========================= */

  if(type === "swim"){

    if(
      state.selection.swimId === id
    ){
      return false;
    }

    setState({

      selection:{

        ...state.selection,
        swimId:id

      }

    });

    return true;

  }

  return false;

}

/* =========================
   ROULETTE RESULT
========================= */

export function setRouletteResult(
  capId,
  swimId
){

  const state =
    getState();

  setState({

    rouletteResult: {

      ...state.rouletteResult,

      capId,
      swimId

    }

  });

}

/* =========================
   SPINNING
========================= */

export function setSpinning(
  value
){

  const state =
    getState();

  setState({

    ui: {

      ...state.ui,

      isSpinning:value

    }

  });

}

/* =========================
   ACTIVE TAB
========================= */

export function setActiveTab(
  tab
){

  const state =
    getState();

  setState({

    ui: {

      ...state.ui,

      activeTab:tab

    }

  });

}

/* =========================
   RECORD
========================= */

export function addRecord(
  capId,
  swimId
){

  const state =
    getState();

  const record = {

    id:
      Date.now().toString(),

    capId,

    swimId,

    createdAt:
      Date.now()

  };

  setState({

    records: [
      record,
      ...state.records
    ]

  });

}
