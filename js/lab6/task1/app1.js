let products = [];
let editId = null;

let currentFilter = null;
let currentSort = null;

const categoryMap = {
  electronics: "Електроніка",
  clothes: "Одяг",
  food: "Їжа",
  other: "Інше",
};

const createProduct = (data) => ({
  id: Date.now(),
  name: data.name,
  price: Number(data.price),
  category: data.category,
  image: data.image,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const getTotalPrice = (products) =>
  products.reduce((sum, p) => sum + Number(p.price), 0);

const filterProducts = (products, category) => {
  if (!category) return products;
  return products.filter((p) => p.category === category);
};

const sortProducts = (products, sortType) => {
  const arr = [...products];

  switch (sortType) {
    case "price":
      return arr.sort((a, b) => b.price - a.price);

    case "created":
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    case "updated":
      return arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    default:
      return products;
  }
};

const list = document.getElementById("productList");
const emptyMsg = document.getElementById("emptyMessage");
const totalEl = document.getElementById("totalPrice");
const modal = document.getElementById("modal");
const form = document.getElementById("productForm");
const toast = document.getElementById("toast");

const render = () => {
  list.innerHTML = "";

  let result = [...products];

  result = filterProducts(result, currentFilter);
  result = sortProducts(result, currentSort);

  emptyMsg.style.display = result.length === 0 ? "block" : "none";

  result.forEach((p) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>ID: ${p.id}</p>
      <p>${p.price} грн</p>
      <p>${categoryMap[p.category] || p.category}</p>
      <button class="btn-sm btn-del" data-id="${p.id}">Видалити</button>
      <button class="btn-sm btn-edit" data-id="${p.id}">Редагувати</button>
    `;

    list.appendChild(li);
  });

  totalEl.textContent = `Загальна сума: ${getTotalPrice(result)} грн`;
};

const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
};

const removeProduct = (id) => {
  const el = document.querySelector(`[data-id="${id}"]`)?.closest("li");

  if (el) {
    el.classList.add("fade-out");

    setTimeout(() => {
      products = products.filter((p) => p.id !== id);
      render();
      showToast("Товар видалено");
    }, 300);
  }
};

const editProduct = (id) => {
  const p = products.find((p) => p.id === id);
  editId = id;

  form.name.value = p.name;
  form.price.value = p.price;
  form.category.value = p.category;
  form.image.value = p.image;

  modal.classList.remove("hidden");
};

list.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);

  if (e.target.classList.contains("btn-del")) {
    removeProduct(id);
  }

  if (e.target.classList.contains("btn-edit")) {
    editProduct(id);
  }
});

document.getElementById("addBtn").onclick = () => {
  editId = null;
  form.reset();
  modal.classList.remove("hidden");
};

document.getElementById("closeModal").onclick = () => {
  modal.classList.add("hidden");
};

form.onsubmit = (e) => {
  e.preventDefault();

  const data = {
    name: form.name.value,
    price: form.price.value,
    category: form.category.value,
    image: form.image.value,
  };

  if (editId) {
    products = products.map((p) =>
      p.id === editId ? { ...p, ...data, updatedAt: new Date() } : p,
    );

    showToast(`Оновлено: ${data.name} (ID: ${editId})`);
  } else {
    products = [...products, createProduct(data)];
    showToast("Товар додано");
  }

  modal.classList.add("hidden");
  render();
};

document.getElementById("filters").onclick = (e) => {
  const filter = e.target.dataset.filter;

  if (!filter) return;

  currentFilter = filter === "all" ? null : filter;
  render();
};

document.getElementById("sorting").onclick = (e) => {
  const sort = e.target.dataset.sort;

  if (!sort) return;

  currentSort = sort === "reset" ? null : sort;
  render();
};
