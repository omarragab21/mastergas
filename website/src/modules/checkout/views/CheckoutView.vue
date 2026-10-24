<template>
  <div class="checkout-page">
    <div class="container container-checkout">
      <CheckoutProgress :current-step="currentStep" :steps="progressSteps" />

      <div class="checkout-layout" :class="{ 'confirmation-layout': currentStep === 5 }">
        <!-- Main Content (Steps) -->
        <div class="main-checkout-content">
          <div
            v-if="checkoutStockError"
            class="checkout-unavailable-warning"
            :class="{ 'is-ltr': currentLocale !== 'ar' }"
            role="alert"
          >
            <svg class="checkout-unavailable-warning-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2" />
              <path d="M12 7.5v5.5M12 16.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span>{{ t('cart.unavailable_product', { name: checkoutUnavailableName }) }}</span>
          </div>
          
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
                    <span>{{ t('checkout.other_recipient') }}</span>
                  </button>

                  <!-- عنواني -->
                  <button 
                    type="button" 
                    class="btn-tab-my-addr" 
                    :class="addressTab === 'saved' ? 'btn-primary-tab' : 'btn-secondary-tab'"
                    @click="switchToSavedAddresses"
                  >
                    <span>{{ t('checkout.my_address') }}</span>
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
                    <span>{{ t('checkout.add_new_address') }}</span>
                  </button>
                </div>
              </div>

              <!-- State 1: عنواني (Saved Addresses) -->
              <div v-if="addressTab === 'saved'" class="saved-addresses-view">
                <div class="registered-addresses-title">{{ t('checkout.registered_addresses') }}</div>

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
                        <span>{{ t('checkout.phone_label') }}: <span class="phone-ltr" dir="ltr">{{ addr.phone }}</span></span>
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
                  <label class="field-label">{{ t('checkout.recipient_name') }}</label>
                  <input 
                    type="text" 
                    v-model="customerInfo.name" 
                    class="form-input" 
                    :placeholder="t('checkout.recipient_name_enter')" 
                    required 
                  />
                </div>

                <!-- field-phone -->
                <div class="field-group field-phone">
                  <label class="field-label">{{ t('checkout.mobile_number') }}</label>
                  <div class="phone-input-wrapper" dir="ltr">
                    <span class="phone-country-code">+966</span>
                    <div class="phone-line-divider"></div>
                    <input 
                      type="tel" 
                      v-model="customerInfo.phone" 
                      class="phone-input-field" 
                      placeholder="5XXXXXXXX" 
                      dir="ltr"
                      required 
                    />
                  </div>
                </div>

                <!-- Frame 12: Dual row for City and Region -->
                <div class="frame-12-dual-row">
                  <!-- Region (المنطقة) - Left column in RTL -->
                  <div class="field-group field-type">
                    <label class="field-label">{{ t('checkout.region') }}</label>
                    <div class="select-wrapper">
                      <select 
                        v-model="customerInfo.region" 
                        class="form-select-custom select-bg-slate"
                        :class="{ 'is-placeholder': !customerInfo.region }"
                      >
                        <option value="" disabled selected>{{ t('checkout.choose_region') }}</option>
                        <option v-for="reg in regionsList" :key="reg" :value="reg">
                          {{ placeLabelFor(reg, currentLocale) }}
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
                    <label class="field-label">{{ t('checkout.city') }}</label>
                    <input
                      v-model="customerInfo.city"
                      type="text"
                      class="form-input"
                      :placeholder="t('checkout.city_enter')"
                      required
                    />
                  </div>
                </div>

                <!-- field-message: العنوان بالتفصيل -->
                <div class="field-group field-message">
                  <label class="field-label">{{ t('checkout.address_details_label') }}</label>
                  <textarea 
                    v-model="customerInfo.address" 
                    class="form-textarea" 
                    :placeholder="t('checkout.address_details_placeholder')" 
                    rows="4"
                    required
                  ></textarea>
                </div>

                <!-- field-message: ملاحظات التوصيل (اختياري) -->
                <div class="field-group field-message">
                  <label class="field-label">{{ t('checkout.delivery_notes_optional') }}</label>
                  <textarea 
                    v-model="customerInfo.notes" 
                    class="form-textarea" 
                    :placeholder="t('checkout.delivery_notes_placeholder')" 
                    rows="4"
                  ></textarea>
                </div>

                <!-- primary-button: متابعة -->
                <button type="submit" class="submit-continue-btn">
                  {{ t('checkout.continue') }}
                </button>
              </form>
            </div>
          </div>

          <!-- Step 3: Payment Method (Figma 1:1 Design) -->
          <div v-if="currentStep === 3" class="step-payment-step fadeIn">
            <div class="payment-content-area">
              <!-- Card 1: Wallet -->
              <div v-if="false"
                class="payment-method-card" 
                :class="{ active: useWallet }" 
                @click="useWallet = !useWallet"
              >
                <div class="card-header">
                  <div class="header-right">
                    <div class="radio-btn" :class="{ selected: useWallet }">
                      <div v-if="useWallet" class="radio-inner-dot"></div>
                    </div>
                    <span class="method-title">{{ t('checkout.use_wallet_balance') }}</span>
                  </div>
                  <div class="method-icon-container">
                    <svg width="24" height="24" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 14V18C19 18.2652 18.8946 18.5196 18.7071 18.7071C18.5196 18.8946 18.2652 19 18 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H16C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2V5M1 3C1 3.53043 1.21071 4.03914 1.58579 4.41421C1.96086 4.78929 2.46957 5 3 5H18C18.2652 5 18.5196 5.10536 18.7071 5.29289C18.8946 5.48043 19 5.73478 19 6V10M19 10H16C15.4696 10 14.9609 10.2107 14.5858 10.5858C14.2107 10.9609 14 11.4696 14 12C14 12.5304 14.2107 13.0391 14.5858 13.4142C14.9609 13.7893 15.4696 14 16 14H19M19 10C19.2652 10 19.5196 10.1054 19.7071 10.2929C19.8946 10.4804 20 10.7348 20 11V13C20 13.2652 19.8946 13.5196 19.7071 13.7071C19.5196 13.8946 19.2652 14 19 14" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <div class="card-content">
                  <div class="wallet-info-row">
                    <span class="wallet-desc-text">{{ t('checkout.available_balance') }}: <bdi class="price-num" dir="ltr">{{ walletBalance > 0 ? formatPrice(walletBalance) : '500.00' }}</bdi></span>
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
                    <span class="method-title">{{ t('checkout.payment_methods.cash_on_delivery') }}</span>
                  </div>
                  <div class="method-icon-container">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-truck">
                      <path d="M14.001 17.9995V6.00065C14.001 5.47027 13.7902 4.96162 13.4151 4.58658C13.04 4.21155 12.5313 4.00085 12.0008 4.00085H4.00016C3.46968 4.00085 2.96094 4.21155 2.58583 4.58658C2.21073 4.96162 2 5.47027 2 6.00065V16.9996C2 17.2647 2.10537 17.5191 2.29292 17.7066C2.48047 17.8941 2.73484 17.9995 3.00008 17.9995H5.00024M5.00024 17.9995C5.00024 19.1039 5.89574 19.9993 7.0004 19.9993C8.10506 19.9993 9.00056 19.1039 9.00056 17.9995M5.00024 17.9995C5.00024 16.895 5.89574 15.9997 7.0004 15.9997C8.10506 15.9997 9.00056 16.895 9.00056 17.9995M9.00056 17.9995H15.001M15.001 17.9995C15.001 19.1039 15.8965 19.9993 17.0012 19.9993C18.1059 19.9993 19.0014 19.1039 19.0014 17.9995M15.001 17.9995C15.001 16.895 15.8965 15.9997 17.0012 15.9997C18.1059 15.9997 19.0014 16.895 19.0014 17.9995M19.0014 17.9995H21.0015C21.2668 17.9995 21.5211 17.8941 21.7087 17.7066C21.8962 17.5191 22.0016 17.2647 22.0016 16.9996V13.3499C22.0012 13.123 21.9236 12.903 21.7816 12.726L18.3013 8.37642C18.2078 8.25931 18.0891 8.16472 17.9541 8.09964C17.8191 8.03457 17.6711 8.00067 17.5212 8.00045H14.001" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <div class="card-content">
                  <div class="method-desc-row">
                    <span class="method-desc-text">{{ t('checkout.cod_desc') }}</span>
                  </div>
                </div>
              </div>

              <!-- Card 3: Credit Card -->
              <div v-if="false"
                class="payment-method-card card-credit" 
                :class="{ active: selectedPayment === 'card' }" 
                @click="selectedPayment = 'card'"
              >
                <div class="card-header">
                  <div class="header-right">
                    <div class="radio-btn" :class="{ selected: selectedPayment === 'card' }">
                      <div v-if="selectedPayment === 'card'" class="radio-inner-dot"></div>
                    </div>
                    <span class="method-title">{{ t('checkout.card') }}</span>
                  </div>
                  <div class="method-icon-container">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 9.99972H22.0016M4.00016 4.99915H20.0014C21.1061 4.99915 22.0016 5.89468 22.0016 6.99937V17.0005C22.0016 18.1052 21.1061 19.0007 20.0014 19.0007H4.00016C2.8955 19.0007 2 18.1052 2 17.0005V6.99937C2 5.89468 2.8955 4.99915 4.00016 4.99915Z" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <div class="card-content">
                  <div class="method-desc-row">
                    <span class="method-desc-text">{{ t('checkout.card_pay_desc') }}</span>
                  </div>
                </div>
              </div>

              <!-- Wallet Summary (if useWallet is active) -->
              <div v-if="useWallet" class="wallet-active-summary">
                <div class="wallet-active-row">
                  <span>{{ t('checkout.order_total') }}:</span>
                  <PriceText :value="grandTotal" :currency="currency" />
                </div>
                <div class="wallet-active-row">
                  <span>{{ t('checkout.from_wallet') }}:</span>
                  <span class="val-green"><PriceText :value="walletPayment" :currency="currency" negative /></span>
                </div>
                <div class="wallet-active-row is-remaining">
                  <span>{{ t('checkout.remaining_to_pay') }}:</span>
                  <PriceText :value="remainingAmount" :currency="currency" />
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
                  <span class="section-title">{{ t('checkout.products') }}</span>
                  <button type="button" class="edit-link-btn" @click="router.push('/cart')">
                    {{ t('checkout.edit') }}
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
                          <SelectedOptionsChips v-if="prod.options?.length" :options="prod.options" :label="L('المواصفات المختارة', 'Selected options')" />
                          <span v-else class="review-item-specs">{{ prod.specs }}</span>
                        </div>

                        <!-- Quantity display box -->
                        <div class="review-qty-display">
                          <span class="review-qty-text">{{ t('checkout.quantity_label') }}: {{ prod.quantity }}</span>
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
                  <span class="section-title">{{ t('checkout.deliver_to') }}</span>
                  <button type="button" class="edit-link-btn" @click="currentStep = 2">
                    {{ t('checkout.edit') }}
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
                  <span class="section-title">{{ t('checkout.payment_method') }}</span>
                  <button type="button" class="edit-link-btn" @click="currentStep = 3">
                    {{ t('checkout.edit') }}
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
                {{ t('checkout.order_details') }}
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
                    <span class="price-val">{{ formatPrice(item.lineTotal ?? item.price * (item.quantity || 1)) }}</span>
                  </div>
                  <div class="receipt-product-name-qty">
                    {{ item.name }} <bdi class="price-num" dir="ltr">×{{ item.quantity || 1 }}</bdi>
                    <SelectedOptionsChips v-if="item.options?.length" :options="item.options" compact />
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
                :placeholder="t('checkout.coupon_code')" 
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
            <span class="coupon-active-label">
              <i class="fas fa-check-circle" aria-hidden="true"></i>
              {{ currentLocale === 'ar' ? 'مفعل' : 'Active' }}
            </span>
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { cartState } from '../../../store/cart';
import { authState } from '../../../store/auth';
import { useOffers } from '../../product/composables/useOffers';
import { useLocalized } from '../../../composables/useLocalized';
import { useDialog } from '../../../composables/useDialog';
import { useSettings } from '../../../composables/useSettings';
import { useCheckoutPricing } from '../../../composables/useCheckoutPricing';
import CheckoutProgress from '../components/CheckoutProgress.vue';
import { useCheckoutStore } from '../store/checkoutStore';
import { regionsList } from '../store/checkoutDefaults';
import { placeLabel as placeLabelFor } from '../../../utils/placeLabels';
import checkoutService from '../services/checkoutService';
import { useCheckoutCoupons } from '../composables/useCheckoutCoupons';
import { useCheckoutTotals } from '../composables/useCheckoutTotals';
import { useCheckoutData } from '../composables/useCheckoutData';
import {
  clearOrderAttempt,
  extractCreatedOrder,
  extractMatchingConflictOrder,
  getOrCreateOrderAttempt,
  getOrderDisplayNumber,
  savePendingPayment,
} from '../../../utils/checkoutSafety';
import { trackPurchase } from '../../../utils/metaPixel';
import { formatPrice as formatPriceBase, formatPriceWithCurrency } from '../../../utils/price';
import PriceText from '../../../components/PriceText.vue';
import SelectedOptionsChips from '../../../components/SelectedOptionsChips.vue';
import { describeSelectedOptions } from '../../../domain/product/productOptions';
import { appendOrderOptions, mergeOrderItems } from '../../../domain/order/orderOptions';
import { logPayment } from '../../../utils/terminalLogger.js';

