// js/render/renderQueue.js

const queue =
  new Map();

let rafId =
  null;

/* =========================
   REGISTER
========================= */

export function queueRender(
  key,
  renderFn
){

  if(
    typeof renderFn !==
    "function"
  ){
    return;
  }

  queue.set(
    key,
    renderFn
  );

  schedule();

}

/* =========================
   CANCEL
========================= */

export function cancelRender(
  key
){

  queue.delete(key);

}

/* =========================
   FLUSH
========================= */

export function flushRender(){

  const tasks = [
    ...queue.entries()
  ];

  queue.clear();

  rafId = null;

  tasks.forEach(
    ([, renderFn]) => {

      try{

        renderFn();

      }catch(err){

        console.error(

          "render queue fail",

          err

        );

      }

    }
  );

}

/* =========================
   SCHEDULE
========================= */

function schedule(){

  if(
    rafId !== null
  ){
    return;
  }

  rafId =
    requestAnimationFrame(
      flushRender
    );

}

/* =========================
   CLEAR ALL
========================= */

export function clearRenderQueue(){

  queue.clear();

  if(
    rafId !== null
  ){

    cancelAnimationFrame(
      rafId
    );

    rafId = null;

  }

}

/* =========================
   PAGE CLEANUP
========================= */

window.addEventListener(
  "pagehide",
  clearRenderQueue
);

document.addEventListener(
  "visibilitychange",
  ()=>{

    if(
      document.hidden
    ){

      clearRenderQueue();

    }

  }
);
