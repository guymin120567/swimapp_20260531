// js/features/coverflow/drag.js

import {
  getState
} from "../../state/state.js";

import {
  setSelected
} from "../../state/actions.js";

import {
  queueRender
} from "../../render/renderQueue.js";

import {
  getCoverflowCards
} from "../../shared/domCache.js";

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
      wrap._dragCleanup
    ){

      wrap._dragCleanup();

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      clearTimeout(
        wrap._programmaticTimer
      );

      wrap._isProgrammatic =
        false;

      wrap._isInertia =
        false;

      wrap._depthTicking =
        false;

      wrap.classList.remove(
        "dragging"
      );

    }

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

    let activePointerId = null;

    const isMobile =
      window.matchMedia(
        "(pointer:coarse)"
      ).matches;

    const MOVE_THRESHOLD =
      isMobile ? 12 : 6;

    wrap._isProgrammatic =
      false;

    wrap._isInertia =
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

      wrap.dataset.dragMoved =
        "false";

      if(
        activePointerId !== null
      ){

        try{

          wrap.releasePointerCapture(
            activePointerId
          );

        }catch(err){}

      }

      activePointerId = null;

      wrap.classList.remove(
        "dragging"
      );

    }

    /* =========================
       POINTER LEAVE FIX
    ========================= */

    function forceEndDrag(){

      if(!isDown){
        return;
      }

      endDrag();

    }

    /* =========================
       SIMPLE MODE
    ========================= */

    function isSimpleMode(){

      return (
        getCoverflowCards(
          wrap
        ).length <= 2
      );

    }

    /* =========================
       SIMPLE CLICK
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

        queueRender(()=>{

          updateDepth(
            wrap
          );

        });

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
        getState().runtime?.isSpinning
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

      downCard =
        e.target.closest(
          ".cover-card"
        );

      if(!downCard){
        return;
      }

      /* =========================
         SIMPLE MODE
      ========================= */

      if(
        isSimpleMode()
      ){

        moved = false;

        velocity = 0;

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

      wrap._isInertia =
        false;

      isDown = true;

      moved = false;

      hasMoved = false;

      wrap.dataset.dragMoved =
        "false";

      wrap.classList.add(
        "dragging"
      );

      startX = e.pageX;

      lastX = e.pageX;

      scrollLeft =
        wrap.scrollLeft;

      velocity = 0;

      activePointerId =
        e.pointerId;

      try{

        wrap.setPointerCapture(
          activePointerId
        );

      }catch(err){}

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

        wrap.dataset.dragMoved =
          "true";

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

      const centerCard =
        findCenterCard(
          wrap
        );

      if(centerCard){

        const type =
          centerCard.dataset.type;

        const id =
          centerCard.dataset.id;

        setSelected(
          type,
          id
        );

      }

      requestDepthUpdate(
        wrap
      );

    }

    /* =========================
       END
    ========================= */

    function endDrag(){

      if(
        isSimpleMode()
      ){

        if(
          downCard &&
          !moved
        ){

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
         CLICK SELECT
      ========================= */

      if(
        !moved &&
        Math.abs(velocity) < 4 &&
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

        wrap._isInertia =
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

        queueRender(()=>{

          updateDepth(
            wrap
          );

        });

        cleanupDrag();

        return;

      }

      /* =========================
         DRAG SNAP
      ========================= */

      const centerCard =
        findCenterCard(
          wrap
        );

      if(centerCard){

        const type =
          centerCard.dataset.type;

        const id =
          centerCard.dataset.id;

        setSelected(
          type,
          id
        );

      }

      snapToNearestCard(
        wrap
      );

      cleanupDrag();

    }

    /* =========================
       EVENTS
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
      forceEndDrag
    );

    wrap.addEventListener(
      "lostpointercapture",
      forceEndDrag
    );

    window.addEventListener(
      "pointerup",
      endDrag
    );

    window.addEventListener(
      "mouseup",
      endDrag
    );

    window.addEventListener(
      "touchend",
      endDrag,
      {
        passive:true
      }
    );

    window.addEventListener(
      "touchcancel",
      forceEndDrag,
      {
        passive:true
      }
    );

    window.addEventListener(
      "blur",
      forceEndDrag
    );

    window.addEventListener(
      "pagehide",
      forceEndDrag
    );

    /* =========================
       REMOVE EVENTS
    ========================= */

    wrap._dragCleanup =
      () => {

        wrap.removeEventListener(
          "pointerdown",
          onDown
        );

        wrap.removeEventListener(
          "pointermove",
          onMove
        );

        wrap.removeEventListener(
          "pointerup",
          endDrag
        );

        wrap.removeEventListener(
          "pointercancel",
          forceEndDrag
        );

        wrap.removeEventListener(
          "lostpointercapture",
          forceEndDrag
        );

      };

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
          isSimpleMode()
        ){
          return;
        }

        if(
          !wrap._initialized
        ){
          return;
        }

        const centerCard =
          findCenterCard(
            wrap
          );

        if(centerCard){

          const type =
            centerCard.dataset.type;

          const id =
            centerCard.dataset.id;

          setSelected(
            type,
            id
          );

        }

        requestDepthUpdate(
          wrap
        );

      },
      {
        passive:true
      }
    );

    /* =========================
       INIT
    ========================= */

    queueRender(()=>{

      const cards =
        getCoverflowCards(
          wrap
        );

      if(
        cards.length > 2
      ){

        snapToNearestCard(
          wrap,
          false
        );

      }else{

        updateDepth(
          wrap
        );

      }

      wrap._initialized =
        true;

    });

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

  const cards =
    getCoverflowCards(
      wrap
    );

  if(
    cards.length <= 2
  ){

    queueRender(()=>{

      updateDepth(
        wrap
      );

    });

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
    Math.max(
      0,
      Math.round(left)
    );

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

      const centerCard =
        findCenterCard(
          wrap
        );

      if(centerCard){

        const type =
          centerCard.dataset.type;

        const id =
          centerCard.dataset.id;

        setSelected(
          type,
          id
        );

      }

      queueRender(()=>{

        updateDepth(
          wrap
        );

      });

    }, smooth ? 320 : 0);

}

