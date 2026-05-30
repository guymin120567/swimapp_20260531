export const defaultState = {

  items: [],

  records: [],

  selection: {

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
  structuredClone(
    defaultState
  );

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
    fn=>fn(state)
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

    ui: {

      ...state.ui,

      ...(partial.ui || {})

    }

  };

  emit();
}
