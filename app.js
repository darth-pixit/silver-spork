import { db } from "./firebase-config.js";
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove, runTransaction, writeBatch,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { ALL_REGIONS, DEFAULT_FILTERS, DISHES, dishesForFilters } from "./dishes.js";

const DISH_BY_ID = new Map(DISHES.map((d) => [d.id, d]));

const $ = (id) => document.getElementById(id);
const show = (el) => el && (el.hidden = false);
const hide = (el) => el && (el.hidden = true);

// ---------- Local identity (no auth) ----------

const userId = (() => {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) ||
      "u-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("userId", id);
  }
  return id;
})();
let displayName = localStorage.getItem("displayName") || "";

const local = {
  liked: JSON.parse(localStorage.getItem("liked") || "[]"),
  disliked: JSON.parse(localStorage.getItem("disliked") || "[]"),
};
const saveLocal = () => {
  localStorage.setItem("liked", JSON.stringify(local.liked));
  localStorage.setItem("disliked", JSON.stringify(local.disliked));
};

let currentHousehold = null;
let unsubHousehold = null;
let unsubSwipes = null;
let allSwipes = [];
let lastSwipe = null;

const todayKey = () => new Date().toLocaleDateString("en-CA");
const SWIPE_RETENTION_DAYS = 7;
const SUGGESTION_RETENTION_DAYS = 2;

// ---------- Boot ----------

(async function boot() {
  const hid = localStorage.getItem("householdId");
  if (hid) {
    try {
      const snap = await getDoc(doc(db, "households", hid));
      if (snap.exists() && (snap.data().members || []).includes(userId)) {
        attachHousehold(hid);
        return;
      }
    } catch {}
    localStorage.removeItem("householdId");
  }
  showOnboarding();
})();

function attachHousehold(hid) {
  if (unsubHousehold) unsubHousehold();
  if (unsubSwipes) unsubSwipes();
  localStorage.setItem("householdId", hid);
  unsubHousehold = onSnapshot(doc(db, "households", hid), (snap) => {
    if (!snap.exists()) return;
    currentHousehold = { id: snap.id, ...snap.data() };
    showApp();
    renderAll();
  });
  unsubSwipes = onSnapshot(collection(db, "households", hid, "swipes"), (snap) => {
    allSwipes = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
    if (currentHousehold) renderAll();
  });
  pruneStaleData(hid).catch(() => {});
}

async function pruneStaleData(hid) {
  const today = todayKey();
  const cutoffSwipe = new Date();
  cutoffSwipe.setDate(cutoffSwipe.getDate() - SWIPE_RETENTION_DAYS);
  const cutoffSwipeKey = cutoffSwipe.toLocaleDateString("en-CA");
  try {
    const snap = await getDocs(collection(db, "households", hid, "swipes"));
    const batch = writeBatch(db);
    let count = 0;
    snap.docs.forEach((d) => {
      const dk = d.data().dateKey;
      if (dk && dk < cutoffSwipeKey) { batch.delete(d.ref); count++; }
    });
    if (count) await batch.commit();
  } catch {}
  try {
    const hhSnap = await getDoc(doc(db, "households", hid));
    if (!hhSnap.exists()) return;
    const sugg = hhSnap.data().todaySuggestions || [];
    const cutoff = Date.now() - SUGGESTION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const fresh = sugg.filter((s) => (s.at || 0) >= cutoff);
    if (fresh.length !== sugg.length) {
      await updateDoc(doc(db, "households", hid), { todaySuggestions: fresh });
    }
    const tm = hhSnap.data().todayMenu;
    if (tm && tm.dateKey && tm.dateKey !== today) {
      await updateDoc(doc(db, "households", hid), { todayMenu: { dateKey: today, breakfast: "", lunch: "", dinner: "" } });
    }
  } catch {}
}

// ---------- Onboarding ----------

document.querySelectorAll("#household-view [data-onboard]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#household-view [data-onboard]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const which = btn.dataset.onboard;
    $("create-household-form").hidden = which !== "create";
    $("join-household-form").hidden = which !== "join";
  });
});

$("create-household-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hide($("household-error"));
  if (!ensureName()) return;
  const name = $("hh-name").value.trim();
  const cookName = $("cook-name").value.trim();
  const cookPhone = digitsWithCC($("cook-cc").value, $("cook-phone").value);
  if (!name) return;
  try {
    const hid = await createHousehold({ name, cookName, cookPhone });
    attachHousehold(hid);
  } catch (err) {
    showError("household-error", err.message || "Could not create");
  }
});

