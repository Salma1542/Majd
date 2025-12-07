// المنتجات والعربة
let allProducts = []; // كل المنتجات (يجب أن يكون عالمياً)
let products = [];    // المنتجات المعروضة
let cart = JSON.parse(localStorage.getItem('cart')) || []; // السلة من localStorage

// Pagination variables
let currentPage = 1;
const productsPerPage = 12;
let paginatedProducts = [];

// دالة لحفظ العربة (مشتركة)
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// دالة للانتقال لصفحة تفاصيل المنتج (يجب أن تكون في النطاق العام)
function goToProductDetails(productId) {
    // حفظ معرف المنتج في localStorage
    localStorage.setItem('selectedProductId', productId);
    // الانتقال لصفحة التفاصيل
    window.location.href = 'product-details.html';
}

// تحميل JSON
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data; // حفظ البيانات الأصلية
    products = [...data]; // نسخة من البيانات الأصلية للعرض
    // عرض الصفحة الأولى مع الترقيم
    setupPagination(products);
    updateCartCount(); // تحديث عدد المنتجات في السلة
    // تحديث عداد السعر بعد تحميل المنتجات
    updatePriceDisplay();
  })
  .catch(err => console.log("خطأ في تحميل المنتجات:", err));

// دالة لإنشاء الترقيم
function setupPagination(filteredProducts) {
    paginatedProducts = filteredProducts || allProducts;
    currentPage = 1;
    displayPage(currentPage);
    createPageNumbers();
}

// دالة لعرض صفحة معينة
function displayPage(pageNumber) {
    const startIndex = (pageNumber - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = paginatedProducts.slice(startIndex, endIndex);
    
    displayProducts(productsToShow);
    updatePaginationControls(pageNumber);
    updateResultsCountForPage(pageNumber);
}

// تحديث عناصر التحكم في الترقيم
function updatePaginationControls(pageNumber) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const totalPages = Math.ceil(paginatedProducts.length / productsPerPage);
    
    if (prevBtn) {
        prevBtn.disabled = pageNumber === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = pageNumber === totalPages;
    }
    
    // تحديث أرقام الصفحات النشطة
    document.querySelectorAll('.page-number').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.textContent) === pageNumber) {
            btn.classList.add('active');
        }
    });
}

// إنشاء أرقام الصفحات
function createPageNumbers() {
    const pageNumbersContainer = document.getElementById('page-numbers');
    if (!pageNumbersContainer) return;
    
    pageNumbersContainer.innerHTML = '';
    const totalPages = Math.ceil(paginatedProducts.length / productsPerPage);
    
    // تحديد عدد الصفحات التي تظهر
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // تأكد من عرض 5 صفحات على الأكثر
    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - 4);
        }
    }
    
    // زر الصفحة الأولى
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'page-number';
        firstPageBtn.textContent = '1';
        firstPageBtn.onclick = () => goToPage(1);
        pageNumbersContainer.appendChild(firstPageBtn);
        
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            pageNumbersContainer.appendChild(dots);
        }
    }
    
    // أزرار الصفحات
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-number';
        pageBtn.textContent = i;
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.onclick = () => goToPage(i);
        pageNumbersContainer.appendChild(pageBtn);
    }
    
    // زر الصفحة الأخيرة
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            pageNumbersContainer.appendChild(dots);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'page-number';
        lastPageBtn.textContent = totalPages;
        lastPageBtn.onclick = () => goToPage(totalPages);
        pageNumbersContainer.appendChild(lastPageBtn);
    }
}

