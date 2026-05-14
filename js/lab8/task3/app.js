const tasksData = [
  {
    id: "task-1",
    title: "Дослідити Drag and Drop API",
    description: "Розібратись із подіями dragstart, dragend, dragover, drop.",
    priority: "high",
    type: "task",
    status: "todo",
  },
  {
    id: "task-2",
    title: "Створити дизайн Kanban дошки",
    description: "Адаптивний, сучасний UI з картками та тінями.",
    priority: "medium",
    type: "feature",
    status: "todo",
  },
  {
    id: "task-3",
    title: "Реалізувати логіку переміщення",
    description:
      "Використовувати чистий JS + Drag and Drop API, оновлювати статуси.",
    priority: "high",
    type: "task",
    status: "progress",
  },
  {
    id: "task-4",
    title: "Написати документацію",
    description: "Короткий опис функціоналу в коментарях.",
    priority: "low",
    type: "task",
    status: "todo",
  },
  {
    id: "task-5",
    title: "Виправити баг з outline при drop",
    description: "Коректне скидання стилів перетягування.",
    priority: "medium",
    type: "bug",
    status: "progress",
  },
  {
    id: "task-6",
    title: "Додати лічильники карток",
    description: "Оновлення кількості завдань в кожній колонці динамічно.",
    priority: "low",
    type: "task",
    status: "done",
  },
  {
    id: "task-7",
    title: "Покращити анімацію",
    description: "Зробити плавне переміщення та зворотній зв'язок.",
    priority: "medium",
    type: "feature",
    status: "todo",
  },
  {
    id: "task-8",
    title: "Тестування в різних браузерах",
    description: "Перевірити сумісність Chrome, Firefox, Edge.",
    priority: "high",
    type: "bug",
    status: "progress",
  },
  {
    id: "task-9",
    title: "Згорнути релізну версію",
    description: "Підготувати фінальну вебсторінку.",
    priority: "low",
    type: "task",
    status: "done",
  },
  {
    id: "task-10",
    title: "Рефакторинг коду",
    description: "Оптимізація слухачів подій drag and drop.",
    priority: "medium",
    type: "task",
    status: "todo",
  },
];

const todoContainer = document.getElementById("todo-list");
const progressContainer = document.getElementById("progress-list");
const doneContainer = document.getElementById("done-list");

const containersMap = {
  todo: todoContainer,
  progress: progressContainer,
  done: doneContainer,
};

const countTodo = document.getElementById("todo-count");
const countProgress = document.getElementById("progress-count");
const countDone = document.getElementById("done-count");

function updateCounters() {
  if (todoContainer) countTodo.innerText = todoContainer.children.length;
  if (progressContainer)
    countProgress.innerText = progressContainer.children.length;
  if (doneContainer) countDone.innerText = doneContainer.children.length;
}

function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.setAttribute("data-id", task.id);
  card.setAttribute("data-priority", task.priority);
  card.setAttribute("data-type", task.type);
  card.setAttribute("draggable", "true");
  card.setAttribute("data-status", task.status);

  card.innerHTML = `
            <div class="task-title">
                <span>${escapeHtml(task.title)}</span>
                <span class="drag-handle">⋮⋮</span>
            </div>
            <div class="task-desc">${escapeHtml(task.description)}</div>
            <div class="task-meta">
                <span>${getPriorityLabel(task.priority)}</span>
                <span>${getTypeLabel(task.type)}</span>
            </div>
        `;

  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragend", handleDragEnd);
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", (e) => {
    card.classList.remove("dragging");
  });

  return card;
}

function getPriorityLabel(priority) {
  if (priority === "high") return "Високий";
  if (priority === "medium") return "Середній";
  return "Низький";
}
function getTypeLabel(type) {
  if (type === "bug") return "Баг";
  if (type === "feature") return "Фіча";
  return "Завдання";
}

function escapeHtml(str) {
  return str
    .replace(/[&<>]/g, function (m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    })
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (c) {
      return c;
    });
}

let draggedItemId = null;

function handleDragStart(e) {
  const card = e.target.closest(".task-card");
  if (!card) {
    e.preventDefault();
    return false;
  }
  draggedItemId = card.getAttribute("data-id");
  e.dataTransfer.setData("text/plain", draggedItemId);
  e.dataTransfer.effectAllowed = "move";
  card.classList.add("dragging");
}

function handleDragEnd(e) {
  const card = e.target.closest(".task-card");
  if (card) card.classList.remove("dragging");
  draggedItemId = null;
  document.querySelectorAll(".task-list").forEach((list) => {
    list.classList.remove("drag-over");
  });
}

function setupDropTargets() {
  const dropZones = [todoContainer, progressContainer, doneContainer];
  dropZones.forEach((zone) => {
    if (!zone) return;
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    zone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", (e) => {
      zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");

      const taskId = e.dataTransfer.getData("text/plain");
      if (!taskId) return;

      const draggedCard = document.querySelector(
        `.task-card[data-id="${taskId}"]`,
      );
      if (!draggedCard) return;

      let newStatus = null;
      if (zone.id === "todo-list") newStatus = "todo";
      else if (zone.id === "progress-list") newStatus = "progress";
      else if (zone.id === "done-list") newStatus = "done";

      if (!newStatus) return;

      const oldStatus = draggedCard.getAttribute("data-status");
      if (oldStatus === newStatus) {
        return;
      }

      const taskIndex = tasksData.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        tasksData[taskIndex].status = newStatus;
      }

      draggedCard.setAttribute("data-status", newStatus);

      zone.appendChild(draggedCard);

      updateCounters();
    });
  });
}

function renderBoard() {
  todoContainer.innerHTML = "";
  progressContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  tasksData.forEach((task) => {
    const card = createTaskCard(task);
    card.setAttribute("data-status", task.status);
    if (task.status === "todo") {
      todoContainer.appendChild(card);
    } else if (task.status === "progress") {
      progressContainer.appendChild(card);
    } else if (task.status === "done") {
      doneContainer.appendChild(card);
    }
  });

  updateCounters();
}

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});
window.addEventListener("drop", (e) => {
  e.preventDefault();
});

renderBoard();
setupDropTargets();

console.log(
  "Kanban Board готовий! Використовуй Drag and Drop для переміщення завдань",
);

document.querySelectorAll(".task-list").forEach((list) => {
  list.addEventListener("dragend", () => {
    list.classList.remove("drag-over");
  });
});
