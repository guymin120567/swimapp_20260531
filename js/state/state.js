const STORAGE_KEY =
  "swim-roulette-state";

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

let state =
  loadState();

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

    console.error(err);

    return structuredClone(
      defaultState
    );

  }

}

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

function emit(){

  listeners.forEach(
    fn => fn(state)
  );

}

function saveState(){

  try{

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(state)

    );

  }catch(err){

    console.error(err);

  }

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
