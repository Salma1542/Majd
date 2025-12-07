// ============== متجر مجد - script.js الكامل والنظيف والشغال 100% ==============

let allProducts = [];
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// تحميل المنتجات
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    products = [...data];
    displayProducts(products);
    updateResultsCount(products);
    updateCartCount();
  });

// عرض المنتجات
function displayProducts(productsToShow) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";
  if (productsToShow.length === 0) {
    container.innerHTML = "<p class='no-products'>لا توجد منتجات مطابقة</p>";
    return;
  }
  productsToShow.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="img"><img src="${p.image}" alt="${p.name}"></div>
      <h4>${p.name}</h4>
      <div class="price-container">
        <button class="add-to-cart" data-id="${p.id}">
          <i class="fas fa-shopping-cart"></i> أضف إلى السلة
        </button>
        <div class="price">${p.price} ج.م</div>
      </div>
    `;
    container.appendChild(card);
  });
  // ربط أزرار السلة
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.onclick = () => addToCart(parseInt(btn.dataset.id));
  });
}

// إضافة للسلة
function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  animateCartIcon();
  showNotification(`تم إضافة "${product.name}" إلى السلة`);
}

// تحديث عداد السلة
function updateCartCount() {
  const el = document.querySelector('.cart-count');
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  if (el) {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  }
}

function animateCartIcon() {
  const cartIcon = document.querySelector('.cart');
  cartIcon.classList.add('shake');
  setTimeout(() => cartIcon.classList.remove('shake'), 500);
}

function showNotification(msg) {
  const n = document.createElement('div');
  n.className = 'cart-notification show';
  n.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

// الفلترة والترتيب (النسخة الشغالة 100%)
function filterProducts() {
  const maxPrice = parseInt(document.getElementById("price-slider").value);
  const sort = document.getElementById("sort").value;
  const allChecked = document.getElementById("cat-all").checked;

  const cats = [
    { id: "cat-sweet", val: "sweatshirt" },
    { id: "cat-bags", val: "bags" },
    { id: "cat-access", val: "accessories" },
    { id: "cat-notebook", val: "notebook" },
    { id: "cat-mug", val: "mug" },
    { id: "cat-siphon", val: "siphon" },
    { id: "cat-box", val: "box" }
  ];

  const selected = cats
    .filter(c => document.getElementById(c.id).checked)
    .map(c => c.val);

  let filtered = allProducts.filter(p => {
    if (p.price > maxPrice) return false;
    if (allChecked) return true;
    if (selected.length === 0) return false;
    return selected.includes(p.category);
  });

  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "new") filtered.sort((a, b) => b.id - a.id);

  displayProducts(filtered);
  updateResultsCount(filtered);
}

function updateResultsCount(arr) {
  const el = document.getElementById("results-count");
  if (el) el.textContent = `عرض 1-${arr.length} من ${allProducts.length} نتيجة`;
}

function updatePriceDisplay() {
  const val = document.getElementById("price-slider").value;
  document.getElementById("max-price").textContent = val + " ج.م";
}

// عجلة الحظ (ما تلمسهاش)
function setupWheel() {
  const trigger = document.getElementById('wheelTrigger');
  const modal = document.getElementById('wheelModal');
  const spinBtn = document.getElementById('spinBtn');
  const result = document.getElementById('result');
  const closeResult = document.getElementById('closeResult');
  const wheel = document.getElementById('wheel');

  if (!trigger || !modal || !spinBtn || !result || !closeResult || !wheel) return;

  trigger.addEventListener('click', () => modal.style.display = 'flex');
  spinBtn.addEventListener('click', spinWheel);
  closeResult.addEventListener('click', () => {
    result.style.display = 'none';
    modal.style.display = 'none';
    setTimeout(() => {
      wheel.style.transition = 'none';
      wheel.style.transform = 'rotate(0deg)';
      setTimeout(() => wheel.style.transition = 'transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99)', 50);
    }, 300);
  });

  function spinWheel() {
    const offers = ["0% OFF", "38% OFF", "5% OFF", "18% OFF", "1 فرصة إضافية", "10% OFF", "25% OFF", "0% OFF"];
    const i = Math.floor(Math.random() * offers.length);
    const deg = 2160 + (i * 45) + Math.floor(Math.random() * 30) + 10;
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
      document.getElementById('offerValue').textContent = offers[i].includes("فرصة") ? "فرصة إضافية" : offers[i];
      result.style.display = 'flex';
    }, 6200);
  }
}

// التهيئة الوحيدة في الملف كله
document.addEventListener("DOMContentLoaded", () => {
  updatePriceDisplay();
  updateCartCount();

  // الفلترة
  document.getElementById("cat-all").addEventListener("change", function () {
    document.querySelectorAll('.categories input:not(#cat-all)').forEach(c => c.checked = false);
    filterProducts();
  });

  document.querySelectorAll('.categories input:not(#cat-all)').forEach(cb => {
    cb.addEventListener("change", function () {
      if (this.checked) document.getElementById("cat-all").checked = false;
      const any = [...document.querySelectorAll('.categories input:not(#cat-all)')].some(c => c.checked);
      if (!any) document.getElementById("cat-all").checked = true;
      filterProducts();
    });
  });

  document.getElementById("price-slider").addEventListener("input", () => {
    updatePriceDisplay();
    filterProducts();
  });

  document.getElementById("sort").addEventListener("change", filterProducts);

  // عجلة الحظ
  setupWheel();
});