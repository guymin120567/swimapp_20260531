import { getState } from "../../state/state.js";

export function renderRoulette(){

  const target =
    document.getElementById("rouletteContent");

  if(!target) return;

  const state = getState();

  const items =
    Array.isArray(state.items) ? state.items : [];

const cap =
  items.find(
    i => i.id === state.selection?.capId
  ) || null;

const swim =
  items.find(
    i => i.id === state.selection?.swimId
  ) || null;

  target.innerHTML = `
    <div class="block">

      <div class="section-title">룰렛 결과</div>

      <div class="roulette-wrap">

        <div class="roulette-slot" data-type="cap">
          <div class="roulette-label">CAP</div>

<div
  class="
    roulette-card
    ${
      state.ui?.isSpinning
        ? "spinning"
        : ""
    }
  "
>
            ${
              cap
                ? `
                 <img
  class="roulette-image"
  src="${cap.image || ""}"
  draggable="false"
/>
                  <div class="card-overlay">
                    <div class="roulette-name">${cap.name}</div>
                  </div>
                `
                : `<div class="card-placeholder">🧢</div>`
            }
          </div>
        </div>

        <div class="roulette-slot" data-type="swim">
          <div class="roulette-label">SWIM</div>

<div
  class="
    roulette-card
    ${
      state.ui?.isSpinning
        ? "spinning"
        : ""
    }
  "
>
            ${
              swim
                ? `
                 <img
  class="roulette-image"
  src="${cap.image || ""}"
  draggable="false"
/>
                  <div class="card-overlay">
                    <div class="roulette-name">${swim.name}</div>
                  </div>
                `
                : `<div class="card-placeholder">🏊</div>`
            }
          </div>
        </div>

      </div>

      <button class="spin-btn" data-action="spin">오늘 뭐 입지 ? </button>

    </div>
  `;
}
