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
    return;
  }

  if(type === "cap"){

    if(
      state.selection.capId === id
    ){
      return;
    }

    setState({
      selection:{
        capId:id
      }
    });

  }

  else if(type === "swim"){

    if(
      state.selection.swimId === id
    ){
      return;
    }

    setState({
      selection:{
        swimId:id
      }
    });

  }

}
