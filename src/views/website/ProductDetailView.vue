<template>
  <div class="product-detail-page" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" v-if="product">
        <router-link to="/">{{ t('nav.home') }}</router-link>
        <span class="separator">›</span>
        <router-link to="/products">{{ t('nav.products') }}</router-link>
        <span class="separator">›</span>
        <router-link :to="product.category_parent_id ? `/products?subcategory_id=${product.category_id}` : `/products?category_id=${product.category_id}`">
          {{ localizedValue(product.category) || (locale === 'ar' ? 'الأفران' : 'Ovens') }}
        </router-link>
        <span class="separator">›</span>
        <span class="current">{{ localized(product, 'name') || (locale === 'ar' ? 'فرن غاز بلت-إن 60 سم' : 'Built-in Gas Oven 60cm') }}</span>
      </nav>

      <div v-if="loading" class="detail-loader">
        <div class="spinner"></div>
      </div>

      <div v-else-if="product" class="product-main-layout">
        <!-- Right Column (in RTL): Image Gallery -->
        <div class="images-section">
          <!-- Main Display Image -->
          <div class="main-image-wrapper" @click="openLightbox(currentImageIndex)">
            <img 
              :src="allImages[currentImageIndex]" 
              :alt="localized(product, 'name')" 
              class="main-display-image" 
              @error="handleImageError($event, currentImageIndex)"
            />
          </div>

          <!-- Thumbnails Row (4 Columns Under Main Image) -->
          <div class="thumbnails-row" v-if="allImages.length > 1">
            <div 
              v-for="(img, index) in allImages.slice(0, 4)" 
              :key="index" 
              class="thumb-item"
              :class="{ active: currentImageIndex === index }"
              @click="currentImageIndex = index"
            >
              <img 
                :src="img" 
                :alt="localized(product, 'name')" 
                @error="handleImageError($event, index)"
              />
            </div>
          </div>
        </div>

        <!-- Left Column (in RTL): Product Information -->
        <div class="info-section">
          <!-- Category & Origin + Share Button -->
          <div class="product-top-meta">
            <div class="category-origin">
              <span>{{ localizedValue(product.category) || (locale === 'ar' ? 'الأفران' : 'Ovens') }}</span>
              <span class="meta-pipe">|</span>
              <span class="origin-text">{{ product.origin || (locale === 'ar' ? 'إيطالي الصنع' : 'Made in Italy') }}</span>
            </div>
            <button class="share-btn" @click.stop="showShareModal = true" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>{{ locale === 'ar' ? 'مشاركة' : 'Share' }}</span>
            </button>
          </div>

          <!-- Product Title -->
          <h1 class="product-title">{{ localized(product, 'name') || (locale === 'ar' ? 'فرن غاز بلت-إن 60 سم' : 'Built-in Gas Oven 60 cm') }}</h1>

          <!-- Rating & Model Row -->
          <div class="rating-model-row">
            <div class="stars-score">
              <div class="stars-gold">
                <i v-for="i in Math.floor(computedAverageRating)" :key="'h-star-'+i" class="fas fa-star"></i>
                <i v-if="(computedAverageRating % 1) >= 0.15" class="fas fa-star-half-alt half-star-flipped"></i>
                <i v-for="i in (5 - Math.floor(computedAverageRating) - ((computedAverageRating % 1) >= 0.15 ? 1 : 0))" :key="'h-empty-'+i" class="far fa-star"></i>
              </div>
              <span class="score-num">{{ Number(computedAverageRating).toFixed(1) }}</span>
              <span class="count-num">({{ locale === 'ar' ? `${computedRatingCount} تقييم` : `${computedRatingCount} reviews` }})</span>
            </div>
            <span class="meta-pipe">|</span>
            <span class="model-num">{{ locale === 'ar' ? 'الموديل' : 'Model' }}: {{ product.sku || product.model_number || 'OG604S' }}</span>
          </div>

          <!-- Price & VAT -->
          <div class="price-box">
            <div class="price-value-row">
              <span class="main-price">{{ formatPrice(currentPrice || 2499) }}</span>
              <span class="currency-symbol">﷼</span>
            </div>
            <span class="vat-notice">{{ locale === 'ar' ? 'شامل ضريبة القيمة المضافة' : 'Includes VAT' }}</span>
          </div>

          <!-- Stock Status -->
          <div class="stock-status" :class="isProductInStock ? 'in-stock' : 'out-of-stock'">
            <span class="stock-dot">•</span>
            <span>{{ isProductInStock ? (locale === 'ar' ? 'متوفر في المخزون' : 'In Stock') : (locale === 'ar' ? 'غير متوفر في المخزون' : 'Out of Stock') }}</span>
          </div>

          <!-- Key Features Checklist (6 items with diamond icon ❖) -->
          <ul class="key-features-list">
            <li v-for="(feat, idx) in productFeatures" :key="idx">
              <span class="feat-icon">❖</span>
              <span class="feat-text">{{ feat }}</span>
            </li>
          </ul>

          <!-- Color Selection -->
          <div class="color-selection-section" v-if="colorOptions.length > 0">
            <div class="color-label">
              <span class="label-title">{{ locale === 'ar' ? 'اللون:' : 'Color:' }}</span>
              <span class="selected-color-name">{{ selectedColorName }}</span>
            </div>
            <div class="color-swatches-row">
              <button 
                v-for="c in colorOptions" 
                :key="c.name"
                type="button"
                class="color-swatch-circle"
                :class="{ 
                  active: selectedColorName === c.name,
                  'white-color': isLightColor(c.hex)
                }"
                :style="{ backgroundColor: c.hex }"
                @click="selectColor(c.name)"
                :title="c.name"
                :aria-label="c.name"
              ></button>
            </div>
          </div>

          <!-- Action Row: Quantity + Add to Cart -->
          <div class="action-row">
            <div class="qty-selector">
              <button type="button" class="qty-btn minus" @click="quantity > 1 ? quantity-- : null" aria-label="Decrease quantity">-</button>
              <span class="qty-number">{{ quantity }}</span>
              <button type="button" class="qty-btn plus" @click="quantity++" aria-label="Increase quantity">+</button>
            </div>
            <button 
              type="button" 
              class="add-to-cart-button" 
              :disabled="!isProductInStock"
              @click="handleAddToCart"
            >
              <svg class="bag-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>{{ isProductInStock ? (locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart') : (locale === 'ar' ? 'غير متوفر' : 'Out of Stock') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Part 3: Tabs Section -->
      <div v-if="product" class="tabs-section">
        <div class="tabs-header">
          <button 
            v-for="tab in tabOptions" 
            :key="tab.id" 
            class="tab-btn" 
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 1. Overview Tab -->
          <div v-if="activeTab === 'overview'" class="tab-pane overview-pane">
            <h2 class="pane-main-title">{{ dynamicOverviewTitle }}</h2>
            <p class="pane-main-desc">{{ dynamicOverviewDesc }}</p>
            <div class="overview-features-grid">
              <div v-for="(feat, idx) in dynamicOverviewFeatures" :key="idx" class="ov-feat-item">
                <i class="far fa-star"></i>
                <span>{{ feat }}</span>
              </div>
            </div>
          </div>

          <!-- 2. Technical Specifications Tab -->
          <div v-if="activeTab === 'specs'" class="tab-pane specs-pane" style="background: rgba(255, 255, 255, 1);">
            <div class="specs-card" style="background: rgba(255, 255, 255, 1);">
              <h3 class="specs-card-title">{{ locale === 'ar' ? 'المواصفات الفنية الكاملة' : 'Full Technical Specifications' }}</h3>
              <div class="specs-grid-rows" style="background: rgba(255, 255, 255, 1);">
                <div v-for="(r, idx) in specRows" :key="idx" class="spec-row" style="background: rgba(255, 255, 255, 1);">
                  <div class="spec-col" style="background: rgba(255, 255, 255, 1);">
                    <span class="spec-label">{{ r.col1.label }}</span>
                    <span class="spec-val">{{ r.col1.value }}</span>
                  </div>
                  <div class="spec-col" v-if="r.col2" style="background: rgba(255, 255, 255, 1);">
                    <span class="spec-label">{{ r.col2.label }}</span>
                    <span class="spec-val">{{ r.col2.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Installation Guide Tab -->
          <div v-if="activeTab === 'installation'" class="tab-pane installation-pane">
            <h2 class="pane-heading">{{ locale === 'ar' ? 'دليل التركيب' : 'Installation Guide' }}</h2>

            <!-- Dynamic Custom Installation Guidance If Provided from Dashboard -->
            <div class="guide-dynamic-banner" v-if="dynamicInstallationTips">
              <div class="dynamic-banner-header">
                <i class="fas fa-info-circle"></i>
                <h4>{{ locale === 'ar' ? 'إرشادات التركيب المخصصة للمنتج' : 'Product Installation Guidance' }}</h4>
              </div>
              <div class="dynamic-banner-body" style="white-space: pre-line;">{{ dynamicInstallationTips }}</div>
            </div>

            <div class="guide-section">
              <div class="guide-sec-header">
                <i class="fas fa-tools"></i>
                <h3>{{ locale === 'ar' ? 'متطلبات التركيب' : 'Installation Requirements' }}</h3>
              </div>
              <ul class="guide-checklist">
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'توصيلة غاز معتمدة ومطابقة للمواصفات' : 'Certified gas connection matching regulatory standards' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'مقبس كهربائي 220-240 فولت بالقرب من موقع التركيب' : '220-240V electrical outlet adjacent to installation opening' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'فتحة خزانة بأبعاد 56 × 56 × 55 سم' : 'Cabinet cutout dimensions 56 × 56 × 55 cm' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'تهوية كافية حسب متطلبات السلامة' : 'Adequate ventilation clearances per safety codes' }}</span></li>
              </ul>
            </div>

            <div class="guide-section">
              <div class="guide-sec-header">
                <i class="fas fa-list-ol"></i>
                <h3>{{ locale === 'ar' ? 'خطوات التركيب' : 'Installation Steps' }}</h3>
              </div>
              <ol class="guide-steps-list">
                <li><span class="step-num-txt">1.</span><span>{{ locale === 'ar' ? 'تأكد من إيقاف إمداد الغاز والكهرباء بالكامل' : 'Shut off main gas and power supplies entirely' }}</span></li>
                <li><span class="step-num-txt">2.</span><span>{{ locale === 'ar' ? 'جهز فتحة الخزانة وفقاً للأبعاد المحددة في دليل المنتج' : 'Prepare the cabinet aperture per product guidelines' }}</span></li>
                <li><span class="step-num-txt">3.</span><span>{{ locale === 'ar' ? 'ضع الفرن في الفتحة مع التأكد من استوائه باستخدام ميزان' : 'Mount the oven ensuring perfect leveling with spirit level' }}</span></li>
                <li><span class="step-num-txt">4.</span><span>{{ locale === 'ar' ? 'وصل خط الغاز باستخدام الوصلات المعتمدة فقط' : 'Connect gas supply using certified high-pressure fittings' }}</span></li>
                <li><span class="step-num-txt">5.</span><span>{{ locale === 'ar' ? 'وصل الكهرباء وتأكد من سلامة التأريض' : 'Plug power and verify ground safety connection' }}</span></li>
                <li><span class="step-num-txt">6.</span><span>{{ locale === 'ar' ? 'اختبر جميع وظائف الفرن والتأكد من عدم وجود تسريب غاز' : 'Test all functions and perform soapy water leak inspection' }}</span></li>
              </ol>
            </div>

            <div class="guide-section">
              <div class="guide-sec-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>{{ locale === 'ar' ? 'ملاحظات مهمة' : 'Important Notes' }}</h3>
              </div>
              <ul class="guide-notes-list">
                <li><span class="warn-icon">⚠</span><span>{{ locale === 'ar' ? 'يجب أن يتم التركيب بواسطة فني معتمد من ماسترجاز' : 'Installation must be performed by certified Mastergas technician' }}</span></li>
                <li><span class="warn-icon">⚠</span><span>{{ locale === 'ar' ? 'عدم الالتزام بتعليمات التركيب قد يؤدي إلى إلغاء الضمان' : 'Non-compliance with installation instructions may void warranty' }}</span></li>
                <li><span class="warn-icon">⚠</span><span>{{ locale === 'ar' ? 'للحصول على خدمة التركيب، تواصل مع الدعم الفني على الرقم الموحد' : 'To request certified installation, contact support on our unified number' }}</span></li>
              </ul>
            </div>
          </div>

          <!-- 4. Shipping & Returns Tab -->
          <div v-if="activeTab === 'shipping'" class="tab-pane shipping-pane">
            <h2 class="pane-heading">{{ locale === 'ar' ? 'الشحن والإرجاع' : 'Shipping & Returns' }}</h2>

            <!-- Dynamic Custom Shipping Guidance If Provided from Dashboard -->
            <div class="guide-dynamic-banner" v-if="dynamicShippingInfo">
              <div class="dynamic-banner-header">
                <i class="fas fa-shipping-fast"></i>
                <h4>{{ locale === 'ar' ? 'تفاصيل الشحن والضمان المخصصة' : 'Custom Shipping & Warranty Terms' }}</h4>
              </div>
              <div class="dynamic-banner-body" style="white-space: pre-line;">{{ dynamicShippingInfo }}</div>
            </div>

            <div class="guide-section">
              <div class="guide-sec-header">
                <i class="fas fa-truck"></i>
                <h3>{{ locale === 'ar' ? 'الشحن والتوصيل' : 'Shipping & Delivery' }}</h3>
              </div>
              <ul class="guide-checklist">
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'شحن مجاني للطلبات فوق 500 ريال' : 'Free shipping for orders exceeding 500 SAR' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'التوصيل خلال 3-5 أيام عمل لجميع مناطق المملكة' : 'Delivery within 3-5 business days across all regions' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'التوصيل خلال 1-2 يوم عمل للمدن الرئيسية (الرياض، جدة، الدمام)' : 'Fast 1-2 day delivery for Riyadh, Jeddah, and Dammam' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'إمكانية تتبع الشحنة عبر رقم التتبع المرسل بالبريد الإلكتروني' : 'Live tracking via tracking number sent via email' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'التوصيل حتى باب المنزل مع إمكانية الرفع للأدوار العليا' : 'Door-to-door delivery with upper-floor lifting service' }}</span></li>
              </ul>
            </div>

            <div class="guide-section">
              <div class="guide-sec-header">
                <i class="fas fa-undo-alt"></i>
                <h3>{{ locale === 'ar' ? 'سياسة الإرجاع والاستبدال' : 'Return & Exchange Policy' }}</h3>
              </div>
              <ul class="guide-checklist">
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'إرجاع مجاني خلال 14 يوم من تاريخ الاستلام' : 'Free return within 14 days of receipt' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'يجب أن يكون المنتج في حالته الأصلية وبغلافه الكامل' : 'Product must be in original condition with complete packaging' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'لا يشمل الإرجاع المنتجات التي تم تركيبها أو استخدامها' : 'Returns do not cover installed or used appliances' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'استرداد المبلغ خلال 5-7 أيام عمل بعد استلام المنتج المرتجع' : 'Refund credited within 5-7 business days upon receipt' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'للاستبدال أو الإرجاع، تواصل مع خدمة العملاء' : 'For returns or exchanges, simply contact customer support' }}</span></li>
              </ul>
            </div>

            <div class="guide-section">
              <div class="guide-sec-header">
                <i class="fas fa-shield-alt"></i>
                <h3>{{ locale === 'ar' ? 'الضمان' : 'Warranty' }}</h3>
              </div>
              <ul class="guide-checklist">
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'ضمان شامل لمدة سنتين على جميع المنتجات' : 'Comprehensive 2-year warranty on all products' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'يشمل الضمان عيوب التصنيع والأعطال الفنية' : 'Covers manufacturer defects and technical malfunctions' }}</span></li>
                <li><span class="check-icon">✓</span><span>{{ locale === 'ar' ? 'لا يشمل الضمان الأضرار الناتجة عن سوء الاستخدام أو التركيب غير المعتمد' : 'Excludes damages caused by misuse or uncertified installation' }}</span></li>
              </ul>
            </div>
          </div>

          <!-- 5. Reviews Tab -->
          <div v-if="activeTab === 'reviews'" class="tab-pane reviews-pane">
            <h2 class="pane-heading">{{ locale === 'ar' ? 'تقييمات العملاء' : 'Customer Reviews' }}</h2>

            <!-- Rating Summary Box -->
            <div class="reviews-score-summary">
              <div class="score-left-col">
                <span class="big-score">{{ Number(computedAverageRating).toFixed(1) }}/5</span>
                <div class="stars-gold">
                  <i v-for="i in Math.floor(computedAverageRating)" :key="'ts-star-'+i" class="fas fa-star"></i>
                  <i v-if="(computedAverageRating % 1) >= 0.15" class="fas fa-star-half-alt half-star-flipped"></i>
                  <i v-for="i in (5 - Math.floor(computedAverageRating) - ((computedAverageRating % 1) >= 0.15 ? 1 : 0))" :key="'ts-empty-'+i" class="far fa-star"></i>
                </div>
                <span class="total-reviews-count">{{ locale === 'ar' ? `${computedRatingCount} تقييم` : `${computedRatingCount} ratings` }}</span>
              </div>

              <div class="bars-right-col">
                <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="rating-bar-row">
                  <span class="bar-label">{{ star }} {{ locale === 'ar' ? (star === 1 ? 'نجمة' : 'نجوم') : (star === 1 ? 'star' : 'stars') }}</span>
                  <div class="bar-track"><div class="bar-fill" :style="{ width: getRatingPercentage(star) + '%' }"></div></div>
                  <span class="bar-pct">{{ getRatingPercentage(star) }}%</span>
                </div>
              </div>
            </div>

            <!-- Review Cards List -->
            <div class="reviews-cards-list">
              <div v-for="(rev, idx) in displayReviews" :key="rev.id || idx" class="review-card-item">
                <div class="rc-header">
                  <div class="rc-user">
                    <i class="far fa-user-circle"></i>
                    <span class="rc-name">{{ rev.user_name || rev.customer?.name || rev.name || (locale === 'ar' ? 'عميل ماسترجاز' : 'Mastergas Customer') }}</span>
                  </div>
                  <span class="rc-date">{{ rev.created_at ? formatDate(rev.created_at) : rev.date }}</span>
                </div>
                <div class="rc-stars">
                  <i v-for="s in 5" :key="s" :class="s <= (rev.rating || 5) ? 'fas fa-star' : 'far fa-star'"></i>
                </div>
                <p class="rc-comment">{{ rev.comment }}</p>
              </div>
            </div>

            <!-- Add Review Button -->
            <div class="add-review-action">
              <button type="button" class="add-review-btn" @click="showAddReviewModal = true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <span>{{ locale === 'ar' ? 'أضف تقييمك' : 'Add Review' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Part 4: Related Products Section -->
      <section class="related-section" v-if="relatedProducts.length > 0">
        <div class="related-header">
          <h2 class="related-title">{{ locale === 'ar' ? 'منتجات ذات صلة' : 'Related Products' }}</h2>
          <p class="related-subtitle">{{ locale === 'ar' ? 'أجهزة متوافقة تكمل تصميم مطبخك الفاخر' : 'Compatible appliances to complete your luxury kitchen' }}</p>
        </div>
        <div class="products-grid">
          <product-card 
            v-for="p in relatedProducts" 
            :key="p.id" 
            :product="p" 
            @click="goToProduct(p)"
            @add-to-cart="cartState.addToCart(p)"
          />
        </div>
      </section>
    </div>

    <!-- Image Lightbox Gallery -->
    <transition name="fade">
      <div v-if="showLightbox" class="lightbox-overlay" @click.self="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">✕</button>
        
        <div class="lightbox-content">
          <button class="lightbox-nav prev" @click="prevLightbox" v-if="allImages.length > 1">
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <div class="lightbox-image-container">
            <img :src="allImages[lightboxIndex]" :alt="product?.name" class="lightbox-main-img" @error="handleImageError($event, lightboxIndex)" />
          </div>

          <button class="lightbox-nav next" @click="nextLightbox" v-if="allImages.length > 1">
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>

        <div class="lightbox-thumbnails" v-if="allImages.length > 1">
          <div 
            v-for="(img, idx) in allImages" 
            :key="idx" 
            class="lightbox-thumb"
            :class="{ active: lightboxIndex === idx }"
            @click="lightboxIndex = idx"
          >
            <img :src="img" @error="handleImageError($event, idx)" />
          </div>
        </div>
      </div>
    </transition>

    <!-- Share Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showShareModal" class="share-modal-overlay" @click.self="showShareModal = false">
          <div class="share-modal-content">
            <div class="share-header">
              <button class="share-close" @click="showShareModal = false"><i class="fas fa-times"></i></button>
              <h3 class="share-title">{{ t('product.share_product') }}</h3>
            </div>
            <div class="share-options">
              <button class="share-option-btn" @click="shareTo('whatsapp')">
                <div class="share-icon whatsapp"><i class="fab fa-whatsapp"></i></div>
                <span class="share-text">WhatsApp</span>
              </button>
              <button class="share-option-btn" @click="shareTo('facebook')">
                <div class="share-icon facebook"><i class="fab fa-facebook-f"></i></div>
                <span class="share-text">Facebook</span>
              </button>
              <button class="share-option-btn" @click="shareTo('twitter')">
                <div class="share-icon twitter">
                  <svg width="14" height="14" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="white"/>
                  </svg>
                </div>
                <span class="share-text">X</span>
              </button>
              <button class="share-option-btn" @click="copyLink">
                <div class="share-icon copy"><i class="far fa-copy"></i></div>
                <span class="share-text">{{ t('product.copy_link') }}</span>
              </button>
            </div>
            <div class="copy-feedback" v-if="linkCopied">{{ t('product.link_copied') }}</div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Add Review Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showAddReviewModal" class="share-modal-overlay" @click.self="showAddReviewModal = false">
          <div class="share-modal-content review-modal-card">
            <div class="share-header">
              <button class="share-close" @click="showAddReviewModal = false"><i class="fas fa-times"></i></button>
              <h3 class="share-title">{{ locale === 'ar' ? 'إضافة تقييم' : 'Add Review' }}</h3>
            </div>
            
            <div v-if="!user" class="login-prompt">
              {{ t('product.login_to_review_prefix') }} <button class="login-link-btn" @click="openLoginModal">{{ t('auth.login') }}</button> {{ t('product.login_to_review_suffix') }}
            </div>
            
            <form v-else @submit.prevent="submitReview" class="review-form">
              <div class="rating-input-group">
                <label>{{ t('product.your_rating') }}:</label>
                <div class="star-rating-input">
                  <i 
                    v-for="i in 5" 
                    :key="i" 
                    :class="i <= reviewForm.rating ? 'fas fa-star active' : 'far fa-star'"
                    @click="reviewForm.rating = i"
                  ></i>
                </div>
              </div>
              
              <div class="form-group">
                <label>{{ t('product.your_opinion') }}:</label>
                <textarea v-model="reviewForm.comment" :placeholder="t('product.review_placeholder')" rows="4"></textarea>
              </div>
              
              <button type="submit" class="submit-review-btn" :disabled="isSubmittingReview">
                {{ isSubmittingReview ? t('profile.sending') : t('profile.submit_rating') }}
              </button>
              
              <div v-if="reviewMessage" :class="['review-msg', reviewStatus]">
                {{ reviewMessage }}
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import api, { isCancelledRequest } from '../../config/axios';
import { cartState } from '../../store/cart';
import { authState } from '../../store/auth';
import { useOffers } from '../../composables/useOffers';
import { useLocalized } from '../../composables/useLocalized';
import { useSettings } from '../../composables/useSettings';
import { useSEO } from '../../composables/useSEO';
import { trackViewContent } from '../../utils/metaPixel';
import ProductCard from '../../components/ProductCard.vue';
import { productService } from '../../services/productService';
import { getProductById, products as fallbackProducts } from '../../data/catalogData';

