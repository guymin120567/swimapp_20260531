// js/state/actions.js

import {
  getState,
  setState
} from "./state.js";

// =========================
// ITEMS
// =========================

export function addItem(item){

  const state =
    getState();

  setState({

    items:[
      ...(state.items || []),
      item
    ]

  });

}

export function removeItem(id){

  const state =
    getState();

  const nextItems =
    (state.items || [])
      .filter(
        i => i.id !== id
      );

  const nextSelection = {

    ...(state.selection || {})

  };

  const nextRouletteResult = {

    ...(state.rouletteResult || {})

  };

  // =========================
  // selection 정리
  // =========================

  if(
    nextSelection.capId === id
  ){

    const firstCap =
      nextItems.find(
        i => i.type === "cap"
      );

    nextSelection.capId =
      firstCap?.id || null;

  }

  if(
    nextSelection.swimId === id
  ){

    const firstSwim =
      nextItems.find(
        i => i.type === "swim"
      );

    nextSelection.swimId =
      firstSwim?.id || null;

  }

  // =========================
  // rouletteResult 정리
  // =========================

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

    items:nextItems,

    selection:
      nextSelection,

    rouletteResult:
      nextRouletteResult

  });

}

// =========================
// SELECTION
// =========================

export function setSelected(type,id){

  const state =
    getState();

  setState({

    selection:{

      ...(state.selection || {}),

      ...(type === "cap"
        ? { capId:id }
        : {}),

      ...(type === "swim"
        ? { swimId:id }
        : {})

    }

  });

}

// =========================
// ROULETTE RESULT
// =========================

export function setRouletteResult(
  capId,
  swimId
){

  const state =
    getState();

  setState({

    rouletteResult:{

      ...(state.rouletteResult || {}),

      capId,

      swimId

    }

  });

}

// =========================
// SPINNING
// =========================

export function setSpinning(value){

  const state =
    getState();

  setState({

    ui:{

      ...(state.ui || {}),

      isSpinning:value

    }

  });

}
