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

    wrap._initialized =
      false;

    /* =========================
       CLEANUP
    ========================= */

    function cleanupDrag(){

      isDown = false;

      moved = false;

      hasMoved = false;

      velocity = 0;

      pointerId = null;

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      wrap.classList.remove(
        "dragging"
      );

      try{

        wrap.releasePointerCapture?.(
          pointerId
        );

      }catch(err){}

    }

    /* =========================
       DOWN
    ========================= */

    function onDown(e){

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

    function endDrag(e){

      if(!isDown){
        return;
      }

      isDown = false;

      wrap.classList.remove(
        "dragging"
      );

      const targetCard =
        e.target.closest(
          ".cover-card"
        );

      /* =========================
         TAP SELECT
      ========================= */

      if(
        !moved &&
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

      inertia(
        wrap,
        velocity
      );

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
      onMove
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

/* 이하 함수 동일 */
