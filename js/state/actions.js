// js/state/actions.js

import {
  getState,
  setState
} from "./state.js";

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
      i =>
        i.id === id &&
        i.type === type
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

      selection:{

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

      selection:{

        swimId:id

      }

    });

    return true;

  }

  return false;

}
