// js/features/coverflow/drag.js

import { getState } from "../../state/state.js";
import { setSelected } from "../../state/actions.js";
import { queueRender } from "../../render/renderQueue.js";
import { getCoverflowCards } from "../../shared/domCache.js";

/* =========================
   GLOBAL HELPERS
========================= */

function isMobilePointer() {
  return window.matchMedia("(pointer:coarse)").matches;
}

function getCards(wrap) {
  return getCoverflowCards(wrap);
}

function isSimpleMode(wrap) {
  return getCards(wrap).length <= 2;
}

/* =========================
   BIND
========================= */

export function bindDrag() {
  const wraps = document.querySelectorAll(".coverflow");

  wraps.forEach(wrap => {
    if (wrap._dragCleanup) {
      wrap._dragCleanup();
    }

    /* =========================
       STATE FLAGS
    ========================= */

    wrap._isDragging = false;
    wrap._isInertia = false;
    wrap._isProgrammatic = false;

    wrap._inertiaRAF = null;
    wrap._selectTimer = null;

    wrap.style.touchAction = "pan-y";

    let startX = 0;
    let lastX = 0;
    let scrollLeft = 0;

    let velocity = 0;
    let moved = false;
    let hasMoved = false;

    let downCard = null;
    let pointerId = null;

    const MOVE_THRESHOLD = isMobilePointer() ? 12 : 6;

    /* =========================
       DEPTH UPDATE (batched)
    ========================= */

    function requestDepth() {
      queueRender(`depth:${wrap}`, () => {
        updateDepth(wrap);
      });
    }

    /* =========================
       SELECT DEBOUNCE
    ========================= */

    function requestSelectFromCenter() {
      clearTimeout(wrap._selectTimer);

      wrap._selectTimer = setTimeout(() => {
        if (wrap._isDragging || wrap._isInertia || wrap._isProgrammatic) return;

        const center = findCenterCard(wrap);
        if (!center) return;

        setSelected(center.dataset.type, center.dataset.id);
      }, 120);
    }

    /* =========================
       POINTER DOWN
    ========================= */

    function onDown(e) {
      if (e.target.closest(".delete-btn")) return;

      if (getState().runtime?.isSpinning) return;
      if (wrap.classList.contains("spinning-lock")) return;
      if (wrap._isProgrammatic) return;

      const card = e.target.closest(".cover-card");
      if (!card) return;

      if (isSimpleMode(wrap)) {
        downCard = card;
        moved = false;
        return;
      }

      const maxScroll = wrap.scrollWidth - wrap.clientWidth;
      if (maxScroll <= 0) return;

      cancelAnimationFrame(wrap._inertiaRAF);
      wrap._isInertia = false;

      wrap._isDragging = true;
      wrap.classList.add("dragging");

      startX = e.clientX;
      lastX = e.clientX;
      scrollLeft = wrap.scrollLeft;

      velocity = 0;
      moved = false;
      hasMoved = false;

      downCard = card;
      pointerId = e.pointerId;

      try {
        wrap.setPointerCapture(pointerId);
      } catch {}

      requestDepth();
    }

    /* =========================
       POINTER MOVE
    ========================= */

    function onMove(e) {
      if (!wrap._isDragging) return;

      const dx = e.clientX - startX;

      if (Math.abs(dx) > MOVE_THRESHOLD) {
        moved = true;
      }

      if (moved) {
        e.preventDefault();
      }

      const walk = dx * 1.02;

      velocity = hasMoved ? e.clientX - lastX : 0;
      hasMoved = true;

      lastX = e.clientX;

      const next = scrollLeft - walk;

      const max = wrap.scrollWidth - wrap.clientWidth;

      wrap.scrollLeft = Math.max(0, Math.min(next, max));

      requestDepth();
    }

    /* =========================
       POINTER END
    ========================= */

    function endDrag() {
      if (isSimpleMode(wrap)) {
        if (downCard && !moved) {
          setSelected(downCard.dataset.type, downCard.dataset.id);
        }

        cleanup();
        return;
      }

      if (!wrap._isDragging) {
        cleanup();
        return;
      }

      wrap._isDragging = false;
      wrap.classList.remove("dragging");

      const target = downCard;

      /* =========================
         CLICK (no move)
      ========================= */

      if (!moved && Math.abs(velocity) < 4 && target) {
        wrap._isProgrammatic = true;

        setSelected(target.dataset.type, target.dataset.id);

        scrollToCard(wrap, target);

        queueRender(`depth:${wrap}`, () => {
          updateDepth(wrap);
        });

        cleanup();
        return;
      }

      /* =========================
         INERTIA OR SNAP
      ========================= */

      if (Math.abs(velocity) > 1.2) {
        inertia(wrap, velocity);
      } else {
        snapToNearestCard(wrap);
      }

      cleanup();
    }

    /* =========================
       CLEANUP
    ========================= */

    function cleanup() {
      wrap._isDragging = false;
      moved = false;
      hasMoved = false;
      downCard = null;
      pointerId = null;

      try {
        if (pointerId !== null) {
          wrap.releasePointerCapture(pointerId);
        }
      } catch {}

      wrap.classList.remove("dragging");
    }

    /* =========================
       EVENTS
    ========================= */

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove, { passive: false });
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("blur", endDrag);
    window.addEventListener("pagehide", endDrag);

    /* =========================
       SCROLL (NO SELECT)
    ========================= */

    wrap.addEventListener(
      "scroll",
      () => {
        if (wrap._isProgrammatic) return;
        if (isSimpleMode(wrap)) return;

        requestDepth();
        requestSelectFromCenter();
      },
      { passive: true }
    );

    /* =========================
       INIT
    ========================= */

    queueRender(`init:${wrap}`, () => {
      if (getCards(wrap).length > 2) {
        snapToNearestCard(wrap, false);
      } else {
        updateDepth(wrap);
      }
    });

    /* =========================
       CLEANUP HOOK
    ========================= */

    wrap._dragCleanup = () => {
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", endDrag);
      wrap.removeEventListener("pointercancel", endDrag);
    };
  });
}

