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

    const nextCap =
      nextItems.find(
        i => i.type === "cap"
      );

    nextSelection.capId =
      nextCap
        ? nextCap.id
        : null;

  }

  if(
    target.type === "swim" &&
    state.selection.swimId === id
  ){

    const nextSwim =
      nextItems.find(
        i => i.type === "swim"
      );

    nextSelection.swimId =
      nextSwim
        ? nextSwim.id
        : null;

  }

  setState({

    items: nextItems,

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

  setState({

    rouletteResult: {

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

  setState({

    ui: {

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

  setState({

    ui: {

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