$("join-household-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hide($("household-error"));
  if (!ensureName()) return;
  const code = $("join-code").value.trim().toUpperCase();
  if (!code) return;
  try {
    const hid = await joinHousehold(code);
    attachHousehold(hid);
  } catch (err) {
    showError("household-error", err.message || "Could not join");
  }
});

function ensureName() {
  const v = $("display-name").value.trim();
  if (!v) {
    showError("household-error", "Enter your name first");
    $("display-name").focus();
    return false;
  }
  displayName = v;
  localStorage.setItem("displayName", displayName);
  return true;
}

async function createHousehold({ name, cookName, cookPhone }) {
  const code = generateJoinCode();
  const hhRef = doc(collection(db, "households"));
  await runTransaction(db, async (tx) => {
    const codeRef = doc(db, "joinIndex", code);
    const codeSnap = await tx.get(codeRef);
    if (codeSnap.exists()) throw new Error("Code collision, try again");
    tx.set(hhRef, {
      name, joinCode: code, cookName, cookPhone,
      ownerId: userId,
      members: [userId],
      memberNames: { [userId]: displayName },
      filters: DEFAULT_FILTERS,
      createdAt: serverTimestamp(),
    });
    tx.set(codeRef, { householdId: hhRef.id });
  });
  return hhRef.id;
}

async function joinHousehold(code) {
  const codeRef = doc(db, "joinIndex", code);
  const codeSnap = await getDoc(codeRef);
  if (!codeSnap.exists()) throw new Error("No household with that code");
  const hid = codeSnap.data().householdId;
  await updateDoc(doc(db, "households", hid), {
    members: arrayUnion(userId),
    [`memberNames.${userId}`]: displayName,
  });
  return hid;
}

function generateJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

// ---------- View switching ----------

function showOnboarding() {
  hide($("app-view"));
  show($("household-view"));
  hide($("topbar-right"));
  if (displayName) $("display-name").value = displayName;
}

function showApp() {
  hide($("household-view"));
  show($("app-view"));
  show($("topbar-right"));
  $("household-pill").textContent = currentHousehold.name;
}

$("leave-btn").addEventListener("click", () => {
  if (!confirm("Leave this household? Your swipes stay; you can rejoin with the code.")) return;
  if (unsubHousehold) unsubHousehold();
  if (unsubSwipes) unsubSwipes();
  unsubHousehold = unsubSwipes = null;
  currentHousehold = null;
  allSwipes = [];
  localStorage.removeItem("householdId");
  showOnboarding();
});

document.querySelectorAll("#app-view nav .tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#app-view nav .tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll("#app-view .view").forEach((v) => v.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
  });
});

// ---------- Render ----------

function renderAll() {
  renderCard();
  renderPlan();
  renderSettings();
  renderTastes();
  renderMembers();
}

function todaysSwipes() {
  const today = todayKey();
  return allSwipes.filter((s) => (s.dateKey || "") === today);
}

function userSwipes(uid) {
  return todaysSwipes().filter((s) => s.userId === uid);
}

function dishCandidates() {
  const filters = currentHousehold.filters || DEFAULT_FILTERS;
  const pool = dishesForFilters(filters).concat(
    (currentHousehold.customDishes || []).map((name) => ({
      id: "custom-" + slugify(name), name, region: "everyday",
      diet: "veg", meals: ["lunch","dinner"], spice: 1, effort: 1, heaviness: 2, ingredients: [],
    }))
  );
  const myVotes = new Set(userSwipes(userId).map((s) => s.dishId));
  return pool.filter((d) => !myVotes.has(d.id));
}

function renderCard() {
  const stack = $("card-stack");
  stack.innerHTML = "";
  const next = dishCandidates()[0];
  if (!next) {
    const empty = document.createElement("div");
    empty.className = "card empty";
    empty.innerHTML = "<div><p>You're caught up.</p><p style='font-size:13px'>Wait for others, or loosen filters in Settings.</p></div>";
    stack.appendChild(empty);
    return;
  }
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = next.id;
  const tags = [
    next.region, next.diet,
    next.spice === 3 ? "spicy" : next.spice === 1 ? "mild" : "med",
    next.effort === 1 ? "quick" : next.effort === 3 ? "elaborate" : "med effort",
  ].map((t) => `<span class="tag">${t}</span>`).join(" ");
  card.innerHTML = `<div class="dish">${escapeHtml(next.name)}</div><div class="meta">${tags}</div>`;
  stack.appendChild(card);
}

