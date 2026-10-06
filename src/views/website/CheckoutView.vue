<template>
  <div class="checkout-page">
    <div class="container container-checkout">
      <!-- Checkout Progress Bar -->
      <div class="checkout-progress-wrapper" v-if="currentStep < 5">
        <div class="checkout-progress">
          <div 
            v-for="step in progressSteps" 
            :key="step.id" 
            class="step-item"
            :class="{ 
              active: currentStep === step.id, 
              completed: currentStep > step.id 
            }"
          >
            <div class="step-circle">
              <i v-if="currentStep > step.id" class="fas fa-check"></i>
              <span v-else>{{ step.id }}</span>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
          <div class="progress-line"></div>
        </div>
      </div>

      <div class="checkout-layout" :class="{ 'confirmation-layout': currentStep === 5 }">
        <!-- Main Content (Steps) -->
        <div class="main-checkout-content">
          
          <!-- Step 2: Shipping Address -->
          <!-- Step 2: Shipping Address (Figma 1:1 Design) -->
          <div v-if="currentStep === 2" class="step-address-step fadeIn">
            <div class="registered-addresses">
              <!-- address-tabs -->
              <div class="address-tabs-bar">
                <!-- Right side tabs (مستلم آخر and عنواني) -->
                <div class="tabs-actions-group">
                  <!-- مستلم آخر -->
                  <button 
                    type="button"
                    class="btn-tab-other" 
                    :class="addressTab === 'other' ? 'btn-primary-tab' : 'btn-secondary-tab'"
                    @click="switchToOtherRecipient"
                  >
                    <span>مستلم آخر</span>
                  </button>

                  <!-- عنواني -->
                  <button 
                    type="button" 
                    class="btn-tab-my-addr" 
                    :class="addressTab === 'saved' ? 'btn-primary-tab' : 'btn-secondary-tab'"
                    @click="switchToSavedAddresses"
                  >
                    <span>عنواني</span>
                  </button>
                </div>

                <!-- Left side (إضافة عنوان جديد) -->
                <div class="add-new-address-wrapper">
                  <button 
                    type="button" 
                    class="btn-tab-add-new"
                    :class="addressTab === 'new' ? 'btn-primary-tab' : 'btn-secondary-tab'"
                    @click="switchToNewAddress"
                  >
                    <span>إضافة عنوان جديد</span>
                  </button>
                </div>
              </div>

              <!-- State 1: عنواني (Saved Addresses) -->
              <div v-if="addressTab === 'saved'" class="saved-addresses-view">
                <div class="registered-addresses-title">العناوين المسجلة</div>

                <div class="addresses-grid">
                  <div 
                    v-for="addr in displayAddresses" 
                    :key="addr.id" 
                    class="address-card"
                    :class="{ selected: selectedAddressId === addr.id }"
                    @click="selectAddress(addr)"
                  >
                    <div class="card-header">
                      <span class="addr-person-name">{{ addr.recipient_name || addr.full_name || addr.name }}</span>
                      <div class="selection-indicator" :class="{ active: selectedAddressId === addr.id }">
                        <div v-if="selectedAddressId === addr.id" class="indicator-inner"></div>
                      </div>
                    </div>

                    <div class="address-details">
                      <div class="detail-line" v-if="addr.phone">
                        <span>رقم الهاتف: {{ addr.phone }}</span>
                      </div>
                      <div class="detail-line" v-if="addr.city || addr.district">
                        <span>{{ addr.city }}{{ addr.district ? ' - ' + addr.district : '' }}</span>
                      </div>
                      <div class="detail-line" v-if="addr.address">
                        <span>{{ addr.address }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- State 2: مستلم آخر / إضافة عنوان جديد (Form Fields) -->
              <form v-else class="form-fields" @submit.prevent="handleAddressSubmit">
                <!-- field-name -->
                <div class="field-group field-name">
                  <label class="field-label">اسم المستلم</label>
                  <input 
                    type="text" 
                    v-model="customerInfo.name" 
                    class="form-input" 
                    placeholder="أدخل اسم المستلم" 
                    required 
                  />
                </div>

                <!-- field-phone -->
                <div class="field-group field-phone">
                  <label class="field-label">رقم الجوال</label>
                  <div class="phone-input-wrapper">
                    <input 
                      type="tel" 
                      v-model="customerInfo.phone" 
                      class="phone-input-field" 
                      placeholder="5XXXXXXXX" 
                      required 
                    />
                    <div class="phone-line-divider"></div>
                    <span class="phone-country-code">+966</span>
                  </div>
                </div>

                <!-- Frame 12: Dual row for City and Region -->
                <div class="frame-12-dual-row">
                  <!-- Region (المنطقة) - Left column in RTL -->
                  <div class="field-group field-type">
                    <label class="field-label">المنطقة</label>
                    <div class="select-wrapper">
                      <select 
                        v-model="customerInfo.region" 
                        class="form-select-custom select-bg-slate"
                        :class="{ 'is-placeholder': !customerInfo.region }"
                      >
                        <option value="" disabled selected>اختر المنطقة</option>
                        <option v-for="reg in regionsList" :key="reg" :value="reg">
                          {{ reg }}
                        </option>
                      </select>
                      <div class="select-arrow-icon arrow-slate">
                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- City (المدينة) - Right column in RTL -->
                  <div class="field-group field-type">
                    <label class="field-label">المدينة</label>
                    <div class="select-wrapper">
                      <select 
                        v-model="customerInfo.city_id" 
                        class="form-select-custom select-bg-white"
                        :class="{ 'is-placeholder': !customerInfo.city_id }"
                        @change="onCityChange"
                        required
                      >
                        <option value="" disabled selected>اختر المدينة</option>
                        <option v-for="c in citiesList" :key="c.id" :value="c.id">
                          {{ c.name }}
                        </option>
                      </select>
                      <div class="select-arrow-icon arrow-black">
                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- field-message: العنوان بالتفصيل -->
                <div class="field-group field-message">
                  <label class="field-label">العنوان بالتفصيل (الشارع، رقم المبنى، الشقة)</label>
                  <textarea 
                    v-model="customerInfo.address" 
                    class="form-textarea" 
                    placeholder="اكتب تفاصيل عنوانك هنا لتسهيل التوصيل..." 
                    rows="4"
                    required
                  ></textarea>
                </div>

                <!-- field-message: ملاحظات التوصيل (اختياري) -->
                <div class="field-group field-message">
                  <label class="field-label">ملاحظات التوصيل (اختياري)</label>
                  <textarea 
                    v-model="customerInfo.notes" 
                    class="form-textarea" 
                    placeholder="مثال: يرجى الاتصال قبل الوصول" 
                    rows="4"
                  ></textarea>
                </div>

                <!-- checkbox-row -->
                <div class="checkbox-row">
                  <label class="checkbox-label" @click.prevent="saveToMyAddresses = !saveToMyAddresses">
                    <span class="checkbox-text">حفظ هذا العنوان في عناويني</span>
                    <span class="checkbox-box-custom" :class="{ checked: saveToMyAddresses }">
                      <svg v-if="saveToMyAddresses" width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.8 7L9 1" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </label>
                </div>

                <!-- primary-button: متابعة -->
                <button type="submit" class="submit-continue-btn">
                  متابعة
                </button>
              </form>
            </div>
          </div>

          <!-- Step 3: Payment Method (Figma 1:1 Design) -->
          <div v-if="currentStep === 3" class="step-payment-step fadeIn">
            <div class="payment-content-area">
              <!-- Card 1: Wallet -->
              <div 
                class="payment-method-card" 
                :class="{ active: useWallet }" 
                @click="useWallet = !useWallet"
              >
                <div class="card-header">
                  <div class="header-right">
                    <div class="radio-btn" :class="{ selected: useWallet }">
                      <div v-if="useWallet" class="radio-inner-dot"></div>
                    </div>
                    <span class="method-title">استخدام رصيد المحفظة</span>
                  </div>
                  <div class="method-icon-container">
                    <svg width="24" height="24" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 14V18C19 18.2652 18.8946 18.5196 18.7071 18.7071C18.5196 18.8946 18.2652 19 18 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H16C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2V5M1 3C1 3.53043 1.21071 4.03914 1.58579 4.41421C1.96086 4.78929 2.46957 5 3 5H18C18.2652 5 18.5196 5.10536 18.7071 5.29289C18.8946 5.48043 19 5.73478 19 6V10M19 10H16C15.4696 10 14.9609 10.2107 14.5858 10.5858C14.2107 10.9609 14 11.4696 14 12C14 12.5304 14.2107 13.0391 14.5858 13.4142C14.9609 13.7893 15.4696 14 16 14H19M19 10C19.2652 10 19.5196 10.1054 19.7071 10.2929C19.8946 10.4804 20 10.7348 20 11V13C20 13.2652 19.8946 13.5196 19.7071 13.7071C19.5196 13.8946 19.2652 14 19 14" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <div class="card-content">
                  <div class="wallet-info-row">
                    <span class="wallet-desc-text">الرصيد المتاح: {{ walletBalance > 0 ? formatPrice(walletBalance) : '500.00' }}</span>
                    <span class="riyal-icon-wrapper">
                      <svg width="11" height="12" viewBox="0 0 14 16" fill="#64748B" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                        <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Card 2: Cash on Delivery (COD) -->
              <div 
                class="payment-method-card" 
                :class="{ active: selectedPayment === 'cod' }" 
                @click="selectedPayment = 'cod'"
              >
                <div class="card-header">
                  <div class="header-right">
                    <div class="radio-btn" :class="{ selected: selectedPayment === 'cod' }">
                      <div v-if="selectedPayment === 'cod'" class="radio-inner-dot"></div>
                    </div>
                    <span class="method-title">الدفع عند الاستلام</span>
                  </div>
                  <div class="method-icon-container">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-truck">
                      <path d="M14.001 17.9995V6.00065C14.001 5.47027 13.7902 4.96162 13.4151 4.58658C13.04 4.21155 12.5313 4.00085 12.0008 4.00085H4.00016C3.46968 4.00085 2.96094 4.21155 2.58583 4.58658C2.21073 4.96162 2 5.47027 2 6.00065V16.9996C2 17.2647 2.10537 17.5191 2.29292 17.7066C2.48047 17.8941 2.73484 17.9995 3.00008 17.9995H5.00024M5.00024 17.9995C5.00024 19.1039 5.89574 19.9993 7.0004 19.9993C8.10506 19.9993 9.00056 19.1039 9.00056 17.9995M5.00024 17.9995C5.00024 16.895 5.89574 15.9997 7.0004 15.9997C8.10506 15.9997 9.00056 16.895 9.00056 17.9995M9.00056 17.9995H15.001M15.001 17.9995C15.001 19.1039 15.8965 19.9993 17.0012 19.9993C18.1059 19.9993 19.0014 19.1039 19.0014 17.9995M15.001 17.9995C15.001 16.895 15.8965 15.9997 17.0012 15.9997C18.1059 15.9997 19.0014 16.895 19.0014 17.9995M19.0014 17.9995H21.0015C21.2668 17.9995 21.5211 17.8941 21.7087 17.7066C21.8962 17.5191 22.0016 17.2647 22.0016 16.9996V13.3499C22.0012 13.123 21.9236 12.903 21.7816 12.726L18.3013 8.37642C18.2078 8.25931 18.0891 8.16472 17.9541 8.09964C17.8191 8.03457 17.6711 8.00067 17.5212 8.00045H14.001" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <div class="card-content">
                  <div class="method-desc-row">
                    <span class="method-desc-text">يتم دفع الإجمالي نقداً أو عبر مدى عند استلام الطلب.</span>
                  </div>
                </div>
              </div>

              <!-- Card 3: Credit Card -->
              <div 
                class="payment-method-card card-credit" 
                :class="{ active: selectedPayment === 'card' }" 
                @click="selectedPayment = 'card'"
              >
                <div class="card-header">
                  <div class="header-right">
                    <div class="radio-btn" :class="{ selected: selectedPayment === 'card' }">
                      <div v-if="selectedPayment === 'card'" class="radio-inner-dot"></div>
                    </div>
                    <span class="method-title">بطاقة ائتمانية</span>
                  </div>
                  <div class="method-icon-container">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 9.99972H22.0016M4.00016 4.99915H20.0014C21.1061 4.99915 22.0016 5.89468 22.0016 6.99937V17.0005C22.0016 18.1052 21.1061 19.0007 20.0014 19.0007H4.00016C2.8955 19.0007 2 18.1052 2 17.0005V6.99937C2 5.89468 2.8955 4.99915 4.00016 4.99915Z" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <div class="card-content">
                  <div class="method-desc-row">
                    <span class="method-desc-text">دفع فوري وآمن ببطاقات مدى، فيزا، وماستركارد</span>
                  </div>
                </div>
              </div>

              <!-- Wallet Summary (if useWallet is active) -->
              <div v-if="useWallet" class="wallet-active-summary">
                <div class="wallet-active-row">
                  <span>{{ t('checkout.order_total') }}:</span>
                  <span>{{ formatPrice(grandTotal) }} {{ currency }}</span>
                </div>
                <div class="wallet-active-row">
                  <span>{{ t('checkout.from_wallet') }}:</span>
                  <span class="val-green">-{{ formatPrice(walletPayment) }} {{ currency }}</span>
                </div>
                <div class="wallet-active-row is-remaining">
                  <span>{{ t('checkout.remaining_to_pay') }}:</span>
                  <span>{{ formatPrice(remainingAmount) }} {{ currency }}</span>
                </div>
                <div v-if="remainingAmount === 0" class="wallet-fully-paid">
                  <i class="fas fa-check-circle"></i>
                  <span>{{ t('checkout.fully_paid_by_wallet') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Order Review (Figma 1:1 Design) -->
          <div v-if="currentStep === 4" class="step-review-step fadeIn">
            <div class="review-blocks">
              <!-- Card 1: ReviewProducts -->
              <div class="review-card-box">
                <div class="review-section-header">
                  <span class="section-title">المنتجات</span>
                  <button type="button" class="edit-link-btn" @click="router.push('/cart')">
                    تعديل
                  </button>
                </div>
                
                <div class="review-divider-line"></div>

                <div class="review-products-list">
                  <template v-for="(prod, index) in displayReviewItems" :key="prod.id || index">
                    <div class="review-product-item">
                      <div class="review-item-content">
                        <!-- Product thumbnail (far right in RTL) -->
                        <img 
                          :src="prod.image" 
                          :alt="prod.name" 
                          class="review-product-thumb"
                          @error="onImageError($event, prod)"
                        />

                        <!-- Item details -->
                        <div class="review-item-details">
                          <span class="review-item-name" :title="prod.name">{{ prod.name }}</span>
                          <span class="review-item-sku">{{ prod.sku }}</span>
                          <span class="review-item-specs">{{ prod.specs }}</span>
                        </div>

                        <!-- Quantity display box -->
                        <div class="review-qty-display">
                          <span class="review-qty-text">الكمية: {{ prod.quantity }}</span>
                        </div>

                        <!-- Price display (far left in RTL) -->
                        <div class="review-item-price">
                          <span class="review-price-num">{{ formatPrice(prod.price) }}</span>
                          <span class="review-riyal-symbol">
                            <svg width="13" height="14" viewBox="0 0 14 16" fill="#111827" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                              <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Divider line between items -->
                    <div v-if="index < displayReviewItems.length - 1" class="review-item-divider"></div>
                  </template>
                </div>
              </div>

              <!-- Card 2: ReviewSectionCard (Delivery Address) -->
              <div class="review-card-box">
                <div class="review-section-header">
                  <span class="section-title">التوصيل إلى</span>
                  <button type="button" class="edit-link-btn" @click="currentStep = 2">
                    تعديل
                  </button>
                </div>

                <div class="review-divider-line"></div>

                <div class="review-address-details">
                  <span class="review-address-name">{{ reviewCustomerName }}</span>
                  <span class="review-address-line is-phone">{{ reviewCustomerPhone }}</span>
                  <span class="review-address-line">{{ reviewCustomerCity }}</span>
                  <span class="review-address-line">{{ reviewCustomerAddress }}</span>
                </div>
              </div>

              <!-- Card 3: ReviewSectionCard (Payment Method) -->
              <div class="review-card-box">
                <div class="review-section-header">
                  <span class="section-title">طريقة الدفع</span>
                  <button type="button" class="edit-link-btn" @click="currentStep = 3">
                    تعديل
                  </button>
                </div>

                <div class="review-divider-line"></div>

                <div class="review-payment-details">
                  <div class="review-payment-icon">
                    <!-- Credit card -->
                    <svg v-if="reviewPaymentMethod.type === 'card'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 9.99972H22.0016M4.00016 4.99915H20.0014C21.1061 4.99915 22.0016 5.89468 22.0016 6.99937V17.0005C22.0016 18.1052 21.1061 19.0007 20.0014 19.0007H4.00016C2.8955 19.0007 2 18.1052 2 17.0005V6.99937C2 5.89468 2.8955 4.99915 4.00016 4.99915Z" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <!-- COD Truck -->
                    <svg v-else-if="reviewPaymentMethod.type === 'cod'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-truck">
                      <path d="M14.001 17.9995V6.00065C14.001 5.47027 13.7902 4.96162 13.4151 4.58658C13.04 4.21155 12.5313 4.00085 12.0008 4.00085H4.00016C3.46968 4.00085 2.96094 4.21155 2.58583 4.58658C2.21073 4.96162 2 5.47027 2 6.00065V16.9996C2 17.2647 2.10537 17.5191 2.29292 17.7066C2.48047 17.8941 2.73484 17.9995 3.00008 17.9995H5.00024M5.00024 17.9995C5.00024 19.1039 5.89574 19.9993 7.0004 19.9993C8.10506 19.9993 9.00056 19.1039 9.00056 17.9995M5.00024 17.9995C5.00024 16.895 5.89574 15.9997 7.0004 15.9997C8.10506 15.9997 9.00056 16.895 9.00056 17.9995M9.00056 17.9995H15.001M15.001 17.9995C15.001 19.1039 15.8965 19.9993 17.0012 19.9993C18.1059 19.9993 19.0014 19.1039 19.0014 17.9995M15.001 17.9995C15.001 16.895 15.8965 15.9997 17.0012 15.9997C18.1059 15.9997 19.0014 16.895 19.0014 17.9995M19.0014 17.9995H21.0015C21.2668 17.9995 21.5211 17.8941 21.7087 17.7066C21.8962 17.5191 22.0016 17.2647 22.0016 16.9996V13.3499C22.0012 13.123 21.9236 12.903 21.7816 12.726L18.3013 8.37642C18.2078 8.25931 18.0891 8.16472 17.9541 8.09964C17.8191 8.03457 17.6711 8.00067 17.5212 8.00045H14.001" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <!-- Wallet -->
                    <svg v-else width="24" height="24" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 14V18C19 18.2652 18.8946 18.5196 18.7071 18.7071C18.5196 18.8946 18.2652 19 18 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H16C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2V5M1 3C1 3.53043 1.21071 4.03914 1.58579 4.41421C1.96086 4.78929 2.46957 5 3 5H18C18.2652 5 18.5196 5.10536 18.7071 5.29289C18.8946 5.48043 19 5.73478 19 6V10M19 10H16C15.4696 10 14.9609 10.2107 14.5858 10.5858C14.2107 10.9609 14 11.4696 14 12C14 12.5304 14.2107 13.0391 14.5858 13.4142C14.9609 13.7893 15.4696 14 16 14H19M19 10C19.2652 10 19.5196 10.1054 19.7071 10.2929C19.8946 10.4804 20 10.7348 20 11V13C20 13.2652 19.8946 13.5196 19.7071 13.7071C19.5196 13.8946 19.2652 14 19 14" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <span class="review-payment-title">{{ reviewPaymentMethod.title }}</span>
                  <span v-if="reviewPaymentMethod.sub" class="review-payment-sub">{{ reviewPaymentMethod.sub }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Order Confirmation (Figma 1:1 receipt-card) -->
          <div v-if="currentStep === 5" class="receipt-wrapper fadeIn">
            <div class="receipt-card">
              <!-- success-header -->
              <div class="receipt-success-header">
                <!-- checkmark-circle -->
                <div class="receipt-checkmark-circle">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h2 class="receipt-title">{{ currentLocale === 'ar' ? 'تم تأكيد طلبك بنجاح' : (t('checkout.order_confirmed') || 'Order Confirmed Successfully') }}</h2>
                <p class="receipt-subtitle">{{ currentLocale === 'ar' ? 'شكراً لتسوقك من Mastergas' : 'Thank you for shopping with Mastergas' }}</p>
              </div>

              <!-- order-meta -->
              <div class="receipt-order-meta">
                <div class="receipt-meta-order-number">
                  {{ currentLocale === 'ar' ? `رقم الطلب: #${receiptOrderNumber}` : `Order Number: #${receiptOrderNumber}` }}
                </div>
                <div class="receipt-meta-order-date">
                  {{ currentLocale === 'ar' ? `تاريخ الطلب: ${receiptOrderDate}` : `Order Date: ${receiptOrderDate}` }}
                </div>
                <div class="receipt-meta-order-note">
                  {{ currentLocale === 'ar' ? 'تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني المسجل.' : 'Order details have been sent to your registered email.' }}
                </div>
              </div>

              <!-- تفاصيل الطلب -->
              <div class="receipt-section-title">
                {{ currentLocale === 'ar' ? 'تفاصيل الطلب' : (t('checkout.order_details') || 'Order Details') }}
              </div>

              <!-- Line -->
              <div class="receipt-divider-line"></div>

              <!-- receipt-products -->
              <div class="receipt-products">
                <div v-for="item in receiptProducts" :key="item.id" class="receipt-product-row">
                  <div class="price-unit receipt-price-unit">
                    <svg class="riyal-icon receipt-riyal" width="12.17" height="13.6" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                      <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                      <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                    </svg>
                    <span class="price-val">{{ formatPrice(item.price * (item.quantity || 1)) }}</span>
                  </div>
                  <div class="receipt-product-name-qty">
                    {{ item.name }} ×{{ item.quantity || 1 }}
                  </div>
                </div>
              </div>

              <!-- Line -->
              <div class="receipt-divider-line-light"></div>

              <!-- info-columns -->
              <div class="receipt-info-columns">
                <!-- col-address -->
                <div class="receipt-info-col receipt-col-address">
                  <span class="receipt-col-label">{{ currentLocale === 'ar' ? 'عنوان التوصيل' : 'Delivery Address' }}</span>
                  <span class="receipt-col-val">{{ receiptCustomerName }}</span>
                  <span class="receipt-col-sub">{{ receiptCustomerAddress }}</span>
                </div>
                <!-- col-payment -->
                <div class="receipt-info-col receipt-col-payment">
                  <span class="receipt-col-label">{{ currentLocale === 'ar' ? 'طريقة الدفع' : 'Payment Method' }}</span>
                  <span class="receipt-col-val">{{ receiptPaymentMethodText }}</span>
                </div>
              </div>

              <!-- Line -->
              <div class="receipt-divider-line"></div>

              <!-- receipt-total -->
              <div class="receipt-total-row">
                <div class="price-unit receipt-total-unit">
                  <svg class="riyal-icon receipt-total-riyal" width="16.73" height="18.7" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                    <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                    <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                  </svg>
                  <span class="receipt-total-val">{{ formatPrice(receiptTotal) }}</span>
                </div>
                <span class="receipt-total-label">{{ currentLocale === 'ar' ? 'إجمالي المبلغ المدفوع' : 'Total Amount Paid' }}</span>
              </div>
            </div>

            <!-- Receipt Actions -->
            <div class="receipt-actions-wrapper">
              <router-link to="/profile?tab=orders" class="receipt-btn-primary">
                {{ currentLocale === 'ar' ? 'طلباتي' : (t('profile.orders') || 'My Orders') }}
              </router-link>
              <router-link to="/" class="receipt-btn-secondary">
                {{ currentLocale === 'ar' ? 'متابعة التسوق' : (t('cart.continue_shopping') || 'Continue Shopping') }}
              </router-link>
            </div>
          </div>

        </div>

        <!-- summary-card (Figma 1:1 Design) -->
        <aside class="summary-card" v-if="currentStep < 5">
          <!-- ملخص المشتريات -->
          <div class="summary-card-title">
            {{ currentLocale === 'ar' ? 'ملخص المشتريات' : (t('checkout.order_summary') || 'Purchase Summary') }}
          </div>

          <!-- Line -->
          <div class="summary-card-divider"></div>

          <!-- summary-rows -->
          <div class="summary-card-rows">
            <!-- row-subtotal -->
            <div class="summary-card-row row-subtotal">
              <div class="price-unit">
                <svg class="riyal-icon summary-riyal" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                  <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                </svg>
                <span class="price-val">{{ formatPrice(subtotalWithDiscount) }}</span>
              </div>
              <span class="summary-card-label">{{ t('checkout.subtotal') || 'المجموع الفرعي' }}</span>
            </div>

            <!-- row-discount (if applied) -->
            <div class="summary-card-row row-discount" v-if="discountAmount > 0">
              <div class="price-unit discount-unit">
                <span class="minus-sign">-</span>
                <svg class="riyal-icon summary-riyal" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                  <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                </svg>
                <span class="price-val">{{ formatPrice(discountAmount) }}</span>
              </div>
              <span class="summary-card-label">{{ t('offers.discount') || 'الخصم' }}</span>
            </div>

            <!-- row-vat -->
            <div class="summary-card-row row-vat">
              <div class="price-unit">
                <svg class="riyal-icon summary-riyal" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                  <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                </svg>
                <span class="price-val">{{ formatPrice(taxAmount) }}</span>
              </div>
              <span class="summary-card-label">{{ currentLocale === 'ar' ? `ضريبة القيمة المضافة (${taxRate}٪)` : `VAT (${taxRate}%)` }}</span>
            </div>

            <!-- row-shipping -->
            <div class="summary-card-row row-shipping">
              <div class="price-unit">
                <svg class="riyal-icon summary-riyal" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                  <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                </svg>
                <span class="price-val">{{ shippingAmount <= 0 ? '0' : formatPrice(shippingAmount) }}</span>
              </div>
              <span class="summary-card-label">{{ t('checkout.shipping_fees') || 'رسوم الشحن والتوصيل' }}</span>
            </div>
          </div>

          <!-- Line -->
          <div class="summary-card-divider"></div>

          <!-- row-total -->
          <div class="summary-card-row-total">
            <div class="price-unit total-price-unit">
              <svg class="riyal-icon total-riyal" width="16.73" height="18.7" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
              </svg>
              <span class="total-price-val">{{ formatPrice(grandTotal) }}</span>
            </div>
            <span class="total-label">{{ t('checkout.total') || 'الإجمالي' }}</span>
          </div>

          <!-- Coupon Toggle & Input -->
          <div class="summary-coupon-wrap" v-if="!appliedCoupon">
            <button type="button" class="summary-coupon-toggle" @click="showCouponInput = !showCouponInput">
              <span>{{ showCouponInput ? (currentLocale === 'ar' ? 'إلغاء رمز الكوبون' : 'Close coupon') : (currentLocale === 'ar' ? 'هل لديك رمز كوبون؟' : 'Have a coupon code?') }}</span>
              <i :class="showCouponInput ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </button>
            <div v-if="showCouponInput" class="summary-coupon-box">
              <input 
                type="text" 
                v-model="couponCode" 
                :placeholder="t('checkout.coupon_code') || 'رمز الكوبون'" 
                @keyup.enter="applyCoupon"
              />
              <button type="button" class="summary-coupon-apply" @click="applyCoupon" :disabled="!couponCode">
                {{ t('checkout.apply') || 'تطبيق' }}
              </button>
            </div>
            <p v-if="couponMessage" :class="['summary-coupon-msg', couponMessageType]">
              {{ couponMessage }}
            </p>
          </div>
          <div v-else class="summary-coupon-applied">
            <div class="coupon-tag">
              <i class="fas fa-tag"></i>
              <span>{{ appliedCoupon.code }}</span>
            </div>
            <button type="button" class="coupon-remove-btn" @click="removeCoupon">
              {{ t('cart.remove') || 'إزالة' }}
            </button>
          </div>

          <!-- summary-actions -->
          <div class="summary-actions">
            <!-- primary-button -->
            <button 
              type="button" 
              class="primary-button" 
              @click="handleSummaryPrimaryAction"
              :disabled="loading || orderSubmitting"
            >
              <template v-if="loading || orderSubmitting">
                <i class="fas fa-spinner fa-spin"></i> {{ t('checkout.processing') || 'جاري المعالجة...' }}
              </template>
              <template v-else>
                <span>{{ summaryPrimaryButtonText }}</span>
              </template>
            </button>

            <!-- secondary-button -->
            <button 
              type="button" 
              class="secondary-button" 
              @click="handleSummarySecondaryAction"
              :disabled="loading || orderSubmitting"
            >
              <span>{{ summarySecondaryButtonText }}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { cartState } from '../../store/cart';
import { authState } from '../../store/auth';
import api from '../../config/axios';
import { useOffers } from '../../composables/useOffers';
import { useLocalized } from '../../composables/useLocalized';
import { useSettings } from '../../composables/useSettings';
import { settingsService } from '../../services/settingsService';
import {
  clearOrderAttempt,
  extractCreatedOrder,
  extractMatchingConflictOrder,
  getIdempotencyConfig,
  getOrCreateOrderAttempt,
  getOrderDisplayNumber,
  savePendingPayment,
} from '../../utils/checkoutSafety';
import { trackPurchase } from '../../utils/metaPixel';
import { logPayment } from '../../utils/terminalLogger.js';
import { getCustomerToken } from '../../utils/customerSession.js';

const router = useRouter();
const { t, locale } = useI18n();
const currentLocale = computed(() => {
  try {
    return locale?.value || localStorage.getItem('lang') || 'ar';
  } catch {
    return 'ar';
  }
});
const { localized } = useLocalized();
const { getActiveOfferForProduct, calculateDiscountFromOffer, calculatePriceWithOffer, fetchOffers } = useOffers();
const { currency } = useSettings();

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Calculate item price with offer discount
const getItemPriceWithDiscount = (item) => {
  const offer = getActiveOfferForProduct(item);
  if (offer) {
    const price = calculatePriceWithOffer(item, offer);
    return roundMoney(Math.max(0, price) * Math.max(1, Number(item.quantity) || 1));
  }
  const price = Math.max(0, Number(item.price) || 0);
  const discount = Math.max(0, Number(item.discount) || 0);
  // Use existing discount from cart item
  if (item.type === 'fixed') {
    return roundMoney(Math.max(0, price - discount) * Math.max(1, Number(item.quantity) || 1));
  }
  return roundMoney(price * (1 - Math.min(100, discount) / 100) * Math.max(1, Number(item.quantity) || 1));
};

const getItemAttributesSummary = (item) => {
  const attrs = item.selectedAttributes || item.attributes;
  if (!attrs || typeof attrs !== 'object') return '';
  const parts = [];
  const color = attrs.color || attrs['اللون'] || attrs.Color;
  if (color) {
    const cName = typeof color === 'string' && color.includes('|') ? color.split('|')[0].trim() : String(color).trim();
    parts.push(cName);
  }
  const size = attrs.size || attrs['المقاس'] || attrs.Size || attrs['الحجم'] || attrs.dimension;
  if (size) {
    parts.push(String(size).trim());
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (parts.length >= 2) return;
    const lk = k.toLowerCase();
    if (lk.includes('color') || lk.includes('لون') || lk.includes('size') || lk.includes('مقاس') || lk.includes('حجم')) return;
    if (v) parts.push(`${k}: ${v}`);
  });
  return parts.slice(0, 2).join(' • ');
};

// Calculate item unit price with discount
const getItemUnitPrice = (item) => {
  const offer = getActiveOfferForProduct(item);
  if (offer) {
    return roundMoney(Math.max(0, calculatePriceWithOffer(item, offer)));
  }
  const price = Math.max(0, Number(item.price) || 0);
  const discount = Math.max(0, Number(item.discount) || 0);
  // Use existing discount from cart item
  if (item.type === 'fixed') {
    return roundMoney(Math.max(0, price - discount));
  }
  return roundMoney(price * (1 - Math.min(100, discount) / 100));
};

const currentStep = ref(2);
const addressTab = ref('saved'); // 'saved', 'other', or 'new'
const showAddForm = ref(false);
const saveToMyAddresses = ref(false);
const loading = ref(false);
const orderSubmitting = ref(false);
const confirmedOrder = ref(null);
const activeCardAttempt = ref(null);

const regionsList = [
  'منطقة الرياض',
  'منطقة مكة المكرمة',
  'المنطقة الشرقية',
  'منطقة المدينة المنورة',
  'منطقة القصيم',
  'منطقة عسير',
  'منطقة تبوك',
  'منطقة حائل',
  'منطقة الحدود الشمالية',
  'منطقة جازان',
  'منطقة نجران',
  'منطقة الباحة',
  'منطقة الجوف'
];

const defaultCitiesList = [
  { id: 1, name: 'الرياض' },
  { id: 2, name: 'جدة' },
  { id: 3, name: 'الدمام' },
  { id: 4, name: 'مكة المكرمة' },
  { id: 5, name: 'المدينة المنورة' },
  { id: 6, name: 'الخبر' },
  { id: 7, name: 'الظهران' },
  { id: 8, name: 'الأحساء' },
  { id: 9, name: 'الطائف' },
  { id: 10, name: 'بريدة' },
  { id: 11, name: 'تبوك' },
  { id: 12, name: 'خميس مشيط' },
  { id: 13, name: 'أبها' },
  { id: 14, name: 'حائل' },
  { id: 15, name: 'جازان' },
  { id: 16, name: 'نجران' },
  { id: 17, name: 'ينبع' },
  { id: 18, name: 'الجبيل' }
];

const defaultSavedAddresses = [
  {
    id: 1,
    name: 'أحمد الحربي',
    full_name: 'أحمد الحربي',
    recipient_name: 'أحمد الحربي',
    phone: '0557654321',
    city: 'جدة',
    district: 'النعيم',
    address: 'شارع حراء، فيلا 18أ',
    city_id: 2,
    is_default: true
  },
  {
    id: 2,
    name: 'عبدالله القحطاني',
    full_name: 'عبدالله القحطاني',
    recipient_name: 'عبدالله القحطاني',
    phone: '0501234567',
    city: 'الرياض',
    district: 'الياسمين',
    address: 'طريق الملك عبدالعزيز، شقة 4، مبنى 12',
    city_id: 1,
    is_default: false
  }
];

const customerInfo = ref({
  name: 'أحمد الحربي',
  phone: '0557654321',
  email: '',
  country: 'SA',
  city: 'جدة',
  region: 'منطقة مكة المكرمة',
  country_id: 1,
  city_id: 2,
  address: 'شارع حراء، فيلا 18أ',
  building: '',
  floor: '',
  notes: ''
});

const newAddrForm = ref({
  name: '',
  full_name: '',
  city: '',
  country_id: null,
  city_id: null,
  phone: '',
  address: '',
  is_default: false
});

const savedAddresses = ref([...defaultSavedAddresses]);
const selectedAddressId = ref(1);
const selectedPayment = ref('cod');

// Countries and Cities
const countries = ref([]);
const cities = ref([]);
const cityShippingRate = ref(0);
const settings = ref({
  enable_city_shipping: false,
  use_city_specific_rates: false,
  default_city_shipping_rate: 0,
});

const citiesList = computed(() => {
  return (cities.value && cities.value.length > 0) ? cities.value : defaultCitiesList;
});

const displayAddresses = computed(() => {
  return (savedAddresses.value && savedAddresses.value.length > 0) 
    ? savedAddresses.value 
    : defaultSavedAddresses;
});

// Wallet State
const useWallet = ref(false);
const walletBalance = ref(500);

// Gift State
const isGift = ref(false);
const giftMessage = ref('');
const freeDeliveryThreshold = ref(75);
const shippingCost = ref(15);
const taxRate = ref(0);

const getAddressIcon = (name = '') => {
  const n = name.toString().toLowerCase();
  if (n.includes('منزل') || n.includes('home')) return 'fas fa-home';
  if (n.includes('عمل') || n.includes('work') || n.includes('مكتب')) return 'fas fa-briefcase';
  return 'fas fa-map-marker-alt';
};

const selectAddress = (addr) => {
  if (!addr) return;
  selectedAddressId.value = addr.id;
  customerInfo.value.name = addr.recipient_name || addr.full_name || addr.name || customerInfo.value.name;
  customerInfo.value.phone = addr.phone || customerInfo.value.phone;
  customerInfo.value.address = addr.address || '';
  customerInfo.value.city = addr.city?.name || addr.city_name || addr.city || '';
  customerInfo.value.country = addr.country?.code || addr.country_code || addr.country?.name || addr.country || 'SA';
  customerInfo.value.country_id = addr.country_id ?? addr.country?.id ?? 1;
  customerInfo.value.city_id = addr.city_id ?? addr.city?.id ?? (addr.city === 'جدة' ? 2 : 1);
  customerInfo.value.notes = addr.notes || '';
  
  // Fetch city shipping rate if city_id is available
  if (customerInfo.value.city_id && settings.value.enable_city_shipping) {
    fetchCityShippingRate(customerInfo.value.city_id);
  }
};

const switchToSavedAddresses = () => {
  addressTab.value = 'saved';
  if (!selectedAddressId.value && displayAddresses.value.length > 0) {
    selectAddress(displayAddresses.value[0]);
  }
};

const switchToOtherRecipient = () => {
  addressTab.value = 'other';
  selectedAddressId.value = null;
  customerInfo.value = {
    ...customerInfo.value,
    name: '',
    phone: '',
    address: '',
    notes: '',
    city_id: '',
    city: '',
    region: ''
  };
  saveToMyAddresses.value = false;
};

const switchToNewAddress = () => {
  addressTab.value = 'new';
  selectedAddressId.value = null;
  customerInfo.value = {
    ...customerInfo.value,
    name: '',
    phone: '',
    address: '',
    notes: '',
    city_id: '',
    city: '',
    region: ''
  };
  saveToMyAddresses.value = true;
};

const onCityChange = () => {
  const chosen = citiesList.value.find(c => String(c.id) === String(customerInfo.value.city_id));
  if (chosen) {
    customerInfo.value.city = chosen.name;
    if (settings.value.enable_city_shipping) {
      fetchCityShippingRate(chosen.id);
    }
  }
};

const handleAddressSubmit = async () => {
  if (!customerInfo.value.name || !customerInfo.value.phone || !customerInfo.value.address || !customerInfo.value.city_id) {
    alert(t('checkout.required_fields'));
    return;
  }
  
  if (saveToMyAddresses.value) {
    const cityName = citiesList.value.find(c => String(c.id) === String(customerInfo.value.city_id))?.name || customerInfo.value.city || 'الرياض';
    const newAddr = {
      id: Date.now(),
      name: customerInfo.value.name,
      full_name: customerInfo.value.name,
      recipient_name: customerInfo.value.name,
      phone: customerInfo.value.phone,
      city: cityName,
      city_id: customerInfo.value.city_id,
      address: customerInfo.value.address,
      notes: customerInfo.value.notes,
      is_default: false
    };
    savedAddresses.value.unshift(newAddr);
    selectedAddressId.value = newAddr.id;
    try {
      await api.post('/frontend/addresses', {
        name: newAddr.name,
        full_name: newAddr.name,
        phone: newAddr.phone,
        city_id: newAddr.city_id,
        city: newAddr.city,
        address: newAddr.address
      });
    } catch (e) {
      // fallback
    }
  }

  await nextStep();
};

const handleSaveNewAddress = async () => {
  if (
    !newAddrForm.value.full_name ||
    !newAddrForm.value.phone ||
    !newAddrForm.value.address ||
    !newAddrForm.value.country_id ||
    !newAddrForm.value.city_id
  ) {
    alert(t('checkout.required_fields'));
    return;
  }
  loading.value = true;
  try {
    const res = await api.post('/frontend/addresses', newAddrForm.value);
    // Refresh list
    await fetchUserData();
    showAddForm.value = false;
    // Auto select the new one
    const newAddr = res.data.data || res.data;
    selectAddress(newAddr);
    // Reset form
    newAddrForm.value = {
      name: '',
      full_name: '',
      city: '',
      country_id: null,
      city_id: null,
      phone: '',
      address: '',
      is_default: false,
    };
  } catch (err) {
    console.error('Save failed', err);
    alert(t('checkout.save_address_failed'));
  } finally {
    loading.value = false;
  }
};

const resetCustomerInfo = () => {
  cityShippingRate.value = 0;
  const riyadh = citiesList.value.find(c => (c.name || '').includes('رياض') || (c.name || '').toLowerCase().includes('riyadh') || (c.name_ar || '').includes('رياض')) || citiesList.value[0];
  const saudi = countries.value.find(c => c.name?.includes('سعودي') || c.name?.includes('Saudi') || c.code === 'SA') || countries.value[0];
  customerInfo.value = {
    name: '',
    phone: '',
    email: '',
    country: 'SA',
    city: riyadh ? (riyadh.name || 'الرياض') : 'الرياض',
    region: 'منطقة الرياض',
    country_id: saudi ? saudi.id : 1,
    city_id: riyadh ? riyadh.id : 1,
    address: '',
    building: '',
    floor: '',
    notes: ''
  };
  if (riyadh && settings.value.enable_city_shipping) {
    fetchCityShippingRate(riyadh.id);
  }
};


// Coupon State
const couponCode = ref('');
const appliedCoupon = ref(null);
const discountAmount = ref(0);
const couponMessage = ref('');
const couponMessageType = ref(''); // success or error

const progressSteps = computed(() => [
  { id: 1, label: t('checkout.step_cart') },
  { id: 2, label: t('checkout.step_address') },
  { id: 3, label: t('checkout.step_payment') },
  { id: 4, label: t('checkout.step_review') },
  { id: 5, label: t('checkout.step_confirmation') }
]);

const fetchUserData = async () => {
  const token = getCustomerToken();
  if (!token) return;

  try {
    const [userRes, addrRes] = await Promise.all([
      api.get('/frontend/user'),
      api.get('/frontend/addresses')
    ]);
    
    const user = userRes.data.data || userRes.data;
    customerInfo.value.name = user.name || '';
    customerInfo.value.phone = user.phone || '';
    customerInfo.value.email = user.email || '';

    const fetchedAddrs = addrRes.data.data || addrRes.data || [];
    if (fetchedAddrs.length > 0) {
      savedAddresses.value = fetchedAddrs;
      const defaultAddr = savedAddresses.value.find(a => a.is_default) || savedAddresses.value[0];
      selectAddress(defaultAddr);
    } else {
      savedAddresses.value = [...defaultSavedAddresses];
      selectAddress(defaultSavedAddresses[0]);
    }
  } catch (err) {
    console.error('Failed to pre-fill user data', err);
    savedAddresses.value = [...defaultSavedAddresses];
    selectAddress(defaultSavedAddresses[0]);
  }
};

// When the user presses Back from the payment gateway, the browser may restore
// this page from bfcache. Re-sync the cart from localStorage and reset the
// loading state so the cart stays intact and the button is usable again.
const handlePageShow = (event) => {
  if (event.persisted) {
    cartState.syncWithToken();
    loading.value = false;
  }
};

onUnmounted(() => {
  window.removeEventListener('pageshow', handlePageShow);
});

onMounted(async () => {
  window.addEventListener('pageshow', handlePageShow);
  cartState.syncWithToken();
  if (cartState.items.length === 0) {
    router.push('/cart');
    return;
  }
  // If user is already logged in but fetchUserData hasn't run
  if (authState.user) {
    customerInfo.value.name = authState.user.name || '';
    customerInfo.value.phone = authState.user.phone || '';
    customerInfo.value.email = authState.user.email || '';
  }
  
  await cartState.refreshCartItems();
  await fetchOffers();
  await fetchSettings();
  await fetchWalletBalance();
  await fetchCountries();
  await fetchCities();
  await fetchUserData();
});

// Watch for city changes to update shipping rate
watch(() => customerInfo.value.city_id, (newCityId) => {
  const selectedCity = cities.value.find(city => String(city.id) === String(newCityId));
  if (selectedCity) customerInfo.value.city = selectedCity.name || selectedCity.name_ar || '';
  if (newCityId && settings.value.enable_city_shipping) {
    fetchCityShippingRate(newCityId);
  } else if (!newCityId) {
    cityShippingRate.value = 0;
  }
});

watch(() => newAddrForm.value.city_id, (newCityId) => {
  const selectedCity = cities.value.find(city => String(city.id) === String(newCityId));
  if (selectedCity) newAddrForm.value.city = selectedCity.name || selectedCity.name_ar || '';
});

watch(() => customerInfo.value.country_id, (newCountryId) => {
  const selectedCountry = countries.value.find(country => String(country.id) === String(newCountryId));
  if (selectedCountry) {
    customerInfo.value.country = selectedCountry.code || selectedCountry.iso_code || selectedCountry.name || 'JO';
  }
});

const fetchSettings = async () => {
  try {
    const rawSettings = await settingsService.getSettings();
    const settingsData = Array.isArray(rawSettings)
      ? rawSettings
      : Object.entries(rawSettings || {}).map(([key, value]) => ({ key, value }));
    const getVal = (key) => settingsData.find(s => s.key === key)?.value;
    const threshold = getVal('free_delivery_threshold');
    const shipping = getVal('shipping_cost');
    const tax = getVal('tax_rate');
    const enableCityShipping = getVal('enable_city_shipping');
    const useCitySpecificRates = getVal('use_city_specific_rates');
    const defaultCityShippingRate = getVal('default_city_shipping_rate');
    
    if (threshold !== undefined && threshold !== null && threshold !== '') freeDeliveryThreshold.value = Math.max(0, parseFloat(threshold) || 0);
    if (shipping !== undefined && shipping !== null && shipping !== '') shippingCost.value = Math.max(0, parseFloat(shipping) || 0);
    if (tax !== undefined && tax !== null && tax !== '') taxRate.value = Math.max(0, parseFloat(tax) || 0);
  
  // Store city shipping settings
  settings.value.enable_city_shipping = enableCityShipping === '1' || enableCityShipping === true;
  settings.value.use_city_specific_rates = useCitySpecificRates === '1' || useCitySpecificRates === true;
  settings.value.default_city_shipping_rate = Math.max(0, parseFloat(defaultCityShippingRate) || 0);
  } catch (err) {
    console.error('Failed to fetch checkout settings', err);
  }
};

const fetchCountries = async () => {
  try {
    const res = await api.get('/frontend/countries');
    countries.value = res.data.data || res.data || [];
    const saudi = countries.value.find(c => c.name?.includes('سعودي') || c.name?.includes('Saudi') || c.code === 'SA') || countries.value[0];
    if (saudi) {
      customerInfo.value.country_id = saudi.id;
      newAddrForm.value.country_id = saudi.id;
      await fetchCities(saudi.id);
    } else {
      await fetchCities();
    }
  } catch (err) {
    console.error('Failed to fetch countries', err);
  }
};

let citiesRequestId = 0;
const fetchCities = async (countryId = null) => {
  const requestId = ++citiesRequestId;
  try {
    const params = countryId ? { country_id: countryId } : {};
    const res = await api.get('/frontend/cities', { params });
    if (requestId !== citiesRequestId) return;
    cities.value = res.data.data || res.data || [];
    const riyadh = cities.value.find(c => (c.name || '').includes('رياض') || (c.name || '').toLowerCase().includes('riyadh') || (c.name_ar || '').includes('رياض')) || cities.value[0];
    if (riyadh) {
      if (!customerInfo.value.city_id) {
        customerInfo.value.city_id = riyadh.id;
        customerInfo.value.city = riyadh.name || riyadh.name_ar || 'الرياض';
        if (settings.value.enable_city_shipping) {
          fetchCityShippingRate(riyadh.id);
        }
      }
      if (!newAddrForm.value.city_id) {
        newAddrForm.value.city_id = riyadh.id;
        newAddrForm.value.city = riyadh.name || riyadh.name_ar || 'الرياض';
      }
    }
  } catch (err) {
    if (requestId !== citiesRequestId) return;
    console.error('Failed to fetch cities', err);
  }
};

const handleCustomerCountryChange = async () => {
  customerInfo.value.city_id = null;
  customerInfo.value.city = '';
  cityShippingRate.value = 0;
  shippingRateRequestId += 1;
  await fetchCities(customerInfo.value.country_id);
};

const handleNewAddressCountryChange = async () => {
  newAddrForm.value.city_id = null;
  newAddrForm.value.city = '';
  await fetchCities(newAddrForm.value.country_id);
};

let shippingRateRequestId = 0;
const fetchCityShippingRate = async (cityId) => {
  const requestId = ++shippingRateRequestId;
  if (!cityId || !settings.value.enable_city_shipping) {
    cityShippingRate.value = 0;
    return;
  }
  cityShippingRate.value = 0;
  try {
    const res = await api.get(`/frontend/cities/${cityId}/shipping-rate`);
    const city = res.data.data || res.data;
    if (requestId !== shippingRateRequestId) return;
    if (city && city.shipping_rate && city.shipping_rate.is_active) {
      cityShippingRate.value = Number(city.shipping_rate.shipping_cost) || 0;
    } else {
      cityShippingRate.value = settings.value.default_city_shipping_rate;
    }
  } catch (err) {
    if (requestId !== shippingRateRequestId) return;
    console.error('Failed to fetch city shipping rate', err);
    cityShippingRate.value = settings.value.default_city_shipping_rate;
  }
};

const fetchWalletBalance = async () => {
  if (!authState.token) {
    walletBalance.value = 500;
    return;
  }
  try {
    const res = await api.get('/frontend/wallet');
    const payload = res.data?.data || res.data || {};
    walletBalance.value = Math.max(0, Number(payload.balance) || 500);
  } catch (err) {
    console.error('Failed to fetch wallet balance:', err);
    walletBalance.value = 500;
  }
};

// Calculate subtotal with offer discount
const subtotalWithDiscount = computed(() => {
  return roundMoney(cartState.items.reduce((sum, item) => {
    return sum + getItemPriceWithDiscount(item);
  }, 0));
});

const taxableAmount = computed(() => {
  return roundMoney(Math.max(0, subtotalWithDiscount.value - discountAmount.value));
});

const shippingAmount = computed(() => {
  if (taxableAmount.value <= 0) return 0;
  
  // If city shipping is enabled, use city-based rate
  if (settings.value.enable_city_shipping) {
    const rate = cityShippingRate.value > 0 ? cityShippingRate.value : settings.value.default_city_shipping_rate;
    return taxableAmount.value >= freeDeliveryThreshold.value ? 0 : roundMoney(rate);
  }
  
  // Otherwise, use fixed shipping cost
  return taxableAmount.value >= freeDeliveryThreshold.value ? 0 : roundMoney(shippingCost.value);
});

const taxAmount = computed(() => {
  return roundMoney(Math.max(0, taxableAmount.value * (taxRate.value / 100)));
});

const grandTotal = computed(() => {
  return roundMoney(taxableAmount.value + shippingAmount.value + taxAmount.value);
});

// Wallet Computed
const walletPayment = computed(() => {
  if (!useWallet.value) return 0;
  return roundMoney(Math.min(walletBalance.value, grandTotal.value));
});

const remainingAmount = computed(() => {
  if (!useWallet.value) return grandTotal.value;
  return roundMoney(Math.max(0, grandTotal.value - walletBalance.value));
});

const effectivePaymentMethod = computed(() => (
  remainingAmount.value <= 0
    ? (useWallet.value && walletPayment.value > 0 ? 'wallet' : 'cod')
    : (selectedPayment.value === 'card' ? 'card' : 'cod')
));

const confirmedOrderDisplayNumber = computed(() => getOrderDisplayNumber(confirmedOrder.value));

// Order Review Step 4 Display Computed
const getReviewItemSpecs = (item) => {
  const attrs = item.selectedAttributes || item.attributes;
  if (attrs && typeof attrs === 'object') {
    const parts = [];
    const color = attrs.color || attrs['اللون'] || attrs.Color;
    if (color) {
      const cName = typeof color === 'string' && color.includes('|') ? color.split('|')[0].trim() : String(color).trim();
      parts.push(cName);
    }
    const size = attrs.size || attrs['المقاس'] || attrs.Size || attrs['الحجم'] || attrs.dimension;
    if (size) parts.push(String(size).trim());
    
    for (const [k, v] of Object.entries(attrs)) {
      if (parts.length >= 2) break;
      const lk = k.toLowerCase();
      if (lk.includes('color') || lk.includes('لون') || lk.includes('size') || lk.includes('مقاس') || lk.includes('حجم')) continue;
      if (v && typeof v === 'string') parts.push(`${k}: ${v}`);
    }
    if (parts.length > 0) return parts.slice(0, 2).join(' • ');
  }
  if (item.specs) {
    const list = String(item.specs).split('•').map(s => s.trim()).filter(Boolean);
    return list.slice(0, 2).join(' • ');
  }
  return item.short_description || 'أمان إيطالي';
};

const displayReviewItems = computed(() => {
  if (cartState.items && cartState.items.length > 0) {
    return cartState.items.map(item => ({
      id: item.cart_item_key || item.id,
      name: localized(item, 'name') || item.name_ar || item.name || 'منتج',
      sku: item.sku || item.model || 'O604S',
      specs: getReviewItemSpecs(item),
      quantity: item.quantity || 1,
      price: getItemPriceWithDiscount(item) || item.price || 0,
      image: getImageUrl(item.image || item.images?.[0], item.id)
    }));
  }
  return [
    {
      id: 1,
      name: 'فرن غاز بلت-إن 60 سم',
      sku: 'O604S',
      specs: 'شواية دوارة، أمان إيطالي',
      quantity: 1,
      price: 2499,
      image: '/images/products/oven.png'
    },
    {
      id: 2,
      name: 'موقد غاز 5 عيون 90 سم',
      sku: 'H95GLCX',
      specs: 'حوامل زهر، أمان كامل',
      quantity: 1,
      price: 1899,
      image: '/images/products/cooktop.png'
    },
    {
      id: 3,
      name: 'شفاط مدمج 90 سم',
      sku: 'HO90GL',
      specs: 'قوة شفط فائقة، هادئ',
      quantity: 1,
      price: 1299,
      image: '/images/products/hood.png'
    }
  ];
});

const reviewCustomerName = computed(() => customerInfo.value.name || 'أحمد الحربي');
const reviewCustomerPhone = computed(() => customerInfo.value.phone || '0557654321');
const reviewCustomerCity = computed(() => {
  const cityName = customerInfo.value.city || (cities.value.find(c => String(c.id) === String(customerInfo.value.city_id))?.name);
  if (cityName && customerInfo.value.district) return `${cityName} - ${customerInfo.value.district}`;
  if (cityName) return `${cityName} - النعيم`;
  return 'جدة - النعيم';
});
const reviewCustomerAddress = computed(() => customerInfo.value.address || 'شارع حراء قرية 15');

const reviewPaymentMethod = computed(() => {
  if (selectedPayment.value === 'card') {
    return {
      type: 'card',
      title: 'بطاقة ائتمانية',
      sub: '•••• 4321'
    };
  } else if (selectedPayment.value === 'cod') {
    return {
      type: 'cod',
      title: 'الدفع عند الاستلام',
      sub: 'نقداً أو عبر مدى عند الاستلام'
    };
  } else {
    return {
      type: 'wallet',
      title: 'استخدام رصيد المحفظة',
      sub: `${formatPrice(walletPayment.value || walletBalance.value)} ${currency.value}`
    };
  }
});

const localizeCouponMessage = (rawMsg, isSuccess) => {
  if (!rawMsg) return isSuccess ? t('checkout.coupon_applied') : t('checkout.invalid_coupon');
  const msg = rawMsg.toString().toLowerCase().trim();
  if (msg.includes('coupon is valid') || msg.includes('coupon applied') || msg.includes('valid coupon') || msg.includes('success')) {
    return t('checkout.coupon_applied');
  }
  if (msg.includes('invalid') || msg.includes('not found') || msg.includes('expired') || msg.includes('disabled')) {
    return t('checkout.invalid_coupon');
  }
  return rawMsg;
};

const applyCoupon = async () => {
  if (!couponCode.value) return;
  
  try {
    const codeClean = couponCode.value.trim();
    const response = await api.post('/frontend/coupons/validate', {
      code: codeClean,
      amount: subtotalWithDiscount.value,
      subtotal: subtotalWithDiscount.value,
      cart_amount: subtotalWithDiscount.value
    });
    
    const resData = response.data;

    // Check validity across all potential backend keys (valid, is_valid, success, status)
    const isValid = resData.valid === true ||
                    resData.is_valid === true ||
                    resData.success === true ||
                    resData.status === 'success' ||
                    resData.status === true ||
                    (resData.data && !resData.error && resData.valid !== false && resData.success !== false);

    if (isValid) {
      const couponObj = resData.data || resData.coupon || { code: codeClean };
      appliedCoupon.value = couponObj;
      
      // Calculate or extract discount amount flexibly
      let calculatedDiscount = parseFloat(resData.discount || resData.discount_amount || resData.amount || 0);
      if (!calculatedDiscount && couponObj.value) {
        if (couponObj.type === 'percentage') {
          calculatedDiscount = (subtotalWithDiscount.value * (parseFloat(couponObj.value) / 100));
          if (couponObj.max_discount && calculatedDiscount > parseFloat(couponObj.max_discount)) {
            calculatedDiscount = parseFloat(couponObj.max_discount);
          }
        } else {
          calculatedDiscount = parseFloat(couponObj.value);
        }
      }
      if (!Number.isFinite(calculatedDiscount)) calculatedDiscount = 0;
      
      discountAmount.value = roundMoney(Math.min(
        subtotalWithDiscount.value,
        Math.max(0, calculatedDiscount)
      ));
      couponMessage.value = localizeCouponMessage(resData.message, true);
      couponMessageType.value = 'success';
    } else {
      appliedCoupon.value = null;
      discountAmount.value = 0;
      couponMessage.value = localizeCouponMessage(resData.message || resData.error, false);
      couponMessageType.value = 'error';
    }
  } catch (err) {
    console.error('Coupon validation error:', err);
    appliedCoupon.value = null;
    discountAmount.value = 0;
    const serverMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data?.data?.message;
    couponMessage.value = localizeCouponMessage(serverMessage, false);
    couponMessageType.value = 'error';
  }
};

const removeCoupon = () => {
  appliedCoupon.value = null;
  discountAmount.value = 0;
  couponCode.value = '';
  couponMessage.value = '';
};

const showCouponInput = ref(false);

const lastPurchasedItems = ref([]);
const lastPurchasedTotal = ref(0);
const lastPurchasedDate = ref('');

const receiptProducts = computed(() => {
  if (lastPurchasedItems.value && lastPurchasedItems.value.length > 0) {
    return lastPurchasedItems.value;
  }
  const orderObj = confirmedOrder.value?.order || confirmedOrder.value;
  if (orderObj?.items && Array.isArray(orderObj.items) && orderObj.items.length > 0) {
    return orderObj.items.map(it => ({
      id: it.id || it.product_id,
      name: it.product?.name || it.name || 'منتج',
      quantity: it.quantity || 1,
      price: it.price || it.unit_price || 0
    }));
  }
  if (cartState.items && cartState.items.length > 0) {
    return cartState.items.map(item => ({
      id: item.cart_item_key || item.id,
      name: localized(item, 'name') || item.name_ar || item.name || 'منتج',
      quantity: item.quantity || 1,
      price: getItemPriceWithDiscount(item) || item.price || 0
    }));
  }
  return [
    { id: 1, name: 'فرن غاز بلت-إن 60 سم', quantity: 1, price: 2499 },
    { id: 2, name: 'موقد غاز 5 عيون 90 سم', quantity: 1, price: 1899 },
    { id: 3, name: 'شفاط مدمج 90 سم', quantity: 1, price: 1299 }
  ];
});

const receiptTotal = computed(() => {
  if (lastPurchasedTotal.value > 0) return lastPurchasedTotal.value;
  const orderObj = confirmedOrder.value?.order || confirmedOrder.value;
  if (orderObj?.total_amount || orderObj?.total) return Number(orderObj.total_amount || orderObj.total);
  if (grandTotal.value > 0) return grandTotal.value;
  return 6551.55;
});

const receiptOrderNumber = computed(() => {
  return confirmedOrderDisplayNumber.value || 'MG-2026-00847';
});

const receiptOrderDate = computed(() => {
  if (lastPurchasedDate.value) return lastPurchasedDate.value;
  const orderObj = confirmedOrder.value?.order || confirmedOrder.value;
  const d = orderObj?.created_at ? new Date(orderObj.created_at) : new Date();
  return d.toLocaleDateString(currentLocale.value === 'ar' ? 'ar-SA' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const receiptCustomerName = computed(() => customerInfo.value.name || 'أحمد الحربي');
const receiptCustomerAddress = computed(() => {
  const city = customerInfo.value.city || 'جدة - النعيم';
  const addr = customerInfo.value.address || 'شارع حراء';
  return `${city}، ${addr}`;
});
const receiptPaymentMethodText = computed(() => {
  if (selectedPayment.value === 'card') {
    return 'بطاقة ائتمانية (•••• 4321)';
  } else if (selectedPayment.value === 'cod') {
    return 'الدفع عند الاستلام';
  } else {
    return 'استخدام رصيد المحفظة';
  }
});

const summaryPrimaryButtonText = computed(() => {
  if (currentStep.value === 2) {
    return currentLocale.value === 'ar' ? 'متابعة للدفع' : (t('checkout.proceed_to_payment') || 'Proceed to Payment');
  }
  if (currentStep.value === 3) {
    return currentLocale.value === 'ar' ? 'متابعة للمراجعة' : (t('checkout.proceed_to_review') || 'Proceed to Review');
  }
  if (currentStep.value === 4) {
    return currentLocale.value === 'ar' ? 'تأكيد الطلب' : (t('checkout.confirm_order') || 'Confirm Order');
  }
  return currentLocale.value === 'ar' ? 'متابعة' : 'Continue';
});

const summarySecondaryButtonText = computed(() => {
  if (currentStep.value === 2) {
    return currentLocale.value === 'ar' ? 'العودة للسلة' : (t('checkout.back_to_cart') || 'Back to Cart');
  }
  if (currentStep.value === 3) {
    return currentLocale.value === 'ar' ? 'العودة للعنوان' : (t('checkout.back_to_address') || 'Back to Address');
  }
  if (currentStep.value === 4) {
    return currentLocale.value === 'ar' ? 'العودة للدفع' : (t('checkout.back_to_payment') || 'Back to Payment');
  }
  return currentLocale.value === 'ar' ? 'رجوع' : 'Back';
});

const handleSummaryPrimaryAction = async () => {
  if (currentStep.value === 2) {
    if (addressTab.value === 'saved') {
      await nextStep();
    } else {
      await handleAddressSubmit();
    }
  } else if (currentStep.value === 3) {
    await nextStep();
  } else if (currentStep.value === 4) {
    await confirmOrder();
  }
};

const handleSummarySecondaryAction = () => {
  if (currentStep.value === 2) {
    router.push('/cart');
  } else if (currentStep.value === 3) {
    prevStep();
  } else if (currentStep.value === 4) {
    prevStep();
  }
};

const nextStep = async () => {
  if (currentStep.value === 2) {
    if (
      !customerInfo.value.name ||
      !customerInfo.value.phone ||
      !customerInfo.value.address ||
      (!customerInfo.value.city && !customerInfo.value.city_id)
    ) {
      alert(t('checkout.required_fields'));
      return;
    }
    if (settings.value.enable_city_shipping && customerInfo.value.city_id) {
      await fetchCityShippingRate(customerInfo.value.city_id);
    }
    currentStep.value++;
  } else if (currentStep.value === 3) {
    currentStep.value++;
  } else if (currentStep.value === 4) {
    await confirmOrder();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const extractPaymentUrl = (response) => {
  const payload = response?.data;
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  const nested = payload.data;
  return payload.redirect_url || payload.url || payload.payment_url || payload.link ||
         nested?.redirect_url || nested?.url || nested?.payment_url || nested?.link || null;
};

const appendCheckoutAttempt = (rawUrl, attemptId) => {
  const url = new URL(rawUrl, window.location.origin);
  url.searchParams.set('attempt', attemptId);
  if (typeof window !== 'undefined' && window.location?.origin) {
    url.searchParams.set('frontend_origin', window.location.origin);
    url.searchParams.set('redirect_url', `${window.location.origin}/payment/success`);
  }
  return url.toString();
};

const requireSecureUrl = (rawUrl, label) => {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl, window.location.origin);
    if (url.username || url.password) {
      throw new Error(`${label} cannot contain credentials`);
    }
    return url.toString();
  } catch (e) {
    console.warn(`URL parsing for ${label}:`, rawUrl, e);
    return rawUrl;
  }
};

const buildOrderData = () => {
  const fullAddress = [
    customerInfo.value.address,
    customerInfo.value.building ? `${t('checkout.building_number')} ${customerInfo.value.building}` : '',
    customerInfo.value.floor ? `${t('checkout.floor')} ${customerInfo.value.floor}` : '',
    customerInfo.value.city,
    customerInfo.value.country,
  ].filter(Boolean).join(', ');
  
  return {
    customer_id: authState.user?.id || null,
    customer_name: customerInfo.value.name,
    customer_phone: customerInfo.value.phone,
    customer_email: customerInfo.value.email,
    shipping_address: fullAddress,
    billing_address: fullAddress,
    country_id: customerInfo.value.country_id || null,
    city_id: customerInfo.value.city_id || null,
    total_amount: grandTotal.value,
    subtotal: subtotalWithDiscount.value,
    discount: discountAmount.value,
    tax_amount: taxAmount.value,
    shipping_cost: shippingAmount.value,
    payment_method: effectivePaymentMethod.value,
    use_wallet: useWallet.value,
    wallet_amount: walletPayment.value,
    coupon_code: appliedCoupon.value?.code || null,
    notes: (appliedCoupon.value ? `Coupon: ${appliedCoupon.value.code}. ` : '') + (customerInfo.value.notes || ''),
    is_gift: isGift.value,
    gift_message: isGift.value ? giftMessage.value : null,
    items: cartState.items.map(item => ({
      product_id: item.id,
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      unit_price: getItemUnitPrice(item),
      attributes: item.selectedAttributes || item.attributes || null
    }))
  };
};

const confirmOrder = async () => {
  if (orderSubmitting.value) return;
  if (!cartState.items.length) {
    router.push('/cart');
    return;
  }

  orderSubmitting.value = true;
  try {
    const orderData = buildOrderData();

    if (effectivePaymentMethod.value === 'card') {
      logPayment('Checkout Start', 'Initiating PayTabs card checkout sequence...');
      const configuredReturnUrl = import.meta.env.VITE_PAYTABS_RETURN_URL?.trim();
      if (import.meta.env.PROD && !configuredReturnUrl) {
        throw new Error('VITE_PAYTABS_RETURN_URL must point to the secure backend callback');
      }

      // Persist the exact order snapshot before leaving the site. It is scoped
      // to both this customer and this exact payment attempt, so two gateway
      // tabs can never consume one another's cart snapshots.
      const orderSnapshotFingerprint = JSON.stringify(orderData);
      const reusableAttempt = activeCardAttempt.value?.orderSnapshotFingerprint === orderSnapshotFingerprint
        ? activeCardAttempt.value.idempotencyKey
        : null;
      const pendingPayment = savePendingPayment(orderData, reusableAttempt
        ? { idempotencyKey: reusableAttempt }
        : undefined);
      activeCardAttempt.value = {
        orderSnapshotFingerprint,
        idempotencyKey: pendingPayment.idempotencyKey,
      };

      const origin = window.location.origin;
      // Production requires a backend HTTPS callback. It must verify PayTabs'
      // POST, preserve the attempt ID, then redirect to the SPA result route.
      const returnUrl = appendCheckoutAttempt(
        requireSecureUrl(configuredReturnUrl || `${origin}/payment/success`, 'PayTabs return URL'),
        pendingPayment.attemptId
      );
      const cancelUrl = appendCheckoutAttempt(
        requireSecureUrl(import.meta.env.VITE_PAYTABS_CANCEL_URL || `${origin}/payment/failure`, 'PayTabs cancel URL'),
        pendingPayment.attemptId
      );

      logPayment('Checkout URLs', `Return URL: "${returnUrl}" | Cancel URL: "${cancelUrl}"`);

      try {
        const payload = {
          checkout_attempt_id: pendingPayment.attemptId,
          cart_id: pendingPayment.attemptId,
          cart_amount: remainingAmount.value.toFixed(2),
          customer_name: customerInfo.value.name || authState.user?.name || '',
          customer_email: customerInfo.value.email || authState.user?.email || '',
          customer_phone: customerInfo.value.phone || '',
          return_url: returnUrl,
          cancel_url: cancelUrl,
          order_data: orderData,
        };

        logPayment('Checkout API Request', 'Sending POST /frontend/paytabs/checkout', payload);

        const checkoutRes = await api.post('/frontend/paytabs/checkout', payload, getIdempotencyConfig(pendingPayment.idempotencyKey));

        const rawUrl = extractPaymentUrl(checkoutRes);
        if (!rawUrl) throw new Error('No payment URL returned from gateway');
        const url = requireSecureUrl(rawUrl, 'PayTabs redirect URL');

        logPayment('Checkout API Response', `Received PayTabs Payment URL: "${url}"`);
        logPayment('Redirecting', `Redirecting browser to PayTabs Gateway page...`);

        // Open Paytabs in the same tab. The cart is intentionally untouched.
        window.location.href = url;
        return;
      } catch (error) {
        logPayment('Checkout API Error', `Failed to initialize PayTabs session: ${error.message}`, error);
        throw error;
      }
    }

    const orderAttempt = getOrCreateOrderAttempt(orderData);
    let createdOrder;
    try {
      const response = await api.post(
        '/frontend/orders',
        orderData,
        getIdempotencyConfig(orderAttempt.idempotencyKey)
      );
      createdOrder = extractCreatedOrder(response);
    } catch (requestError) {
      // An idempotent backend may answer a replay with 409 and include the
      // already-created order. Reconcile only when it explicitly proves that
      // the order belongs to this exact idempotency key.
      if (requestError.response?.status === 409) {
        createdOrder = extractMatchingConflictOrder(requestError.response, {
          idempotencyKey: orderAttempt.idempotencyKey,
        });
      }
      if (!createdOrder) throw requestError;
    }
    if (!createdOrder) throw new Error('Order API did not return a confirmed order');

    // Commit the UI order state first. Cart cleanup is intentionally last and
    // removes only the quantities included in this confirmed order.
    lastPurchasedItems.value = displayReviewItems.value.map(it => ({
      id: it.id,
      name: it.name,
      quantity: it.quantity,
      price: it.price
    }));
    lastPurchasedTotal.value = grandTotal.value;
    lastPurchasedDate.value = new Date().toLocaleDateString(currentLocale.value === 'ar' ? 'ar-SA' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    confirmedOrder.value = createdOrder;
    currentStep.value = 5;

    // Meta Pixel Track Purchase Event when checkout is completed
    trackPurchase({
      orderId: createdOrder.order?.order_number || createdOrder.order?.number || createdOrder.order?.id || createdOrder.order_number || createdOrder.number || createdOrder.id,
      totalValue: createdOrder.order?.total_amount || createdOrder.order?.total || createdOrder.total_amount || createdOrder.total || orderData.total_amount || 0,
      items: orderData.items || [],
    }, currency.value || 'JOD');
    if (useWallet.value) await fetchWalletBalance();
    let cartCleanupSucceeded = false;
    try {
      cartState.removePurchasedItems(orderData.items, {
        expectedOwner: orderAttempt.owner,
      });
      cartCleanupSucceeded = true;
    } catch (cleanupError) {
      // The server order is already confirmed. A local storage issue must not
      // turn the success UI back into a failed-order message.
      console.error('Confirmed order cart cleanup failed:', cleanupError);
    }

    // Keep the idempotency attempt if local cleanup failed. A reload/retry will
    // then reuse the same server-side key instead of risking a second order.
    if (cartCleanupSucceeded) {
      try {
        clearOrderAttempt(localStorage, orderAttempt.idempotencyKey, orderData);
      } catch (storageError) {
        console.error('Failed to clear completed order attempt:', storageError);
      }
    }

    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('order:created', { detail: createdOrder.order }));
      } catch (_) {
        // The event is only an optional UI refresh hint.
      }
    }
  } catch (err) {
    console.error('Order error:', err);
    const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
    alert(errorMsg || t('checkout.order_error'));
  } finally {
    orderSubmitting.value = false;
  }
};

const prevStep = () => {
  if (currentStep.value > 2) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const getImageUrl = (path, id) => {
  const rawPath = typeof path === 'object' && path !== null
    ? (path.image_url || path.url || path.image || path.path || '')
    : path;
  if (rawPath && (String(rawPath).startsWith('/') || String(rawPath).startsWith('http'))) {
    return rawPath;
  }
  if (!rawPath) return id ? `/catalog_images/prod_${id}.jpg` : '/images/home/product_ceramic_hob_60.png';
  const baseUrl = (api.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api');
  if (String(rawPath).includes('catalog_images')) return `/${String(rawPath).replace(/^\//, '')}`;
  return `${baseUrl.replace('/api', '')}/storage/${rawPath}`;
};

const onImageError = (event, item) => {
  const target = event.target;
  if (!target) return;
  if (item?.id && !target.src.includes(`prod_${item.id}.jpg`)) {
    target.src = `/catalog_images/prod_${item.id}.jpg`;
  } else if (!target.src.includes('product_ceramic_hob_60.png')) {
    target.src = '/images/home/product_ceramic_hob_60.png';
  }
};

const formatPrice = (price) => {
  const val = parseFloat(price);
  return isNaN(val) ? '0.00' : val.toLocaleString('en-US', { minimumFractionDigits: 2 });
};

const getPaymentLabel = (key) => {
  const labels = {
    card: t('checkout.card'),
    cod: t('checkout.payment_methods.cash_on_delivery'),
    wallet: t('checkout.payment_methods.wallet')
  };
  return labels[key] || '';
};
</script>

<style scoped>
.checkout-page {
  padding: 160px 0 100px;
  background: #fdfcfd;
  min-height: 100vh;
}

.container-checkout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

/* Progress Bar */
.checkout-progress-wrapper {
  margin-bottom: 60px;
}

.checkout-progress {
  display: flex;
  justify-content: space-between;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.progress-line {
  position: absolute;
  top: 18px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #e5e7eb;
  z-index: 1;
}

.step-item {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100px;
}

.step-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #9ca3af;
  transition: all 0.3s;
}

.step-label {
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
}

.step-item.active .step-circle {
  border-color: #000000;
  color: #000000;
  box-shadow: 0 0 0 5px rgba(135, 50, 96, 0.1);
}

.step-item.active .step-label {
  color: #000000;
  font-weight: 700;
}

.step-item.completed .step-circle {
  background: #000000;
  border-color: #000000;
  color: #fff;
}

.step-item.completed .step-label {
  color: #111827;
}

/* Layout */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  align-items: start;
}

.confirmation-layout {
  grid-template-columns: 1fr;
}

/* Step Container */
.step-container {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(135, 50, 96, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 18px;
}

.header-text h2 {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.header-text p {
  color: #6b7280;
  margin: 5px 0 0;
  font-size: 14px;
}

.saved-addresses-btn {
  margin-right: auto;
  background: none;
  border: none;
  color: #000000;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* Address Cards */
.address-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.address-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  border: 2px solid #f3f4f6;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-card input {
  position: absolute;
  opacity: 0;
}

.address-card.active {
  border-color: #000000;
  background: rgba(135, 50, 96, 0.01);
}

.address-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: #111827;
  font-size: 18px;
  margin-bottom: 12px;
}

.address-title i { color: #000000; }

.default-badge {
  background: #f3f4f6;
  color: #db2777;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
}

.address-owner { font-weight: 700; margin-bottom: 8px; }
.address-details { color: #6b7280; margin-bottom: 5px; font-size: 14px; }
.address-phone { color: #6b7280; direction: ltr; font-size: 14px; }

.radio-circle {
  width: 22px;
  height: 22px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.address-card.active .radio-circle,
.payment-card.active .radio-circle {
  border-color: #000000;
}

.radio-circle::after {
  content: '';
  width: 10px;
  height: 10px;
  background: #000000;
  border-radius: 50%;
  opacity: 0;
}

.address-card.active .radio-circle::after,
.payment-card.active .radio-circle::after {
  opacity: 1;
}

.add-address-btn {
  border: 2px dashed #e5e7eb;
  background: none;
  padding: 24px;
  border-radius: 20px;
  color: #9ca3af;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-address-btn:hover {
  border-color: #000000;
  color: #000000;
}

/* Payment Cards */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border: 2px solid #f3f4f6;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-card input { position: absolute; opacity: 0; }
.payment-card.active { border-color: #000000; background: rgba(135, 50, 96, 0.01); }

.payment-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #000000;
}

.payment-title { display: block; font-weight: 700; font-size: 16px; margin-bottom: 4px; }
.payment-desc { color: #9ca3af; font-size: 13px; }

/* Review Section */
.review-section {
  background: #fcfafb;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.review-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.review-items { display: flex; flex-direction: column; gap: 15px; }
.review-item { display: flex; align-items: center; gap: 15px; }
.review-item img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; }
.review-item .item-info h3 { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
.item-variant-info { font-size: 12px; color: #4b5563; font-weight: 600; margin-bottom: 4px; }
.review-item .item-info span { color: #9ca3af; font-size: 13px; }
.review-item .item-price { margin-right: auto; font-weight: 800; color: #000000; }

.review-summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.review-data-content p { color: #4b5563; font-size: 14px; margin-bottom: 8px; }

/* New Step Header */
.checkout-step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-main .header-title {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.header-main .header-subtitle {
  color: #9ca3af;
  font-size: 14px;
  margin-top: 4px;
}

.header-icon-box {
  width: 54px;
  height: 54px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 22px;
}

/* ===================================================
   Step 2: Registered Addresses (Figma 1:1 Design)
   =================================================== */
.step-address-step {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.registered-addresses {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 24px;
  gap: 16px;
  width: 100%;
  max-width: 880px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: rtl;
}

/* address-tabs */
.address-tabs-bar {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0px 16px;
  gap: 12px;
  width: 100%;
  min-height: 64px;
  border-bottom: 1px solid #E2E8F0;
  border-radius: 0px;
}

.add-new-address-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
}

.tabs-actions-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

/* Secondary Button (Figma) */
.btn-secondary-tab {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  gap: 8px;
  height: 48px;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-secondary-tab:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

/* Primary Button (Figma) */
.btn-primary-tab {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  gap: 8px;
  height: 48px;
  background: #000000;
  border: 1.5px solid #000000;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-tab-my-addr {
  width: 87px;
}

.btn-tab-other {
  width: 116px;
}

.btn-tab-add-new {
  width: 167px;
}

/* State 1: Saved Addresses View */
.saved-addresses-view {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  width: 100%;
}

.registered-addresses-title {
  width: 100%;
  height: 27px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  text-align: right;
  color: #000000;
}

.addresses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}

@media (max-width: 768px) {
  .addresses-grid {
    grid-template-columns: 1fr;
  }
}

.address-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  gap: 12px;
  min-height: 151px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.address-card:hover {
  border-color: #CBD5E1;
}

.address-card.selected {
  border: 2px solid #E2E8F0;
}

/* Card Header */
.card-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: 100%;
  height: 24px;
}

.addr-person-name {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

/* Selection Indicator (Radio button) */
.selection-indicator {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  border-radius: 9999px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.selection-indicator.active {
  border: 2px solid #000000;
}

.selection-indicator .indicator-inner {
  width: 10px;
  height: 10px;
  background: #000000;
  border-radius: 9999px;
}

/* Address details */
.address-details {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 6px;
  width: 100%;
}

.address-details .detail-line {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
}

/* State 2: Form Fields */
.form-fields {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 20px;
  width: 100%;
}

.field-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 8px;
  width: 100%;
}

.field-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #000000;
}

.form-input {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 16px;
  width: 100%;
  height: 44px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-align: right;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #000000;
}

.form-input::placeholder {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

/* Phone input container */
.phone-input-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 16px;
  width: 100%;
  height: 44px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

.phone-input-wrapper:focus-within {
  border-color: #000000;
}

.phone-country-code {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  direction: ltr;
  user-select: none;
}

.phone-line-divider {
  box-sizing: border-box;
  width: 1px;
  height: 16px;
  background: #E2E8F0;
  margin: 0 10px;
}

.phone-input-field {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-align: right;
}

.phone-input-field::placeholder {
  color: #64748B;
}

/* Dual Column Row for City and Region */
.frame-12-dual-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 20px;
  width: 100%;
}

.frame-12-dual-row .field-type {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 640px) {
  .frame-12-dual-row {
    flex-direction: column;
  }
}

/* Select wrapper and custom styles */
.select-wrapper {
  position: relative;
  width: 100%;
  height: 44px;
}

.form-select-custom {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 0px 16px 0px 36px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #000000;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-select-custom.is-placeholder {
  color: #64748B;
}

.form-select-custom.select-bg-white {
  background-color: #FFFFFF;
}

.form-select-custom.select-bg-slate {
  background-color: #F1F5F9;
}

.form-select-custom:focus {
  border-color: #000000;
}

.select-arrow-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

/* Textarea */
.form-textarea {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 12px 16px;
  width: 100%;
  height: 120px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #000000;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  border-color: #000000;
}

.form-textarea::placeholder {
  color: #64748B;
}

/* Checkbox Row */
.checkbox-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: 100%;
  height: 21px;
}

.checkbox-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #000000;
}

.checkbox-box-custom {
  width: 16px;
  height: 16px;
  border: 1.5px solid #000000;
  border-radius: 3px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-box-custom.checked {
  background: #000000;
}

/* Primary Button (متابعة) */
.submit-continue-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  gap: 8px;
  width: 100%;
  height: 48px;
  background: #000000;
  border: none;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #FFFFFF;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.submit-continue-btn:hover {
  opacity: 0.9;
}

.submit-continue-btn:active {
  transform: scale(0.99);
}

/* ===================================================
   Step 3: Payment Method (Figma 1:1 Design)
   =================================================== */
.step-payment-step {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

/* payment-content-area */
.payment-content-area {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
  max-width: 880px;
  border-radius: 0px;
  flex: none;
  order: 1;
  flex-grow: 1;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: rtl;
}

/* payment-method-card */
.payment-method-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  gap: 16px;
  width: 100%;
  max-width: 880px;
  min-height: 117px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.payment-method-card:hover {
  border-color: #CBD5E1;
}

.payment-method-card.card-credit {
  min-height: 109px;
  border: 2px solid #E2E8F0;
  align-items: flex-end;
}

.payment-method-card.card-credit:hover {
  border-color: #CBD5E1;
}

/* card-header */
.payment-method-card .card-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 32px;
  border-radius: 0px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

/* header-right */
.payment-method-card .header-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 12px;
  height: 24px;
  border-radius: 0px;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* radio-btn */
.payment-method-card .radio-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  border-radius: 9999px;
  flex: none;
  flex-shrink: 0;
  order: 0;
  flex-grow: 0;
  transition: border-color 0.2s ease;
}

.payment-method-card .radio-btn.selected {
  border: 2px solid #000000;
}

.payment-method-card .radio-inner-dot {
  width: 10px;
  height: 10px;
  background: #000000;
  border-radius: 9999px;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* method-title (استخدام رصيد المحفظة / الدفع عند الاستلام / بطاقة ائتمانية) */
.payment-method-card .method-title {
  height: 24px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* method-icon-container */
.payment-method-card .method-icon-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 32px;
  height: 32px;
  border-radius: 0px;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.payment-method-card .method-icon-container svg {
  width: 24px;
  height: 24px;
  border-radius: 0px;
  flex: none;
  flex-shrink: 0;
}

.payment-method-card .icon-truck {
  transform: scaleX(-1);
}

/* card-content */
.payment-method-card .card-content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 100%;
  border-radius: 0px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

/* wallet-info */
.wallet-info-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 0px 0px;
  gap: 4px;
  height: 29px;
  border-radius: 0px;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.wallet-desc-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.riyal-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10.65px;
  height: 11.9px;
  border-radius: 0px;
  color: #64748B;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.riyal-icon-wrapper svg {
  width: 10.65px;
  height: 11.9px;
}

/* cod & credit card descriptions */
.method-desc-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 8px 0px 0px;
  width: 100%;
  border-radius: 0px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

.method-desc-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* Wallet Active Summary Box */
.wallet-active-summary {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  width: 100%;
  max-width: 880px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  direction: rtl;
}

.wallet-active-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #334155;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.wallet-active-row .val-green {
  color: #16A34A;
  font-weight: 600;
}

.wallet-active-row.is-remaining {
  border-top: 1px dashed #E2E8F0;
  padding-top: 8px;
  font-weight: 700;
  color: #0F172A;
}

.wallet-fully-paid {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #16A34A;
  font-weight: 600;
  margin-top: 4px;
}

/* ===================================================
   Step 4: Order Review (Figma 1:1 Design)
   =================================================== */
.step-review-step {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

/* review-blocks */
.review-blocks {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 24px;
  width: 100%;
  max-width: 880px;
  border-radius: 0px;
  flex: none;
  order: 1;
  flex-grow: 1;
  direction: rtl;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

/* ReviewSectionCard / ReviewProducts */
.review-card-box {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 16px;
  width: 100%;
  max-width: 880px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

/* section-header */
.review-card-box .review-section-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 27px;
  border-radius: 0px;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

.review-section-header .section-title {
  height: 27px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  color: #000000;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.review-section-header .edit-link-btn {
  height: 21px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  flex: none;
  order: 1;
  flex-grow: 0;
}

.review-section-header .edit-link-btn:hover {
  color: #000000;
}

/* Line divider */
.review-card-box .review-divider-line {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border-bottom: 1px solid #E2E8F0;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

/* products-list */
.review-products-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

/* product-item */
.review-product-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

/* item-content */
.review-item-content {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 16px;
  width: 100%;
  min-height: 80px;
  border-radius: 0px;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
  overflow: hidden;
}

/* product-thumb (far right in RTL) */
.review-product-thumb {
  box-sizing: border-box;
  width: 80px;
  height: 80px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  object-fit: cover;
  background-color: #F8FAFC;
  flex-shrink: 0;
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* item-details */
.review-item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  order: 1;
  flex-grow: 1;
}

.review-item-name {
  display: block;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 100%;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

.review-item-sku {
  display: block;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #64748B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 100%;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

.review-item-specs {
  display: block;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: right;
  color: #64748B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 100%;
  flex: none;
  order: 2;
  align-self: stretch;
  flex-grow: 0;
}

/* qty-display */
.review-qty-display {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 12px;
  height: 29px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  flex: none;
  flex-shrink: 0;
  order: 2;
  flex-grow: 0;
}

.review-qty-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  white-space: nowrap;
}

/* item-price (far left in RTL) */
.review-item-price {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
  height: 24px;
  border-radius: 0px;
  flex: none;
  flex-shrink: 0;
  order: 3;
  flex-grow: 0;
}

.review-price-num {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.review-riyal-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12.17px;
  height: 13.6px;
  color: #111827;
}

.review-riyal-symbol svg {
  width: 12.17px;
  height: 13.6px;
}

/* Line divider between products */
.review-item-divider {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border-bottom: 1px solid #F1F5F9;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

/* Card 2: Address details */
.review-address-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 6px;
  width: 100%;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

.review-address-name {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.review-address-line {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  text-align: right;
}

.review-address-line.is-phone {
  direction: ltr;
  text-align: right;
}

/* Card 3: Payment details */
.review-payment-details {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 100%;
  height: 24px;
  border-radius: 0px;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
}

.review-payment-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.review-payment-icon svg {
  width: 24px;
  height: 24px;
}

.review-payment-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.review-payment-sub {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  direction: ltr;
}

@media (max-width: 640px) {
  .review-item-content {
    flex-wrap: wrap;
    height: auto;
    gap: 12px;
  }
  .review-item-details {
    height: auto;
  }
}

/* Action Buttons New */
.action-buttons-new {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  gap: 15px;
}

.btn-checkout-primary {
  background: #000000;
  color: #fff;
  border: none;
  padding: 15px 40px;
  border-radius: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-checkout-primary:hover {
  background: #4a1936;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(135, 50, 96, 0.2);
}

.btn-checkout-secondary {
  background: #fff;
  color: #4b5563;
  border: 1.5px solid #e5e7eb;
  padding: 15px 40px;
  border-radius: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-checkout-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-checkout-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

.back-btn {
  padding: 16px 32px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4b5563;
  cursor: pointer;
}

.next-btn {
  padding: 16px 60px;
  background: #000000; /* Primary Dark Mauve */
  color: #fff;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.next-btn:hover { background: #4a1936; box-shadow: 0 10px 20px rgba(135, 50, 96, 0.2); }

/* summary-card (Figma 1:1 Design) */
.summary-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 24px;
  gap: 20px;
  width: 400px;
  max-width: 100%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  position: sticky;
  top: 100px;
}

/* ملخص المشتريات */
.summary-card-title {
  width: 100%;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  text-align: right;
  color: #000000;
}

/* Line */
.summary-card-divider {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border: none;
  border-top: 1px solid #E2E8F0;
  margin: 0;
}

/* summary-rows */
.summary-card-rows {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 12px;
  width: 100%;
}

/* row-subtotal / row-vat / row-shipping / row-discount */
.summary-card-row {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  min-height: 24px;
}

.summary-card-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #64748B;
  text-align: right;
}

/* price-unit */
.summary-card .price-unit {
  direction: ltr;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
}

.summary-card .price-unit .price-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.summary-card .discount-unit .minus-sign {
  font-weight: 700;
  font-size: 16px;
  color: #dc2626;
}
.summary-card .discount-unit .price-val {
  color: #dc2626;
}

.summary-card .riyal-icon {
  display: inline-block;
  vertical-align: middle;
  color: #111827;
  flex-shrink: 0;
}

.summary-card .summary-riyal {
  width: 11.41px;
  height: 12.75px;
}

/* row-total */
.summary-card-row-total {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 36px;
}

.summary-card-row-total .total-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  color: #000000;
  text-align: right;
}

.summary-card-row-total .total-price-unit {
  direction: ltr;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
}

.summary-card-row-total .total-riyal {
  width: 16.73px;
  height: 18.7px;
  color: #111827;
  flex-shrink: 0;
}

.summary-card-row-total .total-price-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  color: #000000;
}

/* summary-actions */
.summary-card .summary-actions {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 12px;
  width: 100%;
}

/* primary-button */
.summary-card .primary-button {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  gap: 8px;
  width: 100%;
  height: 56px;
  background: #000000;
  border-radius: 6px;
  border: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #FFFFFF;
  cursor: pointer;
  transition: opacity 0.2s, background-color 0.2s;
}

.summary-card .primary-button:hover:not(:disabled) {
  background: #1f2937;
}

.summary-card .primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* secondary-button */
.summary-card .secondary-button {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  gap: 8px;
  width: 100%;
  height: 56px;
  background: #FFFFFF;
  border: 1.5px solid #000000;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.summary-card .secondary-button:hover:not(:disabled) {
  background: #F8FAFC;
}

.summary-card .secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Coupon Styling in Summary Card */
.summary-coupon-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-coupon-toggle {
  background: none;
  border: none;
  padding: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  transition: color 0.2s;
}

.summary-coupon-toggle:hover {
  color: #000000;
}

.summary-coupon-box {
  display: flex;
  gap: 8px;
  width: 100%;
}

.summary-coupon-box input {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 14px;
  outline: none;
}

.summary-coupon-box input:focus {
  border-color: #000000;
}

.summary-coupon-apply {
  height: 40px;
  padding: 0 16px;
  background: #000000;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.summary-coupon-apply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.summary-coupon-msg {
  font-size: 12px;
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.summary-coupon-msg.success { color: #16a34a; }
.summary-coupon-msg.error { color: #dc2626; }

.summary-coupon-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F1F5F9;
  padding: 8px 12px;
  border-radius: 6px;
  width: 100%;
}

.coupon-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #0F172A;
}

.coupon-remove-btn {
  background: none;
  border: none;
  color: #EF4444;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
}

/* receipt-card (Figma 1:1 Design) */
.receipt-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 720px;
  margin: 20px auto 60px;
}

.receipt-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  gap: 24px;
  width: 720px;
  max-width: 100%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

/* success-header */
.receipt-success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 16px;
  width: 100%;
}

.receipt-checkmark-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  background: #D0FAE5;
  border-radius: 9999px;
  flex-shrink: 0;
}

.receipt-title {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 32px;
  line-height: 48px;
  text-align: center;
  color: #000000;
}

.receipt-subtitle {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  text-align: center;
  color: #64748B;
}

/* order-meta */
.receipt-order-meta {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 8px;
  width: 500px;
  max-width: 100%;
  background: #F1F5F9;
  border-radius: 8px;
}

.receipt-meta-order-number {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  color: #000000;
}

.receipt-meta-order-date {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #64748B;
}

.receipt-meta-order-note {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #64748B;
}

/* Section Title */
.receipt-section-title {
  width: 100%;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 30px;
  text-align: right;
  color: #000000;
}

/* Lines */
.receipt-divider-line {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border: none;
  border-top: 1px solid #E2E8F0;
  margin: 0;
}

.receipt-divider-line-light {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border: none;
  border-top: 1px solid #F1F5F9;
  margin: 0;
}

/* receipt-products */
.receipt-products {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 12px;
  width: 100%;
}

.receipt-product-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-height: 24px;
}

.receipt-product-name-qty {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #64748B;
  text-align: right;
}

.receipt-price-unit {
  direction: ltr;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
}

.receipt-riyal {
  width: 12.17px;
  height: 13.6px;
  color: #111827;
  flex-shrink: 0;
}

.receipt-price-unit .price-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

/* info-columns */
.receipt-info-columns {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px;
  gap: 24px;
  width: 100%;
}

.receipt-info-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.receipt-col-address {
  text-align: right;
  align-items: flex-start;
}

.receipt-col-payment {
  text-align: right;
  align-items: flex-start;
}

.receipt-col-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

.receipt-col-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

.receipt-col-sub {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

/* receipt-total */
.receipt-total-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 36px;
}

.receipt-total-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #64748B;
  text-align: right;
}

.receipt-total-unit {
  direction: ltr;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
}

.receipt-total-riyal {
  width: 16.73px;
  height: 18.7px;
  color: #111827;
  flex-shrink: 0;
}

.receipt-total-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  color: #000000;
}

/* Receipt Actions */
.receipt-actions-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  width: 100%;
}

.receipt-btn-primary {
  min-width: 180px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 28px;
  background: #000000;
  color: #FFFFFF;
  border-radius: 8px;
  text-decoration: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 700;
  font-size: 15px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.receipt-btn-primary:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.receipt-btn-secondary {
  min-width: 180px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 28px;
  background: #FFFFFF;
  color: #000000;
  border: 1.5px solid #000000;
  border-radius: 8px;
  text-decoration: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 700;
  font-size: 15px;
  transition: all 0.2s ease;
}

.receipt-btn-secondary:hover {
  background-color: #F8FAFC;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .receipt-card {
    padding: 20px;
    gap: 16px;
    width: 100%;
  }
  .receipt-order-meta {
    width: 100%;
  }
  .receipt-info-columns {
    flex-direction: column;
    gap: 16px;
  }
  .receipt-actions-wrapper {
    flex-direction: column;
    width: 100%;
  }
  .receipt-btn-primary, .receipt-btn-secondary {
    width: 100%;
    min-width: unset;
    text-align: center;
  }
}

/* Animation */
.fadeIn { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Form */
.checkout-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-weight: 700;
  color: #111827;
  font-size: 14px;
}

.form-group label .required {
  color: #ef4444;
}

.form-group input, 
.form-group textarea {
  padding: 14px 18px;
  border: 1.5px solid #f3f4f6;
  border-radius: 12px;
  background: #fcfafc;
  transition: all 0.3s;
  font-family: inherit;
  font-size: 15px;
}

.form-group input:focus, 
.form-group textarea:focus {
  border-color: #000000;
  outline: none;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(135, 50, 96, 0.05);
}

/* Coupon */
.coupon-section {
  padding: 20px 0;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 20px;
}

.coupon-input-group {
  display: flex;
  gap: 10px;
}

.coupon-input-group input {
  flex: 1;
  padding: 12px 15px;
  border: 1.5px solid #f3f4f6;
  border-radius: 10px;
  font-size: 14px;
}

.coupon-input-group button {
  padding: 0 20px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.apply-btn { background: #000000; color: #fff; }
.remove-btn { background: #fee2e2; color: #ef4444; }

.coupon-msg { font-size: 12px; margin-top: 8px; font-weight: 600; }
.coupon-msg.success { color: #10b981; }
.coupon-msg.error { color: #ef4444; }

.discount-val { color: #10b981; font-weight: 800; }

.sidebar-items-scroll {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 5px;
}

.sidebar-items-scroll::-webkit-scrollbar { width: 4px; }
.sidebar-items-scroll::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 10px; }

.payment-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

/* Wallet Card Styles */
.wallet-card {
  background: linear-gradient(135deg, #8E2DE2 0%, #C94B4B 0.1);
}

.wallet-card.active {
  border-color: #8E2DE2;
  background: linear-gradient(135deg, rgba(142, 45, 226, 0.05) 0%, rgba(201, 75, 75, 0.05) 100%);
}

.wallet-amount {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #8E2DE2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wallet-summary {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
}

.wallet-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.wallet-summary-row:last-child {
  border-bottom: none;
}

.wallet-summary-row.remaining {
  font-weight: 700;
  color: #000000;
  font-size: 16px;
  padding-top: 16px;
}

.wallet-fully-paid {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #d1fae5;
  border-radius: 12px;
  color: #059669;
  font-size: 14px;
  font-weight: 600;
}

.wallet-fully-paid i {
  font-size: 18px;
}

@media (max-width: 1024px) {
  .checkout-layout { grid-template-columns: 1fr; gap: 24px; }
  .order-summary-sidebar { position: static; order: -1; }
  .review-summary-grid { grid-template-columns: 1fr; gap: 15px; }
  .container-checkout { padding: 0 24px; }
  .step-container { padding: 30px 24px; }
  .checkout-progress-wrapper { margin-bottom: 40px; }
}

/* Gift Option Styles */
.gift-option-section {
  margin-top: 30px;
}

.gift-toggle-card {
  display: block;
  background: #fff;
  border: 1.5px solid #f3f4f6;
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gift-toggle-card.active {
  border-color: #000000;
  box-shadow: 0 10px 30px rgba(135, 50, 96, 0.05);
}

.gift-toggle-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.gift-icon-box {
  width: 54px;
  height: 54px;
  background: #f3f4f6;
  color: #000000;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  transition: all 0.3s;
}

.gift-toggle-card.active .gift-icon-box {
  background: #000000;
  color: #fff;
  transform: rotate(-10deg) scale(1.1);
}

.gift-text-box {
  flex: 1;
}

.gift-title {
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 4px;
}

.gift-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.gift-switch {
  position: relative;
  width: 50px;
  height: 26px;
}

.gift-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #e5e7eb;
  transition: .4s;
  border-radius: 34px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.gift-switch input:checked + .switch-slider {
  background-color: #000000;
}

.gift-switch input:checked + .switch-slider:before {
  transform: translateX(24px);
}

.gift-message-box {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px dashed #f3f4f6;
}

.gift-message-box label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.gift-message-box textarea {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-family: inherit;
  resize: none;
  font-size: 14px;
  transition: all 0.3s;
}

.gift-message-box textarea:focus {
  outline: none;
  border-color: #000000;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(135, 50, 96, 0.05);
}

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}


/* Add Address Form v3 (Figma) */
.add-address-form-v3 {
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  background: #fff;
  margin-top: 10px;
}

.form-v3-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.form-v3-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-v3-title::after {
  content: '+';
  color: #000000;
  font-weight: 400;
}

.close-v3-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
}

.save-addr-v3-btn {
  width: 100%;
  background: #ba99ab; /* Light maroon as in figma */
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 20px;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.save-addr-v3-btn:hover:not(:disabled) {
  background: #000000;
}

.save-addr-v3-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  /* Page & layout */
  .checkout-page { padding: 100px 0 50px; }
  .container-checkout { padding: 0 12px; }
  .checkout-layout { gap: 16px; }

  /* Progress bar */
  .checkout-progress-wrapper { margin-bottom: 24px; }
  .checkout-progress { scale: 0.7; transform-origin: center; }

  /* Step container */
  .step-container { padding: 16px 14px; border-radius: 16px; }
  .checkout-step-header { margin-bottom: 16px; gap: 10px; }
  .header-main .header-title { font-size: 18px; }
  .header-main .header-subtitle { font-size: 12px; }
  .header-icon-box { width: 42px; height: 42px; font-size: 16px; border-radius: 12px; }
  .step-header { gap: 12px; margin-bottom: 20px; }
  .header-icon { width: 38px; height: 38px; font-size: 15px; }
  .header-text h2 { font-size: 18px; }
  .header-text p { font-size: 12px; }

  /* Forms */
  .checkout-form-grid { grid-template-columns: 1fr; gap: 12px; }
  .form-group.full-width { grid-column: span 1; }
  .form-row-new.dual { grid-template-columns: 1fr !important; gap: 12px; }
  .add-address-form-v3 { padding: 16px 14px; }
  .form-v3-header { margin-bottom: 16px; }
  .form-v3-title { font-size: 16px; }

  /* Address tabs & cards */
  .address-tabs-bar { flex-wrap: wrap; gap: 10px; min-height: auto; }
  .add-new-address-wrapper { width: 100%; order: 2; }
  .btn-tab-add-new { width: 100%; }
  .tabs-actions-group { width: 100%; justify-content: flex-end; order: 1; }
  .addresses-grid { grid-template-columns: 1fr; }
  .address-card { padding: 16px; border-radius: 8px; }
  .registered-addresses { padding: 16px; }

  /* Gift */
  .gift-option-section { margin-top: 18px; }
  .gift-toggle-card { padding: 14px 12px; border-radius: 14px; }
  .gift-toggle-header { gap: 12px; }
  .gift-icon-box { width: 42px; height: 42px; font-size: 17px; border-radius: 12px; }
  .gift-title { font-size: 14px; }
  .gift-desc { font-size: 11.5px; }
  .gift-message-box { margin-top: 14px; padding-top: 14px; }

  /* Payment */
  .payment-options { gap: 10px; }
  .payment-card { padding: 14px 12px; gap: 12px; border-radius: 14px; }
  .payment-icon { width: 38px; height: 38px; font-size: 15px; }
  .payment-title { font-size: 14px; }
  .payment-desc { font-size: 11.5px; }

  /* Review */
  .review-section { padding: 14px 12px; margin-bottom: 14px; border-radius: 14px; }
  .review-section-header { gap: 10px; font-size: 14px; }
  .review-items { gap: 10px; }
  .review-item { gap: 10px; }
  .review-item img { width: 48px; height: 48px; border-radius: 10px; }
  .review-item .item-info h3 { font-size: 13.5px; }
  .review-item .item-info span { font-size: 11.5px; }
  .review-summary-grid { gap: 12px; }
  .review-data-content p { font-size: 12.5px; margin-bottom: 5px; }

  /* Sidebar summary */
  .order-summary-sidebar { padding: 16px 14px; border-radius: 16px; }
  .sidebar-totals { gap: 10px; }
  .total-row { font-size: 13.5px; }
  .grand-total { font-size: 17px; padding-top: 12px; }
  .coupon-section { padding: 14px 0; margin-bottom: 14px; }
  .coupon-input-group input { padding: 10px 12px; font-size: 13px; }
  .coupon-input-group button { padding: 0 14px; font-size: 13px; }

  /* Wallet */
  .wallet-summary-row { font-size: 12.5px; }
  .wallet-summary-row.remaining { font-size: 14px; }

  /* Actions */
  .next-btn { padding: 14px 24px; font-size: 14px; flex: 1; }
  .back-btn { padding: 14px 16px; font-size: 14px; }

  /* Confirmation */
  .confirmation-container { padding: 20px 10px; }
  .success-title { font-size: 22px; }
  .success-actions { flex-direction: column; gap: 10px; }
  .success-actions a { width: 100%; text-align: center; }
}
</style>