const router = useRouter();
const { t, locale } = useI18n();
const dialog = useDialog();
const checkoutStore = useCheckoutStore();
const {
  currentStep,
  addressTab,
  saveToMyAddresses,
  loading,
  orderSubmitting,
  confirmedOrder,
  activeCardAttempt,
  customerInfo,
  newAddrForm,
  savedAddresses,
  selectedAddressId,
  selectedPayment,
  countries,
  cities,
  cityShippingRate,
  settings,
  useWallet,
  walletBalance,
  isGift,
  giftMessage,
  freeDeliveryThreshold,
  shippingCost,
  taxRate,
  couponCode,
  appliedCoupon,
  discountAmount,
  couponMessage,
  couponMessageType,
  showCouponInput,
  lastPurchasedItems,
  lastPurchasedTotal,
  lastPurchasedDate,
} = storeToRefs(checkoutStore);
const L = (ar, en) => (currentLocale.value === 'ar' ? ar : en);
const currentLocale = computed(() => {
  try {
    return locale?.value || localStorage.getItem('lang') || 'ar';
  } catch {
    return 'ar';
  }
});
const checkoutStockError = ref(null);
const { localized } = useLocalized();
const checkoutUnavailableName = computed(() => {
  const item = checkoutStockError.value;
  if (!item) return '';
  return localized(item, 'name')
    || (currentLocale.value === 'ar' ? item.name_ar : item.name_en)
    || item.name_ar
    || item.name_en
    || item.name
    || t('checkout.this_product');
});
const { getActiveOfferForProduct, calculatePriceWithOffer, fetchOffers } = useOffers();
const { currency } = useSettings();
const { roundMoney, getItemPriceWithDiscount, getItemUnitPrice, getCartPricing } = useCheckoutPricing({
  getActiveOfferForProduct,
  calculatePriceWithOffer,
});

