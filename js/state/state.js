// js/state/state.js

import {
  reducer
} from "./reducer.js";

import {
  loadPersistState,
  savePersistState
} from "./persist.js";

/* =========================
   DEFAULT
========================= */

export const defaultState = {

  // ======================
  // DATA
  // ======================

  items: [],

  records: [],

  // ======================
  // SELECTION
  // ======================

  selection: {

    capId: null,

    swimId: null

  },

  // ======================
  // RESULT
  // ======================

  rouletteResult: {

    capId: null,

    swimId: null

  },

  // ======================
  // UI
  // persist 대상
  // ======================

  ui: {

    activeTab: "roulette",

    activeItemId: null,

    isSpinning: false

  },

  // ======================
  // RUNTIME
  // persist 제외 대상
  // ======================

  runtime: {

    isSpinning: false,

    isDragging: false

  }

};

/* =========================
   CLONE
========================= */

function cloneDefault(){

  return structuredClone(
    defaultState
  );

}

/* =========================
   STATE
========================= */

let state =
  loadPersistState(
    cloneDefault()
  );

const listeners =
  new Set();

/* =========================
   GET
========================= */

export function getState(){

  return state;

}

/* =========================
   SUBSCRIBE
========================= */

export function subscribe(fn){

  listeners.add(fn);

  return ()=>{

    listeners.delete(fn);

  };

}

/* =========================
   EMIT
========================= */

function emit(){

  listeners.forEach(
    fn => fn(state)
  );

}

/* =========================
   DISPATCH
========================= */

export function dispatch(
  action
){

  const nextState =
    reducer(
      state,
      action
    );

  if(
    nextState === state
  ){
    return;
  }

  state =
    nextState;

  savePersistState(
    state
  );

  emit();

}

/* =========================
   LEGACY
========================= */

export function setState(
  partial = {}
){

  dispatch({

    type:
      "SET_STATE",

    payload:
      partial

  });

}
