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

    if(
      wrap.dataset.dragBound
    ){

      requestAnimationFrame(()=>{

        updateDepth(wrap);

      });

      return;

    }

    wrap.dataset.dragBound =
      "true";

    let isDown = false;

    let moved = false;

    let startX = 0;

    let lastX = 0;

    let scrollLeft = 0;

    let velocity = 0;

    let pointerId = null;

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

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      wrap.classList.remove(
        "dragging"
      );

      try{

        if(
          pointerId !== null
        ){

          wrap.releasePointerCapture?.(
            pointerId
          );

        }

      }catch(err){}

      pointerId = null;

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

      if(
        cards.length <= 2
      ){

        downCard =
          e.target.closest(
            ".cover-card"
          );

        isDown = true;

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

      wrap._isProgrammatic =
        false;

      isDown = true;

      moved = false;

      hasMoved = false;

      pointerId =
        e.pointerId;

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

      wrap.setPointerCapture?.(
        pointerId
      );

    }

    /* =========================
       MOVE
    ========================= */

    function onMove(e){

      if(!isDown){
        return;
      }

      const cards =
        wrap.querySelectorAll(
          ".cover-card"
        );

      if(
        cards.length <= 2
      ){
        return;
      }

      e.preventDefault();

      const delta =
        Math.abs(
          e.pageX - startX
        );

      if(
        delta > MOVE_THRESHOLD
      ){

        moved = true;

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

      if(!isDown){
        return;
      }

      isDown = false;

      wrap.classList.remove(
        "dragging"
      );

      const targetCard =
        downCard;

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

        if(targetCard){

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

        }

        cleanupDrag();

        return;

      }

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

    window.addEventListener(
      "pointerup",
      endDrag
    );

    window.addEventListener(
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

  const cards =
    wrap.querySelectorAll(
      ".cover-card"
    );

  if(
    cards.length <= 2
  ){

    updateDepth(
      wrap
    );

    return;

  }

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

  const cards =
    wrap.querySelectorAll(
      ".cover-card"
    );

  if(
    cards.length <= 2
  ){

    snapToNearestCard(
      wrap,
      false
    );

    return;

  }

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

  /* =========================
     SIMPLE MODE
  ========================= */

  if(
    total <= 2
  ){

    cards.forEach((card,index)=>{

      card.classList.remove(
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

    });

    return;

  }

  const centerCard =
    findCenterCard(wrap);

  if(!centerCard){
    return;
  }

  const activeIndex =
    cards.indexOf(
      centerCard
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
