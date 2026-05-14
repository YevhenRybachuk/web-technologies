const LANGS = [
  { name: "JavaScript", sub: "веб / скрипти", icon: "🟨", bg: "#fef9c3" },
  { name: "Python", sub: "дані / AI", icon: "🐍", bg: "#dcfce7" },
  { name: "Java", sub: "бекенд / ентерпрайз", icon: "☕", bg: "#fce7f3" },
  { name: "TypeScript", sub: "типізований JS", icon: "🔷", bg: "#dbeafe" },
  { name: "Rust", sub: "системи / швидкість", icon: "🦀", bg: "#fee2e2" },
  { name: "Go", sub: "хмара / мікросервіси", icon: "🐹", bg: "#fef3c7" },
  { name: "Kotlin", sub: "Android / JVM", icon: "💜", bg: "#ede9fe" },
  { name: "Swift", sub: "iOS / macOS", icon: "🍎", bg: "#ffedd5" },
  { name: "C++", sub: "ігри / системи", icon: "⚡", bg: "#fef9c3" },
  { name: "PHP", sub: "веб / сервер", icon: "🐘", bg: "#f0fdf4" },
];

let cards = LANGS.map((lang, index) => ({
  ...lang,
  id: index,
}));

let editMode = false;
let dragSrcId = null;

const grid = document.getElementById("grid");
const toggleBtn = document.getElementById("toggleBtn");
const hintText = document.getElementById("hintText");

function render() {
  grid.innerHTML = "";

  cards.forEach((card) => {
    const el = document.createElement("div");

    el.className = "card";
    el.dataset.id = card.id;
    el.draggable = editMode;

    el.innerHTML = `
      <button class="delete-btn" title="Видалити">✕</button>

      <div class="card-icon" style="background:${card.bg}">
        ${card.icon}
      </div>

      <div class="card-name">
        ${card.name}
      </div>

      <div class="card-sub">
        ${card.sub}
      </div>
    `;

    // DELETE
    el.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();

      if (!editMode) {
        return;
      }

      cards = cards.filter((c) => c.id !== card.id);

      render();
    });

    // DRAG START
    el.addEventListener("dragstart", (e) => {
      if (!editMode) {
        e.preventDefault();
        return;
      }

      dragSrcId = card.id;

      el.classList.add("dragging");

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", card.id);
    });

    // DRAG END
    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");

      document.querySelectorAll(".drag-over").forEach((element) => {
        element.classList.remove("drag-over");
      });
    });

    // DRAG OVER
    el.addEventListener("dragover", (e) => {
      if (!editMode || dragSrcId === card.id) {
        return;
      }

      e.preventDefault();

      e.dataTransfer.dropEffect = "move";

      document.querySelectorAll(".drag-over").forEach((x) => {
        x.classList.remove("drag-over");
      });

      el.classList.add("drag-over");
    });

    // DRAG LEAVE
    el.addEventListener("dragleave", () => {
      el.classList.remove("drag-over");
    });

    // DROP
    el.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!editMode || dragSrcId === card.id) {
        return;
      }

      const fromIdx = cards.findIndex((c) => c.id === dragSrcId);

      const toIdx = cards.findIndex((c) => c.id === card.id);

      if (fromIdx === -1 || toIdx === -1) {
        return;
      }

      const movedCard = cards.splice(fromIdx, 1)[0];

      cards.splice(toIdx, 0, movedCard);

      dragSrcId = null;

      render();
    });

    grid.appendChild(el);
  });
}

toggleBtn.addEventListener("click", () => {
  editMode = !editMode;

  document.body.classList.toggle("edit-mode", editMode);

  toggleBtn.textContent = editMode ? "Готово" : "Редагувати";

  hintText.textContent = editMode
    ? "Перетягуйте картки або натисніть ✕ щоб видалити"
    : "Натисніть «Редагувати» для керування картками";

  render();
});

render();
