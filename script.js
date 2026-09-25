const STORE_KEY = "tasks-v2";
const THEME_KEY = "tasks-theme";
const PRIORITY_COLOR = { high: "var(--pink)", medium: "var(--amber)", low: "var(--cyan)" };

let state = load() || {
  lists: [
    { id: "l1", name: "Personal", color: "#7c5cff" },
    { id: "l2", name: "Work", color: "#22d3ee" },
  ],
  tasks: [],
};

let view = { type: "smart", value: "today" };
let selectedId = null;
let priorityFilter = "all";
let searchText = "";

const $ = (id) => document.getElementById(id);
const els = {
  listNav: $("listNav"),
  listForm: $("listForm"),
  listInput: $("listInput"),
  taskForm: $("taskForm"),
  taskInput: $("taskInput"),
  priorityInput: $("priorityInput"),
  dateInput: $("dateInput"),
  searchInput: $("searchInput"),
  taskList: $("taskList"),
  empty: $("emptyState"),
  viewTitle: $("viewTitle"),
  viewDate: $("viewDate"),
  greeting: $("greeting"),
  detail: $("detail"),
  themeToggle: $("themeToggle"),
  navItems: document.querySelectorAll(".nav-item[data-view]"),
  chips: document.querySelectorAll(".chip"),
};

/* ---------- Storage & theme ---------- */

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  els.themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  localStorage.setItem(THEME_KEY, theme);
}

els.themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  setTheme(isDark ? "light" : "dark");
});

/* ---------- Helpers ---------- */

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const prioOf = (t) => t.priority || "medium";

function isOverdue(t) {
  if (t.done || !t.date) return false;
  return new Date(`${t.date}T${t.time || "23:59"}`) < new Date();
}

