// js/state/reducer.js

/* =========================
   REDUCER
========================= */

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

        items: [
          ...state.items,
          action.payload
        ]

      };

    /* =========================
       REMOVE ITEM
    ========================= */

    case "REMOVE_ITEM": {

      const id =
        action.payload;

      const target =
        state.items.find(
          i => i.id === id
        );

      if(!target){
        return state;
      }

      const nextItems =
        state.items.filter(
          i => i.id !== id
        );

      const nextSelection = {
        ...state.selection
      };

      if(
        target.type === "cap" &&
        state.selection.capId === id
      ){

        const caps =
          nextItems.filter(
            i => i.type === "cap"
          );

        nextSelection.capId =
          caps[0]?.id || null;

      }

      if(
        target.type === "swim" &&
        state.selection.swimId === id
      ){

        const swims =
          nextItems.filter(
            i => i.type === "swim"
          );

        nextSelection.swimId =
          swims[0]?.id || null;

      }

      return {

        ...state,

        items:
          nextItems,

        selection:
          nextSelection

      };

    }

    /* =========================
       SET SELECTED
    ========================= */

    case "SET_SELECTED": {

      const {
        itemType,
        id
      } = action.payload;

      const exists =
        state.items.some(
          i =>
            i.id === id &&
            i.type === itemType
        );

      if(!exists){
        return state;
      }

      if(itemType === "cap"){

        if(
          state.selection.capId === id
        ){
          return state;
        }

        return {

          ...state,

          selection: {

            ...state.selection,

            capId: id

          }

        };

      }

      if(itemType === "swim"){

        if(
          state.selection.swimId === id
        ){
          return state;
        }

        return {

          ...state,

          selection: {

            ...state.selection,

            swimId: id

          }

        };

      }

      return state;

    }

    /* =========================
       ROULETTE RESULT
    ========================= */

    case "SET_ROULETTE_RESULT": {

      const {
        capId,
        swimId
      } = action.payload;

      return {

        ...state,

        rouletteResult: {

          ...state.rouletteResult,

          capId,

          swimId

        }

      };

    }

    /* =========================
       SPINNING
    ========================= */

    case "SET_SPINNING":

      return {

        ...state,

        runtime: {

          ...state.runtime,

          isSpinning:
            action.payload

        },

        ui: {

          ...state.ui,

          isSpinning:
            action.payload

        }

      };

    /* =========================
       ACTIVE TAB
    ========================= */

    case "SET_ACTIVE_TAB":

      return {

        ...state,

        ui: {

          ...state.ui,

          activeTab:
            action.payload

        }

      };

    /* =========================
       RECORD
    ========================= */

    case "ADD_RECORD":

      return {

        ...state,

        records: [

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

}
