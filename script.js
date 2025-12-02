// الأحداث
let allProducts = []; // كل المنتجات
let products = [];    // المنتجات المعروضة
let cart = JSON.parse(localStorage.getItem('cart')) || []; // السلة من localStorage

// تحميل JSON
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    products = [...data]; // نسخة من البيانات الأصلية
    displayProducts(products);
    updateResultsCount(products);
    updateCartCount(); // تحديث عدد المنتجات في السلة
  })
  .catch(err => console.log("خطأ في تحميل المنتجات:", err));

// عرض المنتجات مع زر الإضافة للسلة
function displayProducts(productsToShow) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  if (productsToShow.length === 0) {
    container.innerHTML = "<p class='no-products'>لا توجد منتجات مطابقة</p>";
    return;
  }

   productsToShow.forEach(p => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="img">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <h4>${p.name}</h4>
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
    button.addEventListener('click', function() {
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
  localStorage.setItem('cart', JSON.stringify(cart));
  
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

// تحديث عدد النتائج
function updateResultsCount(productsToShow) {
  const resultsElement = document.getElementById("results-count");
  if (resultsElement) {
    resultsElement.textContent = `عرض 1-${productsToShow.length} من ${allProducts.length} نتيجة`;
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

  let filtered = allProducts.filter(p => {
    // الفئة
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
  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "new") filtered.sort((a, b) => b.id - a.id);

  displayProducts(filtered);
  updateResultsCount(filtered);
}

// تحديث عرض السعر
function updatePriceDisplay() {
  const slider = document.getElementById("price-slider");
  const maxPriceElement = document.getElementById("max-price");
  if (slider && maxPriceElement) {
    maxPriceElement.textContent = `${slider.value} ج.م`;
  }
}

// إعداد الأحداث
function setupEventListeners() {
  // الكل
  document.getElementById("cat-all").addEventListener("change", () => {
    if (document.getElementById("cat-all").checked) {
      // إلغاء تحديد جميع الفئات الأخرى
      const allCategoryIds = [
        "cat-sweet", "cat-bags", "cat-access", 
        "cat-notebook", "cat-mug", "cat-siphon", "cat-box"
      ];
      allCategoryIds.forEach(id => {
        document.getElementById(id).checked = false;
      });
    }
    filterProducts();
  });

  // أي فئة أخرى تلغي الكل
  const allCategoryIds = [
    "cat-sweet", "cat-bags", "cat-access", 
    "cat-notebook", "cat-mug", "cat-siphon", "cat-box"
  ];
  
  allCategoryIds.forEach(id => {
    document.getElementById(id).addEventListener("change", () => {
      if (document.getElementById(id).checked) {
        document.getElementById("cat-all").checked = false;
      }
      filterProducts();
    });
  });

  // السعر
  document.getElementById("price-slider").addEventListener("input", () => {
    updatePriceDisplay();
    filterProducts();
  });

  // الفرز
  document.getElementById("sort").addEventListener("change", filterProducts);

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
});

// كود للكشف عن ظهور العنصر أثناء التمرير
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
        console.log('تم النقر على زر العجلة');
        wheelModal.style.display = 'flex';
    });
    
    // تدوير العجلة
    spinBtn.addEventListener('click', function() {
        console.log('تم النقر على زر التدوير');
        spinWheel();
    });
    
    // إغلاق النتيجة
    closeResult.addEventListener('click', function() {
        console.log('تم النقر على زر الإغلاق');
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
// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initTicketsPage();
});

function initTicketsPage() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('visitDate').min = today;
    
    // Add event listeners
    document.getElementById('ticketType').addEventListener('change', updateBookingSummary);
    document.getElementById('visitDate').addEventListener('change', updateBookingSummary);
    document.getElementById('visitTime').addEventListener('change', updateBookingSummary);
    
    // Add event listeners for ticket selection buttons
    document.querySelectorAll('.select-ticket-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const ticketType = this.getAttribute('data-type');
            selectTicket(ticketType);
        });
    });
    
    // Handle form submission
    document.getElementById('bookingForm').addEventListener('submit', handleFormSubmit);
    
    // Initialize booking summary
    updateBookingSummary();
}

