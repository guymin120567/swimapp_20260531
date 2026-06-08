// js/features/coverflow/drag.js

import {
  getState
} from "../../state/state.js";

import {
  setSelected
} from "../../state/actions.js";

/* =========================
   BIND
========================= */

export function bindDrag(){

  const wraps =
    document.querySelectorAll(
      ".coverflow"
    );

  wraps.forEach(wrap => {

    /* =========================
       RE-BIND SAFE RESET
    ========================= */

    if(
      wrap.dataset.dragBound
    ){

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      clearTimeout(
        wrap._programmaticTimer
      );

      wrap._isProgrammatic =
        false;

      wrap._depthTicking =
        false;

      wrap.classList.remove(
        "dragging"
      );

      requestAnimationFrame(()=>{

        snapToNearestCard(
          wrap,
          false
        );

        updateDepth(
          wrap
        );

      });

      return;

    }

    wrap.dataset.dragBound =
      "true";

    wrap.style.touchAction =
      "pan-y";

    let isDown = false;

    let moved = false;

    let startX = 0;

    let lastX = 0;

    let scrollLeft = 0;

    let velocity = 0;

    let hasMoved = false;

    let downCard = null;

    const isMobile =
      window.matchMedia(
        "(pointer:coarse)"
      ).matches;

    const MOVE_THRESHOLD =
      isMobile ? 16 : 8;

    wrap._isProgrammatic =
      false;

    wrap._inertiaRAF =
      null;

    wrap._depthTicking =
      false;

    /* =========================
       CLEANUP
    ========================= */

    function cleanupDrag(){

      isDown = false;

      moved = false;

      hasMoved = false;

      velocity = 0;

      downCard = null;

      wrap.classList.remove(
        "dragging"
      );

    }

    /* =========================
       SIMPLE MODE CLICK
    ========================= */

    function handleSimpleModeClick(
      card
    ){

      if(!card){
        return;
      }

      const type =
        card.dataset.type;

      const id =
        card.dataset.id;

      const changed =
        setSelected(
          type,
          id
        );

      if(changed){

        updateDepth(
          wrap
        );

      }

    }

    /* =========================
       DOWN
    ========================= */

    function onDown(e){

      const deleteBtn =
        e.target.closest(
          ".delete-btn"
        );

      if(deleteBtn){
        return;
      }

      if(
        wrap._isProgrammatic
      ){
        return;
      }

      if(
        getState().ui?.isSpinning
      ){
        return;
      }

      if(
        wrap.classList.contains(
          "spinning-lock"
        )
      ){
        return;
      }

      const cards =
        wrap.querySelectorAll(
          ".cover-card"
        );

      /* =========================
         SIMPLE MODE
      ========================= */

      if(cards.length <= 2){

        downCard =
          e.target.closest(
            ".cover-card"
          );

        return;
      }

      if(
        wrap.scrollWidth <=
        wrap.clientWidth
      ){
        return;
      }

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      clearTimeout(
        wrap._programmaticTimer
      );

      wrap._isProgrammatic =
        false;

      isDown = true;

      moved = false;

      hasMoved = false;

      downCard =
        e.target.closest(
          ".cover-card"
        );

      wrap.classList.add(
        "dragging"
      );

      startX = e.pageX;

      lastX = e.pageX;

      scrollLeft =
        wrap.scrollLeft;

      velocity = 0;

    }

    /* =========================
       MOVE
    ========================= */

    function onMove(e){

      if(!isDown){
        return;
      }

      const delta =
        Math.abs(
          e.pageX - startX
        );

      if(
        delta > MOVE_THRESHOLD
      ){

        moved = true;

        e.preventDefault();

      }

      const walk =
        (e.pageX - startX) * 1.02;

      if(hasMoved){

        velocity =
          e.pageX - lastX;

      }else{

        velocity = 0;

        hasMoved = true;

      }

      lastX =
        e.pageX;

      const next =
        scrollLeft - walk;

      const max =
        wrap.scrollWidth -
        wrap.clientWidth;

      wrap.scrollLeft =
        Math.max(
          0,
          Math.min(
            next,
            max
          )
        );

      if(
        wrap._initialized
      ){

        requestDepthUpdate(
          wrap
        );

      }

    }

    /* =========================
       END
    ========================= */

    function endDrag(){

      const cards =
        wrap.querySelectorAll(
          ".cover-card"
        );

      /* =========================
         SIMPLE MODE CLICK
      ========================= */

      if(
        cards.length <= 2
      ){

        if(downCard){

          handleSimpleModeClick(
            downCard
          );

        }

        cleanupDrag();

        return;

      }

      if(!isDown){

        cleanupDrag();

        return;

      }

      isDown = false;

      wrap.classList.remove(
        "dragging"
      );

      const targetCard =
        downCard;

      /* =========================
         TAP SELECT
      ========================= */

      if(
        !moved &&
        Math.abs(velocity) < 1 &&
        targetCard
      ){

        cancelAnimationFrame(
          wrap._inertiaRAF
        );

        clearTimeout(
          wrap._programmaticTimer
        );

        wrap._isProgrammatic =
          false;

        const type =
          targetCard.dataset.type;

        const id =
          targetCard.dataset.id;

        setSelected(
          type,
          id
        );

        scrollToCard(
          wrap,
          targetCard
        );

        cleanupDrag();

        return;

      }

      /* =========================
         DRAG END
      ========================= */

      if(
        Math.abs(velocity) > 0.5
      ){

        inertia(
          wrap,
          velocity
        );

      }else{

        snapToNearestCard(
          wrap
        );

        cleanupDrag();

      }

    }

    /* =========================
       POINTER EVENTS
    ========================= */

    wrap.addEventListener(
      "pointerdown",
      onDown
    );

    wrap.addEventListener(
      "pointermove",
      onMove,
      {
        passive:false
      }
    );

    wrap.addEventListener(
      "pointerup",
      endDrag
    );

    wrap.addEventListener(
      "pointercancel",
      cleanupDrag
    );

    window.addEventListener(
      "blur",
      cleanupDrag
    );

    window.addEventListener(
      "pagehide",
      cleanupDrag
    );

    document.addEventListener(
      "visibilitychange",
      ()=>{

        if(
          document.hidden
        ){

          cleanupDrag();

        }

      }
    );

    /* =========================
       SCROLL
    ========================= */

    wrap.addEventListener(
      "scroll",
      ()=>{

        if(
          wrap._isProgrammatic
        ){
          return;
        }

        if(
          !wrap._initialized
        ){
          return;
        }

        requestDepthUpdate(
          wrap
        );

      },
      {
        passive:true
      }
    );

  });

}

