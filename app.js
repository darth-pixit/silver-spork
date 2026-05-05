import { auth, db } from "./firebase-config.js";
import {
  RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs,
  onSnapshot, serverTimestamp, arrayUnion, runTransaction, writeBatch,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { DISHES, ALL_REGIONS, DEFAULT_FILTERS, dishesForFilters } from "./dishes.js";

const $ = (id) => document.getElementById(id);
const show = (el) => el && (el.hidden = false);
const hide = (el) => el && (el.hidden = true);

const local = {
  liked: JSON.parse(localStorage.getItem("liked") || "[]"),
  disliked: JSON.parse(localStorage.getItem("disliked") || "[]"),
};
const saveLocal = () => {
  localStorage.setItem("liked", JSON.stringify(local.liked));
  localStorage.setItem("disliked", JSON.stringify(local.disliked));
};

let currentUser = null;
let currentHousehold = null;        // { id, ...data }
let unsubHousehold = null;
let unsubSwipes = null;
let allSwipes = [];                 // [{ userId, dishId, vote }]
let confirmationResult = null;
let recaptcha = null;

// ---------- Auth ----------

function setupRecaptcha() {
  if (recaptcha) return recaptcha;
  recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
  return recaptcha;
}

$("phone-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hide($("auth-error"));
  const cc = $("cc").value;
  const phone = $("phone").value.replace(/\D/g, "");
  if (!phone) return;
  $("send-otp-btn").disabled = true;
  try {
    const verifier = setupRecaptcha();
    confirmationResult = await signInWithPhoneNumber(auth, cc + phone, verifier);
    hide($("phone-form"));
    show($("otp-form"));
    $("otp").focus();
  } catch (err) {
    showError("auth-error", err.message || "Could not send OTP");
    try { recaptcha?.clear(); } catch {} recaptcha = null;
  } finally {
    $("send-otp-btn").disabled = false;
  }
});

$("otp-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hide($("auth-error"));
  const code = $("otp").value.trim();
  if (!code || !confirmationResult) return;
  try {
    await confirmationResult.confirm(code);
  } catch (err) {
    showError("auth-error", "Wrong code, try again");
  }
});

$("otp-back").addEventListener("click", () => {
  hide($("otp-form"));
  show($("phone-form"));
  $("otp").value = "";
});

$("signout-btn").addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});

onAuthStateChanged(auth, async (user) => {
  if (!user) { showAuth(); return; }
  currentUser = user;
  await ensureUserDoc(user);
  await routeAfterAuth();
});

async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { phone: user.phoneNumber, createdAt: serverTimestamp() });
  }
}

// ---------- Household routing ----------

async function routeAfterAuth() {
  const q = query(collection(db, "households"), where("members", "array-contains", currentUser.uid));
  const snap = await getDocs(q);
  if (snap.empty) { showHouseholdOnboarding(); return; }
  const hhDoc = snap.docs[0];
  attachHousehold(hhDoc.id);
}

function attachHousehold(hid) {
  if (unsubHousehold) unsubHousehold();
  if (unsubSwipes) unsubSwipes();
  unsubHousehold = onSnapshot(doc(db, "households", hid), (snap) => {
    if (!snap.exists()) return;
    currentHousehold = { id: snap.id, ...snap.data() };
    showApp();
    renderAll();
  });
  unsubSwipes = onSnapshot(collection(db, "households", hid, "swipes"), (snap) => {
    allSwipes = snap.docs.map((d) => d.data());
    if (currentHousehold) renderAll();
  });
}

// ---------- Onboarding (create / join) ----------

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
  const code = $("join-code").value.trim().toUpperCase();
  if (!code) return;
  try {
    const hid = await joinHousehold(code);
    attachHousehold(hid);
  } catch (err) {
    showError("household-error", err.message || "Could not join");
  }
});

