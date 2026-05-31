// =========================
// STORAGE
// =========================

const STORAGE_KEY =
  "swim-roulette-state";

// =========================
// DEFAULT
// =========================

export const defaultState = {

  items: [],

  records: [],

  selection: {

    capId: null,

    swimId: null

  },

  rouletteResult: {

    capId: null,

    swimId: null

  },

  ui: {

    activeTab: "roulette",

    activeItemId: null,

    isSpinning: false

  }

};

// =========================
// LOAD
// =========================

function loadState(){

  try{

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if(!saved){

      return structuredClone(
        defaultState
      );

    }

    return {

      ...structuredClone(
        defaultState
      ),

      ...JSON.parse(saved)

    };

  }catch(err){

    console.error(
      "state load fail",
      err
    );

    return structuredClone(
      defaultState
    );

  }

}

// =========================
// STATE
// =========================

let state =
  loadState();

const listeners =
  new Set();

// =========================
// GET
// =========================

export function getState(){

  return state;

}

// =========================
// SUBSCRIBE
// =========================

export function subscribe(fn){

  listeners.add(fn);

  return ()=>{

    listeners.delete(fn);

  };

}

// =========================
// SAVE
// =========================

function saveState(){

  try{

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(state)

    );

  }catch(err){

    console.error(
      "state save fail",
      err
    );

  }

}

// =========================
// EMIT
// =========================

function emit(){

  listeners.forEach(
    fn => fn(state)
  );

}

// =========================
// SET
// =========================

export function setState(partial){

  state = {

    ...state,

    ...partial,

    selection: {

      ...state.selection,

      ...(partial.selection || {})

    },

    rouletteResult: {

      ...state.rouletteResult,

      ...(partial.rouletteResult || {})

    },

    ui: {

      ...state.ui,

      ...(partial.ui || {})

    }

  };

  saveState();

  emit();

}
