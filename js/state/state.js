// =========================
// STORAGE
// =========================

const STORAGE_KEY =
  "swim-roulette-state";

// =========================
// DEFAULT
// =========================

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

    activeItemId: null

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

// =========================
// HELPERS
// =========================

function cloneDefault(){

  return structuredClone(
    defaultState
  );

}

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

      return cloneDefault();

    }

    const parsed =
      JSON.parse(saved);

    const base =
      cloneDefault();

    return {

      ...base,

      ...parsed,

      selection: {

        ...base.selection,

        ...(parsed.selection || {})

      },

      rouletteResult: {

        ...base.rouletteResult,

        ...(parsed.rouletteResult || {})

      },

      ui: {

        ...base.ui,

        ...(parsed.ui || {})

      },

      // runtime은 저장값 무시
      runtime: {

        ...base.runtime

      }

    };

  }catch(err){

    console.error(
      "state load fail",
      err
    );

    return cloneDefault();

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

    // ====================
    // runtime 제외 저장
    // ====================

    const {

      runtime,

      ...persistState

    } = state;

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(
        persistState
      )

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

export function setState(partial = {}){

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

    },

    runtime: {

      ...state.runtime,

      ...(partial.runtime || {})

    }

  };

  saveState();

  emit();

}
