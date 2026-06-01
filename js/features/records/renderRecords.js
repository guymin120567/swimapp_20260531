// js/features/records/renderRecords.js

import {
  getState
} from "../../state/state.js";

export function renderRecords(){

  const target =
    document.getElementById(
      "recordsSection"
    );

  if(!target){
    return;
  }

  const state =
    getState();

  const records =
    state.records || [];

  if(!records.length){

    target.innerHTML = `

      <div class="section-title">
        기록
      </div>

      <div class="empty-records">
        아직 기록이 없습니다
      </div>

    `;

    return;

  }

  target.innerHTML = `

    <div class="section-title">
      기록
    </div>

    <div class="records-list">

      ${records.map(
        record =>
          createRecordHtml(
            record,
            state.items
          )
      ).join("")}

    </div>

  `;

}

function createRecordHtml(
  record,
  items
){

  const cap =
    items.find(
      i =>
        i.id ===
        record.capId
    );

  const swim =
    items.find(
      i =>
        i.id ===
        record.swimId
    );

  const date =
    new Date(
      record.createdAt
    );

  const dateText =
    `${date.getMonth()+1}/${date.getDate()}`;

  return `

    <div class="record-card">

      <div class="record-date">
        ${dateText}
      </div>

      <div class="record-row">
        🧢 ${
          cap?.name ||
          "(삭제됨)"
        }
      </div>

      <div class="record-row">
        🏊 ${
          swim?.name ||
          "(삭제됨)"
        }
      </div>

    </div>

  `;

}
