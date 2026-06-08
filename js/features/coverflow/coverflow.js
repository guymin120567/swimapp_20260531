/* =========================
   DEPTH
========================= */

export function updateDepth(
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

  const state =
    getState();

  const type =
    wrap.dataset.type;

  const selectedId =
    type === "cap"
      ? state.selection?.capId
      : state.selection?.swimId;

  let activeCard =
    cards.find(
      card =>
        card.dataset.id ===
        selectedId
    );

  if(!activeCard){

    activeCard =
      findCenterCard(
        wrap
      );

  }

  if(!activeCard){
    return;
  }

  const activeIndex =
    cards.indexOf(
      activeCard
    );

  const total =
    cards.length;

  cards.forEach((card,index)=>{

    const dist =
      Math.abs(
        index - activeIndex
      );

    /* =========================
       RESET
    ========================= */

    card.classList.remove(
      "active",
      "depth-1",
      "depth-2",
      "hidden"
    );

    card.style.opacity =
      "";

    card.style.transform =
      "";

    card.style.pointerEvents =
      "";

    const badge =
      card.querySelector(
        ".card-index"
      );

    if(badge){

      badge.textContent =
        `${index + 1} / ${total}`;

    }

    /* =========================
       SIMPLE MODE FIX
    ========================= */

    if(
      total <= 2
    ){

      card.classList.remove(
        "hidden",
        "depth-1",
        "depth-2"
      );

      card.style.opacity =
        "1";

      card.style.pointerEvents =
        "auto";

      card.style.transform =
        "translateZ(0)";

      if(
        card.dataset.id ===
        selectedId
      ){

        card.classList.add(
          "active"
        );

      }else{

        card.classList.remove(
          "active"
        );

      }

      return;

    }

    /* =========================
       NORMAL MODE
    ========================= */

    if(dist === 0){

      card.classList.add(
        "active"
      );

    }else if(
      dist === 1
    ){

      card.classList.add(
        "depth-1"
      );

    }else if(
      dist === 2
    ){

      card.classList.add(
        "depth-2"
      );

    }else{

      card.classList.add(
        "hidden"
      );

    }

  });

}
