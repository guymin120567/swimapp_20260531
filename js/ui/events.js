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

  document.addEventListener(
    "click",
    handleClick
  );

  /*
    iOS Safari
    background 복귀 시
    stuck active 제거
  */

  window.addEventListener(
    "pageshow",
    resetPressedState
  );

  window.addEventListener(
    "blur",
    resetPressedState
  );

  document.addEventListener(
    "visibilitychange",
    ()=>{

      if(!document.hidden){

        resetPressedState();

      }

    }
  );

}

// =========================
// CLICK HANDLER
// =========================

async function handleClick(e){

  const target =
    e.target.closest(
      "[data-action]"
    );

  if(!target){
    return;
  }

  const action =
    target.dataset.action;

  if(!action){
    return;
  }

  /*
    spinning 중
    중복 액션 방지
  */

  if(
    document.body.dataset.spinning ===
    "true"
  ){

    if(
      action !== "spin"
    ){
      return;
    }

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
      target.dataset.id;

    if(!id){
      return;
    }

    const ok =
      confirm(
        "삭제하시겠습니까?"
      );

    if(!ok){
      return;
    }

    removeItem(id);

    return;

  }

  // =========================
  // OPEN ADD
  // =========================

  if(
    action === "open-add"
  ){

    const modal =
      document.getElementById(
        "addModal"
      );

    if(!modal){
      return;
    }

    const type =
      target.dataset.type;

    modal.hidden =
      false;

    modal.dataset.type =
      type;

    requestAnimationFrame(()=>{

      const input =
        document.getElementById(
          "itemText"
        );

      input?.focus();

    });

    return;

  }

  // =========================
  // CLOSE ADD
  // =========================

  if(
    action === "close-add"
  ){

    closeModal();

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

  if(!modal){
    return;
  }

  const type =
    modal.dataset.type;

  const input =
    document.getElementById(
      "itemText"
    );

  const imageInput =
    document.getElementById(
      "itemImage"
    );

  const text =
    input?.value
      ?.trim();

  if(!text){

    input?.focus();

    return;

  }

  /*
    버튼 연타 방지
  */

  const submitBtn =
    document.querySelector(
      '[data-action="add"]'
    );

  if(submitBtn){

    submitBtn.disabled =
      true;

  }

  let image = null;

  try{

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

    /*
      reset
    */

    if(input){

      input.value = "";

    }

    if(imageInput){

      imageInput.value = "";

    }

    closeModal();

  }finally{

    if(submitBtn){

      submitBtn.disabled =
        false;

    }

  }

}

// =========================
// CLOSE MODAL
// =========================

function closeModal(){

  const modal =
    document.getElementById(
      "addModal"
    );

  if(!modal){
    return;
  }

  modal.hidden = true;

}

// =========================
// RESET PRESSED
// =========================

function resetPressedState(){

  document
    .querySelectorAll(
      "button"
    )
    .forEach(btn => {

      btn.blur();

    });

}
