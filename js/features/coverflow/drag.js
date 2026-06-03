// js/features/coverflow/drag.js
import {
  setSelected
} from "../../state/actions.js";

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

    let startX = 0;

    let scrollLeft = 0;

    let velocity = 0;

    let lastX = 0;

    wrap._isProgrammatic = false;

    /* =========================
       INIT CENTER
    ========================= */

    requestAnimationFrame(()=>{

      centerFirst(wrap);

      requestAnimationFrame(()=>{

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

        isDown = true;

        wrap.classList.add(
          "dragging"
        );

        startX = e.pageX;

        lastX = e.pageX;

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

        lastX = x;

        wrap.scrollLeft =
          scrollLeft - walk;

        requestAnimationFrame(()=>{

          updateDepth(wrap);

        });

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

    lastX = x;

    wrap.scrollLeft =
      scrollLeft - walk;

    requestAnimationFrame(()=>{

      updateDepth(wrap);

    });

  },
  { passive:true }
);

    
    /* =========================
       END
    ========================= */

    window.addEventListener(
      "mouseup",
      ()=>{

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
      ()=>{

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
  ()=>{

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
      ()=>{

        if(
          wrap._isProgrammatic
        ){
          return;
        }

        requestAnimationFrame(()=>{

          updateDepth(wrap);

        });

      },
      { passive:true }
    );

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

  const target =
    first.offsetLeft +
    first.clientWidth / 2 -
    wrap.clientWidth / 2;

  wrap.scrollLeft =
    Math.max(0, target);

}

/* =========================
   INERTIA
========================= */

function inertia(
  wrap,
  velocity
){

  let current =
    velocity * 1.8;

  function frame(){

    current *= 0.92;

    wrap.scrollLeft -=
      current;

    updateDepth(wrap);

    if(
      Math.abs(current) > 0.35
    ){

      requestAnimationFrame(
        frame
      );

    }else{

      snapToCenter(wrap);

    }

  }

  requestAnimationFrame(frame);

}

/* =========================
   SNAP CENTER
========================= */

function snapToCenter(
  wrap,
  smooth = true
){
  

  const cards =
    [
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
  const type =
    wrap.dataset.type;

  const activeId =
    closest.dataset.id;

setSelected(
  type,
  activeId
);

/* =========================
   ACTIVE SYNC
========================= */

cards.forEach(card => {

  card.classList.remove(
    "active",
    "depth-1",
    "depth-2"
  );

});

closest.classList.add(
  "active"
);
  const target =
    closest.offsetLeft +
    closest.clientWidth / 2 -
    wrap.clientWidth / 2;

  wrap._isProgrammatic =
    true;

  wrap.scrollTo({

    left:target,

    behavior:
      smooth
        ? "smooth"
        : "auto"

  });

  setTimeout(()=>{

  wrap._isProgrammatic =
    false;

  requestAnimationFrame(()=>{

    updateDepth(wrap);

  });

}, 420);

}

/* =========================
   DEPTH
========================= */

function updateDepth(
  wrap
){

  const cards =
    [
      ...wrap.querySelectorAll(
        ".cover-card"
      )
    ];

  if(!cards.length){
    return;
  }

  const wrapCenter =
    wrap.getBoundingClientRect().left +
    wrap.clientWidth / 2;

  let closest = null;

  let min = Infinity;

  cards.forEach(card => {

    const rect =
      card.getBoundingClientRect();

    const center =
      rect.left +
      rect.width / 2;

    const dist =
      Math.abs(
        wrapCenter - center
      );

    if(dist < min){

      min = dist;

      closest = card;

    }

  });

  cards.forEach(card => {

    const index =
      cards.indexOf(card);

    const activeIndex =
      cards.indexOf(closest);

    const distance =
      Math.abs(
        index - activeIndex
      );

    card.classList.remove(
      "active",
      "depth-1",
      "depth-2"
    );

    if(distance === 0){

      card.classList.add(
        "active"
      );

    }else if(distance === 1){

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
