const SEED_DISHES = [
  { name: "Rajma chawal", tags: ["north indian", "comfort"] },
  { name: "Masala dosa", tags: ["south indian"] },
  { name: "Paneer butter masala", tags: ["north indian", "rich"] },
  { name: "Chole bhature", tags: ["north indian", "heavy"] },
  { name: "Khichdi", tags: ["light", "one pot"] },
  { name: "Pav bhaji", tags: ["street", "veg"] },
  { name: "Aloo paratha", tags: ["breakfast"] },
  { name: "Veg pulao", tags: ["one pot"] },
  { name: "Dal tadka & jeera rice", tags: ["everyday"] },
  { name: "Bisi bele bath", tags: ["south indian", "one pot"] },
  { name: "Thepla & chai", tags: ["gujarati", "light"] },
  { name: "Egg curry & roti", tags: ["protein"] },
  { name: "Hakka noodles", tags: ["indo chinese"] },
  { name: "Vegetable biryani", tags: ["festive"] },
  { name: "Curd rice & pickle", tags: ["light", "south indian"] },
  { name: "Palak paneer", tags: ["greens"] },
  { name: "Methi thepla", tags: ["gujarati"] },
  { name: "Bhindi masala & roti", tags: ["everyday"] },
  { name: "Lemon rice", tags: ["light", "south indian"] },
  { name: "Sambar rice", tags: ["south indian"] },
];

const STORE_KEY = "meal-swipe-state-v1";

const defaultState = () => ({
  liked: [],
  disliked: [],
  plan: [],
  seen: [],
  customAdded: [],
});

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

let state = load();

function candidatePool() {
  const customDishes = state.customAdded.map((name) => ({ name, tags: ["yours"] }));
  const all = [...SEED_DISHES, ...customDishes];
  return all.filter(
    (d) =>
      !state.liked.includes(d.name) &&
      !state.disliked.includes(d.name) &&
      !state.seen.includes(d.name)
  );
}

function currentCard() {
  const pool = candidatePool();
  return pool[0] || null;
}

function renderCard() {
  const stack = document.getElementById("card-stack");
  stack.innerHTML = "";
  const dish = currentCard();
  if (!dish) {
    const empty = document.createElement("div");
    empty.className = "card empty";
    empty.innerHTML =
      "<div><p>You're out of suggestions for now.</p><p style='font-size:13px'>Reset preferences or add your own below.</p></div>";
    stack.appendChild(empty);
    return;
  }
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.name = dish.name;
  const tags = (dish.tags || []).map((t) => `<span class="tag">${t}</span>`).join(" ");
  card.innerHTML = `
    <div class="dish">${dish.name}</div>
    <div class="meta">${tags}</div>
  `;
  stack.appendChild(card);
}

function swipe(direction) {
  const dish = currentCard();
  if (!dish) return;
  const card = document.querySelector(".card[data-name]");
  if (card) card.classList.add(direction === "like" ? "swipe-right" : "swipe-left");

  if (direction === "like") {
    state.liked.push(dish.name);
    state.plan.push(dish.name);
  } else {
    state.disliked.push(dish.name);
  }
  state.seen.push(dish.name);
  save();
  setTimeout(() => {
    renderCard();
    renderPrefs();
    renderPlan();
  }, 220);
}

function renderPrefs() {
  const liked = document.getElementById("liked-list");
  const disliked = document.getElementById("disliked-list");
  liked.innerHTML = "";
  disliked.innerHTML = "";

  const fill = (ul, items, kind) => {
    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = kind === "liked" ? "Nothing yet" : "Nothing yet";
      ul.appendChild(li);
      return;
    }
    items.forEach((name) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${name}</span><button title="Remove" data-name="${name}" data-kind="${kind}">×</button>`;
      ul.appendChild(li);
    });
  };

  fill(liked, state.liked, "liked");
  fill(disliked, state.disliked, "disliked");
}

function renderPlan() {
  const ul = document.getElementById("plan-list");
  ul.innerHTML = "";
  if (state.plan.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No meals picked yet — start swiping.";
    ul.appendChild(li);
    return;
  }
  state.plan.forEach((name, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${name}</span><button title="Remove" data-idx="${i}">×</button>`;
    ul.appendChild(li);
  });
}

function bind() {
  document.getElementById("like-btn").addEventListener("click", () => swipe("like"));
  document.getElementById("dislike-btn").addEventListener("click", () => swipe("dislike"));

  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  document.getElementById("manual-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("manual-input");
    const name = input.value.trim();
    if (!name) return;
    if (!state.customAdded.includes(name)) state.customAdded.push(name);
    if (!state.plan.includes(name)) state.plan.push(name);
    input.value = "";
    save();
    renderPlan();
    flashTab("plan");
  });

  document.getElementById("liked-list").addEventListener("click", onPrefRemove);
  document.getElementById("disliked-list").addEventListener("click", onPrefRemove);

  document.getElementById("plan-list").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-idx]");
    if (!btn) return;
    state.plan.splice(Number(btn.dataset.idx), 1);
    save();
    renderPlan();
  });

  document.getElementById("reset-prefs").addEventListener("click", () => {
    state.liked = [];
    state.disliked = [];
    state.seen = [];
    save();
    renderPrefs();
    renderCard();
  });

  document.getElementById("clear-plan").addEventListener("click", () => {
    state.plan = [];
    save();
    renderPlan();
  });
}

function onPrefRemove(e) {
  const btn = e.target.closest("button[data-name]");
  if (!btn) return;
  const { name, kind } = btn.dataset;
  state[kind] = state[kind].filter((n) => n !== name);
  state.seen = state.seen.filter((n) => n !== name);
  save();
  renderPrefs();
  renderCard();
}

function flashTab(name) {
  const btn = document.querySelector(`.tab[data-tab="${name}"]`);
  if (!btn) return;
  btn.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
    { duration: 280 }
  );
}

bind();
renderCard();
renderPrefs();
renderPlan();
