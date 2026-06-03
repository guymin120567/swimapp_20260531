// js/features/coverflow/drag.js

import {
  setSelected
} from "../../state/actions.js";

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

      requestAnimationFrame(() => {

        updateDepth(wrap);

      });

      return;

    }

    wrap.dataset.dragBound =
      "true";

    let isDown = false;

    let startX = 0;

    let scrollLeft = 0;

    let velocity = 0;

    let lastX = 0;

    wrap._isProgrammatic =
      false;

    wrap._inertiaRAF =
      null;

    wrap._depthTicking =
      false;

    /* =========================
       INIT CENTER
    ========================= */

    requestAnimationFrame(() => {

      centerFirst(wrap);

      requestAnimationFrame(() => {

        updateDepth(wrap);

      });

    });

    /* =========================
       DOWN
    ========================= */

    wrap.addEventListener(
      "mousedown",
      e => {

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
          wrap.scrollWidth <=
          wrap.clientWidth
        ){
          return;
        }

        cancelAnimationFrame(
          wrap._inertiaRAF
        );

        isDown = true;

        wrap.classList.add(
          "dragging"
        );

        startX =
          e.pageX;

        lastX =
          e.pageX;

        scrollLeft =
          wrap.scrollLeft;

      }
    );

    /* =========================
       TOUCH START
    ========================= */

    wrap.addEventListener(
      "touchstart",
      e => {

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
          wrap.scrollWidth <=
          wrap.clientWidth
        ){
          return;
        }

        cancelAnimationFrame(
          wrap._inertiaRAF
        );

        isDown = true;

        wrap.classList.add(
          "dragging"
        );

        startX =
          e.touches[0].pageX;

        lastX =
          startX;

        scrollLeft =
          wrap.scrollLeft;

      },
      { passive:true }
    );

    /* =========================
       MOVE
    ========================= */

    wrap.addEventListener(
      "mousemove",
      e => {

        if(!isDown){
          return;
        }

        e.preventDefault();

        const x =
          e.pageX;

        const walk =
          (x - startX) * 1.08;

        velocity =
          x - lastX;

        lastX =
          x;

        const next =
          scrollLeft - walk;

        const maxScroll =
          wrap.scrollWidth -
          wrap.clientWidth;

        wrap.scrollLeft =
          Math.max(
            0,
            Math.min(
              next,
              maxScroll
            )
          );

        requestDepthUpdate(
          wrap
        );

      }
    );

    wrap.addEventListener(
      "touchmove",
      e => {

        if(!isDown){
          return;
        }

        const x =
          e.touches[0].pageX;

        const walk =
          (x - startX) * 1.08;

        velocity =
          x - lastX;

        lastX =
          x;

        const next =
          scrollLeft - walk;

        const maxScroll =
          wrap.scrollWidth -
          wrap.clientWidth;

        wrap.scrollLeft =
          Math.max(
            0,
            Math.min(
              next,
              maxScroll
            )
          );

        requestDepthUpdate(
          wrap
        );

      },
      { passive:true }
    );

    /* =========================
       END
    ========================= */

    window.addEventListener(
      "mouseup",
      () => {

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
    );

    wrap.addEventListener(
      "mouseleave",
      () => {

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
    );

    window.addEventListener(
      "touchend",
      () => {

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
    );

    /* =========================
       SCROLL
    ========================= */

    wrap.addEventListener(
      "scroll",
      () => {

        if(
          wrap._isProgrammatic
        ){
          return;
        }

        requestDepthUpdate(
          wrap
        );

      },
      { passive:true }
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

  requestAnimationFrame(() => {

    updateDepth(wrap);

    wrap._depthTicking =
      false;

  });

}

/* =========================
   CENTER FIRST
========================= */

function centerFirst(
  wrap
){

  const first =
    wrap.querySelector(
      ".cover-card"
    );

  if(!first){
    return;
  }

  const rawTarget =
    first.offsetLeft +
    first.clientWidth / 2 -
    wrap.clientWidth / 2;

  const maxScroll =
    wrap.scrollWidth -
    wrap.clientWidth;

  const target =
    Math.max(
      0,
      Math.min(
        rawTarget,
        maxScroll
      )
    );

  wrap.scrollLeft =
    target;

}

/* =========================
   CENTER CARD
========================= */

function centerCard(
  wrap,
  card,
  smooth = true
){

  const rawTarget =
    card.offsetLeft +
    card.clientWidth / 2 -
    wrap.clientWidth / 2;

  const maxScroll =
    wrap.scrollWidth -
    wrap.clientWidth;

  const target =
    Math.max(
      0,
      Math.min(
        rawTarget,
        maxScroll
      )
    );

  wrap.scrollTo({

    left:target,

    behavior:
      smooth
        ? "smooth"
        : "auto"

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
    velocity * 1.8;

  function frame(){

    current *= 0.92;

    const next =
      wrap.scrollLeft - current;

    const maxScroll =
      wrap.scrollWidth -
      wrap.clientWidth;

    wrap.scrollLeft =
      Math.max(
        0,
        Math.min(
          next,
          maxScroll
        )
      );

    requestDepthUpdate(
      wrap
    );

    if(
      Math.abs(current) > 0.35
    ){

      wrap._inertiaRAF =
        requestAnimationFrame(
          frame
        );

    }else{

      snapToCenter(wrap);

    }

  }

  wrap._inertiaRAF =
    requestAnimationFrame(
      frame
    );

}

/* =========================
   SNAP CENTER
========================= */

function snapToCenter(
  wrap,
  smooth = true
){

  const cards = [
    ...wrap.querySelectorAll(
      ".cover-card"
    )
  ];

  if(!cards.length){
    return;
  }

  if(
    wrap.scrollWidth <=
    wrap.clientWidth
  ){
    return;
  }

  const wrapCenter =
    wrap.scrollLeft +
    wrap.clientWidth / 2;

  let closest =
    null;

  let min =
    Infinity;

  cards.forEach(card => {

    const center =
      card.offsetLeft +
      card.clientWidth / 2;

    const dist =
      Math.abs(
        wrapCenter - center
      );

    if(dist < min){

      min =
        dist;

      closest =
        card;

    }

  });

  if(!closest){
    return;
  }

  const type =
    wrap.dataset.type;

  const activeId =
    closest.dataset.id;

  setSelected(
    type,
    activeId
  );
cards.forEach(card => {

  card.classList.remove(
    "active"
  );

});

closest.classList.add(
  "active"
);
  const rawTarget =
    closest.offsetLeft +
    closest.clientWidth / 2 -
    wrap.clientWidth / 2;

  const maxScroll =
    wrap.scrollWidth -
    wrap.clientWidth;

  const target =
    Math.max(
      0,
      Math.min(
        rawTarget,
        maxScroll
      )
    );

  wrap._isProgrammatic =
    true;

  wrap.scrollTo({

    left:target,

    behavior:
      smooth
        ? "smooth"
        : "auto"

  });

  setTimeout(() => {

    wrap._isProgrammatic =
      false;

    requestDepthUpdate(
      wrap
    );

  }, 420);

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

  const activeCard =
    wrap.querySelector(
      ".cover-card.active"
    ) || cards[0];

  const activeIndex =
    cards.indexOf(
      activeCard
    );

  cards.forEach(card => {

    const index =
      cards.indexOf(card);

    const distance =
      Math.abs(
        index - activeIndex
      );

    card.classList.remove(
      "depth-1",
      "depth-2"
    );

    if(distance === 1){

      card.classList.add(
        "depth-1"
      );

    }else if(distance >= 2){

      card.classList.add(
        "depth-2"
      );

    }

  });

}