/* =========================
   SNAP / CENTER HELPERS
========================= */

function findCenterCard(wrap) {
  const cards = getCoverflowCards(wrap);
  if (!cards.length) return null;

  const center = wrap.scrollLeft + wrap.clientWidth / 2;

  let best = null;
  let min = Infinity;

  cards.forEach(c => {
    const mid = c.offsetLeft + c.offsetWidth / 2;
    const d = Math.abs(center - mid);

    if (d < min) {
      min = d;
      best = c;
    }
  });

  return best;
}

/* =========================
   SCROLL TO CARD
========================= */

export function scrollToCard(wrap, card, smooth = true) {
  const cards = getCoverflowCards(wrap);
  if (cards.length <= 2) return;

  const left =
    card.offsetLeft -
    wrap.clientWidth / 2 +
    card.clientWidth / 2;

  wrap._isProgrammatic = true;

  wrap.scrollTo({
    left: Math.max(0, left),
    behavior: smooth ? "smooth" : "auto"
  });

  setTimeout(() => {
    wrap._isProgrammatic = false;
  }, smooth ? 300 : 0);
}

/* =========================
   SNAP
========================= */

export function snapToNearestCard(wrap) {
  const center = findCenterCard(wrap);
  if (!center) return;

  setSelected(center.dataset.type, center.dataset.id);
  scrollToCard(wrap, center);
}

/* =========================
   INERTIA
========================= */

function inertia(wrap, velocity) {
  cancelAnimationFrame(wrap._inertiaRAF);

  wrap._isInertia = true;

  function tick() {
    if (wrap._isProgrammatic) return;

    velocity *= 0.94;
    wrap.scrollLeft -= velocity;

    requestDepth();

    if (Math.abs(velocity) < 0.35) {
      wrap._isInertia = false;
      snapToNearestCard(wrap);
      return;
    }

    wrap._inertiaRAF = requestAnimationFrame(tick);
  }

  wrap._inertiaRAF = requestAnimationFrame(tick);
}

/* =========================
   DEPTH
========================= */

function updateDepth(wrap) {
  const cards = getCoverflowCards(wrap);
  const center = findCenterCard(wrap);

  if (!center) return;

  const centerIndex = cards.indexOf(center);

  cards.forEach((c, i) => {
    c.classList.remove("active", "depth-1", "depth-2", "hidden");

    const d = Math.abs(i - centerIndex);

    if (d === 0) c.classList.add("active");
    else if (d === 1) c.classList.add("depth-1");
    else if (d === 2) c.classList.add("depth-2");
    else c.classList.add("hidden");
  });
}