const {
  displayAddresses,
  selectAddress,
  switchToSavedAddresses,
  switchToOtherRecipient,
  switchToNewAddress,
  fetchUserData,
  fetchSettings,
  fetchCityShippingRate,
  fetchWalletBalance,
  handlePageShow,
} = useCheckoutData({
  state: {
    addressTab,
    saveToMyAddresses,
    loading,
    customerInfo,
    newAddrForm,
    savedAddresses,
    selectedAddressId,
    countries,
    cities,
    cityShippingRate,
    settings,
    walletBalance,
    freeDeliveryThreshold,
    shippingCost,
    taxRate,
  },
  cartState,
  authState,
  checkoutService,
});


const handleAddressSubmit = async () => {
  if (!customerInfo.value.name || !customerInfo.value.phone || !customerInfo.value.address || !customerInfo.value.city) {
    dialog.alert(t('checkout.required_fields'), { type: 'warning' });
    return;
  }
  await nextStep();
};



const progressSteps = computed(() => [
  { id: 1, label: t('checkout.step_cart') },
  { id: 2, label: t('checkout.step_address') },
  { id: 3, label: t('checkout.step_payment') },
  { id: 4, label: t('checkout.step_review') },
  { id: 5, label: t('checkout.step_confirmation') }
]);


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
  await fetchUserData();
  await restoreCoupon();
});

