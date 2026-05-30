// js/ui/events.js

import {
  addItem,
  removeItem
} from "../state/actions.js";

import {
  spinAll
} from "../features/roulette/roulette.js";

import {
  compressImage
} from "../utils/image.js";

// =========================
// GLOBAL EVENTS
// =========================

export function bindGlobal(){

  if(
    document.body.dataset.globalBound
  ){
    return;
  }

  document.body.dataset.globalBound =
    "true";

  // =========================
  // CLICK
  // =========================

  document.addEventListener(
    "click",
    handleClick
  );

}

// =========================
// CLICK HANDLER
// =========================

async function handleClick(e){

  const action =
    e.target.dataset.action;

  if(!action){
    return;
  }

  // =========================
  // SPIN
  // =========================

  if(
    action === "spin"
  ){

    await spinAll();

    return;

  }

  // =========================
  // ADD
  // =========================

  if(
    action === "add"
  ){

    await handleAdd();

    return;

  }

  // =========================
  // DELETE
  // =========================

  if(
    action === "delete"
  ){

    const id =
      e.target.dataset.id;

    if(!id){
      return;
    }

    if(confirm("삭제하시겠습니까?")) removeItem(id);

  }

  if(
  action === "open-add"
){

  const modal =
    document.getElementById(
      "addModal"
    );

  const type =
    e.target.dataset.type;

  modal.hidden = false;

  modal.dataset.type =
    type;

  return;

}
if(
  action === "close-add"
){

  const modal =
    document.getElementById(
      "addModal"
    );

  modal.hidden = true;

  return;

}
  
}

// =========================
// ADD
// =========================

async function handleAdd(){

  const modal =
  document.getElementById(
    "addModal"
  );

const type =
  modal.dataset.type;

  const text =
    document.getElementById(
      "itemText"
    )?.value
      ?.trim();

  const imageInput =
    document.getElementById(
      "itemImage"
    );

  if(!text){
    return;
  }

  let image = null;

  const file =
    imageInput?.files?.[0];

  if(file){

    image =
      await compressImage(
        file
      );

  }

  addItem({

    id:
      crypto.randomUUID(),

    type,

    name:text,

    image

  });

  // reset
  document.getElementById(
    "itemText"
  ).value = "";

  if(imageInput){

    imageInput.value = "";

  }
modal.hidden = true;
}
