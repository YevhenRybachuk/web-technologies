const createTask = (text) => ({
  id: crypto.randomUUID(),
  text: text.trim(),
  done: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const toggleTask = (task) => ({
  ...task,
  done: !task.done,
  updatedAt: Date.now(),
});

const updateTaskText = (task, text) => ({
  ...task,
  text: text.trim(),
  updatedAt: Date.now(),
});

const removeTask = (tasks, id) => tasks.filter((t) => t.id !== id);
const addTask = (tasks, text) => [...tasks, createTask(text)];
const replaceTask = (tasks, updated) =>
  tasks.map((t) => (t.id === updated.id ? updated : t));

const sortTasks = (tasks, criterion) => {
  const copy = [...tasks];
  const comparators = {
    "date-asc": (a, b) => a.createdAt - b.createdAt,
    "date-desc": (a, b) => b.createdAt - a.createdAt,
    status: (a, b) => Number(a.done) - Number(b.done),
    updated: (a, b) => b.updatedAt - a.updatedAt,
  };
  return copy.sort(comparators[criterion] ?? comparators["date-asc"]);
};

const filterTasks = (tasks, filter) => {
  const filters = {
    all: () => true,
    active: (t) => !t.done,
    completed: (t) => t.done,
  };
  return tasks.filter(filters[filter] ?? filters.all);
};

const formatDate = (ts) => {
  const d = new Date(ts);
  return (
    d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" }) +
    " " +
    d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
  );
};

const calcStats = (tasks) => ({
  total: tasks.length,
  done: tasks.filter((t) => t.done).length,
  active: tasks.filter((t) => !t.done).length,
});

const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const escapeAttr = (s) => s.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const isValidText = (text) =>
  typeof text === "string" &&
  text.trim().length >= 2 &&
  text.trim().length <= 200;

let state = {
  tasks: [],
  sort: "date-asc",
  filter: "all",
  editing: null,
};

const setState = (patch) => {
  state = { ...state, ...patch };
  render();
};

const renderStats = (tasks) => {
  const { total, done, active } = calcStats(tasks);
  document.getElementById("stats").innerHTML = `
    <div class="stat accent"><strong>${total}</strong> Усього</div>
    <div class="stat green"><strong>${done}</strong> Виконано</div>
    <div class="stat red"><strong>${active}</strong> Активних</div>
  `;
};

const renderTaskItem = (task, isEditing) => {
  const li = document.createElement("li");
  li.className = "task-item" + (task.done ? " done" : "");
  li.dataset.id = task.id;
  li.setAttribute("role", "listitem");

  const checkSvg = `<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke="#0d0d10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  li.innerHTML = `
    <div class="task-check" role="checkbox" aria-checked="${task.done}" aria-label="${task.done ? "Позначено" : "Не позначено"}" tabindex="0" data-action="toggle">
      ${checkSvg}
    </div>
    <div class="task-body">
      ${
        isEditing
          ? `<input class="task-edit-input" type="text" value="${escapeAttr(task.text)}" minlength="2" maxlength="200" required aria-label="Редагування завдання" />`
          : `<div class="task-text">${escapeHtml(task.text)}</div>
           <div class="task-meta">
             <span>Створено: ${formatDate(task.createdAt)}</span>
             ${task.updatedAt !== task.createdAt ? `<span>Оновлено: ${formatDate(task.updatedAt)}</span>` : ""}
           </div>`
      }
    </div>
    <div class="task-actions">
      ${
        isEditing
          ? `<button class="btn-icon save" type="button" data-action="save" aria-label="Зберегти">✓</button>
           <button class="btn-icon" type="button" data-action="cancel" aria-label="Скасувати">✕</button>`
          : `<button class="btn-icon" type="button" data-action="edit" aria-label="Редагувати">✎</button>
           <button class="btn-icon delete" type="button" data-action="delete" aria-label="Видалити">✕</button>`
      }
    </div>
  `;
  return li;
};

const render = () => {
  const { tasks, sort, filter, editing } = state;
  renderStats(tasks);

  const visible = filterTasks(sortTasks(tasks, sort), filter);
  const list = document.getElementById("task-list");
  const empty = document.getElementById("empty-state");

  const existingMap = {};
  list.querySelectorAll(".task-item").forEach((el) => {
    existingMap[el.dataset.id] = el;
  });

  const newChildren = visible.map((task) => {
    const isEditing = editing === task.id;
    const existing = existingMap[task.id];

    if (
      existing &&
      !isEditing &&
      !existing.classList.contains("editing-active")
    ) {
      existing.className = "task-item" + (task.done ? " done" : "");
      existing
        .querySelector(".task-check")
        ?.setAttribute("aria-checked", String(task.done));
      const textEl = existing.querySelector(".task-text");
      if (textEl) textEl.textContent = task.text;
      delete existingMap[task.id];
      return existing;
    }
    const el = renderTaskItem(task, isEditing);
    if (isEditing) el.classList.add("editing-active");
    delete existingMap[task.id];
    return el;
  });

  Object.values(existingMap).forEach((el) => {
    el.classList.add("removing");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  });

  list.replaceChildren(...newChildren);

  if (editing) {
    const input = list.querySelector(".task-edit-input");
    if (input) {
      input.focus();
      input.select();
    }
  }

  empty.hidden = visible.length > 0;
};

const handleAdd = () => {
  const input = document.getElementById("new-task");
  const text = input.value;
  if (!isValidText(text)) {
    input.reportValidity();
    input.focus();
    return;
  }
  setState({ tasks: addTask(state.tasks, text) });
  input.value = "";
  input.focus();
};

const handleListClick = (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const li = btn.closest(".task-item");
  if (!li) return;
  const id = li.dataset.id;
  const action = btn.dataset.action;

  if (action === "toggle") {
    const task = state.tasks.find((t) => t.id === id);
    if (task)
      setState({
        tasks: replaceTask(state.tasks, toggleTask(task)),
        editing: state.editing === id ? null : state.editing,
      });
  }
  if (action === "edit") setState({ editing: id });
  if (action === "save") {
    const input = li.querySelector(".task-edit-input");
    if (!input) return;
    const text = input.value;
    if (!isValidText(text)) {
      input.reportValidity();
      return;
    }
    const task = state.tasks.find((t) => t.id === id);
    if (task)
      setState({
        tasks: replaceTask(state.tasks, updateTaskText(task, text)),
        editing: null,
      });
  }
  if (action === "cancel") setState({ editing: null });
  if (action === "delete") {
    li.classList.add("removing");
    li.addEventListener(
      "animationend",
      () => {
        setState({
          tasks: removeTask(state.tasks, id),
          editing: state.editing === id ? null : state.editing,
        });
      },
      { once: true },
    );
  }
};

const handleListKeydown = (e) => {
  const btn = e.target.closest("[data-action]");
  if (
    btn &&
    (e.key === "Enter" || e.key === " ") &&
    btn.dataset.action === "toggle"
  ) {
    e.preventDefault();
    btn.click();
  }
  const input = e.target.closest(".task-edit-input");
  if (input) {
    if (e.key === "Enter") {
      e.target.closest('[data-action="save"]') ||
        document.querySelector('[data-action="save"]')?.click();
    }
    if (e.key === "Escape") {
      setState({ editing: null });
    }
  }
};

document.getElementById("btn-add").addEventListener("click", handleAdd);
document.getElementById("new-task").addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAdd();
});
document.getElementById("task-list").addEventListener("click", handleListClick);
document
  .getElementById("task-list")
  .addEventListener("keydown", handleListKeydown);

document.getElementById("sort-select").addEventListener("change", (e) => {
  setState({ sort: e.target.value });
});

document.querySelectorAll(".btn-filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".btn-filter")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setState({ filter: btn.dataset.filter });
  });
});

const seed = ["Переглянути лекцію з JavaScript", "Виконати домашнє завдання"];
setState({ tasks: seed.reduce((acc, t) => addTask(acc, t), []) });