const { getActiveOfferForProduct, calculateDiscountFromOffer, calculatePriceWithOffer, fetchOffers } = useOffers();
const { t, locale } = useI18n();
const { localized, localizedValue } = useLocalized();
const { currency, fetchSettings } = useSettings();

const colorMap = {
  'أحمر': '#ef4444',
  'red': '#ef4444',
  'أزرق': '#3b82f6',
  'blue': '#3b82f6',
  'أخضر': '#10b981',
  'green': '#10b981',
  'أسود': '#111827',
  'black': '#111827',
  'أبيض': '#ffffff',
  'white': '#ffffff',
  'وردي': '#ec4899',
  'pink': '#ec4899',
  'ذهبي': '#f59e0b',
  'gold': '#f59e0b',
  'فضي': '#9ca3af',
  'silver': '#9ca3af',
  'ستانلس ستيل': '#d1d5db',
  'ستانلس': '#d1d5db',
  'stainless': '#d1d5db',
  'رمادي': '#6b7280',
  'gray': '#6b7280',
  'grey': '#6b7280',
  'برتقالي': '#f97316',
  'orange': '#f97316',
  'أصفر': '#eab308',
  'yellow': '#eab308',
  'بني': '#92400e',
  'brown': '#92400e',
  'بيج': '#f5f5dc',
  'beige': '#f5f5dc',
  'نحاسي': '#b87333',
  'copper': '#b87333',
  'بنفسجي': '#8b5cf6',
  'purple': '#8b5cf6'
};

