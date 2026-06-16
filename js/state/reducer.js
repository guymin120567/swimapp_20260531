// js/state/reducer.js

export function reducer(
  state,
  action
){

  switch(action.type){

    /* =========================
       SET STATE
    ========================= */

    case "SET_STATE":

      return mergeState(
        state,
        action.payload || {}
      );

    /* =========================
       ADD ITEM
    ========================= */

    case "ADD_ITEM":

      return {

        ...state,

        items:[
          ...state.items,
          action.payload
        ]

      };

    /* =========================
       REMOVE ITEM
    ========================= */

    case "REMOVE_ITEM":

      return {

        ...state,

        items:
          action.payload.items,

        selection:{

          ...state.selection,

          ...action.payload.selection

        },

        rouletteResult:{

          ...state.rouletteResult,

          ...action.payload.rouletteResult

        }

      };

    /* =========================
       SET SELECTION
    ========================= */

    case "SET_SELECTION":

      return {

        ...state,

        selection:{

          ...state.selection,

          ...action.payload

        }

      };

    /* =========================
       ROULETTE RESULT
    ========================= */

    case "SET_ROULETTE_RESULT":

      return {

        ...state,

        rouletteResult:{

          ...state.rouletteResult,

          ...action.payload

        }

      };

    /* =========================
       RUNTIME
    ========================= */

    case "SET_RUNTIME":

      return {

        ...state,

        runtime:{

          ...state.runtime,

          ...action.payload

        }

      };

    /* =========================
       UI
    ========================= */

    case "SET_UI":

      return {

        ...state,

        ui:{

          ...state.ui,

          ...action.payload

        }

      };

    /* =========================
       RECORD
    ========================= */

    case "ADD_RECORD":

      return {

        ...state,

        records:[

          action.payload,

          ...state.records

        ]

      };

    default:

      return state;

  }

}

/* =========================
   MERGE
========================= */

function mergeState(
  state,
  partial
){

  return {

    ...state,

    ...partial,

    selection:{

      ...state.selection,

      ...(partial.selection || {})

    },

    rouletteResult:{

      ...state.rouletteResult,

      ...(partial.rouletteResult || {})

    },

    ui:{

      ...state.ui,

      ...(partial.ui || {})

    },

    runtime:{

      ...state.runtime,

      ...(partial.runtime || {})

    }

  };

}
