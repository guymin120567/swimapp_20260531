// js/ui/renderLayout.js

export function renderLayout(){

  const app =
    document.getElementById(
      "app"
    );

  if(!app){
    return;
  }

  app.innerHTML = `

    <div class="container">

<div
  id="addModal"
  class="add-modal"
  hidden
>

  <div
    class="add-modal-backdrop"
    data-action="close-add"
  ></div>

  <div class="add-modal-sheet">

    <div class="add-modal-header">
      <div class="section-title">아이템 추가</div>
      <button class="modal-close-btn" data-action="close-add">×</button>
    </div>

    <input
      id="itemText"
      type="text"
      placeholder="이름 입력"
    />

    <input
      id="itemImage"
      type="file"
      accept="image/*"
    />

    <button
      class="spin-btn"
      data-action="add"
    >
      추가하기
    </button>

  </div>

</div>
      <main class="main-content">

        <!-- =====================
             ROULETTE
        ====================== -->

        <section
          id="rouletteSection"
          class="section roulette-page"
        >

          <div class="roulette-bg"></div>

          <div id="rouletteContent"></div>

        </section>

        <!-- =====================
             LIST
        ====================== -->

        <section
          id="listsSection"
          class="section"
          hidden
        >

          <!-- CAP -->

<div class="block">

  <div class="section-header">

    <div class="section-title">
      수모 리스트
    </div>

    <button
      class="add-mini-btn"
      data-action="open-add"
      data-type="cap"
    >
      +
    </button>

  </div>

  <div
    class="coverflow"
    data-type="cap"
  ></div>

</div>

          <!-- SWIM -->
<div class="block">


  <div class="section-header">

    <div class="section-title">
      수영복 리스트
    </div>

    <button
      class="add-mini-btn"
      data-action="open-add"
      data-type="swim"
    >
      +
    </button>

  </div>

  <div
    class="coverflow"
    data-type="swim"
  ></div>

</div></div>

          </div>
          
        </section>

        <!-- =====================
             RECORDS
        ====================== -->

        <section
          id="recordsSection"
          class="section"
          hidden
        >

          <div class="section-title">
            기록
          </div>

          <div class="empty-records">
            아직 기록이 없습니다
          </div>

        </section>

      </main>

      <!-- =====================
           TAB
      ====================== -->

      <nav class="bottom-tabs">

        <button
          class="bottom-tab active"
          data-tab="roulette"
        >
          룰렛
        </button>

        <button
          class="bottom-tab"
          data-tab="inventory"
        >
          리스트
        </button>

        <button
          class="bottom-tab"
          data-tab="records"
        >
          기록
        </button>

      </nav>

    </div>

  `;

}
