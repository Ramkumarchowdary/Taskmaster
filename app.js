// ---------- state ----------
const KEY = "ram-todos-v2";
const $ = (s) => document.querySelector(s);
const els = {
  form: $("#add-form"), task: $("#task"), priority: $("#priority"), filter: $("#filter"),
  list: $("#list"), empty: $("#empty"), stats: $("#stats"), theme: $("#theme"),
};
const PRIORITY = { 1: "Low", 2: "Medium", 3: "High" };
let editingId = null;
let filter = "all";
let todos = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
    // migrate old format: array of plain strings under "todos"
    const old = JSON.parse(localStorage.getItem("todos")) || [];
    return old.map((text, i) => newTodo(text, 2, Date.now() - i));
  } catch { return []; }
}
const save = () => localStorage.setItem(KEY, JSON.stringify(todos));
const newTodo = (text, priority, created = Date.now()) => ({
  id: crypto.randomUUID?.() ?? String(created + Math.random()),
  text, priority: Number(priority), done: false, pinned: false, created,
});

// ---------- actions ----------
els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = els.task.value.trim();
  if (!text) return;
  todos.push(newTodo(text, els.priority.value));
  els.task.value = "";
  commit();
});

els.list.addEventListener("click", (e) => {
  const li = e.target.closest(".task");
  if (!li) return;
  const todo = todos.find((t) => t.id === li.dataset.id);
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (e.target.classList.contains("check")) todo.done = !todo.done;
  else if (act === "pin") todo.pinned = !todo.pinned;
  else if (act === "edit") { editingId = todo.id; return render(true); }
  else if (act === "cancel") { editingId = null; return render(); }
  else if (act === "save") return saveEdit(li, todo);
  else if (act === "delete") return remove(li, todo);
  else return;
  commit();
});

els.list.addEventListener("keydown", (e) => {
  if (!e.target.closest(".edit-row")) return;
  const li = e.target.closest(".task");
  if (e.key === "Enter") saveEdit(li, todos.find((t) => t.id === li.dataset.id));
  if (e.key === "Escape") { editingId = null; render(); }
});
els.list.addEventListener("dblclick", (e) => {
  const li = e.target.closest(".task");
  if (li && e.target.classList.contains("text")) { editingId = li.dataset.id; render(true); }
});

function saveEdit(li, todo) {
  const text = li.querySelector(".e-text").value.trim();
  if (!text) return;
  todo.text = text;
  todo.priority = Number(li.querySelector(".e-pri").value);
  editingId = null;
  commit();
}

const dlg = $("#confirm");
const ask = () => new Promise((resolve) => {
  dlg.returnValue = "";
  dlg.addEventListener("close", () => resolve(dlg.returnValue === "ok"), { once: true });
  dlg.showModal();
});
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close("cancel"); });

async function remove(li, todo) {
  if (!todo.done && !(await ask())) return;
  li.classList.add("removing");
  setTimeout(() => { todos = todos.filter((t) => t.id !== todo.id); commit(); }, 450);
}

els.filter.addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (!b) return;
  filter = b.dataset.filter;
  els.filter.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
  render();
});

// ---------- theme ----------
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  els.theme.innerHTML = `<i class="fas fa-${t === "dark" ? "sun" : "moon"}"></i>`;
  localStorage.setItem("ram-theme", t);
}
els.theme.addEventListener("click", () =>
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
setTheme(localStorage.getItem("ram-theme") ||
  "light");

// ---------- render ----------
const commit = () => { save(); render(); };
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function visible() {
  const f = filter;
  return todos
    .filter((t) => f === "all" || (f === "done") === t.done)
    .sort((a, b) => b.pinned - a.pinned || a.done - b.done || b.created - a.created);
}

function row(t) {
  if (t.id === editingId) {
    return `<li class="task" data-id="${t.id}" data-p="${t.priority}">
      <span></span>
      <div class="edit-row">
        <input class="e-text" type="text" value="${esc(t.text)}" aria-label="Task text">
        <select class="e-pri">${[1, 2, 3].map((p) => `<option value="${p}" ${p === t.priority ? "selected" : ""}>${PRIORITY[p]}</option>`).join("")}</select>
      </div>
      <div class="actions">
        <button data-act="save" aria-label="Save"><i class="fas fa-check"></i></button>
        <button data-act="cancel" aria-label="Cancel"><i class="fas fa-xmark"></i></button>
      </div></li>`;
  }
  return `<li class="task ${t.done ? "done" : ""} ${t.pinned ? "pinned" : ""}" data-id="${t.id}" data-p="${t.priority}">
    <input class="check" type="checkbox" ${t.done ? "checked" : ""} aria-label="Mark complete">
    <div>
      <div class="text" title="Double-click to edit">${esc(t.text)}</div>
      <div class="meta"><span>${PRIORITY[t.priority]} priority</span></div>
    </div>
    <div class="actions">
      <button data-act="pin" class="${t.pinned ? "on" : ""}" aria-label="${t.pinned ? "Unpin" : "Pin to top"}"><i class="fas fa-thumbtack"></i></button>
      <button data-act="edit" aria-label="Edit"><i class="fas fa-pen"></i></button>
      <button data-act="delete" aria-label="Delete"><i class="fas fa-trash"></i></button>
    </div></li>`;
}

function render(focusEdit = false) {
  const items = visible();
  els.list.innerHTML = items.map(row).join("");
  els.empty.hidden = items.length > 0;
  const left = todos.filter((t) => !t.done).length;
  els.stats.textContent = `${left} of ${todos.length} left`;
  if (focusEdit) els.list.querySelector(".e-text")?.focus();
}
render();