$("like-btn").addEventListener("click", () => swipe("like"));
$("dislike-btn").addEventListener("click", () => swipe("dislike"));
$("undo-btn").addEventListener("click", undoSwipe);

async function swipe(vote) {
  const dish = dishCandidates()[0];
  if (!dish || !currentHousehold) return;
  const card = document.querySelector(".card[data-id]");
  if (card) card.classList.add(vote === "like" ? "swipe-right" : "swipe-left");
  if (vote === "like" && !local.liked.includes(dish.name)) local.liked.push(dish.name);
  if (vote === "dislike" && !local.disliked.includes(dish.name)) local.disliked.push(dish.name);
  saveLocal();
  const dateKey = todayKey();
  const docId = `${userId}_${dish.id}_${dateKey}`;
  await setDoc(doc(db, "households", currentHousehold.id, "swipes", docId), {
    userId, dishId: dish.id, dishName: dish.name, vote, dateKey, at: serverTimestamp(),
  });
  lastSwipe = { dishId: dish.id, dishName: dish.name, vote, docId };
  updateUndoButton();
  setTimeout(renderCard, 220);
}

async function undoSwipe() {
  if (!lastSwipe || !currentHousehold) return;
  const { dishName, vote, docId } = lastSwipe;
  try {
    await deleteDoc(doc(db, "households", currentHousehold.id, "swipes", docId));
  } catch {}
  if (vote === "like") local.liked = local.liked.filter((n) => n !== dishName);
  if (vote === "dislike") local.disliked = local.disliked.filter((n) => n !== dishName);
  saveLocal();
  lastSwipe = null;
  updateUndoButton();
  renderCard();
  renderTastes();
}

function updateUndoButton() {
  const btn = $("undo-btn");
  if (!btn) return;
  btn.disabled = !lastSwipe;
}

$("add-to-deck-btn").addEventListener("click", async () => {
  const input = $("manual-input");
  const name = input.value.trim();
  if (!name || !currentHousehold) return;
  await updateDoc(doc(db, "households", currentHousehold.id), {
    customDishes: arrayUnion(name),
  });
  input.value = "";
  flashHint("Added to everyone's cards");
});

$("manual-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("manual-input");
  const name = input.value.trim();
  if (!name || !currentHousehold) return;
  const today = currentHousehold.todaySuggestions || [];
  if (today.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
    flashHint("Already on today's list");
    return;
  }
  await updateDoc(doc(db, "households", currentHousehold.id), {
    todaySuggestions: arrayUnion({
      name,
      byUid: userId,
      byName: currentHousehold.memberNames?.[userId] || displayName || "Member",
      at: Date.now(),
    }),
  });
  input.value = "";
  flashHint("Suggested for today — open Plan to send to cook");
});

const ORIGINAL_EXPLAINER = $("manual-explainer").textContent;
let explainerTimer = null;
function flashHint(msg) {
  const el = $("manual-explainer");
  el.textContent = msg;
  clearTimeout(explainerTimer);
  explainerTimer = setTimeout(() => { el.textContent = ORIGINAL_EXPLAINER; }, 2200);
}

function matchedDishes() {
  if (!currentHousehold) return [];
  const memberCount = currentHousehold.members.length;
  const byDish = new Map();
  for (const s of todaysSwipes()) {
    if (!byDish.has(s.dishId)) byDish.set(s.dishId, { name: s.dishName, likes: new Set(), dislikes: new Set() });
    const e = byDish.get(s.dishId);
    if (s.vote === "like") e.likes.add(s.userId);
    else e.dislikes.add(s.userId);
  }
  const out = [];
  for (const [dishId, e] of byDish.entries()) {
    if (e.dislikes.size > 0) continue;
    if (e.likes.size === memberCount) out.push({ dishId, name: e.name });
  }
  return out;
}

const SLOTS = ["breakfast", "lunch", "dinner"];
const SLOT_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

function todayMenu() {
  const tm = currentHousehold?.todayMenu;
  if (!tm || tm.dateKey !== todayKey()) return { breakfast: "", lunch: "", dinner: "" };
  return { breakfast: tm.breakfast || "", lunch: tm.lunch || "", dinner: tm.dinner || "" };
}

function suggestionsToday() {
  const today = todayKey();
  return (currentHousehold?.todaySuggestions || []).filter((s) => {
    if (!s.at) return false;
    return new Date(s.at).toLocaleDateString("en-CA") === today;
  });
}

