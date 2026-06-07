// js/features/coverflow/drag.js

import {
  getState
} from "../../state/state.js";

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

    let hasMoved =
      false;

    wrap._isProgrammatic =
      false;

    wrap._inertiaRAF =
      null;

    wrap._depthTicking =
      false;

    wrap._initialized =
      false;

    function cleanupDrag(){

      isDown = false;

      hasMoved = false;

      velocity = 0;

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      wrap.classList.remove(
        "dragging"
      );

    }

    function onDown(x){

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

      wrap.classList.add(
        "dragging"
      );

      startX = x;

      lastX = x;

      scrollLeft =
        wrap.scrollLeft;

      velocity = 0;

    }

    wrap.addEventListener(
      "mousedown",
      e => {

        onDown(
          e.pageX
        );

      }
    );

    wrap.addEventListener(
      "touchstart",
      e => {

        onDown(
          e.touches[0].pageX
        );

      },
      {
        passive:true
      }
    );

    function onMove(x){

      if(!isDown){
        return;
      }

      const delta =
        Math.abs(
          x - startX
        );

      if(delta > 8){

        moved = true;

      }

      const walk =
        (x - startX) * 1.02;

      if(hasMoved){

        velocity =
          x - lastX;

      }else{

        velocity = 0;

        hasMoved = true;

      }

      lastX = x;

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

    wrap.addEventListener(
      "mousemove",
      e => {

        onMove(
          e.pageX
        );

      }
    );

    wrap.addEventListener(
      "touchmove",
      e => {

        onMove(
          e.touches[0].pageX
        );

      },
      {
        passive:true
      }
    );

    wrap.addEventListener(
      "click",
      e => {

        if(moved){

          e.preventDefault();

          e.stopPropagation();

          moved = false;

          return;

        }

      },
      true
    );

    function endDrag(){

      if(!isDown){
        return;
      }

      isDown = false;

      wrap.classList.remove(
        "dragging"
      );

      inertia(
        wrap,
        velocity
      );

    }

    window.addEventListener(
      "mouseup",
      endDrag
    );

    window.addEventListener(
      "mouseleave",
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
      cleanupDrag,
      {
        passive:true
      }
    );

    window.addEventListener(
      "blur",
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

  wrap.scrollTo({

    left,
    behavior:
      smooth
        ? "smooth"
        : "auto"

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

      updateDepth(
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

function updateDepth(
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

  const wrapCenter =
    wrap.scrollLeft +
    wrap.clientWidth / 2;

  let activeIndex = 0;

  let min = Infinity;

  cards.forEach((card,index)=>{

    const center =
      card.offsetLeft +
      card.clientWidth / 2;

    const dist =
      Math.abs(
        wrapCenter - center
      );

    if(dist < min){

      min = dist;

      activeIndex = index;

    }

  });

  cards.forEach((card,index)=>{

    const dist =
      Math.abs(
        index - activeIndex
      );

    card.classList.remove(
      "active",
      "depth-1",
      "depth-2"
    );

    card.style.display =
      dist <= 2
        ? ""
        : "none";

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

    }else{

      card.classList.add(
        "depth-2"
      );

    }

  });

}
