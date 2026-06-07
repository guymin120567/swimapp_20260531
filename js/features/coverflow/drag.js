// js/features/coverflow/drag.js

import {
  setSelected
} from "../../state/actions.js";

import {
  getState
} from "../../state/state.js";

import {
  renderCoverflow
} from "./coverflow.js";

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

    wrap._isProgrammatic =
      false;

    wrap._inertiaRAF =
      null;

    wrap._depthTicking =
      false;

    requestAnimationFrame(()=>{

      requestDepthUpdate(
        wrap
      );

    });

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

      clearTimeout(
        wrap._programmaticTimer
      );

      wrap._isProgrammatic =
        false;

      isDown = true;

      moved = false;

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

      if(delta > 6){

        moved = true;

      }

      const walk =
        (x - startX) * 1.02;

      velocity =
        x - lastX;

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

      requestDepthUpdate(
        wrap
      );

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
      endDrag
    );

    wrap.addEventListener(
      "scroll",
      ()=>{

        if(
          wrap._isProgrammatic
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
    velocity * 1.35;

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
      Math.abs(current) > 0.22
    ){

      wrap._inertiaRAF =
        requestAnimationFrame(
          frame
        );

    }else{

      snapToCenter(
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
   SNAP
========================= */

function snapToCenter(
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

  let closest = null;

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

      closest = card;

    }

  });

  if(!closest){
    return;
  }

  const changed =
    setSelected(
      wrap.dataset.type,
      closest.dataset.id
    );

  if(!changed){
    return;
  }

  renderCoverflow(
    wrap.dataset.type
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
