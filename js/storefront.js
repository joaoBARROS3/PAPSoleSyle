const catalog = window.soleStyleCatalog;
const productGrid = document.querySelector('#productGrid');
const searchInput = document.querySelector('#productSearch');
const brandFilter = document.querySelector('#brandFilter');
const filterButtons = [...document.querySelectorAll('.filter-chip')];
let products = catalog.list();
let activeCategory = 'todos';
let activeProduct = null;
let cart = readCart();
let toastTimer;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('solestyle-cart') || '[]');
    return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === 'string' && Number.isFinite(item.price)) : [];
  } catch {
    return [];
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function productCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  const imageButton = document.createElement('button');
  imageButton.type = 'button';
  imageButton.className = 'product-image';
  imageButton.setAttribute('aria-label', `Ver detalhes de ${product.brand} ${product.name}`);
  const image = document.createElement('img');
  image.src = product.image;
  image.alt = `${product.brand} ${product.name}`;
  image.loading = 'lazy';
  imageButton.append(image);
  if (product.badge) {
    const badge = document.createElement('span');
    badge.className = 'product-badge';
    badge.textContent = product.badge;
    imageButton.append(badge);
  }
  imageButton.addEventListener('click', () => openProduct(product));

  const info = document.createElement('div');
  info.className = 'product-info';
  const description = document.createElement('div');
  const brand = document.createElement('p');
  brand.className = 'product-brand';
  brand.textContent = product.brand;
  const name = document.createElement('h3');
  name.textContent = product.name;
  description.append(brand, name);
  const price = document.createElement('p');
  price.className = 'product-price';
  price.textContent = formatPrice(Number(product.price));
  info.append(description, price);

  const add = document.createElement('button');
  add.className = 'quick-add';
  add.type = 'button';
  add.setAttribute('aria-label', `Adicionar ${product.brand} ${product.name} ao cesto`);
  add.innerHTML = '<i data-lucide="plus" aria-hidden="true"></i>';
  add.addEventListener('click', () => addToCart(product, '40', product.color || product.colors?.[0] || 'Original'));
  card.append(imageButton, info, add);
  return card;
}

