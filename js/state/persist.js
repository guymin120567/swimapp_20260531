// js/state/persist.js

/* =========================
   STORAGE
========================= */

const STORAGE_KEY =
  "swim-roulette-state";

/* =========================
   SAVE
========================= */

export function savePersistState(
  state
){

  try{

    const persistState = {

      items:
        Array.isArray(
          state.items
        )
          ? state.items
          : [],

      records:
        Array.isArray(
          state.records
        )
          ? state.records
          : [],

      selection: {

        capId:
          state.selection?.capId ||
          null,

        swimId:
          state.selection?.swimId ||
          null

      },

      rouletteResult: {

        capId:
          state.rouletteResult?.capId ||
          null,

        swimId:
          state.rouletteResult?.swimId ||
          null

      },

      ui: {

        activeTab:
          state.ui?.activeTab ||
          "roulette"

      }

    };

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(
        persistState
      )

    );

  }catch(err){

    console.error(
      "persist save fail",
      err
    );

  }

}

/* =========================
   LOAD
========================= */

export function loadPersistState(
  defaultState
){

  try{

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if(!raw){

      return structuredClone(
        defaultState
      );

    }

    const parsed =
      JSON.parse(raw);

    return {

      ...structuredClone(
        defaultState
      ),

      ...parsed,

      items:
        Array.isArray(
          parsed.items
        )
          ? parsed.items
          : [],

      records:
        Array.isArray(
          parsed.records
        )
          ? parsed.records
          : [],

      selection: {

        ...structuredClone(
          defaultState
        ).selection,

        ...(parsed.selection || {})

      },

      rouletteResult: {

        ...structuredClone(
          defaultState
        ).rouletteResult,

        ...(parsed.rouletteResult || {})

      },

      ui: {

        ...structuredClone(
          defaultState
        ).ui,

        ...(parsed.ui || {}),

        isSpinning: false

      },

      runtime: {

        ...structuredClone(
          defaultState
        ).runtime,

        isSpinning: false

      }

    };

  }catch(err){

    console.error(
      "persist load fail",
      err
    );

    return structuredClone(
      defaultState
    );

  }

}

/* =========================
   CLEAR
========================= */

export function clearPersistState(){

  try{

    localStorage.removeItem(
      STORAGE_KEY
    );

  }catch(err){

    console.error(
      "persist clear fail",
      err
    );

  }

}
