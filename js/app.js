// js/app.js

import {
  initController
} from "./core/controller.js";

window.addEventListener(
  "DOMContentLoaded",
  async ()=>{

    showSplash();

    const minSplashTime =
      new Promise(
        res=>setTimeout(
          res,
          600
        )
      );

    const controller =
      initController();

    await Promise.all([

      controller.boot(),

      minSplashTime

    ]);

    const app =
      document.getElementById(
        "app"
      );

    if(app){

      requestAnimationFrame(()=>{

        app.classList.add(
          "show"
        );

      });

    }

    if(
      window.requestIdleCallback
    ){

      requestIdleCallback(
        ()=>{

          requestAnimationFrame(()=>{

            hideSplash();

          });

        }
      );

    }else{

      setTimeout(()=>{

        requestAnimationFrame(()=>{

          hideSplash();

        });

      },120);

    }

  }
);

/* =========================
   SPLASH
========================= */

function showSplash(){

  const el =
    document.getElementById(
      "splash"
    );

  if(!el){
    return;
  }

  el.classList.remove(
    "hide"
  );

  el.style.opacity =
    "1";

}

/* =========================
   HIDE
========================= */

function hideSplash(){

  const el =
    document.getElementById(
      "splash"
    );

  if(!el){
    return;
  }

  el.classList.add(
    "hide"
  );

  clearTimeout(
    window.__splashRemoveTimer
  );

  window.__splashRemoveTimer =
    setTimeout(()=>{

      el.remove();

    },600);

}