/* =========================
   SNAP
========================= */

export function snapToNearestCard(
  wrap,
  smooth = true
){

  if(!wrap){
    return;
  }

  const cards =
    getCoverflowCards(
      wrap
    );

  if(
    cards.length <= 2
  ){

    queueRender(()=>{

      updateDepth(
        wrap
      );

    });

    return;

  }

  const center =
    wrap.scrollLeft +
    (wrap.clientWidth / 2);

  let closest = null;

  let min = Infinity;

  cards.forEach(card => {

    const cardCenter =
      card.offsetLeft +
      (card.offsetWidth / 2);

    const dist =
      Math.abs(
        center - cardCenter
      );

    if(dist < min){

      min = dist;

      closest = card;

    }

  });

  if(!closest){
    return;
  }

  const type =
    closest.dataset.type;

  const id =
    closest.dataset.id;

  setSelected(
    type,
    id
  );

  scrollToCard(
    wrap,
    closest,
    smooth
  );

}

/* =========================
   FIND CENTER
========================= */

function findCenterCard(
  wrap
){

  const cards =
    getCoverflowCards(
      wrap
    );

  if(!cards.length){
    return null;
  }

  const center =
    wrap.scrollLeft +
    (wrap.clientWidth / 2);

  let closest = null;

  let min = Infinity;

  cards.forEach(card => {

    const cardCenter =
      card.offsetLeft +
      (card.offsetWidth / 2);

    const dist =
      Math.abs(
        center - cardCenter
      );

    if(dist < min){

      min = dist;

      closest = card;

    }

  });

  return closest;

}

/* =========================
   DEPTH
========================= */

export function updateDepth(
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

    const cards =
      getCoverflowCards(
        wrap
      );

    const centerCard =
      findCenterCard(
        wrap
      );

    cards.forEach(card => {

      card.classList.remove(
        "active",
        "depth-1",
        "depth-2",
        "hidden"
      );

    });

    if(!centerCard){

      wrap._depthTicking =
        false;

      return;

    }

    const centerIndex =
      cards.indexOf(
        centerCard
      );

    cards.forEach((card,index)=>{

      const diff =
        Math.abs(
          index - centerIndex
        );

      if(diff === 0){

        card.classList.add(
          "active"
        );

      }else if(diff === 1){

        card.classList.add(
          "depth-1"
        );

      }else if(diff === 2){

        card.classList.add(
          "depth-2"
        );

      }else{

        card.classList.add(
          "hidden"
        );

      }

    });

    wrap._depthTicking =
      false;

  });

}

/* =========================
   DEPTH RAF
========================= */

function requestDepthUpdate(
  wrap
){

  queueRender(()=>{

    updateDepth(
      wrap
    );

  });

}

/* =========================
   INERTIA
========================= */

function inertia(
  wrap,
  velocity
){

  wrap._isInertia =
    true;

  function tick(){

    velocity *= 0.94;

    wrap.scrollLeft -=
      velocity;

    requestDepthUpdate(
      wrap
    );

    if(
      Math.abs(velocity) < 0.35
    ){

      wrap._isInertia =
        false;

      snapToNearestCard(
        wrap
      );

      return;

    }

    wrap._inertiaRAF =
      requestAnimationFrame(
        tick
      );

  }

  tick();

}