const getPresetColorHex = (label) => {
  if (!label) return '#6b7280';
  if (label.startsWith('#')) return label;
  const l = label.toLowerCase().trim();
  return colorMap[l] || '#6b7280';
};

const getActualColor = (colorName) => {
  if (!colorName) return 'transparent';
  if (colorName.startsWith('#')) return colorName;
  return colorMap[colorName.trim().toLowerCase()] || colorMap[colorName.trim()] || colorName;
};

const isLightColor = (hex) => {
  if (!hex || typeof hex !== 'string') return false;
  if (hex === '#ffffff' || hex.toLowerCase() === 'white' || hex === 'أبيض') return true;
  if (hex.startsWith('#') && hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.75;
  }
  return false;
};

const route = useRoute();
const router = useRouter();

const product = ref(null);
const relatedProducts = ref([]);
const loading = ref(true);
let productController = null;
let productRequestSequence = 0;
const currentImageIndex = ref(0);
const quantity = ref(1);
const selectedAttributes = ref({});
const activeTab = ref('overview');
const attributesList = ref([]);

// Lightbox
const showLightbox = ref(false);
const lightboxIndex = ref(0);

// Share & Review Modals
const showShareModal = ref(false);
const showAddReviewModal = ref(false);
const linkCopied = ref(false);