/* =========================
   SCROLL TO CARD
========================= */

export function scrollToCard(
  wrap,
  card,
  smooth = true
){

  if(
    !wrap ||
    !card
  ){
    return;
  }

  const left =
    card.offsetLeft -
    (
      wrap.clientWidth / 2
    ) +
    (
      card.clientWidth / 2
    );

  const safeLeft =
    Math.round(left);

  wrap._isProgrammatic =
    true;

  wrap.scrollTo({

    left:safeLeft,

    behavior:
      smooth
        ? "smooth"
        : "auto"

  });

  clearTimeout(
    wrap._programmaticTimer
  );

  wrap._programmaticTimer =
    setTimeout(()=>{

      wrap._isProgrammatic =
        false;

      wrap.scrollLeft =
        Math.round(
          wrap.scrollLeft
        );

      updateDepth(
        wrap
      );

    }, smooth ? 420 : 0);

}

/* =========================
   FIND CENTER CARD
========================= */

export function findCenterCard(
  wrap
){

  const cards = [
    ...wrap.querySelectorAll(
      ".cover-card"
    )
  ];

  if(!cards.length){
    return null;
  }

  const wrapCenter =
    wrap.scrollLeft +
    wrap.clientWidth / 2;

  let targetCard = null;

  let min = Infinity;

  cards.forEach(card => {

    const center =
      card.offsetLeft +
      card.clientWidth / 2;

    const dist =
      Math.abs(
        wrapCenter - center
      );

    if(dist < min){

      min = dist;

      targetCard = card;

    }

  });

  return targetCard;

}

