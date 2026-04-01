const catalog = new Map();
const activeOrders = new Set();
const priceHistory = new WeakMap();
const promotionalItems = new WeakSet();
const originalPrices = new WeakMap();


let productIdCounter = 101;

function addProduct(id, name, price, stock) {
  const product = { id, name, price, stock };
  catalog.set(id, product);

  priceHistory.set(product, []);
  console.log(`Продукт "${name}" додано.`);
}

function deleteProduct(id) {
  if (catalog.has(id)) {
    catalog.delete(id);
    console.log(`ID:${id} видалено.`);
  }
}

function updateProduct(id, newPrice, newStock) {
  const product = catalog.get(id);
  if (product) {
    if (product.price !== newPrice) {
      const history = priceHistory.get(product) || [];
      history.push(product.price);
      priceHistory.set(product, history);
    }

    product.price = newPrice;
    product.stock = newStock;
    console.log(`Інформацію про "${product.name}" оновлено.`);
  }
}

function findProductByName(name) {
  return Array.from(catalog.values()).filter(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
}

function createOrder(orderId, productId, quantity) {
  const product = catalog.get(productId);
  if (product && product.stock >= quantity) {
    product.stock -= quantity;
    activeOrders.add(orderId);
  } else {
    alert("Товар відсутній або недостатньо на складі!");
  }
}

function markAsPromo(id) {
  const product = catalog.get(id);
  if (!product) return;

  if (!promotionalItems.has(product)) {
    promotionalItems.add(product);

    originalPrices.set(product, product.price);

    const salePrice = Math.round(product.price * 0.9);
    updateProduct(id, salePrice, product.stock);
    console.log(`Акцію активовано для ${product.name}`);
  } else {
    promotionalItems.delete(product);

    const oldPrice = originalPrices.get(product);
    if (oldPrice) {
      updateProduct(id, oldPrice, product.stock);
      originalPrices.delete(product);
    }
    console.log(`Акцію скасовано для ${product.name}`);
  }
}


function uiRender(items = Array.from(catalog.values())) {
  const table = document.getElementById('catalogTable');
  if (!table) return;
  table.innerHTML = '';

  items.forEach(product => {
    const isPromo = promotionalItems.has(product);
    const row = document.createElement('tr');
    if (isPromo) row.classList.add('promo-row');

    row.innerHTML = `
      <td>${product.name} ${isPromo ? '🔥' : ''}</td>
      <td>${product.price} грн</td>
      <td>${product.stock} шт</td>
      <td>
        <button class="btn-sm btn-buy" onclick="uiOrder(${product.id})">Замовити</button>
        <button class="btn-sm" style="background:#8e44ad; color:white;" onclick="uiEdit(${product.id})">Змінити</button>
        <button class="btn-sm" onclick="uiShowHistory(${product.id})">Історія</button>
        <button class="btn-sm" style="background:#f39c12;" onclick="uiPromo(${product.id})">% Акція</button>
        <button class="btn-sm btn-del" onclick="uiDelete(${product.id})">🗑️</button>
      </td>
    `;
    table.appendChild(row);
  });

  document.getElementById('ordersCount').innerText = activeOrders.size;
}

function uiAddProduct() {
  const name = document.getElementById('prodName').value;
  const price = Number(document.getElementById('prodPrice').value);
  const stock = Number(document.getElementById('prodStock').value);

  if (name && price > 0) {
    addProduct(productIdCounter++, name, price, stock);
    uiRender();
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodStock').value = '';
  }
}

function uiEdit(id) {
  const product = catalog.get(id);
  const newPrice = prompt(`Нова ціна для ${product.name}:`, product.price);
  const newStock = prompt(`Кількість на складі:`, product.stock);

  if (newPrice !== null && newStock !== null) {
    updateProduct(id, Number(newPrice), Number(newStock));
    uiRender();
  }
}

function uiShowHistory(id) {
  const product = catalog.get(id);
  const history = priceHistory.get(product);
  if (!history || history.length === 0) {
    alert("Ціна ще не змінювалася.");
  } else {
    alert(`Історія цін для ${product.name}:\n${history.join(' грн → ')} грн → зараз ${product.price} грн`);
  }
}

function uiDelete(id) {
  deleteProduct(id);
  uiRender();
}

function uiOrder(id) {
  createOrder(`ORD-${Date.now()}`, id, 1);
  uiRender();
}

function uiPromo(id) {
  markAsPromo(id);
  uiRender();
}

function uiSearch() {
  const query = document.getElementById('searchInp').value;
  const filtered = findProductByName(query);
  uiRender(filtered);
}

uiRender();