function chipsForSlot(slot, matched, suggestions) {
  const chips = [];
  for (const m of matched) {
    const dish = DISH_BY_ID.get(m.dishId);
    const meals = dish?.meals;
    if (!meals || meals.includes(slot)) chips.push({ name: m.name, kind: "matched" });
  }
  for (const s of suggestions) chips.push({ name: s.name, kind: "today" });
  const seen = new Set();
  return chips.filter(({ name }) => {
    const k = name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function renderPlan() {
  if (!currentHousehold) return;
  const memberCount = currentHousehold.members.length;
  $("match-hint").textContent = memberCount > 1
    ? `Set today's menu. Tap a chip to fill a slot, or type your own. Matches show when all ${memberCount} members swipe yum.`
    : "Set today's menu. Type freely, or invite others with the join code so swipe matches surface as chips.";

  const menu = todayMenu();
  const matched = matchedDishes();
  const suggestions = suggestionsToday();

  for (const slot of SLOTS) {
    const input = $(`slot-${slot}`);
    if (input && document.activeElement !== input) input.value = menu[slot] || "";
    const chipWrap = $(`slot-${slot}-chips`);
    if (!chipWrap) continue;
    chipWrap.innerHTML = "";
    const chips = chipsForSlot(slot, matched, suggestions);
    if (chips.length === 0) {
      const empty = document.createElement("span");
      empty.className = "hint";
      empty.style.fontSize = "12px";
      empty.textContent = "No suggestions yet — type your own.";
      chipWrap.appendChild(empty);
    } else {
      for (const c of chips) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (c.kind === "today" ? " today" : "");
        b.textContent = c.name;
        b.dataset.slot = slot;
        b.dataset.fill = c.name;
        chipWrap.appendChild(b);
      }
    }
  }

  const anyFilled = SLOTS.some((s) => (menu[s] || "").trim());
  $("send-cook-btn").disabled = !currentHousehold.cookPhone || !anyFilled;
}

async function saveMenuField(slot, value) {
  if (!currentHousehold) return;
  const menu = { ...todayMenu(), [slot]: value, dateKey: todayKey() };
  await updateDoc(doc(db, "households", currentHousehold.id), { todayMenu: menu });
}

let menuSaveTimer = null;
SLOTS.forEach((slot) => {
  const input = $(`slot-${slot}`);
  if (!input) return;
  input.addEventListener("input", () => {
    clearTimeout(menuSaveTimer);
    const value = input.value;
    menuSaveTimer = setTimeout(() => saveMenuField(slot, value), 400);
  });
  input.addEventListener("blur", () => {
    clearTimeout(menuSaveTimer);
    saveMenuField(slot, input.value);
  });
});

document.addEventListener("click", async (e) => {
  const chip = e.target.closest("button.chip[data-fill]");
  if (!chip) return;
  const slot = chip.dataset.slot;
  const value = chip.dataset.fill;
  const input = $(`slot-${slot}`);
  if (input) input.value = value;
  await saveMenuField(slot, value);
});

$("send-cook-btn").addEventListener("click", () => {
  if (!currentHousehold?.cookPhone) return;
  const menu = todayMenu();
  const filled = SLOTS.filter((s) => (menu[s] || "").trim());
  if (!filled.length) return;
  const cookName = currentHousehold.cookName || "ji";
  const family = currentHousehold.name;
  const parts = [`Namaste ${cookName} 🙏`, `From the ${family} family — today's menu:`, ""];
  for (const slot of filled) parts.push(`${SLOT_LABEL[slot]}: ${menu[slot].trim()}`);
  parts.push("", "Anything missing in groceries? Reply here.");
  const phone = (currentHousehold.cookPhone || "").replace(/\D/g, "");
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(parts.join("\n"))}`, "_blank");
});

$("reset-today-btn").addEventListener("click", async () => {
  if (!confirm("Clear today's swipes, suggestions and menu for everyone?")) return;
  const today = todayKey();
  const snap = await getDocs(collection(db, "households", currentHousehold.id, "swipes"));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    if ((d.data().dateKey || "") === today) batch.delete(d.ref);
  });
  batch.update(doc(db, "households", currentHousehold.id), {
    todaySuggestions: [],
    todayMenu: { dateKey: today, breakfast: "", lunch: "", dinner: "" },
  });
  await batch.commit();
  lastSwipe = null;
  updateUndoButton();
});

// ---------- Settings ----------

function renderSettings() {
  if (!currentHousehold) return;
  const f = currentHousehold.filters || DEFAULT_FILTERS;
  $("f-diet").value = f.diet || "any";
  $("f-spice").value = String(f.maxSpice ?? 3);
  $("f-effort").value = String(f.maxEffort ?? 3);
  $("f-excluded").value = (f.excludedIngredients || []).join(", ");

  const regWrap = $("region-toggles");
  regWrap.innerHTML = "";
  const excluded = new Set(f.excludedRegions || []);
  ALL_REGIONS.forEach(([key, label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (excluded.has(key) ? " on" : "");
    b.textContent = label;
    b.addEventListener("click", () => b.classList.toggle("on"));
    b.dataset.region = key;
    regWrap.appendChild(b);
  });

  $("s-cook-name").value = currentHousehold.cookName || "";
  splitCC(currentHousehold.cookPhone || "", $("s-cook-cc"), $("s-cook-phone"));

  $("s-display-name").value = currentHousehold.memberNames?.[userId] || displayName || "";
  $("join-code-display").textContent = currentHousehold.joinCode || "";
}

$("filters-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const excludedRegions = [...document.querySelectorAll("#region-toggles .chip.on")].map((b) => b.dataset.region);
  const excludedIngredients = $("f-excluded").value.split(",").map((s) => s.trim()).filter(Boolean);
  const filters = {
    diet: $("f-diet").value,
    excludedRegions,
    excludedIngredients,
    maxSpice: Number($("f-spice").value),
    maxEffort: Number($("f-effort").value),
  };
  await updateDoc(doc(db, "households", currentHousehold.id), { filters });
  flash("filters-saved");
});

$("cook-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const cookName = $("s-cook-name").value.trim();
  const cookPhone = digitsWithCC($("s-cook-cc").value, $("s-cook-phone").value);
  await updateDoc(doc(db, "households", currentHousehold.id), { cookName, cookPhone });
  flash("cook-saved");
});

$("me-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = $("s-display-name").value.trim();
  if (!v) return;
  displayName = v;
  localStorage.setItem("displayName", displayName);
  await updateDoc(doc(db, "households", currentHousehold.id), {
    [`memberNames.${userId}`]: displayName,
  });
  flash("me-saved");
});

// ---------- Tastes ----------

function renderTastes() {
  const fill = (ulId, items, kind) => {
    const ul = $(ulId);
    ul.innerHTML = "";
    if (items.length === 0) {
      const li = document.createElement("li"); li.className = "empty"; li.textContent = "Nothing yet";
      ul.appendChild(li); return;
    }
    items.forEach((name) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${escapeHtml(name)}</span><button data-name="${escapeHtml(name)}" data-kind="${kind}">×</button>`;
      ul.appendChild(li);
    });
  };
  fill("liked-list", local.liked, "liked");
  fill("disliked-list", local.disliked, "disliked");
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".pref-list button[data-name]");
  if (!btn) return;
  const { name, kind } = btn.dataset;
  local[kind] = local[kind].filter((n) => n !== name);
  saveLocal();
  renderTastes();
  renderCard();
});