function formatDue(t) {
  if (!t.date) return "";
  const [y, m, d] = t.date.split("-").map(Number);
  const day = new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!t.time) return day;
  const [h, min] = t.time.split(":").map(Number);
  const time = new Date(2000, 0, 1, h, min).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day}, ${time}`;
}

function sortByDue(list) {
  return [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return `${a.date}T${a.time || "23:59"}`.localeCompare(`${b.date}T${b.time || "23:59"}`);
  });
}

/* ---------- Filtering ---------- */

function tasksForView() {
  const today = todayStr();
  let list = state.tasks;

  if (view.type === "list") {
    list = list.filter((t) => t.listId === view.value && !t.done);
  } else if (view.value === "today") {
    list = list.filter((t) => !t.done && t.date === today);
  } else if (view.value === "upcoming") {
    list = list.filter((t) => !t.done && t.date && t.date > today);
  } else if (view.value === "completed") {
    list = list.filter((t) => t.done);
  }

  if (priorityFilter !== "all") list = list.filter((t) => prioOf(t) === priorityFilter);
  if (searchText) {
    const q = searchText.toLowerCase();
    list = list.filter((t) => t.title.toLowerCase().includes(q));
  }
  return sortByDue(list);
}

function viewName() {
  if (view.type === "list") {
    return state.lists.find((l) => l.id === view.value)?.name || "List";
  }
  return { today: "Today", upcoming: "Upcoming", completed: "Completed" }[view.value];
}

/* ---------- Actions ---------- */

function addTask(title, priority, date) {
  const listId = view.type === "list" ? view.value : (state.lists[0]?.id || null);
  const task = { id: uid(), title, desc: "", done: false, priority, date, time: "", listId };
  state.tasks.unshift(task);
  selectedId = task.id;
  save();
  render();
}

function updateTask(id, changes) {
  const task = state.tasks.find((t) => t.id === id);
  if (task) Object.assign(task, changes);
  save();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  if (selectedId === id) selectedId = null;
  save();
  render();
}

function addList(name) {
  const colors = ["#7c5cff", "#22d3ee", "#f472b6", "#fbbf24", "#34d399"];
  const list = { id: uid(), name, color: colors[state.lists.length % colors.length] };
  state.lists.push(list);
  view = { type: "list", value: list.id };
  save();
  render();
}

/* ---------- Rendering ---------- */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderStats() {
  const today = todayStr();
  const open = state.tasks.filter((t) => !t.done);
  const dueToday = open.filter((t) => t.date === today).length;
  const overdue = open.filter(isOverdue).length;
  const done = state.tasks.filter((t) => t.done).length;

  $("statOpen").textContent = open.length;
  $("statToday").textContent = dueToday;
  $("statOverdue").textContent = overdue;
  $("statDone").textContent = done;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const weekTasks = state.tasks.filter((t) => t.date && t.date >= weekStartStr && t.date <= today);
  const weekDone = weekTasks.filter((t) => t.done).length;
  const percent = weekTasks.length ? Math.round((weekDone / weekTasks.length) * 100) : 0;

  $("weekPercent").textContent = percent;
  $("weekFill").style.width = `${percent}%`;
  $("weekNote").textContent = weekTasks.length
    ? `${weekDone} of ${weekTasks.length} tasks finished`
    : "No tasks scheduled this week";
}

function renderSidebar() {
  const today = todayStr();
  const open = state.tasks.filter((t) => !t.done);
  $("countToday").textContent = open.filter((t) => t.date === today).length || "";
  $("countUpcoming").textContent = open.filter((t) => t.date && t.date > today).length || "";
  $("countCompleted").textContent = state.tasks.filter((t) => t.done).length || "";

  els.navItems.forEach((btn) => {
    btn.classList.toggle("is-active", view.type === "smart" && btn.dataset.view === view.value);
  });

  els.listNav.replaceChildren(
    ...state.lists.map((list) => {
      const li = el("li");
      const btn = el("button", "nav-item" + (view.type === "list" && view.value === list.id ? " is-active" : ""));
      const label = el("span");
      const dot = el("span", "list-dot");
      dot.style.setProperty("--dot", list.color);
      label.append(dot, list.name);
      const count = state.tasks.filter((t) => t.listId === list.id && !t.done).length;
      btn.append(label, el("span", "count", count ? String(count) : ""));
      btn.addEventListener("click", () => {
        view = { type: "list", value: list.id };
        selectedId = null;
        render();
      });
      li.appendChild(btn);
      return li;
    })
  );
}

function buildTaskRow(task) {
  const prio = prioOf(task);
  const li = el("li", "task" + (task.done ? " is-done" : "") + (task.id === selectedId ? " is-selected" : ""));
  li.style.setProperty("--prio", PRIORITY_COLOR[prio]);

  const check = el("input", "task-check");
  check.type = "checkbox";
  check.checked = task.done;
  check.addEventListener("click", (e) => e.stopPropagation());
  check.addEventListener("change", () => updateTask(task.id, { done: check.checked }));

  const body = el("div", "task-body");
  body.appendChild(el("div", "task-title", task.title));

  const meta = el("div", "task-meta");
  meta.appendChild(el("span", "tag-prio", prio[0].toUpperCase() + prio.slice(1)));
  if (task.date) {
    meta.appendChild(el("span", isOverdue(task) ? "tag-overdue" : "", formatDue(task)));
  }
  body.appendChild(meta);

  li.addEventListener("click", () => {
    selectedId = task.id;
    render();
  });

  li.append(check, body);
  return li;
}

function renderList() {
  const tasks = tasksForView();
  els.taskList.replaceChildren(...tasks.map(buildTaskRow));

  const filtered = priorityFilter !== "all" || searchText;
  els.empty.textContent = filtered
    ? "No tasks match your search or filter."
    : view.value === "completed" && view.type === "smart"
      ? "No completed tasks yet."
      : "No tasks here. Add one above.";
  els.empty.hidden = tasks.length > 0;
}

function renderDetail() {
  const task = state.tasks.find((t) => t.id === selectedId);

  if (!task) {
    els.detail.replaceChildren(el("p", "detail-empty", "Select a task to see details."));
    return;
  }

  const form = el("form");
  const head = el("p", "detail-head", "Task details");

  const titleLabel = el("label", null, "Title");
  const titleInput = el("input");
  titleInput.type = "text";
  titleInput.value = task.title;
  titleInput.maxLength = 140;
  titleInput.required = true;
  titleLabel.appendChild(titleInput);

  const descLabel = el("label", null, "Notes");
  const descInput = el("textarea");
  descInput.value = task.desc;
  descLabel.appendChild(descInput);

  const listLabel = el("label", null, "List");
  const listSelect = el("select");
  state.lists.forEach((list) => {
    const opt = el("option", null, list.name);
    opt.value = list.id;
    opt.selected = list.id === task.listId;
    listSelect.appendChild(opt);
  });
  listLabel.appendChild(listSelect);

  const prioLabel = el("label", null, "Priority");
  const prioSelect = el("select");
  [["high", "High"], ["medium", "Medium"], ["low", "Low"]].forEach(([value, text]) => {
    const opt = el("option", null, text);
    opt.value = value;
    opt.selected = value === prioOf(task);
    prioSelect.appendChild(opt);
  });
  prioLabel.appendChild(prioSelect);

  const dateLabel = el("label", null, "Due date");
  const dateInput = el("input");
  dateInput.type = "date";
  dateInput.value = task.date;
  dateLabel.appendChild(dateInput);

  const timeLabel = el("label", null, "Due time");
  const timeInput = el("input");
  timeInput.type = "time";
  timeInput.value = task.time;
  timeLabel.appendChild(timeInput);

  const actions = el("div", "detail-actions");
  const delBtn = el("button", "btn-ghost", "Delete");
  delBtn.type = "button";
  delBtn.classList.add("is-danger");
  delBtn.addEventListener("click", () => deleteTask(task.id));

  const saveBtn = el("button", "btn", "Save");
  saveBtn.type = "submit";

  actions.append(delBtn, saveBtn);
  form.append(titleLabel, descLabel, listLabel, prioLabel, dateLabel, timeLabel, actions);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;
    updateTask(task.id, {
      title,
      desc: descInput.value,
      listId: listSelect.value,
      priority: prioSelect.value,
      date: dateInput.value,
      time: timeInput.value,
    });
  });

  els.detail.replaceChildren(head, form);
}

function render() {
  const now = new Date();
  const hour = now.getHours();
  els.greeting.textContent = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  els.viewTitle.textContent = viewName();
  els.viewDate.textContent = view.type === "smart" && view.value === "today"
    ? now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : "";

  renderStats();
  renderSidebar();
  renderList();
  renderDetail();
}

/* ---------- Events ---------- */

els.navItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    view = { type: "smart", value: btn.dataset.view };
    selectedId = null;
    render();
  });
});

els.taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = els.taskInput.value.trim();
  if (!title) return;
  const date = els.dateInput.value || (view.type === "smart" && view.value === "today" ? todayStr() : "");
  addTask(title, els.priorityInput.value, date);
  els.taskForm.reset();
  els.priorityInput.value = "medium";
});

els.listForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = els.listInput.value.trim();
  if (!name) return;
  addList(name);
  els.listForm.reset();
});

els.searchInput.addEventListener("input", () => {
  searchText = els.searchInput.value.trim();
  render();
});

els.chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    priorityFilter = chip.dataset.priority;
    els.chips.forEach((c) => c.classList.toggle("is-active", c === chip));
    render();
  });
});

/* ---------- Init ---------- */

setTheme(localStorage.getItem(THEME_KEY) || "dark");
render();
setInterval(render, 60 * 1000);