/* =========================
   SNAP TO NEAREST CARD
========================= */

export function snapToNearestCard(
  wrap,
  smooth = true
){

  const targetCard =
    findCenterCard(wrap);

  if(!targetCard){
    return;
  }

  scrollToCard(
    wrap,
    targetCard,
    smooth
  );

  const type =
    targetCard.dataset.type;

  const id =
    targetCard.dataset.id;

  setSelected(
    type,
    id
  );

  requestAnimationFrame(()=>{

    updateDepth(
      wrap
    );

  });

}

/* =========================
   DEPTH RAF
========================= */

function requestDepthUpdate(
  wrap
){

  if(
    wrap._depthTicking
  ){
    return;
  }

  wrap._depthTicking =
    true;

  requestAnimationFrame(()=>{

    updateDepth(wrap);

    wrap._depthTicking =
      false;

  });

}

/* =========================
   INERTIA
========================= */

function inertia(
  wrap,
  velocity
){

  if(
    wrap.scrollWidth <=
    wrap.clientWidth
  ){

    snapToNearestCard(
      wrap,
      false
    );

    cleanupDrag();

    return;

  }

  let current =
    velocity * 1.1;

  function frame(){

    current *= 0.9;

    const next =
      wrap.scrollLeft -
      current;

    const max =
      wrap.scrollWidth -
      wrap.clientWidth;

    wrap.scrollLeft =
      Math.max(
        0,
        Math.min(
          next,
          max
        )
      );

    requestDepthUpdate(
      wrap
    );

    if(
      Math.abs(current) > 0.2
    ){

      wrap._inertiaRAF =
        requestAnimationFrame(
          frame
        );

    }else{

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      wrap._inertiaRAF =
        null;

      wrap.scrollLeft =
        Math.round(
          wrap.scrollLeft
        );

      snapToNearestCard(
        wrap
      );

      cleanupDrag();

    }

  }

  wrap._inertiaRAF =
    requestAnimationFrame(
      frame
    );

}

/* =========================
   DEPTH
========================= */

export function updateDepth(
  wrap
){

  const cards = [
    ...wrap.querySelectorAll(
      ".cover-card"
    )
  ];

  if(!cards.length){
    return;
  }

  const state =
    getState();

  const type =
    wrap.dataset.type;

  const selectedId =
    type === "cap"
      ? state.selection?.capId
      : state.selection?.swimId;

  let activeCard =
    cards.find(
      card =>
        card.dataset.id ===
        selectedId
    );

  if(!activeCard){

    activeCard =
      findCenterCard(
        wrap
      );

  }

  if(!activeCard){
    return;
  }

  const activeIndex =
    cards.indexOf(
      activeCard
    );

  const total =
    cards.length;

  cards.forEach((card,index)=>{

    const dist =
      Math.abs(
        index - activeIndex
      );

    card.classList.remove(
      "active",
      "depth-1",
      "depth-2",
      "hidden"
    );

    const badge =
      card.querySelector(
        ".card-index"
      );

    if(badge){

      badge.textContent =
        `${index + 1} / ${total}`;

    }

    if(
      total <= 2
    ){

      if(
        card.dataset.id ===
        selectedId
      ){

        card.classList.add(
          "active"
        );

      }

      return;

    }

    if(dist === 0){

      card.classList.add(
        "active"
      );

    }else if(
      dist === 1
    ){

      card.classList.add(
        "depth-1"
      );

    }else if(
      dist === 2
    ){

      card.classList.add(
        "depth-2"
      );

    }else{

      card.classList.add(
        "hidden"
      );

    }

  });

}