// الانتقال إلى صفحة معينة
function goToPage(pageNumber) {
    currentPage = pageNumber;
    displayPage(pageNumber);
    createPageNumbers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// تحديث عدد النتائج للصفحة الحالية
function updateResultsCountForPage(pageNumber) {
    const resultsElement = document.getElementById("results-count");
    if (!resultsElement) return;
    
    const startIndex = (pageNumber - 1) * productsPerPage + 1;
    const endIndex = Math.min(pageNumber * productsPerPage, paginatedProducts.length);
    const totalProducts = paginatedProducts.length;
    
    resultsElement.textContent = `عرض ${startIndex}-${endIndex} من ${totalProducts} نتيجة`;
}

// عرض المنتجات مع زر الإضافة للسلة
function displayProducts(productsToShow) {
  const container = document.getElementById("products-container");
  if (!container) return;
  
  container.innerHTML = "";

  if (!productsToShow || productsToShow.length === 0) {
    container.innerHTML = "<p class='no-products'>لا توجد منتجات مطابقة</p>";
    return;
  }

  productsToShow.forEach(p => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="img" onclick="goToProductDetails(${p.id})" style="cursor: pointer;">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <h4 onclick="goToProductDetails(${p.id})" style="cursor: pointer;">${p.name}</h4>
      <div class="price-container">
        <button class="add-to-cart" data-id="${p.id}">
          <i class="fas fa-shopping-cart"></i>
          أضف إلى السلة
        </button>
        <div class="price">${p.price} ج.م</div>
      </div>
    `;
    container.appendChild(productCard);
  });

  // إضافة مستمعات الأحداث لأزرار الإضافة للسلة
  attachAddToCartListeners();
}

// إضافة مستمعات الأحداث لأزرار الإضافة للسلة
function attachAddToCartListeners() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // منع انتشار الحدث إلى العناصر الأم
      e.preventDefault(); // منع السلوك الافتراضي إذا كان زر داخل form
      const productId = parseInt(this.getAttribute('data-id'));
      addToCart(productId);
    });
  });
}

// إضافة منتج إلى السلة
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  
  if (!product) {
    console.error('المنتج غير موجود');
    return;
  }

  // التحقق مما إذا كان المنتج موجودًا بالفعل في السلة
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    // زيادة الكمية إذا كان المنتج موجودًا
    existingItem.quantity += 1;
  } else {
    // إضافة منتج جديد إلى السلة
    cart.push({
      ...product,
      quantity: 1
    });
  }

  // حفظ السلة في localStorage
  saveCart();
  
  // تحديث عدد المنتجات في السلة
  updateCartCount();
  
  // عرض رسالة تأكيد
  showCartNotification(product.name);
  
  // إضافة تأثير اهتزاز للسلة
  animateCartIcon();
}

// تحديث عدد المنتجات في السلة
function updateCartCount() {
  const cartIcon = document.querySelector('.cart i');
  const cartCount = document.querySelector('.cart-count');
  
  let totalItems = 0;
  cart.forEach(item => {
    totalItems += item.quantity;
  });
  
  // تحديث العداد إذا كان موجودًا
  if (cartCount) {
    cartCount.textContent = totalItems;
    if (totalItems > 0) {
      cartCount.style.display = 'flex';
    } else {
      cartCount.style.display = 'none';
    }
  }
  
  // إضافة مؤشر إذا لم يكن موجودًا
  if (!cartCount && cartIcon) {
    const countSpan = document.createElement('span');
    countSpan.className = 'cart-count';
    countSpan.textContent = totalItems;
    if (totalItems > 0) {
      countSpan.style.display = 'flex';
    } else {
      countSpan.style.display = 'none';
    }
    document.querySelector('.cart').appendChild(countSpan);
  }
}

// عرض إشعار إضافة المنتج
function showCartNotification(productName) {
  // إنشاء عنصر الإشعار
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-check-circle"></i>
      <p>تم إضافة "${productName}" إلى السلة</p>
    </div>
  `;
  
  // إضافة الإشعار إلى الجسم
  document.body.appendChild(notification);
  
  // عرض الإشعار مع تأثير
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // إخفاء الإشعار بعد 3 ثواني
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// تأثير اهتزاز لأيقونة السلة
function animateCartIcon() {
  const cartIcon = document.querySelector('.cart');
  if (cartIcon) {
    cartIcon.classList.add('shake');
    setTimeout(() => {
      cartIcon.classList.remove('shake');
    }, 500);
  }
}

// فلترة المنتجات
function filterProducts() {
  const maxPrice = parseInt(document.getElementById("price-slider").value);
  const sort = document.getElementById("sort").value;

  const allCat = document.getElementById("cat-all").checked;
  const selectedCategories = [];
  
  // إضافة جميع الفئات إلى المصفوفة
  const categories = [
    { id: "cat-sweet", value: "sweatshirt" },
    { id: "cat-bags", value: "bags" },
    { id: "cat-access", value: "accessories" },
    { id: "cat-notebook", value: "notebook" },
    { id: "cat-mug", value: "mug" },
    { id: "cat-siphon", value: "siphon" },
    { id: "cat-box", value: "box" }
  ];
  
  categories.forEach(cat => {
    if (document.getElementById(cat.id).checked) {
      selectedCategories.push(cat.value);
    }
  });

  // البدء من البيانات الأصلية دائماً
  let filtered = allProducts.filter(p => {
    // الفئة - إذا لم يكن "الكل" محدداً
    if (!allCat && selectedCategories.length > 0) {
      if (!selectedCategories.includes(p.category)) return false;
    }
    
    // السعر
    if (p.price > maxPrice) return false;
    return true;
  });

  // إذا لم يتم تحديد أي فئة وكان "الكل" غير محدد، لا تعرض أي منتجات
  if (!allCat && selectedCategories.length === 0) {
    filtered = [];
  }

  // الفرز
  if (sort === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "new") {
    filtered.sort((a, b) => b.id - a.id);
  }

  // تطبيق الترقيم على النتائج المفلترة
  setupPagination(filtered);
}

// تحديث عرض السعر
function updatePriceDisplay() {
  const slider = document.getElementById("price-slider");
  const maxPriceElement = document.getElementById("max-price");
  const minPriceElement = document.getElementById("min-price");
  
  if (slider && maxPriceElement) {
    maxPriceElement.textContent = `${slider.value} ج.م`;
  }
  if (minPriceElement) {
    minPriceElement.textContent = "0 ج.م";
  }
}

// إعداد الأحداث
function setupEventListeners() {
  // الكل
  const catAll = document.getElementById("cat-all");
  if (catAll) {
    catAll.addEventListener("change", () => {
      // إلغاء تحديد جميع الفئات الأخرى عند تحديد "الكل"
      const allCategoryIds = [
        "cat-sweet", "cat-bags", "cat-access", 
        "cat-notebook", "cat-mug", "cat-siphon", "cat-box"
      ];
      
      allCategoryIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.checked = false;
        }
      });
      filterProducts();
    });
  }

  // أي فئة أخرى تلغي الكل
  const allCategoryIds = [
    "cat-sweet", "cat-bags", "cat-access", 
    "cat-notebook", "cat-mug", "cat-siphon", "cat-box"
  ];
  
  allCategoryIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", () => {
        // إلغاء تحديد "الكل" عند تحديد أي فئة أخرى
        const catAllElement = document.getElementById("cat-all");
        if (catAllElement) {
          catAllElement.checked = false;
        }
        filterProducts();
      });
    }
  });

  // السعر
  const priceSlider = document.getElementById("price-slider");
  if (priceSlider) {
    priceSlider.addEventListener("input", () => {
      updatePriceDisplay();
      filterProducts();
    });
  }

  // الفرز
  const sortSelect = document.getElementById("sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", filterProducts);
  }

  // أزرار الترقيم
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        goToPage(currentPage - 1);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(paginatedProducts.length / productsPerPage);
      if (currentPage < totalPages) {
        goToPage(currentPage + 1);
      }
    });
  }

  // زر التطبيق (إذا كان موجوداً)
  const applyBtn = document.getElementById("apply-filter");
  if (applyBtn) {
    applyBtn.addEventListener("click", filterProducts);
  }
}

// تهيئة الصفحة عند التحميل
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updatePriceDisplay();
  updateCartCount(); // تحديث عداد السلة عند التحميل
  
  // كود العجلة
  setupWheel();
  
  // كود للكشف عن ظهور العنصر أثناء التمرير
  setupScrollAnimation();
});

// كود للكشف عن ظهور العنصر أثناء التمرير
function setupScrollAnimation() {
  function checkScroll() {
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
      const sectionPosition = aboutSection.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (sectionPosition < screenPosition) {
        aboutSection.classList.add('visible');
      }
    }
  }

  // استدعاء الدالة عند التمرير وعند تحميل الصفحة
  window.addEventListener('scroll', checkScroll);
  window.addEventListener('load', checkScroll);
}