// Preserve the original view-scoped lifecycle: a fresh checkout starts from
// the default state when the route is left and later opened again.
onUnmounted(() => {
  checkoutStore.$reset();
});

const {
  subtotalWithDiscount,
  shippingAmount,
  taxAmount,
  grandTotal,
  walletPayment,
  remainingAmount,
  effectivePaymentMethod,
} = useCheckoutTotals({
  cartState,
  settings,
  cityShippingRate,
  freeDeliveryThreshold,
  shippingCost,
  taxRate,
  discountAmount,
  useWallet,
  walletBalance,
  selectedPayment,
  getCartPricing,
  roundMoney,
});

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
  return item.short_description || L('أمان إيطالي', 'Italian safety');
};

const itemOptions = (item) => describeSelectedOptions(item.selectedOptions, locale.value === 'en' ? 'en' : 'ar');

const displayReviewItems = computed(() => {
  if (cartState.items && cartState.items.length > 0) {
    return cartState.items.map(item => ({
      id: item.cart_item_key || item.id,
      name: localized(item, 'name') || item.name_ar || item.name || t('checkout.unknown_product'),
      sku: item.sku || item.model || 'O604S',
      specs: getReviewItemSpecs(item),
      options: itemOptions(item),
      quantity: item.quantity || 1,
      price: getItemPriceWithDiscount(item, cartState.items) || item.price || 0,
      image: getImageUrl(item.image || item.images?.[0], item.id)
    }));
  }
  return [
    {
      id: 1,
      name: L('فرن غاز بلت-إن 60 سم', '60 cm Built-in Gas Oven'),
      sku: 'O604S',
      specs: L('شواية دوارة، أمان إيطالي', 'Rotating grill, Italian safety'),
      quantity: 1,
      price: 2499,
      image: '/images/products/oven.png'
    },
    {
      id: 2,
      name: L('موقد غاز 5 عيون 90 سم', '90 cm 5-Burner Gas Hob'),
      sku: 'H95GLCX',
      specs: L('حوامل زهر، أمان كامل', 'Cast iron grates, full safety'),
      quantity: 1,
      price: 1899,
      image: '/images/products/cooktop.png'
    },
    {
      id: 3,
      name: L('شفاط مدمج 90 سم', '90 cm Built-in Hood'),
      sku: 'HO90GL',
      specs: L('قوة شفط فائقة، هادئ', 'Powerful and quiet extraction'),
      quantity: 1,
      price: 1299,
      image: '/images/products/hood.png'
    }
  ];
});