function selectTicket(ticketType) {
    const select = document.getElementById('ticketType');
    
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
    document.querySelector('.booking-form').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    
    // Highlight the form
    document.querySelector('.booking-form-wrapper').style.boxShadow = '0 0 0 3px rgba(201, 162, 0, 0.3)';
    setTimeout(() => {
        document.querySelector('.booking-form-wrapper').style.boxShadow = '';
    }, 1500);
}

function updateBookingSummary() {
    const ticketSelect = document.getElementById('ticketType');
    const selectedOption = ticketSelect.options[ticketSelect.selectedIndex];
    const ticketPrice = selectedOption.getAttribute('data-price') || 0;
    const ticketText = selectedOption.text || '-';
    const visitDate = document.getElementById('visitDate').value;
    const visitTime = document.getElementById('visitTime').value;
    
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
        formattedTime = visitTime + ' ' + (parseInt(visitTime.split(':')[0]) < 12 ? 'صباحًا' : 'مساءً');
    }
    
    // Update summary
    document.getElementById('summaryTicket').textContent = ticketText;
    document.getElementById('summaryPrice').textContent = ticketPrice ? `${ticketPrice} ج.م` : '-';
    document.getElementById('summaryDate').textContent = formattedDate;
    document.getElementById('summaryTime').textContent = formattedTime;
    document.getElementById('totalAmount').textContent = ticketPrice ? `${ticketPrice} ج.م` : '0 ج.م';
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        ticketType: document.getElementById('ticketType').value,
        visitDate: document.getElementById('visitDate').value,
        visitTime: document.getElementById('visitTime').value,
        notes: document.getElementById('notes').value
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
        document.getElementById('fullName').focus();
        return false;
    }
    
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
        alert('الرجاء إدخال بريد إلكتروني صحيح');
        document.getElementById('email').focus();
        return false;
    }
    
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
        alert('الرجاء إدخال رقم هاتف صحيح');
        document.getElementById('phone').focus();
        return false;
    }
    
    if (!formData.ticketType) {
        alert('الرجاء اختيار نوع التذكرة');
        document.getElementById('ticketType').focus();
        return false;
    }
    
    if (!formData.visitDate) {
        alert('الرجاء اختيار تاريخ الزيارة');
        document.getElementById('visitDate').focus();
        return false;
    }
    
    if (!formData.visitTime) {
        alert('الرجاء اختيار وقت الزيارة');
        document.getElementById('visitTime').focus();
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
// cart.js

// تحميل العربة من localStorage
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
        emptyCart.style.display = 'block';
        return;
    }
    
    emptyCart.style.display = 'none';
    
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
    
    document.getElementById('itemCount').textContent = itemCount;
    document.getElementById('subtotal').textContent = `${subtotal} ج.م`;
    document.getElementById('shipping').textContent = `${shipping} ج.م`;
    document.getElementById('discount').textContent = `${discountAmount} ج.م`;
    document.getElementById('total').textContent = `${total} ج.م`;
    
    // تحديث زر الدفع
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = itemCount === 0;
    
    if (itemCount === 0) {
        checkoutBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> العربة فارغة';
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
    document.getElementById('applyDiscount').addEventListener('click', applyDiscount);
    document.getElementById('discountCode').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyDiscount();
        }
    });
    
    // اتمام الشراء
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
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
    const item = document.querySelector(`.cart-item-controls [data-index="${index}"]`).closest('.cart-item');
    item.style.transform = 'translateX(-100%)';
    item.style.opacity = '0';
    
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
    const discountCode = document.getElementById('discountCode').value.trim();
    const messageElement = document.getElementById('discountMessage');
    
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
    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <h4>${product.name}</h4>
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
    document.querySelectorAll('#suggestedProducts .add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCartFromSuggested(productId);
        });
    });
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

// حفظ العربة في localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// تحديث عداد العربة في الهيدر
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        if (totalItems > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }
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
