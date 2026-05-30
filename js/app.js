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

      app.classList.add(
        "show"
      );

    }

    requestAnimationFrame(()=>{

      requestAnimationFrame(()=>{

        if(
          window.requestIdleCallback
        ){

          requestIdleCallback(
            ()=>hideSplash()
          );

        }else{

          setTimeout(
            ()=>hideSplash(),
            120
          );

        }

      });

    });

  }
);

// =========================
// SPLASH
// =========================

function showSplash(){

  const el =
    document.getElementById(
      "splash"
    );

  if(!el) return;

  el.classList.remove(
    "hide"
  );

  el.style.opacity = "1";
}

// =========================
// HIDE
// =========================

function hideSplash(){

  const el =
    document.getElementById(
      "splash"
    );

  if(!el) return;

  el.classList.add(
    "hide"
  );

  setTimeout(()=>{

    el.remove();

  },600);
}