// ---------- Members ----------

function renderMembers() {
  const ul = $("members-list"); ul.innerHTML = "";
  const names = currentHousehold.memberNames || {};
  currentHousehold.members.forEach((uid) => {
    const li = document.createElement("li");
    const me = uid === userId ? " (you)" : "";
    const owner = uid === currentHousehold.ownerId ? " · owner" : "";
    li.innerHTML = `<span>${escapeHtml(names[uid] || uid.slice(0, 6))}${me}${owner}</span>`;
    ul.appendChild(li);
  });
}

// ---------- Helpers ----------

function showError(id, msg) {
  const el = $(id); el.textContent = msg; show(el);
}
function flash(id) {
  const el = $(id); show(el); setTimeout(() => hide(el), 1500);
}
function digitsWithCC(cc, raw) {
  const d = (raw || "").replace(/\D/g, "");
  return d ? cc + d : "";
}
function splitCC(stored, ccSelect, phoneInput) {
  const ccs = [...ccSelect.options].map((o) => o.value).sort((a, b) => b.length - a.length);
  const match = ccs.find((c) => stored.startsWith(c));
  if (match) {
    ccSelect.value = match;
    phoneInput.value = stored.slice(match.length);
  } else {
    phoneInput.value = stored.replace(/\D/g, "");
  }
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