const shareTo = (platform) => {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(product.value?.name || '');
  
  if (platform === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?text=${title} - ${url}`, '_blank');
  } else if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  } else if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
      showShareModal.value = false;
    }, 2000);
  });
};

const openLightbox = (index) => {
  lightboxIndex.value = index;
  showLightbox.value = true;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  showLightbox.value = false;
  document.body.style.overflow = '';
};

const nextLightbox = () => {
  if (lightboxIndex.value < allImages.value.length - 1) {
    lightboxIndex.value++;
  } else {
    lightboxIndex.value = 0;
  }
};

const prevLightbox = () => {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--;
  } else {
    lightboxIndex.value = allImages.value.length - 1;
  }
};

// Tabs definition matching exact screenshot order and titles
const tabOptions = computed(() => {
  return [
    { id: 'overview', label: locale.value === 'ar' ? 'نظرة عامة' : 'Overview' },
    { id: 'specs', label: locale.value === 'ar' ? 'المواصفات الفنية' : 'Technical Specifications' },
    { id: 'installation', label: locale.value === 'ar' ? 'التركيب' : 'Installation' },
    { id: 'shipping', label: locale.value === 'ar' ? 'الشحن والإرجاع' : 'Shipping & Returns' },
    { id: 'reviews', label: locale.value === 'ar' ? 'التقييمات' : 'Reviews' }
  ];
});

watch(tabOptions, (tabs) => {
  if (!Array.isArray(tabs) || tabs.length === 0) return;
  const exists = tabs.some(t => t.id === activeTab.value);
  if (!exists) activeTab.value = tabs[0].id;
}, { immediate: true });

// Multi-Image Gallery
const allImages = computed(() => {
  const images = [];
  const pId = product.value?.id;
  
  if (product.value?.images && Array.isArray(product.value.images) && product.value.images.length > 0) {
    product.value.images.forEach(img => {
      images.push(getImageUrl(img, pId));
    });
  } else if (product.value?.image) {
    images.push(getImageUrl(product.value.image, pId));
  }

  // Ensure every product has its 3 high-res images
  if (images.length <= 1 && pId) {
    return [
      `/catalog_images/prod_${pId}_0.jpg`,
      `/catalog_images/prod_${pId}_1.jpg`,
      `/catalog_images/prod_${pId}_2.jpg`
    ];
  }
  
  return images.length > 0 ? images : [
    '/catalog_images/prod_173_0.jpg',
    '/catalog_images/prod_173_1.jpg',
    '/catalog_images/prod_173_2.jpg'
  ];
});

const getImageUrl = (path, id) => {
  if (typeof path === 'object' && path !== null) {
    path = path.image_url || path.url || path.image || path.path || '';
  }
  if (!path) {
    const targetId = id || product.value?.id;
    return targetId ? `/catalog_images/prod_${targetId}_0.jpg` : '/placeholder-product.png';
  }
  if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('/'))) return path;
  if (typeof path === 'string' && path.includes('catalog_images')) return `/${path.replace(/^\//, '')}`;
  const baseUrl = api.defaults.baseURL || '';
  return `${baseUrl.replace('/api', '')}/storage/${path}`;
};

const handleImageError = (event, index) => {
  const pId = product.value?.id;
  const targetIndex = (index !== undefined && index !== null) ? index : currentImageIndex.value;
  if (pId) {
    const fallbackPath = `/catalog_images/prod_${pId}_${targetIndex}.jpg`;
    const singlePath = `/catalog_images/prod_${pId}.jpg`;
    if (!event.target.src.endsWith(fallbackPath) && !event.target.src.endsWith(singlePath)) {
      event.target.src = fallbackPath;
      return;
    }
  }
  event.target.src = '/images/home/hero_pristine.png';
};

const formatPrice = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '2,499' : num.toLocaleString('en-US');
};

// Stock Status logic
const isProductInStock = computed(() => {
  if (!product.value) return true;
  if (product.value.stock !== undefined && product.value.stock !== null) {
    return Number(product.value.stock) > 0;
  }
  if (product.value.quantity !== undefined && product.value.quantity !== null) {
    return Number(product.value.quantity) > 0;
  }
  return true;
});

// Rating & Reviews logic
const reviews = ref([]);

const defaultReviews = computed(() => [
  {
    id: 'def-1',
    user_name: 'أحمد محمد',
    date: '15 أغسطس 2024',
    rating: 5,
    comment: locale.value === 'ar' ? 'منتج ممتاز والجودة كانت كما توقعت، التركيب كان سريعاً والأداء فاق التوقعات.' : 'Excellent product, quality was as expected, installation was fast and performance exceeded expectations.'
  },
  {
    id: 'def-2',
    user_name: 'سارة العتيبي',
    date: '9 يوليو 2024',
    rating: 5,
    comment: locale.value === 'ar' ? 'فرن رائع وتصميم أنيق، الطهي متساوٍ والحرارة ممتازة، أنصح به بشدة.' : 'Wonderful oven and elegant design, uniform cooking and great heat, highly recommended.'
  },
  {
    id: 'def-3',
    user_name: 'خالد الشمري',
    date: '22 يونيو 2024',
    rating: 5,
    comment: locale.value === 'ar' ? 'أفضل فرن استخدمته، الجودة الإيطالية واضحة في أدق التفاصيل، يستحق كل ريال.' : 'Best oven I have used, Italian quality is evident in every detail, worth every riyal.'
  }
]);

const displayReviews = computed(() => {
  if (Array.isArray(reviews.value) && reviews.value.length > 0) {
    return reviews.value;
  }
  return defaultReviews.value;
});

const computedRatingCount = computed(() => {
  if (product.value?.reviews_count !== undefined && product.value?.reviews_count !== null) {
    return Number(product.value.reviews_count);
  }
  if (Array.isArray(reviews.value) && reviews.value.length > 0) {
    return reviews.value.length;
  }
  return 23;
});

const computedAverageRating = computed(() => {
  if (product.value?.rating !== undefined && product.value?.rating !== null) {
    return Number(product.value.rating);
  }
  if (Array.isArray(reviews.value) && reviews.value.length > 0) {
    const sum = reviews.value.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return Number((sum / reviews.value.length).toFixed(1));
  }
  return 4.2;
});

const getRatingPercentage = (star) => {
  if (Array.isArray(reviews.value) && reviews.value.length > 0) {
    const count = reviews.value.filter(r => Math.round(Number(r.rating || 5)) === star).length;
    return Math.round((count / reviews.value.length) * 100);
  }
  const map = { 5: 80, 4: 15, 3: 5, 2: 0, 1: 0 };
  return map[star] || 0;
};

const fetchReviews = async (productId) => {
  try {
    const list = await productService.getProductReviews(productId);
    if (Array.isArray(list) && list.length > 0) {
      reviews.value = list;
    }
  } catch (err) {
    console.warn('Reviews API info:', err?.message);
  }
};

// Bullet points matching screenshot
const productFeatures = computed(() => {
  const rawFeat = localized(product.value, 'features') || product.value?.features;
  if (Array.isArray(rawFeat) && rawFeat.length > 0) {
    return rawFeat;
  }
  if (typeof rawFeat === 'string' && rawFeat.trim()) {
    const list = rawFeat.split(/[\n\r]+/).map(s => s.replace(/^[-•*❖]\s*/, '').trim()).filter(Boolean);
    if (list.length > 0) return list;
  }
  return [
    locale.value === 'ar' ? 'سعة 65 لتر طهي مريح لمختلف الوجبات' : '65L capacity for versatile and effortless cooking',
    locale.value === 'ar' ? '4 وظائف طهي مبرمجة هندسياً لأداء متكامل' : '4 engineered preset cooking functions',
    locale.value === 'ar' ? 'إشعال كهربائي ذاتي سهل وآمن بلمسة واحدة' : 'One-touch safe automatic electric ignition',
    locale.value === 'ar' ? 'باب زجاجي مزدوج يحفظ الحرارة بكفاءة عالية' : 'Double-glazed door for superior heat retention',
    locale.value === 'ar' ? 'صمام أمان كامل يضمن سلامة المطبخ والمنزل' : 'Full safety cutoff valve for kitchen protection',
    locale.value === 'ar' ? 'صنع بالكامل في إيطاليا بمعايير جودة دقيقة' : '100% Made in Italy to exacting standards'
  ];
});

// Dynamic Overview Data
const dynamicOverviewTitle = computed(() => {
  return locale.value === 'ar' ? 'تحكم كامل وتوزيع حراري متساوٍ' : 'Complete Control & Uniform Heat Distribution';
});

const dynamicOverviewDesc = computed(() => {
  const desc = localized(product.value, 'description');
  if (desc && desc.trim()) return desc;
  return locale.value === 'ar' 
    ? 'صمم فرن ماسترجاز المدمج بحجم 60 سم ليقدم تجربة طهي احترافية تضاهي المطابخ العالمية. بفضل سعته الكبيرة البالغة 65 لتر، يمكنك طهي وجبات عائلية متكاملة بكل سهولة. يتميز الفرن بتصميم إيطالي فاخر معزز بأنظمة أمان ذكية وصمام أمان كامل يضمن راحة البال التامة لك ولعائلتك.'
    : 'Engineered in 60cm built-in format for professional culinary excellence. With its 65L capacity, prepare family meals effortlessly. Italian luxury styling reinforced with smart safety systems.';
});

const dynamicOverviewFeatures = computed(() => {
  const rawFeat = localized(product.value, 'features') || product.value?.features;
  if (Array.isArray(rawFeat) && rawFeat.length > 0) {
    return rawFeat;
  }
  if (typeof rawFeat === 'string' && rawFeat.trim()) {
    const list = rawFeat.split(/[\n\r]+/).map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
    if (list.length > 0) return list;
  }
  return [
    locale.value === 'ar' ? 'سعة كبيرة تبلغ 65 لتر تناسب العائلات والأطباق الضخمة' : 'Spacious 65L capacity tailored for family gatherings',
    locale.value === 'ar' ? 'تنظيف سهل وسريع بفضل طبقة المينا الداخلية المانعة للالتصاق' : 'Easy-clean enamel interior coating',
    locale.value === 'ar' ? 'توزيع حراري متساوٍ يضمن خبزاً وتحميراً مثالياً من جميع الجهات' : 'Even convection heat distribution for flawless baking',
    locale.value === 'ar' ? 'أمان متقدم مع صمام أمان إيطالي كامل لقطع الغاز الفوري' : 'Advanced full Italian safety cutoff valve'
  ];
});

// Dynamic Technical Specifications driven directly from API
const technicalSpecifications = computed(() => {
  const isAr = locale.value === 'ar';
  const prod = product.value || {};
  const name = (prod.name_i18n?.ar || prod.name || '').toLowerCase();
  const attrs = prod.attributes || prod.raw_attributes || {};

  function cleanSpecValue(val) {
    if (val === undefined || val === null) return '';
    let str = Array.isArray(val) ? val.join(' / ') : String(val).trim();
    if (isAr) {
      str = str.replace(/\s*\([A-Za-z0-9\s/&,.-]+\)/g, '').trim();
    }
    return str;
  }

  // Key normalization dictionary (maps Arabic / English variants to clean display keys)
  const specKeyMap = {
    'الارتفاع': { ar: 'الارتفاع', en: 'Height' },
    'height': { ar: 'الارتفاع', en: 'Height' },
    'العرض': { ar: 'العرض', en: 'Width' },
    'width': { ar: 'العرض', en: 'Width' },
    'السعة': { ar: 'السعة', en: 'Capacity' },
    'capacity': { ar: 'السعة', en: 'Capacity' },
    'العمق': { ar: 'العمق', en: 'Depth' },
    'depth': { ar: 'العمق', en: 'Depth' },
    'الجهد الكهربائي': { ar: 'الجهد الكهربائي', en: 'Voltage' },
    'voltage': { ar: 'الجهد الكهربائي', en: 'Voltage' },
    'نوع الطاقة': { ar: 'نوع الطاقة', en: 'Energy Source' },
    'energy': { ar: 'نوع الطاقة', en: 'Energy Source' },
    'energy_source': { ar: 'نوع الطاقة', en: 'Energy Source' },
    'power': { ar: 'نوع الطاقة', en: 'Energy Source' },
    'المؤقت الرقمي': { ar: 'المؤقت الرقمي', en: 'Digital Timer' },
    'timer': { ar: 'المؤقت الرقمي', en: 'Digital Timer' },
    'وظائف الطهي': { ar: 'وظائف الطهي', en: 'Cooking Functions' },
    'functions': { ar: 'وظائف الطهي', en: 'Cooking Functions' },
    'نظام الإشعال': { ar: 'نظام الإشعال', en: 'Ignition System' },
    'ignition': { ar: 'نظام الإشعال', en: 'Ignition System' },
    'صمام الأمان': { ar: 'صمام الأمان', en: 'Safety Valve' },
    'safety': { ar: 'صمام الأمان', en: 'Safety Valve' },
    'بلد المنشأ': { ar: 'بلد المنشأ', en: 'Country of Origin' },
    'origin': { ar: 'بلد المنشأ', en: 'Country of Origin' },
    'اللون والمظهر': { ar: 'اللون والمظهر', en: 'Color & Finish' },
    'color_finish': { ar: 'اللون والمظهر', en: 'Color & Finish' },
    'نوع الحوامل': { ar: 'نوع الحوامل', en: 'Pan Supports' },
    'pan_supports': { ar: 'نوع الحوامل', en: 'Pan Supports' },
    'pan_support': { ar: 'نوع الحوامل', en: 'Pan Supports' },
    'مستويات السرعة': { ar: 'مستويات السرعة', en: 'Speed Levels' },
    'speed': { ar: 'مستويات السرعة', en: 'Speed Levels' },
    'نوع الفلتر': { ar: 'نوع الفلتر', en: 'Filter Type' },
    'filter': { ar: 'نوع الفلتر', en: 'Filter Type' },
    'مستوى الضوضاء': { ar: 'مستوى الضوضاء', en: 'Noise Level' },
    'noise': { ar: 'مستوى الضوضاء', en: 'Noise Level' },
    'ضغط المياه المناسب': { ar: 'ضغط المياه المناسب', en: 'Operating Water Pressure' },
    'pressure': { ar: 'ضغط المياه المناسب', en: 'Operating Water Pressure' },
    'عدد الشعلات': { ar: 'عدد الشعلات', en: 'Burners Count' },
    'burners': { ar: 'عدد الشعلات', en: 'Burners Count' },
    'الوزن الصافي': { ar: 'الوزن الصافي', en: 'Net Weight' },
    'weight': { ar: 'الوزن الصافي', en: 'Net Weight' }
  };

  // Helper to extract dynamic attribute value from API attributes
  function getAttrValue(keyAliases) {
    if (!attrs || typeof attrs !== 'object') return null;
    for (const k of keyAliases) {
      if (attrs[k] !== undefined && attrs[k] !== null) {
        const val = cleanSpecValue(attrs[k]);
        if (val && val !== 'null') return val;
      }
      const lower = k.toLowerCase();
      if (attrs[lower] !== undefined && attrs[lower] !== null) {
        const val = cleanSpecValue(attrs[lower]);
        if (val && val !== 'null') return val;
      }
    }
    return null;
  }

  // Parse dimensions string if present ("59.5 × 59.5 × 55 سم")
  let dimH = null, dimW = null, dimD = null;
  const rawDims = attrs.dimensions || attrs['الأبعاد'] || attrs.Dimensions;
  if (rawDims) {
    const dimStr = cleanSpecValue(rawDims);
    const parts = dimStr.split(/[×xX*]/).map(s => s.trim().replace('سم', '').trim()).filter(Boolean);
    if (parts.length >= 3) {
      dimH = `${parts[0]} سم`;
      dimW = `${parts[1]} سم`;
      dimD = `${parts[2]} سم`;
    }
  }

  let specsList = [];

  if (name.includes('موقد') || name.includes('مسطح') || name.includes('hob') || name.includes('cooktop')) {
    const is90 = name.includes('90') || name.includes('5');
    specsList = [
      { label: isAr ? 'الارتفاع' : 'Height', value: getAttrValue(['الارتفاع', 'height']) || dimH || '5 سم' },
      { label: isAr ? 'العرض' : 'Width', value: getAttrValue(['العرض', 'width']) || dimW || (is90 ? '86 سم' : '59.5 سم') },
      { label: isAr ? 'السعة' : 'Capacity', value: getAttrValue(['السعة', 'capacity']) || (is90 ? (isAr ? '5 شعلات غاز' : '5 Gas Burners') : (isAr ? '4 شعلات غاز' : '4 Gas Burners')) },
      { label: isAr ? 'العمق' : 'Depth', value: getAttrValue(['العمق', 'depth']) || dimD || '51 سم' },
      { label: isAr ? 'الجهد الكهربائي' : 'Voltage', value: getAttrValue(['الجهد الكهربائي', 'voltage']) || '220-240 فولت' },
      { label: isAr ? 'نوع الطاقة' : 'Energy Source', value: getAttrValue(['نوع الطاقة', 'power', 'energy']) || (isAr ? 'غاز طبيعي / مسال' : 'Natural / LPG Gas') },
      { label: isAr ? 'المؤقت الرقمي' : 'Digital Timer', value: getAttrValue(['المؤقت الرقمي', 'timer']) || (isAr ? 'نعم' : 'Yes') },
      { label: isAr ? 'نوع الحوامل' : 'Pan Supports', value: getAttrValue(['نوع الحوامل', 'pan_supports', 'pan_support']) || (isAr ? 'حديد زهر ثقيل' : 'Heavy-Duty Cast Iron') },
      { label: isAr ? 'نظام الإشعال' : 'Ignition System', value: getAttrValue(['نظام الإشعال', 'ignition']) || (isAr ? 'إلكتروني مدمج بالمفتاح' : 'Integrated Auto-Ignition') },
      { label: isAr ? 'صمام الأمان' : 'Safety Valve', value: getAttrValue(['صمام الأمان', 'safety']) || (isAr ? 'أمان كامل فوري' : 'Full Flame Safety') },
      { label: isAr ? 'بلد المنشأ' : 'Country of Origin', value: getAttrValue(['بلد المنشأ', 'origin']) || (isAr ? 'إيطاليا' : 'Italy') },
      { label: isAr ? 'اللون والمظهر' : 'Color & Finish', value: selectedColorName.value || getAttrValue(['اللون والمظهر', 'material', 'المادة']) || (name.includes('زجاج') ? (isAr ? 'زجاج حراري مقسّى' : 'Tempered Glass') : (isAr ? 'ستانلس ستيل' : 'Stainless Steel')) }
    ];
  } else if (name.includes('شفاط') || name.includes('hood')) {
    specsList = [
      { label: isAr ? 'الارتفاع' : 'Height', value: getAttrValue(['الارتفاع', 'height']) || dimH || '70-105 سم' },
      { label: isAr ? 'العرض' : 'Width', value: getAttrValue(['العرض', 'width']) || dimW || '90 سم' },
      { label: isAr ? 'السعة' : 'Capacity', value: getAttrValue(['السعة', 'capacity']) || (isAr ? 'قوة شفط 1200 م³/ساعة' : '1200 m³/h Suction') },
      { label: isAr ? 'العمق' : 'Depth', value: getAttrValue(['العمق', 'depth']) || dimD || '50 سم' },
      { label: isAr ? 'الجهد الكهربائي' : 'Voltage', value: getAttrValue(['الجهد الكهربائي', 'voltage']) || '220-240 فولت' },
      { label: isAr ? 'نوع الطاقة' : 'Energy Source', value: getAttrValue(['نوع الطاقة', 'power', 'energy']) || (isAr ? 'كهرباء 230 واط' : 'Electric 230W') },
      { label: isAr ? 'المؤقت الرقمي' : 'Digital Timer', value: getAttrValue(['المؤقت الرقمي', 'timer']) || (isAr ? 'نعم' : 'Yes') },
      { label: isAr ? 'مستويات السرعة' : 'Speed Levels', value: getAttrValue(['مستويات السرعة', 'speed']) || (isAr ? '3 سرعات توربو' : '3 Turbo Speeds') },
      { label: isAr ? 'نوع الفلتر' : 'Filter Type', value: getAttrValue(['نوع الفلتر', 'filter']) || (isAr ? 'فلاتر ألومنيوم متعددة الطبقات' : 'Multi-layer Aluminum') },
      { label: isAr ? 'مستوى الضوضاء' : 'Noise Level', value: getAttrValue(['مستوى الضوضاء', 'noise']) || (isAr ? 'منخفض (56 ديسيبل)' : 'Ultra Quiet (56 dB)') },
      { label: isAr ? 'بلد المنشأ' : 'Country of Origin', value: getAttrValue(['بلد المنشأ', 'origin']) || (isAr ? 'إيطاليا' : 'Italy') },
      { label: isAr ? 'اللون والمظهر' : 'Color & Finish', value: selectedColorName.value || getAttrValue(['اللون والمظهر', 'material', 'المادة']) || (isAr ? 'ستانلس ستيل 304' : 'Stainless Steel 304') }
    ];
  } else if (name.includes('سخان') || name.includes('heater') || name.includes('water')) {
    const is10 = name.includes('10');
    specsList = [
      { label: isAr ? 'الارتفاع' : 'Height', value: getAttrValue(['الارتفاع', 'height']) || dimH || '55 سم' },
      { label: isAr ? 'العرض' : 'Width', value: getAttrValue(['العرض', 'width']) || dimW || '35 سم' },
      { label: isAr ? 'السعة' : 'Capacity', value: getAttrValue(['السعة', 'capacity']) || (is10 ? (isAr ? '10 لتر / دقيقة' : '10 L/min') : (isAr ? '6 لتر / دقيقة' : '6 L/min')) },
      { label: isAr ? 'العمق' : 'Depth', value: getAttrValue(['العمق', 'depth']) || dimD || '18 سم' },
      { label: isAr ? 'الجهد الكهربائي' : 'Voltage', value: getAttrValue(['الجهد الكهربائي', 'voltage']) || (isAr ? 'شاشة إلكترونية تعمل بالبطاريات' : 'Battery-Powered') },
      { label: isAr ? 'نوع الطاقة' : 'Energy Source', value: getAttrValue(['نوع الطاقة', 'power', 'energy']) || (isAr ? 'غاز طبيعي / أسطوانات مسال' : 'Natural / LPG Gas') },
      { label: isAr ? 'المؤقت الرقمي' : 'Digital Timer', value: getAttrValue(['المؤقت الرقمي', 'timer']) || (isAr ? 'شاشة رقمية LED' : 'Digital LED Display') },
      { label: isAr ? 'ضغط المياه المناسب' : 'Operating Water Pressure', value: getAttrValue(['ضغط المياه المناسب', 'pressure']) || (isAr ? 'يعمل مع ضغط المياه المنخفض' : 'Low Water Pressure') },
      { label: isAr ? 'نظام الإشعال' : 'Ignition System', value: getAttrValue(['نظام الإشعال', 'ignition']) || (isAr ? 'إلكتروني أوتوماتيكي فوري' : 'Instant Auto-Ignition') },
      { label: isAr ? 'صمام الأمان' : 'Safety Valve', value: getAttrValue(['صمام الأمان', 'safety']) || (isAr ? 'حماية ثلاثية من انقطاع الغاز والحرارة' : 'Triple Safety') },
      { label: isAr ? 'بلد المنشأ' : 'Country of Origin', value: getAttrValue(['بلد المنشأ', 'origin']) || (isAr ? 'إيطاليا' : 'Italy') },
      { label: isAr ? 'اللون والمظهر' : 'Color & Finish', value: selectedColorName.value || getAttrValue(['اللون والمظهر', 'material', 'المادة']) || (isAr ? 'أبيض ناصع مقاوم للصدأ' : 'Pure White') }
    ];
  } else {
    // Standard Built-in Oven (matching reference screenshot)
    const is90 = name.includes('90');
    specsList = [
      { label: isAr ? 'الارتفاع' : 'Height', value: getAttrValue(['الارتفاع', 'height']) || dimH || '59.5 سم' },
      { label: isAr ? 'العرض' : 'Width', value: getAttrValue(['العرض', 'width']) || dimW || (is90 ? '89.5 سم' : '59.5 سم') },
      { label: isAr ? 'السعة' : 'Capacity', value: getAttrValue(['السعة', 'capacity']) || (is90 ? '85 لتر' : '65 لتر') },
      { label: isAr ? 'العمق' : 'Depth', value: getAttrValue(['العمق', 'depth']) || dimD || (is90 ? '56 سم' : '55 سم') },
      { label: isAr ? 'الجهد الكهربائي' : 'Voltage', value: getAttrValue(['الجهد الكهربائي', 'voltage']) || '220-240 فولت' },
      { label: isAr ? 'نوع الطاقة' : 'Energy Source', value: getAttrValue(['نوع الطاقة', 'power', 'energy']) || (isAr ? 'غاز طبيعي / مسال' : 'Natural / LPG Gas') },
      { label: isAr ? 'المؤقت الرقمي' : 'Digital Timer', value: getAttrValue(['المؤقت الرقمي', 'timer']) || (isAr ? 'نعم' : 'Yes') },
      { label: isAr ? 'وظائف الطهي' : 'Cooking Functions', value: getAttrValue(['وظائف الطهي', 'functions']) || (is90 ? (isAr ? '6 وظائف' : '6 Functions') : (isAr ? '4 وظائف' : '4 Functions')) },
      { label: isAr ? 'نظام الإشعال' : 'Ignition System', value: getAttrValue(['نظام الإشعال', 'ignition']) || (isAr ? 'إلكتروني ذاتي' : 'Electronic Auto-Ignition') },
      { label: isAr ? 'صمام الأمان' : 'Safety Valve', value: getAttrValue(['صمام الأمان', 'safety']) || (isAr ? 'أمان كامل' : 'Full Flame Safety') },
      { label: isAr ? 'بلد المنشأ' : 'Country of Origin', value: getAttrValue(['بلد المنشأ', 'origin']) || (isAr ? 'إيطاليا' : 'Italy') },
      { label: isAr ? 'اللون والمظهر' : 'Color & Finish', value: selectedColorName.value || getAttrValue(['اللون والمظهر', 'material', 'المادة']) || (isAr ? 'ستانلس ستيل' : 'Stainless Steel') }
    ];
  }

  // Also dynamically append any additional custom specifications from API
  const handledKeys = [
    'color', 'اللون', 'size', 'المقاس', 'الحجم', 
    'images', 'image', 'dimensions', 'الأبعاد', 
    'brand', 'العلامة التجارية', 'warranty', 'الضمان',
    'material', 'المادة', 'خامة الصنع',
    'الارتفاع', 'height', 'العرض', 'width', 'السعة', 'capacity', 'العمق', 'depth',
    'الجهد الكهربائي', 'voltage', 'نوع الطاقة', 'power', 'energy', 'energy_source',
    'المؤقت الرقمي', 'timer', 'وظائف الطهي', 'functions',
    'نظام الإشعال', 'ignition', 'صمام الأمان', 'safety',
    'بلد المنشأ', 'origin', 'اللون والمظهر', 'color_finish',
    'نوع الحوامل', 'pan_supports', 'مستويات السرعة', 'speed',
    'نوع الفلتر', 'filter', 'مستوى الضوضاء', 'noise',
    'ضغط المياه المناسب', 'pressure'
  ];

  if (attrs && typeof attrs === 'object') {
    Object.keys(attrs).forEach(k => {
      const lower = k.toLowerCase().trim();
      if (handledKeys.includes(lower) || handledKeys.includes(k.trim())) return;
      const v = attrs[k];
      const strVal = cleanSpecValue(v);
      if (strVal && strVal !== 'null') {
        const specConf = specKeyMap[lower] || specKeyMap[k.trim()];
        const label = specConf ? (isAr ? specConf.ar : specConf.en) : (isAr ? (/^[a-zA-Z]/.test(k) ? '' : k) : k);
        if (label && !specsList.some(s => s.label === label)) {
          specsList.push({ label, value: strVal });
        }
      }
    });
  }

  return specsList;
});

const specRows = computed(() => {
  const rows = [];
  const list = technicalSpecifications.value;
  for (let i = 0; i < list.length; i += 2) {
    rows.push({
      col1: list[i],
      col2: list[i + 1] || null
    });
  }
  return rows;
});

// Dynamic Installation Tips
const dynamicInstallationTips = computed(() => {
  return localized(product.value, 'tips') || product.value?.tips || '';
});

// Dynamic Shipping & Warranty Info
const dynamicShippingInfo = computed(() => {
  return localized(product.value, 'shipping_info') || product.value?.shipping_info || '';
});

// Normalized Attributes & Color Options
const normalizedAttributes = computed(() => {
  if (!product.value) return [];
  const result = [];
  const handledTypes = new Set();
  
  // 1. Colors
  let colors = [];
  if (Array.isArray(product.value.color_options) && product.value.color_options.length > 0) {
    colors = product.value.color_options.map(c => {
      if (typeof c === 'object' && c !== null) {
        return { label: c.name || c.label || '', hex: c.hex || c.color || getPresetColorHex(c.name || '') };
      }
      const str = String(c);
      if (str.includes('|')) {
        const [lbl, hx] = str.split('|');
        return { label: lbl.trim(), hex: hx.trim() };
      }
      return { label: str.trim(), hex: getPresetColorHex(str.trim()) };
    });
  } else {
    const rawAttrs = product.value.attributes;
    if (rawAttrs && typeof rawAttrs === 'object') {
      const colorVal = rawAttrs.color || rawAttrs['اللون'] || rawAttrs.Color || rawAttrs['الالوان'];
      if (Array.isArray(colorVal) && colorVal.length > 0) {
        colors = colorVal.map(c => {
          if (typeof c === 'object' && c !== null) {
            return { label: c.name || c.label || '', hex: c.hex || c.color || getPresetColorHex(c.name || '') };
          }
          const str = String(c);
          if (str.includes('|')) {
            const [lbl, hx] = str.split('|');
            return { label: lbl.trim(), hex: hx.trim() };
          }
          return { label: str.trim(), hex: getPresetColorHex(str.trim()) };
        });
      }
    }
  }
  
  if (colors.length > 0) {
    result.push({
      key: 'color',
      label: locale.value === 'ar' ? 'اللون' : 'Color',
      isColor: true,
      options: colors
    });
  }
  return result;
});

const colorOptions = computed(() => {
  const colorAttr = normalizedAttributes.value.find(a => a.isColor);
  if (colorAttr && colorAttr.options.length > 0) {
    return colorAttr.options.map(o => ({
      name: o.label,
      hex: o.hex || getActualColor(o.label)
    }));
  }
  return [
    { name: locale.value === 'ar' ? 'ستانلس ستيل' : 'Stainless Steel', hex: '#d1d5db' },
    { name: locale.value === 'ar' ? 'أسود' : 'Black', hex: '#111827' }
  ];
});

const selectedColorName = computed(() => {
  const selected = selectedAttributes.value['color'] || selectedAttributes.value['اللون'];
  if (selected) return selected;
  return colorOptions.value[0]?.name || (locale.value === 'ar' ? 'ستانلس ستيل' : 'Stainless Steel');
});

const selectColor = (name) => {
  selectedAttributes.value['color'] = name;
  selectedAttributes.value['اللون'] = name;
};

// Calculate active offer for this product
const activeOffer = computed(() => {
  if (product.value) {
    return getActiveOfferForProduct(product.value);
  }
  return null;
});

const currentPrice = computed(() => {
  if (activeOffer.value) {
    return calculatePriceWithOffer(product.value, activeOffer.value);
  }
  const price = Number(product.value?.price) || 2499;
  const salePrice = Number(product.value?.sale_price) || 0;
  if (salePrice > 0 && salePrice < price) return salePrice;
  const discount = Number(product.value?.discount) || 0;
  return price * (1 - discount / 100);
});

const handleAddToCart = () => {
  const payload = {
    ...product.value,
    price: currentPrice.value
  };
  cartState.addToCart(payload, quantity.value, selectedAttributes.value);
};

const goToProduct = (p) => {
  router.push(`/product/${p.id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Fetch product data
const fetchProduct = async (id) => {
  productController?.abort();
  productController = new AbortController();
  const controller = productController;
  const sequence = ++productRequestSequence;
  loading.value = true;
  currentImageIndex.value = 0;
  try {
    const pData = await productService.getProductById(id, { signal: controller.signal });
    if (controller.signal.aborted || sequence !== productRequestSequence) return;
    if (pData && typeof pData === 'object' && !Array.isArray(pData) && pData.id) {
      product.value = pData;
      selectColor(colorOptions.value[0]?.name);

      useSEO({
        title: localized(product.value, 'name'),
        description: localized(product.value, 'description') || `اشتري ${localized(product.value, 'name')} الإيطالي الفاخر من ماسترجاز.`,
        keywords: `${localized(product.value, 'name')}, ماسترجاز, أجهزة غاز إيطالية, Mastergas`,
        image: getImageUrl(product.value.image, product.value.id)
      });

      trackViewContent(product.value, currency.value);
      fetchRelated(product.value.category_id);
    } else {
      product.value = getProductById(id);
      fetchRelated(product.value.category_id);
    }
  } catch (err) {
    if (isCancelledRequest(err) || controller.signal.aborted || sequence !== productRequestSequence) return;
    console.error('Failed to fetch product:', err);
    product.value = getProductById(id);
    fetchRelated(product.value.category_id);
  } finally {
    if (sequence === productRequestSequence) loading.value = false;
  }
};

const fetchRelated = async (categoryId) => {
  try {
    const catId = categoryId || product.value?.category_id || product.value?.category?.id;
    if (catId) {
      const res = await productService.getProducts({ category_id: catId, per_page: 8 });
      const list = res.data?.data || res.data || [];
      const filtered = Array.isArray(list) ? list.filter(p => p.id !== product.value?.id).slice(0, 4) : [];
      relatedProducts.value = filtered.length > 0 ? filtered : fallbackProducts.filter(p => p.id !== product.value?.id).slice(0, 4);
    } else {
      relatedProducts.value = fallbackProducts.filter(p => p.id !== product.value?.id).slice(0, 4);
    }
  } catch {
    relatedProducts.value = fallbackProducts.filter(p => p.id !== product.value?.id).slice(0, 4);
  }
};

watch(() => route.params.id, (newId) => {
  if (newId) fetchProduct(newId);
});

// Reviews submit logic
const reviewForm = ref({ rating: 5, comment: '' });
const isSubmittingReview = ref(false);
const reviewMessage = ref('');
const reviewStatus = ref('');
const user = computed(() => authState.user || (authState.token ? { logged_in: true } : null));

const submitReview = async () => {
  isSubmittingReview.value = true;
  reviewMessage.value = '';
  try {
    await api.post('/frontend/reviews', {
      product_id: route.params.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment
    });
    reviewStatus.value = 'success';
    reviewMessage.value = locale.value === 'ar' ? 'شكراً لك! تم إرسال تقييمك بنجاح.' : 'Thank you! Your review has been submitted.';
    if (route.params.id) {
      fetchReviews(route.params.id);
    }
    setTimeout(() => {
      showAddReviewModal.value = false;
    }, 1500);
  } catch (err) {
    reviewStatus.value = 'error';
    reviewMessage.value = locale.value === 'ar' ? 'حدث خطأ أثناء إرسال التقييم.' : 'Error submitting review.';
  } finally {
    isSubmittingReview.value = false;
  }
};

const openLoginModal = () => {
  router.push('/login');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(() => {
  fetchOffers();
  fetchSettings();
  if (route.params.id) {
    fetchProduct(route.params.id);
  } else {
    product.value = null;
    relatedProducts.value = [];
    loading.value = false;
  }
});

onUnmounted(() => {
  productController?.abort();
});
</script>

<style scoped>
.product-detail-page {
  background: #ffffff;
  min-height: 100vh;
  padding-top: 36px;
  padding-bottom: 80px;
  font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #111827;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: #6b7280;
  margin: 10px 0 34px 0;
}

.breadcrumbs a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumbs a:hover {
  color: #111827;
}

.breadcrumbs .separator {
  color: #9ca3af;
  font-size: 13px;
}

.breadcrumbs .current {
  color: #111827;
  font-weight: 600;
}

.detail-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #f3f4f6;
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Product Main Layout: 2 Columns */
.product-main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 68px;
  align-items: start;
  margin-bottom: 56px;
}

/* Gallery Section (Right in RTL) */
.images-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.main-image-wrapper {
  width: 100%;
  height: 440px;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.main-display-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-display-image:hover {
  transform: scale(1.02);
}

.thumbnails-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
}

.thumb-item {
  height: 82px;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.thumb-item.active {
  border-color: #000000;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Info Section (Left in RTL) */
.info-section {
  display: flex;
  flex-direction: column;
}

.product-top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-origin {
  font-size: 13.5px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-pipe {
  color: #d1d5db;
  font-weight: 400;
}

.share-btn {
  background: none;
  border: none;
  font-size: 13.5px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
  padding: 0;
}

.share-btn:hover {
  color: #111827;
}

.product-title {
  font-size: 30px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 14px 0;
  line-height: 1.28;
}

.rating-model-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  color: #6b7280;
  margin-bottom: 22px;
}

.stars-score {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars-gold {
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13.5px;
}

.stars-gold .half-star-flipped {
  display: inline-block;
}

[dir="rtl"] .stars-gold .half-star-flipped,
.product-detail-page[dir="rtl"] .half-star-flipped {
  transform: scaleX(-1);
}

.score-num {
  font-weight: 700;
  color: #111827;
}

.count-num {
  color: #6b7280;
}

.model-num {
  color: #6b7280;
  font-size: 13px;
}

/* Price Box */
.price-box {
  margin-bottom: 12px;
}

.price-value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.main-price {
  font-size: 32px;
  font-weight: 900;
  color: #111827;
  line-height: 1;
}

.currency-symbol {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.vat-notice {
  font-size: 12.5px;
  color: #6b7280;
  margin-top: 4px;
  display: block;
}

/* Stock Status */
.stock-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 22px;
}

.stock-status.in-stock {
  color: #10b981;
}

.stock-status.out-of-stock {
  color: #ef4444;
}

.stock-dot {
  font-size: 18px;
  line-height: 1;
}

/* Key Features */
.key-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.key-features-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: #374151;
}

.feat-icon {
  font-size: 12px;
  color: #64748b;
  line-height: 1;
}

/* Color Selection */
.color-selection-section {
  margin-bottom: 24px;
}

.color-label {
  font-size: 13.5px;
  margin-bottom: 10px;
}

.label-title {
  font-weight: 700;
  color: #111827;
  margin-left: 6px;
}

.selected-color-name {
  color: #374151;
  font-weight: 500;
}

.color-swatches-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-swatch-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.color-swatch-circle.active {
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #000000;
  border-color: transparent;
}

/* Action Row (Quantity + Add to Cart) */
.action-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
}

.qty-selector {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  height: 48px;
  width: 120px;
  justify-content: space-between;
  padding: 0 10px;
  background: #ffffff;
}

.qty-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #4b5563;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-number {
  font-weight: 700;
  font-size: 15px;
  color: #111827;
}

.add-to-cart-button {
  flex: 1;
  height: 48px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-to-cart-button:hover:not(:disabled) {
  background: #1f2937;
}

.add-to-cart-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Tabs Section */
.tabs-section {
  margin-top: 50px;
  margin-bottom: 60px;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  gap: 36px;
  margin-bottom: 36px;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 15.5px;
  font-weight: 600;
  color: #6b7280;
  padding: 12px 4px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: #111827;
}

.tab-btn.active {
  color: #000000;
  font-weight: 800;
  border-bottom: 2.5px solid #000000;
  margin-bottom: -1px;
}

/* Tab 1: Overview */
.overview-pane .pane-main-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 14px 0;
}

.overview-pane .pane-main-desc {
  font-size: 14.5px;
  line-height: 1.8;
  color: #4b5563;
  margin: 0 0 28px 0;
  max-width: 960px;
}

.overview-features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 30px;
}

.ov-feat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
}

.ov-feat-item i {
  color: #64748b;
  font-size: 14px;
}

/* Tab 2: Specs */
.specs-pane {
  background: rgba(255, 255, 255, 1) !important;
}

.specs-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 28px 36px 24px 36px;
  background: rgba(255, 255, 255, 1) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.specs-card-title {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  text-align: right;
  background: transparent !important;
}

.specs-grid-rows {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 1) !important;
}

.spec-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 80px;
  padding: 16px 0;
  border-bottom: 1px solid #edf2f7;
  background: rgba(255, 255, 255, 1) !important;
}

.spec-row:last-child {
  border-bottom: none;
  padding-bottom: 4px;
}

.spec-col {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: rgba(255, 255, 255, 1) !important;
}

.spec-label {
  font-size: 14.5px;
  color: #475569;
  font-weight: 500;
  background: transparent !important;
}

.spec-val {
  font-size: 14.5px;
  font-weight: 600;
  color: #0f172a;
  background: transparent !important;
}

/* Tab 3 & 4: Guide Sections (Installation, Shipping) */
.pane-heading {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 28px 0;
}

.guide-dynamic-banner {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-right: 4px solid #111827;
  border-radius: 10px;
  padding: 18px 22px;
  margin-bottom: 30px;
}

[dir="ltr"] .guide-dynamic-banner {
  border-right: 1px solid #e2e8f0;
  border-left: 4px solid #111827;
}

.dynamic-banner-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  margin-bottom: 8px;
}

.dynamic-banner-header i {
  color: #000000;
  font-size: 16px;
}

.dynamic-banner-header h4 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.dynamic-banner-body {
  font-size: 14px;
  line-height: 1.7;
  color: #4b5563;
}

.guide-section {
  margin-bottom: 30px;
}

.guide-sec-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.guide-sec-header i {
  font-size: 16px;
  color: #374151;
}

.guide-sec-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.guide-checklist, .guide-steps-list, .guide-notes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-checklist li, .guide-steps-list li, .guide-notes-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #4b5563;
}

.check-icon {
  color: #10b981;
  font-weight: 700;
}

.warn-icon {
  color: #f59e0b;
}

.step-num-txt {
  font-weight: 700;
  color: #6b7280;
  width: 16px;
}

/* Tab 5: Reviews */
.reviews-score-summary {
  display: flex;
  align-items: center;
  gap: 50px;
  margin-bottom: 36px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f3f4f6;
}

.score-left-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.big-score {
  font-size: 38px;
  font-weight: 900;
  color: #111827;
  line-height: 1;
}

.total-reviews-count {
  font-size: 13.5px;
  color: #6b7280;
}

.bars-right-col {
  flex: 1;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}

.bar-label {
  width: 60px;
}

.bar-track {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #f59e0b;
  border-radius: 4px;
}

.bar-pct {
  font-size: 12.5px;
  width: 32px;
  text-align: left;
}

.reviews-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.review-card-item {
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 18px 22px;
  background: #fafafa;
}

.rc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rc-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14.5px;
  color: #111827;
}

.rc-date {
  font-size: 12.5px;
  color: #9ca3af;
}

.rc-stars {
  color: #f59e0b;
  font-size: 12px;
  margin-bottom: 8px;
  display: flex;
  gap: 2px;
}

.rc-comment {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
}

.add-review-action {
  display: flex;
  justify-content: flex-start;
}

.add-review-btn {
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-review-btn:hover {
  background: #1f2937;
}

/* Related Products Section */
.related-section {
  margin-top: 60px;
  margin-bottom: 60px;
}

.related-header {
  text-align: center;
  margin-bottom: 36px;
}

.related-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 6px 0;
}

.related-subtitle {
  font-size: 14.5px;
  color: #6b7280;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* Lightbox Modal */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.lightbox-close {
  position: absolute;
  top: 24px;
  right: 24px;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
}

.lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  max-width: 90vw;
  max-height: 75vh;
}

.lightbox-main-img {
  max-width: 80vw;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-nav {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
}

.lightbox-thumbnails {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.lightbox-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
}

.lightbox-thumb.active {
  border-color: #ffffff;
}

.lightbox-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Share & Review Modals */
.share-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.share-modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.review-modal-card {
  width: 460px;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.share-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
}

.share-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.share-option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
}

.share-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ffffff;
}

.share-icon.whatsapp { background: #25d366; }
.share-icon.facebook { background: #1877f2; }
.share-icon.twitter { background: #000000; }
.share-icon.copy { background: #6b7280; }

.copy-feedback {
  text-align: center;
  margin-top: 14px;
  color: #10b981;
  font-weight: 600;
  font-size: 13px;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.star-rating-input {
  display: flex;
  gap: 6px;
  font-size: 20px;
  color: #d1d5db;
  cursor: pointer;
  margin-top: 6px;
}

.star-rating-input .active {
  color: #f59e0b;
}

.review-form textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  font-family: inherit;
  resize: vertical;
}

.submit-review-btn {
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  cursor: pointer;
}

.review-msg.success {
  color: #10b981;
  font-size: 13px;
  font-weight: 600;
}

.review-msg.error {
  color: #ef4444;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 992px) {
  .product-main-layout {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .specs-grid-rows .spec-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  .overview-features-grid {
    grid-template-columns: 1fr;
  }
  .tabs-header {
    overflow-x: auto;
    gap: 20px;
  }
  .reviews-score-summary {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