const reviewCustomerName = computed(() => customerInfo.value.name || L('أحمد الحربي', 'Ahmed Al-Harbi'));
const reviewCustomerPhone = computed(() => customerInfo.value.phone || '0557654321');
const reviewCustomerCity = computed(() => {
  const cityName = customerInfo.value.city || (cities.value.find(c => String(c.id) === String(customerInfo.value.city_id))?.name);
  if (cityName && customerInfo.value.district) return `${cityName} - ${customerInfo.value.district}`;
  if (cityName) return `${cityName} - ${L('النعيم', 'Al-Naeem')}`;
  return L('جدة - النعيم', 'Jeddah - Al-Naeem');
});
const reviewCustomerAddress = computed(() => customerInfo.value.address || L('شارع حراء قرية 15', 'Hira Street, Village 15'));

const reviewPaymentMethod = computed(() => {
  if (selectedPayment.value === 'card') {
    return {
      type: 'card',
      title: t('checkout.card'),
      sub: '•••• 4321'
    };
  } else if (selectedPayment.value === 'cod') {
    return {
      type: 'cod',
      title: t('checkout.payment_methods.cash_on_delivery'),
      sub: t('checkout.cod_sub')
    };
  } else {
    return {
      type: 'wallet',
      title: t('checkout.use_wallet_balance'),
      sub: formatPriceWithCurrency(walletPayment.value || walletBalance.value, currency.value)
    };
  }
});

