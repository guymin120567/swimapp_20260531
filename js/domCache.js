// js/shared/domCache.js

const cache =
  new Map();

/* =========================
   GET
========================= */

export function getElement(
  selector,
  parent = document
){

  const key =
    `${selector}__${parent === document
      ? "document"
      : "custom"
    }`;

  const cached =
    cache.get(key);

  if(
    cached &&
    document.contains(cached)
  ){
    return cached;
  }

  const element =
    parent.querySelector(
      selector
    );

  if(element){

    cache.set(
      key,
      element
    );

  }

  return element;

}

/* =========================
   GET ALL
========================= */

export function getElements(
  selector,
  parent = document
){

  return [
    ...parent.querySelectorAll(
      selector
    )
  ];

}

/* =========================
   REMOVE CACHE
========================= */

export function removeCache(
  selector,
  parent = document
){

  const key =
    `${selector}__${parent === document
      ? "document"
      : "custom"
    }`;

  cache.delete(key);

}

/* =========================
   CLEAR
========================= */

export function clearDomCache(){

  cache.clear();

}

/* =========================
   RAF QUERY
========================= */

export function rafQuery(
  callback
){

  cancelAnimationFrame(
    window.__domCacheRAF
  );

  window.__domCacheRAF =
    requestAnimationFrame(
      callback
    );

}

/* =========================
   PAGE CLEANUP
========================= */

window.addEventListener(
  "pagehide",
  clearDomCache
);

document.addEventListener(
  "visibilitychange",
  ()=>{

    if(
      document.hidden
    ){

      clearDomCache();

    }

  }
);
