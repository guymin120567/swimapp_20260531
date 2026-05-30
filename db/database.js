const DB_NAME = "swimRouletteDB";
const DB_VERSION = 4;
const STATE_STORE = "stateStore";
const STATE_KEY = "main_state";

let dbInstance = null;

// =========================
// OPEN DB (SAFE CORE)
// =========================
async function openDB(){

  if(dbInstance){
    return dbInstance;
  }

  return new Promise((resolve) => {

    let settled = false;

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // 🔥 강제 timeout 방지
    const timer = setTimeout(() => {

      if(settled) return;
      settled = true;

      console.warn("DB OPEN TIMEOUT → fallback mode");

      resolve(null);

    }, 3000);

    request.onupgradeneeded = (event) => {

      const db = event.target.result;

      if(!db.objectStoreNames.contains(STATE_STORE)){
        db.createObjectStore(STATE_STORE);
      }
    };

    request.onsuccess = () => {

      if(settled) return;
      settled = true;

      clearTimeout(timer);

      dbInstance = request.result;

      resolve(dbInstance);
    };

    request.onerror = () => {

      if(settled) return;
      settled = true;

      clearTimeout(timer);

      console.warn("DB OPEN ERROR → fallback mode");

      resolve(null);
    };

    request.onblocked = () => {
      console.warn("DB BLOCKED (ignored)");
    };

    request.onversionchange = () => {
      try {
        request.result?.close();
      } catch(e){}
    };

  });
}

// =========================
// SAVE STATE
// =========================
export async function saveState(state){

  const db = await openDB();

  // DB 없으면 그냥 무시 (앱 계속 동작)
  if(!db){
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return true;
  }

  return new Promise((resolve) => {

    const tx = db.transaction(STATE_STORE, "readwrite");
    const store = tx.objectStore(STATE_STORE);

    const req = store.put(state, STATE_KEY);

    req.onsuccess = () => resolve(true);

    req.onerror = () => {
      console.warn("SAVE FAIL → fallback localStorage");
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
      resolve(false);
    };

  });
}

// =========================
// LOAD STATE (핵심 안정화)
// =========================
export async function loadState(){

  const db = await openDB();

  // 🔥 DB 없으면 localStorage fallback
  if(!db){

    try {
      const raw = localStorage.getItem(STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e){
      return null;
    }
  }

  return new Promise((resolve) => {

    let settled = false;

    const timer = setTimeout(() => {

      if(settled) return;
      settled = true;

      console.warn("LOAD TIMEOUT → fallback localStorage");

      try {
        const raw = localStorage.getItem(STATE_KEY);
        resolve(raw ? JSON.parse(raw) : null);
      } catch(e){
        resolve(null);
      }

    }, 3000);

    try {

      const tx = db.transaction(STATE_STORE, "readonly");
      const store = tx.objectStore(STATE_STORE);
      const req = store.get(STATE_KEY);

      req.onsuccess = () => {

        if(settled) return;
        settled = true;

        clearTimeout(timer);

        resolve(req.result || null);
      };

      req.onerror = () => {

        if(settled) return;
        settled = true;

        clearTimeout(timer);

        console.warn("LOAD ERROR → fallback localStorage");

        const raw = localStorage.getItem(STATE_KEY);
        resolve(raw ? JSON.parse(raw) : null);
      };

    } catch(e){

      if(settled) return;
      settled = true;

      clearTimeout(timer);

      resolve(null);
    }
  });
}
