// js/features/records/renderRecords.js

import {
  getState
} from "../../state/state.js";

/* =========================
   RENDER
========================= */

export function renderRecords(){

  const target =
    document.getElementById(
      "recordsContent"
    );

  if(!target){
    return;
  }

  const state =
    getState();

  const records =
    Array.isArray(
      state.records
    )
      ? [...state.records]
      : [];

  if(!records.length){

    target.innerHTML = `
      <div class="empty-records">
        아직 기록이 없습니다
      </div>
    `;

    return;

  }

  target.innerHTML =
    `
      <div class="records-list">

        ${
          records
            .slice()
            .reverse()
            .map(record => {

              return `

                <div class="record-card">

                  <div class="record-date">
                    ${formatDate(record.date)}
                  </div>

                  <div class="record-row">
                    🧢 ${record.capName || "-"}
                  </div>

                  <div class="record-row">
                    🩳 ${record.swimName || "-"}
                  </div>

                </div>

              `;

            })
            .join("")
        }

      </div>
    `;

}

/* =========================
   DATE FORMAT
========================= */

function formatDate(date){

  if(!date){
    return "-";
  }

  const d =
    new Date(date);

  if(
    Number.isNaN(
      d.getTime()
    )
  ){
    return "-";
  }

  return (
    `${d.getFullYear()}. ` +
    `${String(
      d.getMonth() + 1
    ).padStart(2,"0")}. ` +
    `${String(
      d.getDate()
    ).padStart(2,"0")} ` +
    `${String(
      d.getHours()
    ).padStart(2,"0")}:` +
    `${String(
      d.getMinutes()
    ).padStart(2,"0")}`
  );

}
