// updateDepth 부분만 교체

function updateDepth(
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

  const activeCard =
    wrap.querySelector(
      ".cover-card.active"
    ) || cards[0];

  const activeIndex =
    cards.indexOf(
      activeCard
    );

  cards.forEach(card => {

    const index =
      cards.indexOf(card);

    const distance =
      Math.abs(
        index - activeIndex
      );

    card.classList.remove(
      "depth-1",
      "depth-2"
    );

    if(distance === 1){

      card.classList.add(
        "depth-1"
      );

    }else if(distance >= 2){

      card.classList.add(
        "depth-2"
      );

    }

  });

}
