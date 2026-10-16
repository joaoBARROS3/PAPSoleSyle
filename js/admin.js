const catalog = window.soleStyleCatalog;
const formDialog = document.querySelector('#productFormDialog');
const form = document.querySelector('#productForm');
const rows = document.querySelector('#productRows');
const search = document.querySelector('#adminSearch');
let products = catalog.list();
let toastTimer;

function formatPrice(value) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
}

function showToast(message) {
  const toast = document.querySelector('#adminToast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

function updateMetrics() {
  document.querySelector('#productMetric').textContent = products.length;
  document.querySelector('#brandMetric').textContent = new Set(products.map(product => product.brand.toLocaleLowerCase('pt-PT'))).size;
  const average = products.length ? products.reduce((sum, product) => sum + Number(product.price), 0) / products.length : 0;
  document.querySelector('#averageMetric').textContent = formatPrice(average);
}

function categoryLabel(product) {
  const labels = { homem: 'Homem', mulher: 'Mulher', unissexo: 'Unissexo' };
  return (product.category || []).map(category => labels[category] || category).join(' · ') || 'Sem categoria';
}

function renderProducts() {
  const query = search.value.trim().toLocaleLowerCase('pt-PT');
  const filtered = products.filter(product => `${product.name} ${product.brand}`.toLocaleLowerCase('pt-PT').includes(query));
  rows.replaceChildren();
  filtered.forEach(product => {
    const row = document.createElement('tr');
    const productCell = document.createElement('td');
    const productInfo = document.createElement('div');
    productInfo.className = 'product-cell';
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = '';
    const text = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = product.name;
    const id = document.createElement('span');
    id.textContent = `SKU ${product.id}`;
    text.append(name, id);
    productInfo.append(image, text);
    productCell.append(productInfo);
    const brand = document.createElement('td');
    brand.textContent = product.brand;
    const category = document.createElement('td');
    const pill = document.createElement('span');
    pill.className = 'category-pill';
    pill.textContent = categoryLabel(product);
    category.append(pill);
    const price = document.createElement('td');
    price.textContent = formatPrice(Number(product.price));
    const actions = document.createElement('td');
    const actionGroup = document.createElement('div');
    actionGroup.className = 'row-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'icon-action';
    edit.setAttribute('aria-label', `Editar ${product.name}`);
    edit.innerHTML = '<i data-lucide="pencil" aria-hidden="true"></i>';
    edit.addEventListener('click', () => openForm(product));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-action delete';
    remove.setAttribute('aria-label', `Eliminar ${product.name}`);
    remove.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';
    remove.addEventListener('click', () => deleteProduct(product));
    actionGroup.append(edit, remove);
    actions.append(actionGroup);
    row.append(productCell, brand, category, price, actions);
    rows.append(row);
  });
  document.querySelector('#tableCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'}`;
  document.querySelector('#tableEmpty').hidden = filtered.length > 0;
  updateMetrics();
  if (window.lucide) lucide.createIcons();
}

function openForm(product) {
  form.reset();
  document.querySelector('#productId').value = product?.id || '';
  document.querySelector('#formTitle').textContent = product ? 'Editar produto' : 'Adicionar produto';
  if (product) {
    document.querySelector('#productName').value = product.name;
    document.querySelector('#productBrand').value = product.brand;
    document.querySelector('#productPrice').value = product.price;
    document.querySelector('#productImage').value = product.image;
    document.querySelector('#productColors').value = (product.colors || [product.color]).filter(Boolean).join(', ');
    document.querySelector('#productDescription').value = product.description || '';
    form.querySelectorAll('[name="category"]').forEach(input => { input.checked = (product.category || []).includes(input.value); });
  }
  formDialog.showModal();
  document.querySelector('#productName').focus();
}

function makeId(name) {
  const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'produto';
  let id = slug;
  let suffix = 2;
  while (products.some(product => product.id === id && id !== document.querySelector('#productId').value)) id = `${slug}-${suffix++}`;
  return id;
}

function deleteProduct(product) {
  if (!window.confirm(`Eliminar ${product.name} do catálogo?`)) return;
  products = products.filter(item => item.id !== product.id);
  catalog.save(products);
  renderProducts();
  showToast(`${product.name} eliminado`);
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const idInput = document.querySelector('#productId');
  const colors = document.querySelector('#productColors').value.split(',').map(color => color.trim()).filter(Boolean);
  const category = [...form.querySelectorAll('[name="category"]:checked')].map(input => input.value);
  if (!category.length || !colors.length) {
    showToast('Seleciona uma categoria e pelo menos uma cor.');
    return;
  }
  const product = {
    id: idInput.value || makeId(document.querySelector('#productName').value),
    name: document.querySelector('#productName').value.trim(),
    brand: document.querySelector('#productBrand').value.trim(),
    price: Number(document.querySelector('#productPrice').value),
    image: document.querySelector('#productImage').value.trim(),
    category,
    colors,
    color: colors[0],
    description: document.querySelector('#productDescription').value.trim(),
    badge: ''
  };
  const existingIndex = products.findIndex(item => item.id === product.id);
  if (existingIndex >= 0) products[existingIndex] = product;
  else products.unshift(product);
  catalog.save(products);
  formDialog.close();
  renderProducts();
  showToast(existingIndex >= 0 ? 'Produto atualizado' : 'Produto adicionado');
});

document.querySelector('#addProduct').addEventListener('click', () => openForm());
document.querySelector('#closeForm').addEventListener('click', () => formDialog.close());
document.querySelector('#cancelForm').addEventListener('click', () => formDialog.close());
formDialog.addEventListener('click', event => {
  if (event.target === formDialog) formDialog.close();
});
search.addEventListener('input', renderProducts);
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