const { applyCoupon, removeCoupon, restoreCoupon } = useCheckoutCoupons({
  couponCode,
  appliedCoupon,
  discountAmount,
  couponMessage,
  couponMessageType,
  subtotalWithDiscount,
  roundMoney,
  checkoutService,
  t,
});

const receiptProducts = computed(() => {
  if (lastPurchasedItems.value && lastPurchasedItems.value.length > 0) {
    return lastPurchasedItems.value;
  }
  const orderObj = confirmedOrder.value?.order || confirmedOrder.value;
  if (orderObj?.items && Array.isArray(orderObj.items) && orderObj.items.length > 0) {
    return orderObj.items.map(it => ({
      id: it.id || it.product_id,
      name: it.product?.name || it.name || t('checkout.unknown_product'),
      quantity: it.quantity || 1,
      price: it.price || it.unit_price || 0
    }));
  }
  if (cartState.items && cartState.items.length > 0) {
    return cartState.items.map(item => ({
      id: item.cart_item_key || item.id,
      name: localized(item, 'name') || item.name_ar || item.name || t('checkout.unknown_product'),
      options: itemOptions(item),
      quantity: item.quantity || 1,
      lineTotal: getItemPriceWithDiscount(item, cartState.items) || item.price || 0,
      price: getItemPriceWithDiscount(item, cartState.items) || item.price || 0
    }));
  }
  return [
    { id: 1, name: L('فرن غاز بلت-إن 60 سم', '60 cm Built-in Gas Oven'), quantity: 1, price: 2499 },
    { id: 2, name: L('موقد غاز 5 عيون 90 سم', '90 cm 5-Burner Gas Hob'), quantity: 1, price: 1899 },
    { id: 3, name: L('شفاط مدمج 90 سم', '90 cm Built-in Hood'), quantity: 1, price: 1299 }
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

const receiptCustomerName = computed(() => customerInfo.value.name || L('أحمد الحربي', 'Ahmed Al-Harbi'));
const receiptCustomerAddress = computed(() => {
  const city = customerInfo.value.city || L('جدة - النعيم', 'Jeddah - Al-Naeem');
  const addr = customerInfo.value.address || L('شارع حراء', 'Hira Street');
  return currentLocale.value === 'ar' ? `${city}، ${addr}` : `${city}, ${addr}`;
});
const receiptPaymentMethodText = computed(() => {
  if (selectedPayment.value === 'card') {
    return `${t('checkout.card')} (•••• 4321)`;
  } else if (selectedPayment.value === 'cod') {
    return t('checkout.payment_methods.cash_on_delivery');
  } else {
    return t('checkout.use_wallet_balance');
  }
});

const summaryPrimaryButtonText = computed(() => {
  if (currentStep.value === 2) {
    return t('checkout.proceed_to_payment');
  }
  if (currentStep.value === 3) {
    return t('checkout.proceed_to_review');
  }
  if (currentStep.value === 4) {
    return t('checkout.confirm_order');
  }
  return t('checkout.continue');
});

const summarySecondaryButtonText = computed(() => {
  if (currentStep.value === 2) {
    return t('checkout.back_to_cart');
  }
  if (currentStep.value === 3) {
    return t('checkout.back_to_address');
  }
  if (currentStep.value === 4) {
    return t('checkout.back_to_payment');
  }
  return t('checkout.back');
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
      !customerInfo.value.city
    ) {
      dialog.alert(t('checkout.required_fields'), { type: 'warning' });
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
  const offerIds = [...new Set(
    cartState.items
      .map(item => Number(item.offer_id))
      .filter(offerId => Number.isInteger(offerId) && offerId > 0)
  )];
  const offerId = offerIds.length === 1 ? offerIds[0] : null;
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
    // Chosen options ride in the notes: the order API has no field for them.
    notes: appendOrderOptions((appliedCoupon.value ? `Coupon: ${appliedCoupon.value.code}. ` : '') + (customerInfo.value.notes || ''), cartState.items),
    is_gift: isGift.value,
    gift_message: isGift.value ? giftMessage.value : null,
    ...(offerId ? { offer_id: offerId } : {}),
    // The API rejects a product listed twice, so option lines of one product
    // become a single item.
    items: mergeOrderItems(cartState.items.map(item => ({
      product_id: item.id,
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      unit_price: getItemUnitPrice(item, cartState.items),
      ...(item.offer_id ? { offer_id: Number(item.offer_id) } : {}),
    })))
  };
};

const confirmOrder = async () => {
  if (orderSubmitting.value) return;
  if (!cartState.items.length) {
    router.push('/cart');
    return;
  }

  checkoutStockError.value = null;
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

        const checkoutRes = await checkoutService.createPaytabsCheckout(payload, pendingPayment.idempotencyKey);

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
      const response = await checkoutService.createOrder(orderData, orderAttempt.idempotencyKey);
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
      options: it.options,
      quantity: it.quantity,
      // Review prices are already line totals (price × quantity).
      lineTotal: it.price,
      price: it.price
    }));
    const serverOrder = createdOrder?.order || createdOrder;
    const serverTotal = Number(serverOrder?.total_amount ?? serverOrder?.total ?? 0);
    lastPurchasedTotal.value = serverTotal > 0 ? serverTotal : grandTotal.value;
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
    }, currency.value || 'SAR');
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
      } catch {
        // The event is only an optional UI refresh hint.
      }
    }
  } catch (err) {
    console.error('Order error:', err);
    const rawErrorMessage = String(err.response?.data?.message || err.response?.data?.error || err.message || '');
    const isStockError = [409, 422].includes(Number(err.response?.status))
      && /(insufficient stock|out of stock|المخزون|غير متوفر|نفد)/i.test(rawErrorMessage);
    if (isStockError) {
      const unavailableItem = cartState.items[0];
      checkoutStockError.value = unavailableItem || null;
      return;
    }
    const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
    dialog.alert(errorMsg || t('checkout.order_error'), { type: 'error', title: t('checkout.order_error_title') });
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
  if (!rawPath) return '/brand/mastergas-icon.png';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-tijara.be-kite.com/api';
  return `${baseUrl.replace('/api', '')}/storage/${rawPath}`;
};

const onImageError = (event, item) => {
  const target = event.target;
  if (!target) return;
  target.src = '/brand/mastergas-icon.png';
};

const formatPrice = (price) => formatPriceBase(price, { fraction: 'fixed' });

</script>

<style src="../styles/checkout.css" scoped></style>