function renderProducts() {
  productGrid.replaceChildren(...products.map(productCard));
  const brands = [...new Set(products.map(product => product.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-PT'));
  const selectedBrand = brandFilter.value;
  brandFilter.replaceChildren(new Option('Todas as marcas', 'todas'), ...brands.map(brand => new Option(brand, brand.toLocaleLowerCase('pt-PT'))));
  if ([...brandFilter.options].some(option => option.value === selectedBrand)) brandFilter.value = selectedBrand;
  if (window.lucide) lucide.createIcons();
  applyFilters();
}

function applyFilters() {
  const query = searchInput.value.trim().toLocaleLowerCase('pt-PT');
  const brand = brandFilter.value;
  let visible = 0;
  [...productGrid.children].forEach((card, index) => {
    const product = products[index];
    const searchable = `${product.name} ${product.brand}`.toLocaleLowerCase('pt-PT');
    const matches = searchable.includes(query) && (brand === 'todas' || product.brand.toLocaleLowerCase('pt-PT') === brand) && (activeCategory === 'todos' || product.category.includes(activeCategory));
    card.hidden = !matches;
    if (matches) visible++;
  });
  document.querySelector('#resultsCount').textContent = `${visible} ${visible === 1 ? 'modelo' : 'modelos'} para descobrir`;
  document.querySelector('#emptyState').hidden = visible !== 0;
}

function openProduct(product) {
  activeProduct = product;
  document.querySelector('#dialogImage').src = product.image;
  document.querySelector('#dialogImage').alt = `${product.brand} ${product.name}`;
  document.querySelector('#dialogBrand').textContent = product.brand;
  document.querySelector('#dialogTitle').textContent = product.name;
  document.querySelector('#dialogPrice').textContent = formatPrice(Number(product.price));
  document.querySelector('#dialogDescription').textContent = product.description || '';
  const colors = product.colors?.length ? product.colors : [product.color || 'Original'];
  const colorSelect = document.querySelector('#colorSelect');
  colorSelect.replaceChildren(...colors.map(color => new Option(color, color)));
  colorSelect.value = product.color || colors[0];
  document.querySelector('#sizeSelect').value = '';
  document.querySelector('#sizeError').textContent = '';
  document.querySelector('#productDialog').showModal();
}

function addToCart(product, size, color) {
  const existing = cart.find(item => item.id === product.id && item.size === size && item.color === color);
  if (existing) existing.quantity++;
  else cart.push({ id: product.id, name: product.name, brand: product.brand, price: Number(product.price), image: product.image, size, color, quantity: 1 });
  saveCart();
  showToast(`${product.name} adicionado ao cesto`);
}

function saveCart() {
  localStorage.setItem('solestyle-cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const cartItems = document.querySelector('#cartItems');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector('#cartCount').textContent = count;
  document.querySelector('#drawerItemCount').textContent = `(${count})`;
  document.querySelector('#openCart').setAttribute('aria-label', `Abrir cesto, ${count} ${count === 1 ? 'artigo' : 'artigos'}`);
  document.querySelector('#cartEmpty').hidden = count > 0;
  document.querySelector('#cartSummary').hidden = count === 0;
  cartItems.replaceChildren();
  cart.forEach(item => {
    const row = document.createElement('article');
    row.className = 'cart-item';
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = '';
    const info = document.createElement('div');
    info.className = 'cart-item-info';
    const brand = document.createElement('p');
    brand.textContent = item.brand;
    const name = document.createElement('h3');
    name.textContent = item.name;
    const details = document.createElement('span');
    details.textContent = `Tam. ${item.size} · ${item.color} · ${item.quantity} un.`;
    info.append(brand, name, details);
    const price = document.createElement('strong');
    price.textContent = formatPrice(item.price * item.quantity);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-item';
    remove.textContent = 'Remover';
    remove.addEventListener('click', () => {
      cart = cart.filter(cartItem => !(cartItem.id === item.id && cartItem.size === item.size && cartItem.color === item.color));
      saveCart();
    });
    const meta = document.createElement('div');
    meta.className = 'cart-item-meta';
    meta.append(price, remove);
    row.append(image, info, meta);
    cartItems.append(row);
  });
  document.querySelector('#cartTotal').textContent = formatPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

function openDrawer() {
  document.querySelector('#cartDrawer').classList.add('is-open');
  document.querySelector('#cartDrawer').setAttribute('aria-hidden', 'false');
  document.querySelector('#drawerBackdrop').hidden = false;
  document.querySelector('#closeCart').focus();
}

function closeDrawer() {
  document.querySelector('#cartDrawer').classList.remove('is-open');
  document.querySelector('#cartDrawer').setAttribute('aria-hidden', 'true');
  document.querySelector('#drawerBackdrop').hidden = true;
  document.querySelector('#openCart').focus();
}

searchInput.addEventListener('input', applyFilters);
brandFilter.addEventListener('change', applyFilters);
filterButtons.forEach(button => button.addEventListener('click', () => {
  activeCategory = button.dataset.filter;
  filterButtons.forEach(filter => {
    const selected = filter === button;
    filter.classList.toggle('is-active', selected);
    filter.setAttribute('aria-pressed', String(selected));
  });
  applyFilters();
}));
document.querySelectorAll('[data-nav-filter]').forEach(link => link.addEventListener('click', () => {
  activeCategory = link.dataset.navFilter;
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === activeCategory;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  applyFilters();
}));
document.querySelector('#clearFilters').addEventListener('click', () => {
  searchInput.value = '';
  brandFilter.value = 'todas';
  activeCategory = 'todos';
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === 'todos';
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  applyFilters();
});
document.querySelector('#dialogAdd').addEventListener('click', () => {
  const size = document.querySelector('#sizeSelect').value;
  if (!size) {
    document.querySelector('#sizeError').textContent = 'Seleciona um tamanho para continuar.';
    document.querySelector('#sizeSelect').focus();
    return;
  }
  addToCart(activeProduct, size, document.querySelector('#colorSelect').value);
  document.querySelector('#productDialog').close();
});
document.querySelector('[data-close-dialog]').addEventListener('click', () => document.querySelector('#productDialog').close());
document.querySelector('#productDialog').addEventListener('click', event => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
document.querySelector('#openCart').addEventListener('click', openDrawer);
document.querySelector('#closeCart').addEventListener('click', closeDrawer);
document.querySelector('#drawerBackdrop').addEventListener('click', closeDrawer);
document.querySelector('#checkoutButton').addEventListener('click', () => {
  document.querySelector('#checkoutTotal').textContent = formatPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  closeDrawer();
  document.querySelector('#checkoutDialog').showModal();
});
document.querySelector('[data-close-checkout]').addEventListener('click', () => document.querySelector('#checkoutDialog').close());
document.querySelector('#checkoutForm').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity() || cart.length === 0) return;
  cart = [];
  saveCart();
  event.currentTarget.reset();
  document.querySelector('#checkoutDialog').close();
  showToast('Encomenda registada nesta demonstração.');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.querySelector('#cartDrawer').classList.contains('is-open')) closeDrawer();
});
window.addEventListener('solestyle:catalog-updated', event => {
  products = event.detail.products;
  renderProducts();
});
window.addEventListener('storage', event => {
  if (event.key === 'solestyle-products') {
    products = catalog.list();
    renderProducts();
  }
});

renderProducts();
renderCart();
