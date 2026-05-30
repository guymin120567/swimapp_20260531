import { subscribe } from "../state/state.js";
import { renderCoverflow } from "../features/coverflow/coverflow.js";
import { renderRoulette } from "../features/roulette/renderRoulette.js";

export function bindUI(){

  subscribe(() => {

    // 🔥 상태 변경되면 자동 렌더
    renderCoverflow();
    renderRoulette();

  });

}
