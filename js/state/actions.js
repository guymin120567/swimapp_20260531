// js/state/actions.js

import {

  getState,

  setState

} from "./state.js";

/* =========================
   HELPERS
========================= */

function getItemsByType(type){

  const state =
    getState();

  return state.items.filter(
    item => item.type === type
  );

}

function findFallbackItem(
  type,
  removedId,
  nextItems
){

  const currentItems =
    getItemsByType(type);

  const nextTypeItems =
    nextItems.filter(
      item => item.type === type
    );

  const removedIndex =
    currentItems.findIndex(
      item => item.id === removedId
    );

  return (

    nextTypeItems[
      Math.max(
        0,
        removedIndex - 1
      )
    ]

    ||

    nextTypeItems[0]

    ||

    null

  );

}

/* =========================
   ADD ITEM
========================= */

export function addItem(item){

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

export function removeItem(id){

  const state =
    getState();

  const target =
    state.items.find(
      item => item.id === id
    );

  if(!target){
    return false;
  }

  const nextItems =
    state.items.filter(
      item => item.id !== id
    );

  const nextSelection = {

    ...state.selection

  };

  /* =========================
     CAP
  ========================= */

  if(

    target.type === "cap"

    &&

    state.selection.capId === id

  ){

    const fallback =
      findFallbackItem(
        "cap",
        id,
        nextItems
      );

    nextSelection.capId =
      fallback
        ? fallback.id
        : null;

  }

  /* =========================
     SWIM
  ========================= */

  if(

    target.type === "swim"

    &&

    state.selection.swimId === id

  ){

    const fallback =
      findFallbackItem(
        "swim",
        id,
        nextItems
      );

    nextSelection.swimId =
      fallback
        ? fallback.id
        : null;

  }

  /* =========================
     ROULETTE RESULT CLEANUP
  ========================= */

  const nextRouletteResult = {

    ...state.rouletteResult

  };

  if(
    nextRouletteResult.capId === id
  ){

    nextRouletteResult.capId =
      null;

  }

  if(
    nextRouletteResult.swimId === id
  ){

    nextRouletteResult.swimId =
      null;

  }

  setState({

    items:
      nextItems,

    selection:
      nextSelection,

    rouletteResult:
      nextRouletteResult

  });

  return true;

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

      item =>

        item.id === id

        &&

        item.type === type

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

      selection: {

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

      selection: {

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

    runtime: {

      isSpinning:value

    }

  });

}

/* =========================
   DRAGGING
========================= */

export function setDragging(
  value
){

  setState({

    runtime: {

      isDragging:value

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
   ACTIVE ITEM
========================= */

export function setActiveItem(
  id
){

  setState({

    ui: {

      activeItemId:id

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