async function createHousehold({ name, cookName, cookPhone }) {
  const code = generateJoinCode();
  const hhRef = doc(collection(db, "households"));
  await runTransaction(db, async (tx) => {
    const codeRef = doc(db, "joinIndex", code);
    const codeSnap = await tx.get(codeRef);
    if (codeSnap.exists()) throw new Error("Code collision, try again");
    tx.set(hhRef, {
      name, joinCode: code, cookName, cookPhone,
      ownerId: currentUser.uid,
      members: [currentUser.uid],
      memberNames: { [currentUser.uid]: currentUser.phoneNumber || "You" },
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
    members: arrayUnion(currentUser.uid),
    [`memberNames.${currentUser.uid}`]: currentUser.phoneNumber || "Member",
  });
  return hid;
}

function generateJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

// ---------- Top-level view switching ----------

function showAuth() {
  show($("auth-view")); hide($("household-view")); hide($("app-view"));
  hide($("topbar-right"));
}
function showHouseholdOnboarding() {
  hide($("auth-view")); show($("household-view")); hide($("app-view"));
  hide($("topbar-right"));
}
function showApp() {
  hide($("auth-view")); hide($("household-view")); show($("app-view"));
  show($("topbar-right"));
  $("household-pill").textContent = currentHousehold.name;
}

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

function userSwipes(userId) {
  return allSwipes.filter((s) => s.userId === userId);
}

function dishCandidates() {
  const filters = currentHousehold.filters || DEFAULT_FILTERS;
  const pool = dishesForFilters(filters).concat(
    (currentHousehold.customDishes || []).map((name) => ({
      id: "custom-" + slugify(name), name, region: "everyday",
      diet: "veg", meals: ["lunch","dinner"], spice: 1, effort: 1, heaviness: 2, ingredients: [],
    }))
  );
  const myVotes = new Set(userSwipes(currentUser.uid).map((s) => s.dishId));
  return pool.filter(
    (d) => !myVotes.has(d.id) && !local.liked.includes(d.name) && !local.disliked.includes(d.name)
  );
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

async function swipe(vote) {
  const dish = dishCandidates()[0];
  if (!dish || !currentHousehold) return;
  const card = document.querySelector(".card[data-id]");
  if (card) card.classList.add(vote === "like" ? "swipe-right" : "swipe-left");
  if (vote === "like" && !local.liked.includes(dish.name)) local.liked.push(dish.name);
  if (vote === "dislike" && !local.disliked.includes(dish.name)) local.disliked.push(dish.name);
  saveLocal();
  await setDoc(doc(db, "households", currentHousehold.id, "swipes", `${currentUser.uid}_${dish.id}`), {
    userId: currentUser.uid, dishId: dish.id, dishName: dish.name, vote, at: serverTimestamp(),
  });
  setTimeout(renderCard, 220);
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
  await updateDoc(doc(db, "households", currentHousehold.id), {
    todaySuggestions: arrayUnion({
      name,
      byUid: currentUser.uid,
      byName: currentHousehold.memberNames?.[currentUser.uid] || "Member",
      at: Date.now(),
    }),
  });
  input.value = "";
  flashHint("Suggested for today — open Plan to send to cook");
});

function flashHint(msg) {
  const el = $("manual-explainer");
  const original = el.textContent;
  el.textContent = msg;
  setTimeout(() => { el.textContent = original; }, 2200);
}

function matchedDishes() {
  if (!currentHousehold) return [];
  const memberCount = currentHousehold.members.length;
  const byDish = new Map();
  for (const s of allSwipes) {
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

function renderPlan() {
  const ul = $("plan-list");
  ul.innerHTML = "";
  const matched = matchedDishes();
  const today = currentHousehold.todaySuggestions || [];
  const memberCount = currentHousehold.members.length;
  $("match-hint").textContent = memberCount > 1
    ? `A dish matches when all ${memberCount} members swipe yum. "Today" suggestions skip the vote.`
    : "Invite others with the join code in Settings to make matches happen.";

  today.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(s.name)} <span class="tag">today · ${escapeHtml(s.byName || "member")}</span></span>` +
      `<button data-today-idx="${i}" title="Remove">×</button>`;
    ul.appendChild(li);
  });

  matched.forEach(({ name }) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(name)} <span class="tag">matched</span></span>`;
    ul.appendChild(li);
  });

  if (matched.length === 0 && today.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No matches or suggestions yet.";
    ul.appendChild(li);
  }

  $("send-cook-btn").disabled =
    !currentHousehold.cookPhone || (matched.length === 0 && today.length === 0);
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-today-idx]");
  if (!btn || !currentHousehold) return;
  const idx = Number(btn.dataset.todayIdx);
  const next = (currentHousehold.todaySuggestions || []).filter((_, i) => i !== idx);
  await updateDoc(doc(db, "households", currentHousehold.id), { todaySuggestions: next });
});

$("send-cook-btn").addEventListener("click", () => {
  const matched = matchedDishes();
  const today = currentHousehold.todaySuggestions || [];
  if ((!matched.length && !today.length) || !currentHousehold.cookPhone) return;
  const cookName = currentHousehold.cookName || "ji";
  const family = currentHousehold.name;
  const parts = [`Namaste ${cookName} 🙏`, `From the ${family} family:`, ""];
  if (today.length) {
    parts.push("For today:");
    today.forEach((s, i) => parts.push(`${i + 1}. ${s.name}`));
    parts.push("");
  }
  if (matched.length) {
    parts.push("This week's matches:");
    matched.forEach((d, i) => parts.push(`${i + 1}. ${d.name}`));
    parts.push("");
  }
  parts.push("Anything missing in groceries? Reply here.");
  const phone = (currentHousehold.cookPhone || "").replace(/\D/g, "");
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(parts.join("\n"))}`, "_blank");
});

$("reset-week-btn").addEventListener("click", async () => {
  if (!confirm("Clear everyone's swipes and today's suggestions, and start fresh?")) return;
  const snap = await getDocs(collection(db, "households", currentHousehold.id, "swipes"));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await updateDoc(doc(db, "households", currentHousehold.id), { todaySuggestions: [] });
});

// ---------- Settings: filters, cook, regions ----------

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
    b.addEventListener("click", () => {
      b.classList.toggle("on");
    });
    b.dataset.region = key;
    regWrap.appendChild(b);
  });

  $("s-cook-name").value = currentHousehold.cookName || "";
  const cp = currentHousehold.cookPhone || "";
  const m = cp.match(/^(\+\d{1,3})(.*)$/);
  if (m) { $("s-cook-cc").value = m[1]; $("s-cook-phone").value = m[2]; }
  else { $("s-cook-phone").value = cp.replace(/\D/g, ""); }

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

// ---------- Tastes (personal, localStorage) ----------

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
    const me = uid === currentUser.uid ? " (you)" : "";
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
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
