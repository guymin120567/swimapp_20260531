// js/features/coverflow/drag.js

import { setSelected } from "../../state/actions.js";
import { getState } from "../../state/state.js";

export function bindDrag() {

  const wraps =
    document.querySelectorAll(
      ".coverflow"
    );

  wraps.forEach(wrap => {

    if (
      wrap.dataset.dragBound
    ) {

      requestAnimationFrame(() => {
        updateDepth(wrap);
      });

      return;
    }

    wrap.dataset.dragBound =
      "true";

    let isDown = false;

    let isDragging = false;

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

    /* =========================
       INIT
    ========================= */

    requestAnimationFrame(() => {

      centerSelected(wrap);

      requestDepthUpdate(wrap);

    });

    /* =========================
       DOWN
    ========================= */

    function onDown(x) {

      if (
        wrap._isProgrammatic
      ) {
        return;
      }

      if (
        getState().ui?.isSpinning
      ) {
        return;
      }

      if (
        wrap.classList.contains(
          "spinning-lock"
        )
      ) {
        return;
      }

      if (
        wrap.scrollWidth <=
        wrap.clientWidth
      ) {
        return;
      }

      cancelAnimationFrame(
        wrap._inertiaRAF
      );

      isDown = true;

      isDragging = false;

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
        onDown(e.pageX);
      }
    );

    wrap.addEventListener(
      "touchstart",
      e => {
        onDown(
          e.touches[0].pageX
        );
      },
      { passive: true }
    );

    /* =========================
       MOVE
    ========================= */

    function onMove(x) {

      if (!isDown) return;

      const delta =
        Math.abs(
          x - startX
        );

      if (delta > 6) {

        moved = true;

        isDragging = true;

      }

      const walk =
        (x - startX) * 1.05;

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
          Math.min(next, max)
        );

      requestDepthUpdate(
        wrap
      );

    }

    wrap.addEventListener(
      "mousemove",
      e => {
        onMove(e.pageX);
      }
    );

    wrap.addEventListener(
      "touchmove",
      e => {
        onMove(
          e.touches[0].pageX
        );
      },
      { passive: true }
    );

    /* =========================
       CLICK BLOCK
    ========================= */

    wrap.addEventListener(
      "click",
      e => {

        if (moved) {

          e.preventDefault();

          e.stopPropagation();

          moved = false;

          return;
        }

      },
      true
    );

    /* =========================
       END
    ========================= */

    function endDrag() {

      if (!isDown) return;

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

    /* =========================
       SCROLL
    ========================= */

    wrap.addEventListener(
      "scroll",
      () => {

        if (
          wrap._isProgrammatic
        ) {
          return;
        }

        requestDepthUpdate(
          wrap
        );

      },
      { passive: true }
    );

  });

}

/* =========================
   DEPTH RAF
========================= */

function requestDepthUpdate(
  wrap
) {

  if (
    wrap._depthTicking
  ) {
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
   CENTER SELECTED
========================= */

function centerSelected(
  wrap
) {

  const active =
    wrap.querySelector(
      ".cover-card.active"
    );

  if (!active) return;

  centerCard(
    wrap,
    active,
    false
  );

}

/* =========================
   CENTER CARD
========================= */

function centerCard(
  wrap,
  card,
  smooth = true
) {

  if (!card) return;

  requestAnimationFrame(() => {

    const cardCenter =
      card.offsetLeft +
      card.clientWidth / 2;

    const target =
      cardCenter -
      wrap.clientWidth / 2;

    const max =
      Math.max(
        0,
        wrap.scrollWidth -
        wrap.clientWidth
      );

    const final =
      Math.max(
        0,
        Math.min(target, max)
      );

    wrap._isProgrammatic =
      true;

    wrap.scrollTo({
      left: final,
      behavior:
        smooth
          ? "smooth"
          : "auto"
    });

    clearTimeout(
      wrap._programmaticTimer
    );

    wrap._programmaticTimer =
      setTimeout(() => {

        wrap._isProgrammatic =
          false;

        requestDepthUpdate(
          wrap
        );

      }, smooth ? 420 : 0);

  });

}

/* =========================
   INERTIA
========================= */

function inertia(
  wrap,
  velocity
) {

  if (
    wrap.scrollWidth <=
    wrap.clientWidth
  ) {
    return;
  }

  let current =
    velocity * 1.7;

  function frame() {

    current *= 0.92;

    const next =
      wrap.scrollLeft -
      current;

    const max =
      wrap.scrollWidth -
      wrap.clientWidth;

    wrap.scrollLeft =
      Math.max(
        0,
        Math.min(next, max)
      );

    requestDepthUpdate(
      wrap
    );

    if (
      Math.abs(current) > 0.35
    ) {

      wrap._inertiaRAF =
        requestAnimationFrame(
          frame
        );

    } else {

      snapToCenter(wrap);

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
) {

  const cards = [
    ...wrap.querySelectorAll(
      ".cover-card"
    )
  ];

  if (!cards.length) {
    return;
  }

  const wrapCenter =
    wrap.scrollLeft +
    wrap.clientWidth / 2;

  let closest = null;

  let min = Infinity;

  cards.forEach(card => {

    const c =
      card.offsetLeft +
      card.clientWidth / 2;

    const d =
      Math.abs(
        wrapCenter - c
      );

    if (d < min) {

      min = d;

      closest = card;

    }

  });

  if (!closest) return;

  setSelected(
    wrap.dataset.type,
    closest.dataset.id
  );

  cards.forEach(c => {
    c.classList.remove(
      "active"
    );
  });

  closest.classList.add(
    "active"
  );

  centerCard(
    wrap,
    closest,
    true
  );

}

/* =========================
   DEPTH
========================= */

function updateDepth(
  wrap
) {

  const cards = [
    ...wrap.querySelectorAll(
      ".cover-card"
    )
  ];

  if (!cards.length) {
    return;
  }

  const active =
    wrap.querySelector(
      ".cover-card.active"
    ) || cards[0];

  const activeIndex =
    cards.indexOf(active);

  cards.forEach(card => {

    const index =
      cards.indexOf(card);

    const dist =
      Math.abs(
        index - activeIndex
      );

    card.classList.remove(
      "depth-1",
      "depth-2"
    );

    if (dist === 1) {

      card.classList.add(
        "depth-1"
      );

    } else if (
      dist >= 2
    ) {

      card.classList.add(
        "depth-2"
      );

    }

  });

}