// تهيئة عجلة الحظ
function setupWheel() {
  const wheelTrigger = document.getElementById('wheelTrigger');
  const wheelModal = document.getElementById('wheelModal');
  const spinBtn = document.getElementById('spinBtn');
  const result = document.getElementById('result');
  const closeResult = document.getElementById('closeResult');
  const wheel = document.getElementById('wheel');
  
  if (!wheelTrigger || !wheelModal || !spinBtn || !result || !closeResult || !wheel) {
    console.error('عنصر أو أكثر مفقود في عجلة الحظ!');
    return;
  }
  
  // فتح عجلة الحظ
  wheelTrigger.addEventListener('click', function() {
    wheelModal.style.display = 'flex';
  });
  
  // تدوير العجلة
  spinBtn.addEventListener('click', function() {
    spinWheel();
  });
  
  // إغلاق النتيجة
  closeResult.addEventListener('click', function() {
    result.style.display = 'none';
    wheelModal.style.display = 'none';
    
    // إعادة تعيين العجلة
    setTimeout(() => {
      wheel.style.transition = 'none';
      wheel.style.transform = 'rotate(0deg)';
      setTimeout(() => {
        wheel.style.transition = 'transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      }, 50);
    }, 300);
  });
  
  // وظيفة تدوير العجلة
  function spinWheel() {
    const offers = [
      "0% OFF",
      "38% OFF",
      "5% OFF",
      "18% OFF",
      "1 فرصة إضافية",
      "10% OFF",
      "25% OFF",
      "0% OFF"
    ];
    
    const randomIndex = Math.floor(Math.random() * offers.length);
    const selectedOffer = offers[randomIndex];
    
    // دوران 6 لفات كاملة + الزاوية المطلوبة
    const segmentDegree = 45;
    const extraSpins = 6 * 360;
    const finalDegree = extraSpins + (randomIndex * segmentDegree) + Math.floor(Math.random() * 30) + 10;
    
    wheel.style.transform = `rotate(${finalDegree}deg)`;
    
    setTimeout(() => {
      let displayText = selectedOffer;
      if (selectedOffer.includes("فرصة")) displayText = "فرصة إضافية";
      
      const offerValue = document.getElementById('offerValue');
      if (offerValue) {
        offerValue.innerHTML = displayText;
      }
      
      result.style.display = 'flex';
    }, 6200);
  }
}

// ============================================
// كود صفحة تفاصيل المنتج
// ============================================
if (window.location.pathname.includes('product-details.html')) {
  let selectedSize = null;
  let currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  let currentImageIndex = 0;
  let currentProduct = null;

  document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    loadSuggestedProductsForDetails();
    updateCartCount();
    setupFullscreenModal();
  });

  // تحميل تفاصيل المنتج
  async function loadProductDetails() {
    const productId = parseInt(localStorage.getItem('selectedProductId'));
    
    if (!productId) {
      window.location.href = 'shop.html';
      return;
    }

    try {
      const response = await fetch('products.json');
      const products = await response.json();
      currentProduct = products.find(p => p.id === productId);
      
      if (!currentProduct) {
        window.location.href = 'shop.html';
        return;
      }
      
      displayProductDetails(currentProduct);
      setupGalleryNavigation(currentProduct.images || [currentProduct.image]);
    } catch (error) {
      console.error('Error loading product details:', error);
      window.location.href = 'shop.html';
    }
  }

  // عرض تفاصيل المنتج
  function displayProductDetails(product) {
    const container = document.getElementById('product-details');
    if (!container) return;
    
    const categoryNames = {
      'sweatshirt': 'سويت-شيرت',
      'bags': 'شنط',
      'accessories': 'اكسسوارات',
      'notebook': 'نوت بوك',
      'mug': 'مجات',
      'siphon': 'سيفونيز',
      'box': 'بوكسيز'
    };
    
    const categoryName = categoryNames[product.category] || product.category;
    const productDescription = product.description || getDefaultDescription(product.category, product.name);
    const isInWishlist = currentWishlist.includes(product.id);
    const images = product.images || [product.image];
    
    // إنشاء النجوم للتقييم
    const ratingStars = getRatingStars(product.rating || 4);
    
    container.innerHTML = `
      <!-- Gallery Section -->
      <div class="product-gallery">
        <div class="product-main-image-container">
          <img src="${images[0]}" alt="${product.name}" class="product-main-image" id="main-image">
          <div class="image-controls">
            <button class="zoom-btn" onclick="zoomImage()">
              <i class="fas fa-search-plus"></i>
            </button>
            <button class="fullscreen-btn" onclick="openFullscreen('${images[0]}')">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>
        
        <div class="product-thumbnails-container">
          <button class="scroll-btn left" onclick="scrollThumbnails('left')">
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <div class="thumbnails-scroll" id="thumbnails-scroll">
            ${images.map((img, index) => `
              <img src="${img}" 
                   alt="${product.name} - صورة ${index + 1}" 
                   class="thumbnail ${index === 0 ? 'active' : ''}" 
                   onclick="changeMainImage('${img}', ${index})"
                   data-index="${index}">
            `).join('')}
          </div>
          
          <button class="scroll-btn right" onclick="scrollThumbnails('right')">
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>
      </div>
      
      <!-- Product Info Section -->
      <div class="product-info">
        <div class="product-header">
          <h1 class="product-title">${product.name}</h1>
          <span class="product-category">${categoryName}</span>
          
          <div class="product-price-container">
            <div class="product-price">${product.price} ج.م</div>
            <div class="product-rating">
              ${ratingStars}
              <span style="color: #666; font-size: 14px; margin-right: 5px;">(${product.rating || 4})</span>
            </div>
          </div>
        </div>
        
        <div class="product-description">
          <p>${productDescription}</p>
        </div>
        
        <!-- Size Selector -->
        ${product.sizes && product.sizes.length > 0 ? `
        <div class="size-selector">
          <div class="size-title">
            <i class="fas fa-ruler"></i>
            <span>اختر المقاس:</span>
          </div>
          <div class="size-options" id="size-options">
            ${product.sizes.map(size => {
              const isAvailable = product.availableSizes ? product.availableSizes.includes(size) : true;
              return `
                <div class="size-option ${!isAvailable ? 'unavailable' : ''}" 
                     data-size="${size}"
                     onclick="${isAvailable ? `selectSize('${size}')` : ''}">
                  ${size}
                </div>
              `;
            }).join('')}
          </div>
          <div class="size-guide">
            <a href="#" onclick="showSizeGuide()">
              <i class="fas fa-info-circle"></i>
              دليل المقاسات
            </a>
          </div>
        </div>
        ` : ''}
        
        <!-- Quantity and Actions -->
        <div class="quantity-actions">
          <div class="quantity-selector">
            <button class="quantity-btn" onclick="decreaseQuantity()">-</button>
            <input type="number" class="quantity-input" value="1" min="1" max="10" id="product-quantity">
            <button class="quantity-btn" onclick="increaseQuantity()">+</button>
          </div>
        </div>
        
        <div class="product-actions">
          <button class="add-to-cart-btn" onclick="addToCartFromDetails(${product.id})">
            <i class="fas fa-shopping-cart"></i>
            أضف إلى السلة
          </button>
          <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
        
        <!-- Product Meta Information -->
        <div class="product-meta">
          <div class="meta-item">
            <i class="fas fa-shield-alt"></i>
            <span>ضمان الجودة لمدة <strong>سنة</strong></span>
          </div>
          <div class="meta-item">
            <i class="fas fa-truck"></i>
            <span>شحن سريع خلال <strong>2-5 أيام</strong></span>
          </div>
          <div class="meta-item">
            <i class="fas fa-undo"></i>
            <span>إرجاع مجاني خلال <strong>14 يوم</strong></span>
          </div>
          <div class="meta-item">
            <i class="fas fa-box"></i>
            <span>متوفر في المخزون: <strong>${product.availableSizes ? product.availableSizes.length + ' مقاس' : 'متوفر'}</strong></span>
          </div>
        </div>
        
        <a href="shop.html" class="back-to-shop">
          <i class="fas fa-arrow-right"></i>
          العودة إلى المتجر
        </a>
      </div>
    `;
  }

  // الحصول على نجوم التقييم
  function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // نجوم كاملة
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }
    
    // نصف نجمة
    if (halfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // نجوم فارغة
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
  }

  // الحصول على وصف افتراضي
  function getDefaultDescription(category, name) {
    const descriptions = {
      'sweatshirt': `سويتشيرت ${name} مصنوع من أجود أنواع القطن، مريح ومناسب لجميع الفصول. تصميم فريد يعبر عن التراث المصري العريق.`,
      'bags': `حقيبة ${name} مصنوعة يدوياً من الجلد الطبيعي، عملية وأنيقة مع مساحة تخزين مناسبة لجميع احتياجاتك اليومية.`,
      'accessories': `إكسسوار ${name} مصمم بعناية ليعبر عن الجمال والتراث المصري، مثالي للهدايا أو للاستخدام الشخصي.`,
      'notebook': `دفتر ملاحظات ${name} بغلاف فاخر وورق عالي الجودة، مثالي للكتابة والتسجيل مع لمسة من التراث المصري.`,
      'mug': `كوب ${name} مصنوع من السيراميك عالي الجودة، يحمل تصميمات مستوحاة من التراث المصري، مثالي للمشروبات الساخنة والباردة.`,
      'siphon': `سيفون ${name} يجمع بين الأصالة والحداثة، مصنوع من مواد عالية الجودة مع تصميم فريد يعبر عن الحضارة المصرية.`,
      'box': `صندوق ${name} مصمم بعناية لحفظ الأشياء الثمينة، يجمع بين الجمال والوظيفية مع لمسة من التراث المصري.`
    };
    
    return descriptions[category] || `منتج ${name} عالي الجودة من متجر مجد، مصمم بعناية ليعبر عن الجمال والتراث المصري.`;
  }

  // تغيير الصورة الرئيسية
  function changeMainImage(imageSrc, index) {
    const mainImage = document.getElementById('main-image');
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    
    if (mainImage) {
      mainImage.src = imageSrc;
      currentImageIndex = index;
    }
    
    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => openFullscreen(imageSrc);
    }
    
    // تحديث الصور المصغرة النشطة
    document.querySelectorAll('.thumbnail').forEach((thumb, idx) => {
      thumb.classList.remove('active');
      if (idx === index) {
        thumb.classList.add('active');
      }
    });
  }

  // تكبير الصورة
  function zoomImage() {
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
      mainImage.style.transform = mainImage.style.transform === 'scale(1.5)' ? 'scale(1)' : 'scale(1.5)';
    }
  }

  // فتح الصورة بالكامل
  function openFullscreen(imageSrc) {
    const modal = document.getElementById('fullscreenModal');
    const fullscreenImage = document.getElementById('fullscreenImage');
    
    if (modal && fullscreenImage) {
      fullscreenImage.src = imageSrc;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // إعداد نافذة العرض بالكامل
  function setupFullscreenModal() {
    const modal = document.getElementById('fullscreenModal');
    const closeBtn = document.getElementById('closeFullscreen');
    
    if (modal && closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      });
      
      // إغلاق بالزر ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          modal.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      });
    }
  }

  // تمرير الصور المصغرة
  function scrollThumbnails(direction) {
    const scrollContainer = document.getElementById('thumbnails-scroll');
    if (!scrollContainer) return;
    
    const scrollAmount = 120;
    if (direction === 'left') {
      scrollContainer.scrollLeft -= scrollAmount;
    } else {
      scrollContainer.scrollLeft += scrollAmount;
    }
  }

  // إعداد التنقل بين الصور
  function setupGalleryNavigation(images) {
    // إضافة مفاتيح الأسهم للتنقل بين الصور
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        // التالي
        const nextIndex = (currentImageIndex + 1) % images.length;
        changeMainImage(images[nextIndex], nextIndex);
      } else if (e.key === 'ArrowLeft') {
        // السابق
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        changeMainImage(images[prevIndex], prevIndex);
      }
    });
    
    // Swipe للهواتف
    let touchStartX = 0;
    let touchEndX = 0;
    
    const mainImageContainer = document.querySelector('.product-main-image-container');
    if (mainImageContainer) {
      mainImageContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });
      
      mainImageContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      });
    }
    
    function handleSwipe() {
      const swipeThreshold = 50;
      
      if (touchEndX < touchStartX - swipeThreshold) {
        // سحب لليسار = التالي
        const nextIndex = (currentImageIndex + 1) % images.length;
        changeMainImage(images[nextIndex], nextIndex);
      }
      
      if (touchEndX > touchStartX + swipeThreshold) {
        // سحب لليمين = السابق
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        changeMainImage(images[prevIndex], prevIndex);
      }
    }
  }

  // اختيار المقاس
  function selectSize(size) {
    selectedSize = size;
    
    // تحديث الأزرار
    document.querySelectorAll('.size-option').forEach(option => {
      option.classList.remove('selected');
      if (option.getAttribute('data-size') === size) {
        option.classList.add('selected');
      }
    });
    
    showNotification(`تم اختيار المقاس: ${size}`);
  }

  // عرض دليل المقاسات
  function showSizeGuide() {
    const guideHTML = `
      <div style="text-align: center; padding: 30px; max-width: 500px; margin: 0 auto;">
        <h3 style="color: #c9a200; margin-bottom: 20px;">دليل المقاسات</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1e8cc;">
              <th style="padding: 12px; border: 1px solid #ddd;">المقاس</th>
              <th style="padding: 12px; border: 1px solid #ddd;">الصدر (سم)</th>
              <th style="padding: 12px; border: 1px solid #ddd;">الطول (سم)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 10px; border: 1px solid #ddd;">S</td><td style="padding: 10px; border: 1px solid #ddd;">90-95</td><td style="padding: 10px; border: 1px solid #ddd;">68</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;">M</td><td style="padding: 10px; border: 1px solid #ddd;">100-105</td><td style="padding: 10px; border: 1px solid #ddd;">70</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;">L</td><td style="padding: 10px; border: 1px solid #ddd;">110-115</td><td style="padding: 10px; border: 1px solid #ddd;">72</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;">XL</td><td style="padding: 10px; border: 1px solid #ddd;">120-125</td><td style="padding: 10px; border: 1px solid #ddd;">74</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd;">XXL</td><td style="padding: 10px; border: 1px solid #ddd;">130-135</td><td style="padding: 10px; border: 1px solid #ddd;">76</td></tr>
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">للقياسات الدقيقة، يرجى قياس جسمك قبل الاختيار</p>
      </div>
    `;
    
    alert(guideHTML.replace(/<[^>]*>/g, ''));
  }

  // تبديل المفضلة
  function toggleWishlist(productId) {
    const index = currentWishlist.indexOf(productId);
    const wishlistBtn = document.querySelector('.wishlist-btn');
    const heartIcon = wishlistBtn.querySelector('i');
    
    if (index === -1) {
      // إضافة للمفضلة
      currentWishlist.push(productId);
      wishlistBtn.classList.add('active');
      heartIcon.classList.remove('far');
      heartIcon.classList.add('fas');
      showNotification('تمت إضافة المنتج إلى المفضلة');
    } else {
      // إزالة من المفضلة
      currentWishlist.splice(index, 1);
      wishlistBtn.classList.remove('active');
      heartIcon.classList.remove('fas');
      heartIcon.classList.add('far');
      showNotification('تمت إزالة المنتج من المفضلة');
    }
    
    // حفظ في localStorage
    localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
  }

  // زيادة الكمية
  function increaseQuantity() {
    const quantityInput = document.getElementById('product-quantity');
    if (quantityInput) {
      let value = parseInt(quantityInput.value);
      if (value < 10) {
        quantityInput.value = value + 1;
      }
    }
  }

  // تقليل الكمية
  function decreaseQuantity() {
    const quantityInput = document.getElementById('product-quantity');
    if (quantityInput) {
      let value = parseInt(quantityInput.value);
      if (value > 1) {
        quantityInput.value = value - 1;
      }
    }
  }

  // إضافة المنتج إلى السلة من صفحة التفاصيل
  function addToCartFromDetails(productId) {
    // التحقق من اختيار المقاس للمنتجات التي لها مقاسات
    if (currentProduct && currentProduct.sizes && currentProduct.sizes.length > 0 && !selectedSize) {
      showNotification('الرجاء اختيار المقاس أولاً', 'error');
      return;
    }
    
    const quantityInput = document.getElementById('product-quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    // تحميل المنتج من ملف JSON
    fetch('products.json')
      .then(res => res.json())
      .then(products => {
        const product = products.find(p => p.id === productId);
        
        if (product) {
          // التحقق مما إذا كان المنتج موجوداً بالفعل
          const existingItemIndex = cart.findIndex(item => 
            item.id === productId && item.size === selectedSize
          );
          
          if (existingItemIndex !== -1) {
            // تحديث الكمية للمقاس المحدد
            cart[existingItemIndex].quantity = Math.min(cart[existingItemIndex].quantity + quantity, 10);
          } else {
            // إضافة منتج جديد مع المقاس
            cart.push({
              ...product,
              quantity: quantity,
              size: selectedSize
            });
          }
          
          saveCart();
          updateCartCount();
          
          // عرض إشعار النجاح
          const sizeText = selectedSize ? ` (مقاس: ${selectedSize})` : '';
          showNotification(`تم إضافة ${quantity} من "${product.name}"${sizeText} إلى السلة`);
        }
      })
      .catch(error => console.error('Error:', error));
  }

  // تحميل منتجات مقترحة لصفحة التفاصيل
  async function loadSuggestedProductsForDetails() {
    try {
      const response = await fetch('products.json');
      const products = await response.json();
      const currentProductId = parseInt(localStorage.getItem('selectedProductId'));
      
      // اختيار 4 منتجات عشوائية (غير المنتج الحالي)
      const suggested = products
        .filter(p => p.id !== currentProductId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      
      displaySuggestedProductsForDetails(suggested);
    } catch (error) {
      console.error('Error loading suggested products:', error);
    }
  }

  // عرض المنتجات المقترحة في صفحة التفاصيل
  function displaySuggestedProductsForDetails(products) {
    const container = document.getElementById('suggested-products');
    if (!container) return;
    
    container.innerHTML = '';
    
    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="img" onclick="goToProductDetails(${product.id})" style="cursor: pointer;">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <h4 onclick="goToProductDetails(${product.id})" style="cursor: pointer;">${product.name}</h4>
        <div class="price-container">
          <div class="price">${product.price} ج.م</div>
          <button class="add-to-cart" data-id="${product.id}">
            <i class="fas fa-shopping-cart"></i>
            أضف إلى السلة
          </button>
        </div>
      `;
      container.appendChild(productCard);
    });
    
    // إضافة مستمعات الأحداث للأزرار الجديدة
    attachAddToCartListeners();
  }

  // دالة لعرض الإشعارات
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      background: ${type === 'error' ? '#dc3545' : '#28a745'};
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      text-align: center;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      max-width: 400px;
      margin: 0 auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // إضافة أنيميشن
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateY(-30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-30px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ============================================
// كود تذاكر المتحف
// ============================================
if (window.location.pathname.includes('tickets.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    initTicketsPage();
  });

  function initTicketsPage() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('visitDate');
    if (dateInput) {
      dateInput.min = today;
    }
    
    // Add event listeners
    const ticketTypeSelect = document.getElementById('ticketType');
    const visitDateInput = document.getElementById('visitDate');
    const visitTimeInput = document.getElementById('visitTime');
    const bookingForm = document.getElementById('bookingForm');
    
    if (ticketTypeSelect) {
      ticketTypeSelect.addEventListener('change', updateBookingSummary);
    }
    
    if (visitDateInput) {
      visitDateInput.addEventListener('change', updateBookingSummary);
    }
    
    if (visitTimeInput) {
      visitTimeInput.addEventListener('change', updateBookingSummary);
    }
    
    // Add event listeners for ticket selection buttons
    document.querySelectorAll('.select-ticket-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const ticketType = this.getAttribute('data-type');
        selectTicket(ticketType);
      });
    });
    
    // Handle form submission
    if (bookingForm) {
      bookingForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialize booking summary
    updateBookingSummary();
  }

  function selectTicket(ticketType) {
    const select = document.getElementById('ticketType');
    if (!select) return;
    
    // Set the selected option
    for (let option of select.options) {
      if (option.value === ticketType) {
        option.selected = true;
        break;
      }
    }
    
    // Update the summary
    updateBookingSummary();
    
    // Scroll to form
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
      bookingForm.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
    
    // Highlight the form
    const formWrapper = document.querySelector('.booking-form-wrapper');
    if (formWrapper) {
      formWrapper.style.boxShadow = '0 0 0 3px rgba(201, 162, 0, 0.3)';
      setTimeout(() => {
        formWrapper.style.boxShadow = '';
      }, 1500);
    }
  }

  function updateBookingSummary() {
    const ticketSelect = document.getElementById('ticketType');
    if (!ticketSelect) return;
    
    const selectedOption = ticketSelect.options[ticketSelect.selectedIndex];
    const ticketPrice = selectedOption ? selectedOption.getAttribute('data-price') || 0 : 0;
    const ticketText = selectedOption ? selectedOption.text || '-' : '-';
    const visitDate = document.getElementById('visitDate') ? document.getElementById('visitDate').value : '';
    const visitTime = document.getElementById('visitTime') ? document.getElementById('visitTime').value : '';
    
    // Format date
    let formattedDate = '-';
    if (visitDate) {
      const date = new Date(visitDate);
      formattedDate = date.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Format time
    let formattedTime = '-';
    if (visitTime) {
      const hour = parseInt(visitTime.split(':')[0]);
      formattedTime = visitTime + ' ' + (hour < 12 ? 'صباحًا' : 'مساءً');
    }
    
    // Update summary
    const summaryTicket = document.getElementById('summaryTicket');
    const summaryPrice = document.getElementById('summaryPrice');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const totalAmount = document.getElementById('totalAmount');
    
    if (summaryTicket) summaryTicket.textContent = ticketText;
    if (summaryPrice) summaryPrice.textContent = ticketPrice ? `${ticketPrice} ج.م` : '-';
    if (summaryDate) summaryDate.textContent = formattedDate;
    if (summaryTime) summaryTime.textContent = formattedTime;
    if (totalAmount) totalAmount.textContent = ticketPrice ? `${ticketPrice} ج.م` : '0 ج.م';
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
      fullName: document.getElementById('fullName') ? document.getElementById('fullName').value : '',
      email: document.getElementById('email') ? document.getElementById('email').value : '',
      phone: document.getElementById('phone') ? document.getElementById('phone').value : '',
      ticketType: document.getElementById('ticketType') ? document.getElementById('ticketType').value : '',
      visitDate: document.getElementById('visitDate') ? document.getElementById('visitDate').value : '',
      visitTime: document.getElementById('visitTime') ? document.getElementById('visitTime').value : '',
      notes: document.getElementById('notes') ? document.getElementById('notes').value : ''
    };
    
    // Validate form
    if (!validateForm(formData)) {
      return;
    }
    
    // Create booking
    const bookingId = createBooking(formData);
    
    // Show success message
    showSuccessMessage(bookingId, formData);
    
    // Reset form
    e.target.reset();
    updateBookingSummary();
  }

  function validateForm(formData) {
    // Basic validation
    if (!formData.fullName.trim()) {
      alert('الرجاء إدخال الاسم الكامل');
      const fullNameInput = document.getElementById('fullName');
      if (fullNameInput) fullNameInput.focus();
      return false;
    }
    
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      alert('الرجاء إدخال بريد إلكتروني صحيح');
      const emailInput = document.getElementById('email');
      if (emailInput) emailInput.focus();
      return false;
    }
    
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
      alert('الرجاء إدخال رقم هاتف صحيح');
      const phoneInput = document.getElementById('phone');
      if (phoneInput) phoneInput.focus();
      return false;
    }
    
    if (!formData.ticketType) {
      alert('الرجاء اختيار نوع التذكرة');
      const ticketTypeInput = document.getElementById('ticketType');
      if (ticketTypeInput) ticketTypeInput.focus();
      return false;
    }
    
    if (!formData.visitDate) {
      alert('الرجاء اختيار تاريخ الزيارة');
      const visitDateInput = document.getElementById('visitDate');
      if (visitDateInput) visitDateInput.focus();
      return false;
    }
    
    if (!formData.visitTime) {
      alert('الرجاء اختيار وقت الزيارة');
      const visitTimeInput = document.getElementById('visitTime');
      if (visitTimeInput) visitTimeInput.focus();
      return false;
    }
    
    return true;
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function isValidPhone(phone) {
    const re = /^01[0125][0-9]{8}$/;
    return re.test(phone);
  }

  function createBooking(formData) {
    // Generate booking ID
    const bookingId = 'MAGD-' + Date.now().toString().slice(-8);
    
    // Here you would normally send the data to a server
    // For now, we'll just log it and show a success message
    console.log('Booking created:', { bookingId, ...formData });
    
    return bookingId;
  }

  function showSuccessMessage(bookingId, formData) {
    // Create success message
    const successHTML = `
      <div class="success-message">
        <i class="fas fa-check-circle"></i>
        <h3>تم تأكيد حجزك بنجاح!</h3>
        <p>رقم الحجز: <strong>${bookingId}</strong></p>
        <p>تم إرسال تفاصيل الحجز إلى بريدك الإلكتروني ورقم الهاتف</p>
        <div class="booking-details">
          <p><strong>${formData.fullName}</strong></p>
          <p>${formData.ticketType === 'single' ? 'تذكرة فردية' : 
                formData.ticketType === 'family' ? 'تذكرة عائلية' : 
                'تذكرة طلابية'}</p>
          <p>${formData.visitDate} - ${formData.visitTime}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Create and show message
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = successHTML;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      border: 2px solid #4CAF50;
      z-index: 1000;
      max-width: 500px;
      margin: 0 auto;
      animation: slideIn 0.5s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateY(-100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      .success-message {
        position: relative;
      }
      
      .success-message i.fa-check-circle {
        color: #4CAF50;
        font-size: 3rem;
        margin-bottom: 15px;
      }
      
      .success-message h3 {
        color: #333;
        margin-bottom: 10px;
      }
      
      .success-message p {
        color: #666;
        margin-bottom: 10px;
      }
      
      .booking-details {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
        border: 1px solid #eee;
      }
      
      .close-btn {
        position: absolute;
        top: 10px;
        left: 10px;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 1.2rem;
      }
    `;
    document.head.appendChild(style);
    
    // Remove message after 10 seconds
    setTimeout(() => {
      if (messageDiv.parentElement) {
        messageDiv.remove();
      }
    }, 10000);
  }
}

// ============================================
// كود صفحة العربة
// ============================================
if (window.location.pathname.includes('cart.html')) {
  let discountApplied = false;
  let discountAmount = 0;

  // تهيئة الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    updateCartSummary();
    loadSuggestedProducts();
    setupEventListeners();
    updateCartCount();
  });

  // تحميل عناصر العربة
  function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cart.length === 0) {
      if (emptyCart) emptyCart.style.display = 'block';
      return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (!cartItemsContainer) return;
    
    // مسح المحتوى القديم
    const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
    existingItems.forEach(item => item.remove());
    
    // إنشاء عناصر جديدة
    cart.forEach((item, index) => {
      const cartItem = createCartItemElement(item, index);
      cartItemsContainer.appendChild(cartItem);
    });
  }

  // إنشاء عنصر في العربة
  function createCartItemElement(item, index) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.name}</h3>
        <span class="cart-item-category">${getCategoryName(item.category)}</span>
        ${item.size ? `<span class="cart-item-size">المقاس: ${item.size}</span>` : ''}
        <div class="cart-item-price">${item.price} ج.م</div>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-control">
          <button class="quantity-btn minus" data-index="${index}">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-index="${index}">
          <button class="quantity-btn plus" data-index="${index}">+</button>
        </div>
        <button class="remove-item" data-index="${index}">
          <i class="fas fa-trash"></i>
          حذف
        </button>
      </div>
    `;
    
    return cartItem;
  }

  // الحصول على اسم التصنيف
  function getCategoryName(category) {
    const categories = {
      'sweatshirt': 'سويت-شيرت',
      'bags': 'شنط',
      'accessories': 'اكسسوارات',
      'notebook': 'نوت بوك',
      'mug': 'مجات',
      'siphon': 'سيفونيز',
      'box': 'بوكسيز'
    };
    
    return categories[category] || category;
  }

  // تحديث ملخص الطلب
  function updateCartSummary() {
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = itemCount > 0 ? 50 : 0;
    const total = subtotal + shipping - discountAmount;
    
    const itemCountElement = document.getElementById('itemCount');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const discountElement = document.getElementById('discount');
    const totalElement = document.getElementById('total');
    
    if (itemCountElement) itemCountElement.textContent = itemCount;
    if (subtotalElement) subtotalElement.textContent = `${subtotal} ج.م`;
    if (shippingElement) shippingElement.textContent = `${shipping} ج.م`;
    if (discountElement) discountElement.textContent = `${discountAmount} ج.م`;
    if (totalElement) totalElement.textContent = `${total} ج.م`;
    
    // تحديث زر الدفع
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.disabled = itemCount === 0;
      
      if (itemCount === 0) {
        checkoutBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> العربة فارغة';
      }
    }
  }

  // إعداد مستمعات الأحداث
  function setupEventListeners() {
    // مستمعات للكمية
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('quantity-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const isPlus = e.target.classList.contains('plus');
        
        if (isPlus) {
          cart[index].quantity = Math.min(cart[index].quantity + 1, 10);
        } else {
          cart[index].quantity = Math.max(cart[index].quantity - 1, 1);
        }
        
        saveCart();
        updateQuantityInput(index);
      }
      
      if (e.target.classList.contains('remove-item')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        removeFromCart(index);
      }
    });
    
    // مستمعات لإدخال الكمية
    document.addEventListener('input', function(e) {
      if (e.target.classList.contains('quantity-input')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const value = parseInt(e.target.value);
        
        if (value >= 1 && value <= 10) {
          cart[index].quantity = value;
          saveCart();
        }
      }
    });
    
    // تطبيق الخصم
    const applyDiscountBtn = document.getElementById('applyDiscount');
    if (applyDiscountBtn) {
      applyDiscountBtn.addEventListener('click', applyDiscount);
    }
    
    const discountCodeInput = document.getElementById('discountCode');
    if (discountCodeInput) {
      discountCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          applyDiscount();
        }
      });
    }
    
    // اتمام الشراء
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', checkout);
    }
  }

  // تحديث حقل الكمية
  function updateQuantityInput(index) {
    const input = document.querySelector(`.quantity-input[data-index="${index}"]`);
    if (input) {
      input.value = cart[index].quantity;
      updateCartSummary();
    }
  }

  // حذف عنصر من العربة
  function removeFromCart(index) {
    // إضافة تأثير قبل الحذف
    const item = document.querySelector(`.cart-item-controls [data-index="${index}"]`);
    if (item) {
      const cartItem = item.closest('.cart-item');
      if (cartItem) {
        cartItem.style.transform = 'translateX(-100%)';
        cartItem.style.opacity = '0';
      }
    }
    
    setTimeout(() => {
      cart.splice(index, 1);
      saveCart();
      loadCartItems();
      updateCartSummary();
      updateCartCount();
    }, 300);
  }

  // تطبيق الخصم
  function applyDiscount() {
    const discountCodeElement = document.getElementById('discountCode');
    const messageElement = document.getElementById('discountMessage');
    
    if (!discountCodeElement || !messageElement) return;
    
    const discountCode = discountCodeElement.value.trim();
    
    if (discountApplied) {
      messageElement.textContent = 'تم تطبيق خصم مسبقاً';
      messageElement.className = 'discount-note error';
      return;
    }
    
    // قائمة أكواد الخصم
    const discountCodes = {
      'MAGD10': 10,
      'MAGD20': 20,
      'WELCOME': 15,
      'FIRSTORDER': 25
    };
    
    if (discountCode in discountCodes) {
      const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      discountAmount = (subtotal * discountCodes[discountCode]) / 100;
      discountApplied = true;
      
      messageElement.textContent = `تم تطبيق خصم ${discountCodes[discountCode]}% بنجاح!`;
      messageElement.className = 'discount-note success';
      
      updateCartSummary();
    } else {
      messageElement.textContent = 'كود الخصم غير صالح';
      messageElement.className = 'discount-note error';
    }
  }

  // اتمام الشراء
  function checkout() {
    if (cart.length === 0) {
      alert('عربة التسوق فارغة');
      return;
    }
    
    // محاكاة عملية الشراء
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50 - discountAmount;
    
    // عرض نموذج الدفع
    showPaymentModal(total);
  }

  // عرض نموذج الدفع
  function showPaymentModal(total) {
    const modalHTML = `
      <div class="payment-modal" id="paymentModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>اكمل عملية الشراء</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="order-summary">
              <h4>ملخص الطلب</h4>
              <p>المجموع: <strong>${total} ج.م</strong></p>
            </div>
            
            <form id="paymentForm">
              <div class="form-group">
                <label>الاسم على البطاقة</label>
                <input type="text" required>
              </div>
              <div class="form-group">
                <label>رقم البطاقة</label>
                <input type="text" maxlength="16" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>تاريخ الانتهاء</label>
                  <input type="text" placeholder="MM/YY" required>
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input type="text" maxlength="3" required>
                </div>
              </div>
              
              <button type="submit" class="submit-payment">
                <i class="fas fa-lock"></i>
                تأكيد الدفع
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // إضافة النماذج إلى الصفحة
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // إضافة الأنماط
    const styles = `
      .payment-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
      }
      
      .modal-content {
        background: white;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        animation: slideUp 0.3s ease;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 2px solid #f1e8cc;
      }
      
      .modal-header h3 {
        margin: 0;
        color: #333;
      }
      
      .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
      }
      
      .modal-body {
        padding: 20px;
      }
      
      .order-summary {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
      }
      
      .order-summary h4 {
        margin-top: 0;
        color: #333;
      }
      
      #paymentForm .form-group {
        margin-bottom: 15px;
      }
      
      #paymentForm label {
        display: block;
        margin-bottom: 5px;
        color: #333;
        font-weight: 500;
      }
      
      #paymentForm input {
        width: 100%;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
      }
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      
      .submit-payment {
        width: 100%;
        padding: 15px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // مستمعات الأحداث للنموذج
    document.querySelector('.close-modal').addEventListener('click', () => {
      modalContainer.remove();
    });
    
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
      e.preventDefault();
      completePayment();
    });
  }

  // اتمام عملية الدفع
  function completePayment() {
    // محاكاة عملية الدفع الناجحة
    setTimeout(() => {
      // إنشاء رقم طلب
      const orderId = 'ORDER-' + Date.now().toString().slice(-8);
      
      // عرض رسالة النجاح
      alert(`تمت عملية الشراء بنجاح!\nرقم الطلب: ${orderId}\nسيتم التواصل معك لتأكيد الشحن.`);
      
      // تفريغ العربة
      cart = [];
      saveCart();
      updateCartCount();
      
      // إعادة تحميل الصفحة
      location.reload();
    }, 1500);
  }

  // تحميل منتجات مقترحة
  async function loadSuggestedProducts() {
    try {
      const response = await fetch('products.json');
      const products = await response.json();
      
      // اختيار 4 منتجات عشوائية
      const suggested = products
        .filter(p => !cart.some(item => item.id === p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      
      displaySuggestedProducts(suggested);
    } catch (error) {
      console.error('Error loading suggested products:', error);
    }
  }

  // عرض المنتجات المقترحة
  function displaySuggestedProducts(products) {
    const container = document.getElementById('suggestedProducts');
    if (!container) return;
    
    container.innerHTML = '';
    
    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="img" onclick="goToProductDetails(${product.id})" style="cursor: pointer;">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <h4 onclick="goToProductDetails(${product.id})" style="cursor: pointer;">${product.name}</h4>
        <div class="price-container">
          <div class="price">${product.price} ج.م</div>
          <button class="add-to-cart" data-id="${product.id}">
            <i class="fas fa-shopping-cart"></i>
            أضف إلى السلة
          </button>
        </div>
      `;
      container.appendChild(productCard);
    });
    
    // إضافة مستمعات الأحداث للأزرار الجديدة
    attachAddToCartListeners();
  }

  // إضافة منتج من المقترحة
  function addToCartFromSuggested(productId) {
    // إضافة المنتج إلى العربة
    fetch('products.json')
      .then(res => res.json())
      .then(products => {
        const product = products.find(p => p.id === productId);
        
        if (product) {
          // التحقق مما إذا كان المنتج موجوداً بالفعل
          const existingItem = cart.find(item => item.id === productId);
          
          if (existingItem) {
            existingItem.quantity = Math.min(existingItem.quantity + 1, 10);
          } else {
            cart.push({
              ...product,
              quantity: 1
            });
          }
          
          saveCart();
          loadCartItems();
          updateCartSummary();
          updateCartCount();
          
          // عرض إشعار
          showNotification('تمت إضافة المنتج إلى العربة');
        }
      })
      .catch(error => console.error('Error:', error));
  }

  // إظهار إشعار
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      max-width: 400px;
      margin: 0 auto;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}