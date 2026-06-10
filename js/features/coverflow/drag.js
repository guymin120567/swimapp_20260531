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

      wrap._isInertia =
        false;

      wrap._depthTicking =
        false;

      wrap.classList.remove(
        "dragging"
      );

      requestAnimationFrame(()=>{

        const cards =
          wrap.querySelectorAll(
            ".cover-card"
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
       SIMPLE MODE
    ========================= */

    function isSimpleMode(){

      return (
        wrap.querySelectorAll(
          ".cover-card"
        ).length <= 2
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

        requestAnimationFrame(()=>{

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
        wrap._isInertia
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

      /* =========================
         CENTER SYNC
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

      requestDepthUpdate(
        wrap
      );

    }

    /* =========================
       END
    ========================= */

    function endDrag(){

      /* =========================
         SIMPLE MODE
      ========================= */

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

        requestAnimationFrame(()=>{

          updateDepth(
            wrap
          );

        });

        cleanupDrag();

        return;

      }

      /* =========================
         INERTIA
      ========================= */

      if(
        Math.abs(velocity) > 0.45
      ){

        inertia(
          wrap,
          velocity
        );

      }else{

        snapToNearestCard(
          wrap
        );

      }

      cleanupDrag();

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
      "pointerup",
      endDrag
    );

    window.addEventListener(
      "mouseup",
      endDrag
    );

    window.addEventListener(
      "blur",
      cleanupDrag
    );

    window.addEventListener(
      "pagehide",
      cleanupDrag
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
    wrap.querySelectorAll(
      ".cover-card"
    );

  /* =========================
     SIMPLE MODE
  ========================= */

  if(
    cards.length <= 2
  ){

    requestAnimationFrame(()=>{

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

      requestAnimationFrame(()=>{

        updateDepth(
          wrap
        );

      });

    }, smooth ? 320 : 0);

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

  const wrapRect =
    wrap.getBoundingClientRect();

  const wrapCenter =
    wrapRect.left +
    (
      wrapRect.width / 2
    );

  let targetCard = null;

  let min = Infinity;

  cards.forEach(card => {

    const rect =
      card.getBoundingClientRect();

    const center =
      rect.left +
      (
        rect.width / 2
      );

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

  const cards =
    wrap.querySelectorAll(
      ".cover-card"
    );

  if(
    cards.length <= 2
  ){

    requestAnimationFrame(()=>{

      updateDepth(
        wrap
      );

    });

    return;

  }

  const targetCard =
    findCenterCard(wrap);

  if(!targetCard){
    return;
  }

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
    targetCard,
    smooth
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

    if(
      !document.contains(
        wrap
      )
    ){

      wrap._depthTicking =
        false;

      return;

    }

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

    return;

  }

  wrap._isInertia =
    true;

  let current =
    velocity * 1.08;

  function frame(){

    current *= 0.92;

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

    if(
      Math.abs(current) > 0.3
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

      wrap._isInertia =
        false;

      wrap.scrollLeft =
        Math.round(
          wrap.scrollLeft
        );

      snapToNearestCard(
        wrap
      );

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

  const total =
    cards.length;

  const state =
    getState();

  const type =
    wrap.dataset.type;

  const selectedId =
    type === "cap"
      ? state.selection?.capId
      : state.selection?.swimId;

  let activeCard = null;

  /* =========================
     SIMPLE MODE
  ========================= */

  if(
    total <= 2
  ){

    activeCard =
      cards.find(
        card =>
          card.dataset.id ===
          selectedId
      );

    if(!activeCard){

      activeCard =
        cards[0];
    }

  }else{

    activeCard =
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

  }

  if(!activeCard){
    return;
  }

  const activeIndex =
    cards.indexOf(
      activeCard
    );

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

    /* =========================
       SIMPLE MODE
    ========================= */

    if(
      total <= 2
    ){

      card.classList.remove(
        "hidden"
      );

      if(card === activeCard){

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
