<template>
  <div class="profile-page">
    <div class="container main-container">
      <div class="account-layout">
        <!-- Sidebar Menu -->
        <aside class="account-sidebar">
          <div class="sidebar-inner">
            <nav class="sidebar-nav">
              <router-link to="/profile?tab=info" class="nav-item" :class="{ active: currentTab === 'info' }">
                <i class="far fa-user"></i>
                <span>{{ t('profile.personal_info') }}</span>
              </router-link>
              <router-link to="/profile?tab=addresses" class="nav-item" :class="{ active: currentTab === 'addresses' }">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ t('profile.addresses') }}</span>
              </router-link>
              <router-link to="/profile?tab=orders" class="nav-item" :class="{ active: currentTab === 'orders' }">
                <i class="fas fa-shopping-bag"></i>
                <span>{{ t('profile.orders') }}</span>
              </router-link>
              <router-link to="/profile?tab=wallet" class="nav-item" :class="{ active: currentTab === 'wallet' }">
                <i class="far fa-credit-card"></i>
                <span>{{ t('profile.wallet') }}</span>
              </router-link>
              <router-link to="/profile?tab=wishlist" class="nav-item" :class="{ active: currentTab === 'wishlist' }">
                <i class="far fa-heart"></i>
                <span>{{ t('profile.wishlist') }}</span>
                <span class="count-badge" v-if="wishlistCount > 0">{{ wishlistCount }}</span>
              </router-link>
              <router-link to="/profile?tab=notifications" class="nav-item" :class="{ active: currentTab === 'notifications' }">
                <i class="far fa-bell"></i>
                <span>{{ t('profile.notifications') }}</span>
                <span class="count-badge danger" v-if="notifCount > 0">{{ notifCount }}</span>
              </router-link>
              <router-link to="/profile?tab=returns" class="nav-item" :class="{ active: currentTab === 'returns' }">
                <i class="fas fa-undo"></i>
                <span>{{ t('profile.returns') }}</span>
              </router-link>
            </nav>
            <div class="sidebar-footer">
              <button class="logout-btn" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>{{ t('profile.logout') }}</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- Mobile Horizontal Scroll Navigation Tabs -->
        <div class="profile-mobile-tabs-container">
          <div class="profile-mobile-tabs">
            <router-link to="/profile?tab=info" class="mobile-tab-btn" :class="{ active: currentTab === 'info' }">
              <i class="far fa-user"></i>
              <span>{{ t('profile.personal_info') }}</span>
            </router-link>
            <router-link to="/profile?tab=addresses" class="mobile-tab-btn" :class="{ active: currentTab === 'addresses' }">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ t('profile.addresses') }}</span>
            </router-link>
            <router-link to="/profile?tab=orders" class="mobile-tab-btn" :class="{ active: currentTab === 'orders' }">
              <i class="fas fa-shopping-bag"></i>
              <span>{{ t('profile.orders') }}</span>
            </router-link>
            <router-link to="/profile?tab=wallet" class="mobile-tab-btn" :class="{ active: currentTab === 'wallet' }">
              <i class="far fa-credit-card"></i>
              <span>{{ t('profile.wallet') }}</span>
            </router-link>
            <router-link to="/profile?tab=wishlist" class="mobile-tab-btn" :class="{ active: currentTab === 'wishlist' }">
              <i class="far fa-heart"></i>
              <span>{{ t('profile.wishlist') }}</span>
              <span class="mobile-tab-badge" v-if="wishlistCount > 0">{{ wishlistCount }}</span>
            </router-link>
            <router-link to="/profile?tab=notifications" class="mobile-tab-btn" :class="{ active: currentTab === 'notifications' }">
              <i class="far fa-bell"></i>
              <span>{{ t('profile.notifications') }}</span>
              <span class="mobile-tab-badge danger" v-if="notifCount > 0">{{ notifCount }}</span>
            </router-link>
            <router-link to="/profile?tab=returns" class="mobile-tab-btn" :class="{ active: currentTab === 'returns' }">
              <i class="fas fa-undo"></i>
              <span>{{ t('profile.returns') }}</span>
            </router-link>
          </div>
        </div>

        <!-- Main Content Area -->
        <main class="account-main">
          <!-- Information Tab -->
          <div v-if="currentTab === 'info'" class="content-view">
             <header class="view-header">
               <h2 class="view-title">{{ t('profile.personal_info') }}</h2>
             </header>
             
             <div class="form-container">
               <form @submit.prevent="updateProfile" class="profile-form" v-if="!showPasswordForm">
                 <div class="form-row">
                   <div class="form-group">
                     <label>{{ t('auth.name') }}</label>
                     <input type="text" v-model="form.name" required />
                   </div>
                   <div class="form-group">
                     <label>{{ t('auth.email') }}</label>
                     <input type="email" v-model="form.email" dir="ltr" required />
                   </div>
                 </div>
                 <div class="form-row">
                   <div class="form-group">
                     <label>{{ t('profile.country') }}</label>
                     <input type="text" :value="localizedCountryName" readonly class="country-readonly-input" />
                   </div>
                   <div class="form-group">
                    <label>{{ t('auth.phone') }}</label>
                    <input type="text" v-model="form.phone" dir="ltr" />
                  </div>
                 </div>

                 <div class="form-actions">
                   <button type="button" class="change-pw-btn" @click="showPasswordForm = true">
                     <i class="fas fa-lock"></i>
                     {{ t('profile.change_password') }}
                   </button>
                   <button type="submit" class="save-btn" :disabled="loadingData">
                     {{ loadingData ? t('common.loading') : t('profile.edit_profile') }}
                   </button>
                 </div>
               </form>

               <!-- Password Form -->
               <form @submit.prevent="changePassword" class="profile-form" v-else>
                  <h3 class="inner-subtitle">{{ t('profile.change_password') }}</h3>

                  <div class="form-group">
                    <label>{{ t('profile.new_password') }}</label>
                    <input type="password" v-model="passForm.password" required />
                  </div>
                  <div class="form-group">
                    <label>{{ t('profile.confirm_new_password') }}</label>
                    <input type="password" v-model="passForm.password_confirmation" required />
                  </div>
                  <div class="form-actions">
                    <button type="button" class="cancel-btn" @click="showPasswordForm = false">{{ t('common.cancel') }}</button>
                    <button type="submit" class="save-btn" :disabled="loadingData">{{ t('profile.update_password') }}</button>
                  </div>
               </form>
             </div>
          </div>

          <!-- Addresses Tab -->
          <div v-else-if="currentTab === 'addresses'" class="content-view">
             <header class="view-header flex-header">
               <h2 class="view-title">{{ t('profile.saved_addresses') }}</h2>
               <button class="add-btn" v-if="!showAddAddress" @click="openAddAddress">
                  <i class="fas fa-plus"></i> {{ t('profile.add_address') }}
               </button>
             </header>

             <div class="address-form-box" v-if="showAddAddress">
                <h3 class="inner-subtitle">{{ isEditAddress ? t('profile.edit_address') : t('profile.add_new_address') }}</h3>
                <form @submit.prevent="saveAddress">
                  <div class="form-row">
                    <div class="form-group">
                      <label>{{ t('profile.address_name') }}</label>
                      <input type="text" v-model="addressForm.name" required />
                    </div>
                    <div class="form-group">
                      <label>{{ t('checkout.recipient_name') }}</label>
                      <input type="text" v-model="addressForm.full_name" required />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>الدولة <span class="required">*</span></label>
                      <div class="input-relative">
                        <input type="text" :value="locale === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'" readonly class="fixed-country-input" />
                        <i class="fas fa-globe input-icon"></i>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>{{ t('checkout.city') }}</label>
                      <div class="input-relative">
                        <select v-model="addressForm.city_id">
                          <option value="">اختر المدينة</option>
                          <option v-for="city in cities" :key="city.id" :value="city.id">
                            {{ city.name }}
                          </option>
                        </select>
                        <i class="fas fa-chevron-down input-icon"></i>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>{{ t('checkout.full_address') }}</label>
                    <input type="text" v-model="addressForm.address" required />
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>{{ t('auth.phone') }}</label>
                      <input type="text" v-model="addressForm.phone" dir="ltr" required />
                    </div>
                  </div>
                  <div class="checkbox-group">
                    <input type="checkbox" id="addr_default" v-model="addressForm.is_default" />
                    <label for="addr_default">{{ t('profile.set_default_address') }}</label>
                  </div>
                  <div class="form-actions">
                    <button type="submit" class="save-btn" :disabled="loadingData">{{ t('checkout.save_address') }}</button>
                    <button type="button" class="cancel-btn" @click="showAddAddress = false">{{ t('common.cancel') }}</button>
                  </div>
                </form>
             </div>

             <div class="addresses-grid" v-if="!showAddAddress">
               <div v-for="addr in addressesList" :key="addr.id" class="address-card">
                  <div class="addr-info">
                    <div class="addr-tag">
                      <h4 class="addr-name">{{ addr.name }}</h4>
                      <span class="default-badge" v-if="addr.is_default">{{ t('checkout.default') }}</span>
                    </div>
                    <div class="addr-owner" v-if="addr.full_name"><i class="far fa-user"></i> {{ addr.full_name }}</div>
                    <div class="addr-country"><i class="fas fa-globe"></i> {{ addr.country?.name || addr.country_name || (locale === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia') }}</div>
                    <div class="addr-full-text" v-if="addr.city || addr.address"><i class="fas fa-map-marker-alt"></i> {{ addr.city ? addr.city + ' - ' : '' }}{{ addr.address }}</div>
                    <div class="addr-phone" v-if="addr.phone"><i class="fas fa-phone-alt"></i> {{ addr.phone }}</div>
                  </div>
                  <div class="addr-actions">
                    <button @click="editAddress(addr)" class="edit-btn"><i class="far fa-edit"></i></button>
                    <button @click="deleteAddress(addr.id)" class="del-btn"><i class="far fa-trash-alt"></i></button>
                  </div>
               </div>
               <div v-if="addressesList.length === 0" class="empty-state">{{ t('profile.no_addresses') }}</div>
             </div>
          </div>

          <!-- Orders Tab -->
          <div v-else-if="currentTab === 'orders'" class="content-view">
             <header class="view-header flex-header">
               <div class="header-main-title">
                  <h2 class="view-title">{{ t('profile.orders') }}</h2>
                  <span class="view-subtitle-count">({{ ordersList.length }})</span>
               </div>
               <div class="order-filter-tabs-v2">
                 <button :class="{ active: orderTab === 'current' }" @click="orderTab = 'current'">{{ t('profile.current_orders') }} <span class="tab-count-v2">{{ ordersList.filter(o => !['delivered', 'cancelled'].includes(o.status)).length }}</span></button>
                 <button :class="{ active: orderTab === 'past' }" @click="orderTab = 'past'">{{ t('profile.past_orders') }} <span class="tab-count-v2">{{ ordersList.filter(o => ['delivered', 'cancelled'].includes(o.status)).length }}</span></button>
               </div>

             </header>

             <div class="orders-list-v2">
                <div v-for="order in displayedOrders" :key="order.id" class="order-card-v2" :class="{ expanded: expandedOrders.includes(order.id) }">
                   <!-- Card Summary Header -->
                   <div class="order-summary-v2" @click="toggleOrder(order.id)">
                      <div class="collapse-icon">
                        <i class="fas fa-chevron-down" :class="{ rotated: expandedOrders.includes(order.id) }"></i>
                      </div>
                      
                      <div class="order-id-v2">
                        <span class="id-text">{{ order.orderNumber || order.order_number || ('#' + order.id) }}</span>
                        <span class="order-date-v2">{{ order.date || formatDate(order.created_at) }}</span>
                      </div>

                      <div class="order-status-indicator">
                        <span class="status-badge-v2" :class="order.status">
                          <i :class="getStatusIcon(order.status)"></i>
                          {{ formatStatus(order.status) }}
                        </span>
                      </div>

                      <div class="order-total-v2">
                        {{ order.total_amount || order.total }} {{ currency }}
                      </div>
                   </div>

                   <!-- Expanded Details Content -->
                   <div class="order-detailed-content" v-if="expandedOrders.includes(order.id)">
                      
                      <!-- Phase 1: Tracking Timeline -->
                      <div class="detail-section timeline-section">
                        <div class="section-title-v2"><i class="fas fa-shipping-fast"></i> {{ t('profile.order_tracking') }}</div>
                        <div class="vertical-timeline">
                          <div class="timeline-item" :class="{ active: isStepDone('pending', order.status) }">
                            <div class="timeline-dot"><i class="fas fa-check"></i></div>
                            <div class="timeline-info">
                              <span class="step-name">{{ t('profile.order_confirmed_step') }}</span>
                              <span class="step-time">{{ getStepTime(order, 'pending') }}</span>
                            </div>
                          </div>
                          <div class="timeline-item" :class="{ active: isStepDone('processing', order.status) }">
                            <div class="timeline-dot"><i class="fas fa-check"></i></div>
                            <div class="timeline-info">
                              <span class="step-name">{{ t('profile.processing_step') }}</span>
                              <span class="step-time">{{ getStepTime(order, 'processing') }}</span>
                            </div>
                          </div>
                          <div class="timeline-item" :class="{ active: isStepDone('shipped', order.status) }">
                            <div class="timeline-dot"><i class="fas fa-check"></i></div>
                            <div class="timeline-info">
                              <span class="step-name">{{ t('profile.shipped_step') }}</span>
                              <span class="step-time">{{ getStepTime(order, 'shipped') }}</span>
                            </div>
                          </div>
                          <div class="timeline-item" :class="{ active: isStepDone('delivered', order.status) }">
                            <div class="timeline-dot"><i class="fas fa-check"></i></div>
                            <div class="timeline-info">
                              <span class="step-name">{{ t('profile.delivered_step') }}</span>
                              <span class="step-time">{{ getStepTime(order, 'delivered') }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Phase 2: Products -->
                      <div class="detail-section products-section-v2">
                        <div class="section-title-v2"><i class="fas fa-box-open"></i> {{ t('nav.products') }} ({{ (order.items || order.products || []).length }})</div>
                        <div class="order-products-v2">
                          <div v-for="item in (order.items || order.products || [])" :key="item.id" class="o-prod-card-v2">
                            <img :src="getImageUrl(item.image || item.product?.image || item.product?.images?.[0])" class="o-prod-img-v2" />
                            <div class="o-prod-details-v2">
                              <div class="o-prod-name-v2">{{ item.name || item.product?.name }}</div>
                              <div class="o-prod-qty-v2">{{ t('cart.quantity') }}: {{ item.quantity }}</div>
                            </div>
                            <div class="o-prod-total-price-v2">{{ ((item.price || item.unit_price) * item.quantity).toFixed(2) }} {{ currency }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- Phase 3: Info & Totals -->
                      <div class="detail-section-grid">
                        <div class="info-box-v2">
                          <div class="section-title-v2"><i class="fas fa-file-invoice"></i> {{ t('profile.order_info') }}</div>
                          <div class="info-rows-v2">
                             <div class="info-row-v2"><span>{{ t('checkout.payment_method') }}:</span> <strong>{{ getPaymentLabel(order.paymentMethod || order.payment_method) }}</strong></div>
                             <div class="info-row-v2"><span>{{ t('checkout.shipping_address') }}:</span> <strong>{{ order.customerAddress || order.shipping_address }}</strong></div>
                             <div class="info-row-v2"><span>{{ t('profile.order_date') }}:</span> <strong>{{ order.date || formatDate(order.created_at) }}</strong></div>
                          </div>
                        </div>

                        <div class="summary-box-v2">
                          <div class="section-title-v2"><i class="fas fa-calculator"></i> {{ t('profile.price_summary') }}</div>
                          <div class="summary-rows-v2">
                             <div class="summary-row-v2"><span>{{ t('checkout.subtotal') }}:</span> <span>{{ (order.subtotal || 0).toFixed(2) }} {{ currency }}</span></div>
                             <div class="summary-row-v2"><span>{{ t('checkout.shipping') }}:</span> <span>{{ (order.shipping || order.shipping_cost || 0).toFixed(2) }} {{ currency }}</span></div>
                             <div class="summary-row-v2"><span>{{ t('offers.discount') }}:</span> <span class="discount-text-v2">-{{ (order.discount || 0).toFixed(2) }} {{ currency }}</span></div>
                             <div class="summary-row-v2 grand-total-v2"><span>{{ t('checkout.total') }}:</span> <span>{{ (order.total_amount || order.total || 0).toFixed(2) }} {{ currency }}</span></div>
                          </div>
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="order-footer-actions-v2">
                         <button class="btn-inverse-v2" @click="printInvoice(order)"><i class="fas fa-print"></i> {{ t('profile.print_invoice') }}</button>
                         <template v-if="['delivered', 'completed'].includes((order.status || '').toLowerCase())">
                           <button class="btn-rate-v2" @click="initiateRating(order)"><i class="far fa-star"></i> {{ t('profile.rate_products') }}</button>
                           <button class="btn-return-v2" @click="initiateReturn(order)"><i class="fas fa-undo"></i> {{ t('profile.return_request') }}</button>
                         </template>
                         <button v-else class="btn-outline-v2" @click="copyOrderID(order)"><i class="far fa-copy"></i> {{ t('profile.copy_order_number') }}</button>
                      </div>

                   </div>
                </div>
                <!-- Empty State -->
                <div v-if="displayedOrders.length === 0" class="empty-state-v2">
                   <i class="fas fa-box-open empty-icon"></i>
                   <p>{{ t('profile.no_orders_section') }}</p>
                </div>
             </div>
          </div>

          <!-- Returns Tab -->
          <div v-else-if="currentTab === 'returns'" class="content-view">
             <header class="view-header flex-header">
               <h2 class="view-title">{{ t('profile.returns') }}</h2>
               <button class="add-btn" v-if="!showReturnForm" @click="openReturnForm">
                  <i class="fas fa-plus"></i> {{ t('profile.return_request') }}
               </button>
             </header>

             <!-- New Return Request Form -->
             <div class="return-form-box" v-if="showReturnForm">
                <h3 class="inner-subtitle">{{ t('profile.submit_return_request') }}</h3>
                
                <div class="return-steps">
                  <!-- Step 1: Select Order -->
                  <div class="form-group" v-if="returnStep === 1">
                    <label>{{ t('profile.choose_order') }}</label>
                    <select v-model="selectedOrderForReturn" class="custom-select-v2">
                      <option :value="null">--- {{ t('profile.choose_delivered_order') }} ---</option>
                      <option v-for="o in ordersList.filter(o => ['delivered', 'completed'].includes(o.status))" :key="o.id" :value="o">
                        {{ o.orderNumber || o.order_number }} - {{ o.date || formatDate(o.created_at) }}
                      </option>
                    </select>
                    <div class="form-actions mt-4">
                      <button class="save-btn" :disabled="!selectedOrderForReturn" @click="returnStep = 2">{{ t('common.next') }}</button>
                      <button class="cancel-btn" @click="showReturnForm = false">{{ t('common.cancel') }}</button>
                    </div>
                  </div>

                  <!-- Step 2: Select Product -->
                  <div class="form-group" v-if="returnStep === 2">
                    <label>{{ t('profile.choose_product_to_return') }}</label>
                    <div class="product-selection-list">
                      <div v-for="item in (selectedOrderForReturn.items || selectedOrderForReturn.products)" 
                           :key="item.id" 
                           class="product-select-item"
                           :class="{ selected: selectedItemForReturn?.id === item.id }"
                           @click="selectedItemForReturn = item">
                        <img :src="getImageUrl(item.image)" class="p-mini-img" />
                        <div class="p-mini-info">
                          <span class="p-mini-name">{{ item.name }}</span>
                          <span class="p-mini-price">{{ item.unit_price || item.price }} {{ currency }}</span>
                        </div>
                        <div class="p-check"><i class="fas fa-check-circle"></i></div>
                      </div>
                    </div>
                    <div class="form-actions mt-4">
                      <button class="save-btn" :disabled="!selectedItemForReturn" @click="returnStep = 3">{{ t('common.next') }}</button>
                      <button class="cancel-btn" @click="returnStep = 1">{{ t('common.back') }}</button>
                    </div>
                  </div>

                  <!-- Step 3: Reason -->
                  <div class="form-group" v-if="returnStep === 3">
                    <label>{{ t('profile.return_reason') }}</label>
                    <textarea v-model="returnReason" rows="4" :placeholder="t('profile.return_reason_placeholder')" class="custom-textarea"></textarea>
                    <div class="char-count" :class="{ valid: returnReason.trim().length >= 10, invalid: returnReason && returnReason.trim().length < 10 }" v-if="returnReason">
                      {{ returnReason.trim().length }}/10 {{ t('profile.characters') }}
                    </div>
                    <div class="form-actions mt-4">
                      <button class="save-btn" :disabled="!returnReason || returnReason.trim().length < 10" @click="submitReturnRequest">{{ t('profile.send_request') }}</button>
                      <button class="cancel-btn" @click="returnStep = 2">{{ t('common.back') }}</button>
                    </div>
                  </div>
                </div>
             </div>

             <!-- Returns List -->
             <div class="returns-list" v-if="!showReturnForm">
                <div v-for="ret in returnsList" :key="ret.id" class="return-card">
                  <div class="ret-header">
                    <span class="ret-id">{{ t('profile.request') }} #{{ ret.returnNumber }}</span>
                    <span class="status-badge-v2" :class="ret.status">{{ formatReturnStatus(ret.status) }}</span>
                  </div>
                  <div class="ret-body">
                    <img :src="ret.productImage" class="ret-img" v-if="ret.productImage" />
                    <div class="ret-info">
                      <div class="ret-pname">{{ ret.productName }}</div>
                      <div class="ret-order">{{ t('profile.original_order') }}: {{ ret.orderNumber || ret.orderId || '—' }}</div>
                      <div class="ret-reason"><strong>{{ t('profile.reason') }}:</strong> {{ ret.reason }}</div>
                      <div class="ret-notes" v-if="ret.adminNotes"><strong>{{ t('profile.admin_note') }}:</strong> {{ ret.adminNotes }}</div>
                    </div>
                    <div class="ret-refund">
                      <span class="refund-label">{{ t('profile.amount') }}:</span>
                      <span class="refund-val">{{ ret.refundAmount }} {{ currency }}</span>
                    </div>
                  </div>
                  <div class="ret-footer">
                    <span class="ret-date">{{ ret.date ? formatDate(ret.date) : '—' }}</span>
                  </div>
                </div>
                <div v-if="returnsList.length === 0" class="empty-state">{{ t('profile.no_previous_returns') }}</div>
             </div>
          </div>

          <!-- Wishlist Tab -->
          <div v-else-if="currentTab === 'wishlist'" class="content-view">
             <header class="view-header">
               <h2 class="view-title">{{ t('profile.wishlist') }} <span class="count">({{ wishlistCount }})</span></h2>
             </header>

             <div v-if="wishlistCount === 0" class="empty-view">
                <div class="empty-icon">💔</div>
                <p>{{ t('profile.wishlist_empty') }}</p>
                <router-link to="/products" class="go-shop-btn">{{ t('home.shop_now') }}</router-link>
             </div>

             <div class="wishlist-grid" v-else>
                <div v-for="product in cartState.wishlist" :key="product.id" class="wish-card">
                   <img :src="getImageUrl(product.image || product.images?.[0])" @click="$router.push('/product/'+product.id)" />
                   <div class="wish-body">
                      <h4 @click="$router.push('/product/'+product.id)">{{ product.name }}</h4>
                      <div class="wish-price">{{ product.price }} {{ currency }}</div>
                      <div class="wish-card-actions">
                        <button class="wish-add-cart" @click="cartState.addToCart(product)">
                          <i class="fas fa-shopping-cart"></i> {{ t('cart.title') }}
                        </button>
                        <button class="wish-remove" @click="cartState.toggleWishlist(product)">
                          <i class="far fa-trash-alt"></i>
                        </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- Wallet Tab -->
          <div v-else-if="currentTab === 'wallet'" class="content-view wallet-view">
             <div v-if="loadingWallet" class="loading-state">
               <div class="spinner"></div>
               <p>{{ t('common.loading') }}</p>
             </div>

             <div v-else class="wallet-container">
               <!-- Main Balance Card -->
               <div class="wallet-balance-card">
                 <div class="balance-content">
                   <span class="balance-title">{{ t('profile.available_balance') }}</span>
                   <span class="balance-value">{{ formatPrice(walletData.balance) }} {{ currency }}</span>
                   <span class="balance-subtitle">{{ t('profile.balance_subtitle') }}</span>
                 </div>
                 <div class="balance-icon">
                   <i class="fas fa-wallet"></i>
                 </div>
               </div>

               <!-- Stats Cards -->
               <div class="stats-cards">
                 <div class="stat-card refund-card">
                   <div class="stat-header">
                     <i class="fas fa-sync-alt stat-icon"></i>
                   </div>
                   <span class="stat-title">{{ t('profile.total_refunds') }}</span>
                   <span class="stat-value">{{ formatPrice(totalRefunds) }} {{ currency }}</span>
                   <span class="stat-count">{{ t('profile.transactions_count', { count: refundCount }) }}</span>
                 </div>
                 <div class="stat-card purchase-card">
                   <div class="stat-header">
                     <i class="fas fa-arrow-up stat-icon"></i>
                   </div>
                   <span class="stat-title">{{ t('profile.total_purchases') }}</span>
                   <span class="stat-value">{{ formatPrice(totalPurchases) }} {{ currency }}</span>
                   <span class="stat-count">{{ t('profile.transactions_count', { count: purchaseCount }) }}</span>
                 </div>
               </div>

               <!-- Transactions Section -->
               <div class="wallet-transactions">
                 <div class="transactions-header">
                   <h3 class="transactions-title">{{ t('profile.transactions_history') }}</h3>
                   <div class="transaction-filters">
                     <button 
                       v-for="filter in filters" 
                       :key="filter.value"
                       class="filter-btn"
                       :class="{ active: activeFilter === filter.value }"
                       @click="activeFilter = filter.value"
                     >
                       {{ filter.label }}
                     </button>
                   </div>
                 </div>

                 <div v-if="filteredTransactions.length === 0" class="empty-state">
                   <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
                     <rect x="2" y="5" width="20" height="14" rx="2" />
                     <line x1="2" y1="10" x2="22" y2="10" />
                   </svg>
                   <p>{{ t('profile.no_transactions') }}</p>
                 </div>

                 <div v-else class="transactions-list">
                   <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-item">
                     <div class="transaction-icon" :class="transaction.type === 'deposit' ? 'deposit' : 'purchase'">
                       <i :class="transaction.type === 'deposit' ? 'fas fa-sync-alt' : 'fas fa-arrow-up'"></i>
                     </div>
                     <div class="transaction-info">
                       <span class="transaction-desc">{{ transaction.type === 'deposit' ? t('profile.refund') : t('profile.purchase') }} - {{ transaction.description }}</span>
                       <span class="transaction-subtext">{{ transaction.reference_id ? '#' + transaction.reference_id : '' }} • {{ formatDate(transaction.date) }}</span>
                     </div>
                     <span class="transaction-amount" :class="transaction.type === 'deposit' ? 'deposit' : 'purchase'">
                       {{ transaction.type === 'deposit' ? '+' : '-'}}{{ t('currency') }} {{ formatPrice(transaction.amount) }}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
          </div>

          <!-- Notifications Tab -->
          <div v-else-if="currentTab === 'notifications'" class="content-view">
             <header class="view-header flex-header">
               <h2 class="view-title">{{ t('profile.notifications') }} <span class="count" v-if="notificationsList.length > 0">({{ notificationsList.length }})</span></h2>
             </header>

             <div class="notifications-list-box" v-if="notificationsList.length > 0">
               <div v-for="notif in notificationsList" :key="notif.id" class="notif-card" :class="{ unread: !notif.is_read }">
                 <div class="notif-icon"><i class="fas fa-bell"></i></div>
                 <div class="notif-details">
                   <div class="notif-title">{{ notif.title || localized(notif, 'title') }}</div>
                   <div class="notif-message">{{ notif.message || notif.body || localized(notif, 'message') }}</div>
                   <div class="notif-time">{{ formatDate(notif.created_at || notif.date) }}</div>
                 </div>
               </div>
             </div>
             
             <div v-else class="empty-state">
               <i class="fas fa-bell-slash empty-icon"></i>
               <p>{{ t('profile.no_notifications') || 'لا يوجد إشعارات حالياً' }}</p>
             </div>
          </div>
        </main>
      </div>
    </div>


    <!-- Rating Modal -->
    <div v-if="showRatingModal" class="modal-overlay" @click.self="showRatingModal = false">
      <div class="rating-modal">
        <button class="close-modal" @click="showRatingModal = false">&times;</button>
        <h3 class="modal-title">{{ t('profile.rate_products') }}</h3>
        <p class="modal-desc">{{ t('profile.rating_desc') }}</p>

        <div class="rating-item-select" v-if="ratingOrder">
           <label>{{ t('profile.choose_product_to_rate') }}:</label>
           <div class="rating-prods-scroll">
              <div v-for="item in (ratingOrder.items || ratingOrder.products)" 
                   :key="item.id" 
                   class="r-item-card"
                   :class="{ active: ratingItem?.id === item.id }"
                   @click="ratingItem = item">
                <img :src="getImageUrl(item.image)" alt="">
                <span>{{ item.name }}</span>
              </div>
           </div>
        </div>

        <div class="stars-input">
          <i v-for="star in 5" :key="star" 
             class="fa-star" 
             :class="star <= ratingValue ? 'fas active' : 'far'"
             @click="ratingValue = star"></i>
        </div>

        <textarea v-model="ratingComment" :placeholder="t('profile.rating_placeholder')" rows="4"></textarea>

        <button class="submit-rating-btn" @click="submitRating" :disabled="loadingData">
          {{ loadingData ? t('profile.sending') : t('profile.submit_rating') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import api from '../../config/axios'
import { cartState } from '../../store/cart'
import { authState, authActions } from '../../store/auth'
import { useOffers } from '../../composables/useOffers'
import { useLocalized } from '../../composables/useLocalized'
import { useSettings } from '../../composables/useSettings'
import { findCountryByCode } from '../../data/countries'
import { escapeHtml } from '../../utils/sanitize'
import returnsService from '../../services/returnsService'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { localized } = useLocalized()
const loadingData = ref(false)
const { getActiveOfferForProduct, calculateDiscountFromOffer, calculatePriceWithOffer, fetchOffers } = useOffers()
const { currency, fetchSettings } = useSettings()

// Tabs Handling
const currentTab = computed(() => route.query.tab || 'info')
const wishlistCount = computed(() => cartState.wishlist.length)
const ordersTotalCount = computed(() => ordersList.value.length)
const notifCount = ref(0) // Default to 0, no longer hardcoded

// Form State
const form = reactive({ name: '', email: '', phone: '', country: 'JO', rawCountryCode: 'JO' })
const showPasswordForm = ref(false)
const passForm = reactive({ password: '', password_confirmation: '' })

// Country Localization
const userCountryObj = computed(() => {
  const code = form.rawCountryCode || authState.user?.country || 'SA';
  return findCountryByCode(code);
});

const localizedCountryName = computed(() => {
  if (userCountryObj.value) {
    return locale.value === 'ar' ? userCountryObj.value.nameAr : userCountryObj.value.nameEn;
  }
  return form.country || (locale.value === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia');
});

// Data Lists
const addressesList = ref([])
const ordersList = ref([])
const notificationsList = ref([])
const orderTab = ref('current')
const expandedOrders = ref([])

const fetchNotifications = async () => {
  try {
    const res = await api.get('/frontend/notifications')
    const data = res.data?.data || res.data || []
    notificationsList.value = Array.isArray(data) ? data : []
    notifCount.value = notificationsList.value.filter(n => !n.is_read).length
  } catch (e) {
    notificationsList.value = []
    notifCount.value = 0
  }
}

// Returns State
const returnsList = ref([])
const showReturnForm = ref(false)
const returnStep = ref(1)
const selectedOrderForReturn = ref(null)
const selectedItemForReturn = ref(null)
const returnReason = ref('')

// Wallet State
const walletData = ref({ balance: 0, transactions: [] })
const loadingWallet = ref(false)
const activeFilter = ref('all')

const filters = [
  { label: t('profile.all'), value: 'all' },
  { label: t('profile.purchases'), value: 'purchase' },
  { label: t('profile.refunds'), value: 'deposit' }
]

const totalRefunds = computed(() => {
  return walletData.value.transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

const totalPurchases = computed(() => {
  return walletData.value.transactions
    .filter(t => t.type !== 'deposit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

const refundCount = computed(() => {
  return walletData.value.transactions.filter(t => t.type === 'deposit').length
})

const purchaseCount = computed(() => {
  return walletData.value.transactions.filter(t => t.type !== 'deposit').length
})

const filteredTransactions = computed(() => {
  if (activeFilter.value === 'all') {
    return walletData.value.transactions
  }
  if (activeFilter.value === 'deposit') {
    return walletData.value.transactions.filter(t => t.type === 'deposit')
  }
  if (activeFilter.value === 'purchase') {
    return walletData.value.transactions.filter(t => t.type !== 'deposit')
  }
  return walletData.value.transactions
})

// Addresses Logic
const showAddAddress = ref(false)
const isEditAddress = ref(false)
const editingAddressId = ref(null)
const addressForm = reactive({ name: '', full_name: '', address: '', city: '', country_id: null, city_id: null, phone: '', is_default: false })

// Countries and Cities
const countries = ref([])
const cities = ref([])

const fetchCountries = async () => {
  try {
    const res = await api.get('/frontend/countries')
    countries.value = res.data.data || res.data || []
    const jordan = countries.value.find(c => c.name?.includes('أردن') || c.name?.includes('Jordan') || c.code === 'JO') || countries.value[0]
    if (jordan) {
      addressForm.country_id = jordan.id
      await fetchCities(jordan.id)
    } else {
      await fetchCities()
    }
  } catch (err) {
    console.error('Failed to fetch countries', err)
  }
}

const fetchCities = async (countryId = null) => {
  try {
    const params = countryId ? { country_id: countryId } : {}
    const res = await api.get('/frontend/cities', { params })
    cities.value = res.data.data || res.data || []
    const amman = cities.value.find(c => (c.name || '').includes('عمان') || (c.name || '').toLowerCase().includes('amman') || (c.name_ar || '').includes('عمان')) || cities.value[0]
    if (amman && !addressForm.city_id) {
      addressForm.city_id = amman.id
      addressForm.city = amman.name || amman.name_ar || 'عمان'
    }
  } catch (err) {
    console.error('Failed to fetch cities', err)
  }
}

// Orders Logic
const displayedOrders = computed(() => {
  if (!ordersList.value || !Array.isArray(ordersList.value)) return [];
  
  return ordersList.value.filter(o => {
    const status = (o.status || '').toLowerCase();
    if (orderTab.value === 'current') {
      return !['delivered', 'cancelled', 'completed'].includes(status);
    } else {
      return ['delivered', 'cancelled', 'completed'].includes(status);
    }
  });
})

const formatPhoneWithCountryCode = (phone, country) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  
  const c = (country || '').toUpperCase();
  
  if (c === 'JO' || c === 'JORDAN') {
    if (cleaned.startsWith('00962')) {
      return '+' + cleaned.substring(2);
    }
    if (cleaned.startsWith('962')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('07') && cleaned.length === 10) {
      return '+962' + cleaned.substring(1);
    }
    if (cleaned.startsWith('7') && cleaned.length === 9) {
      return '+962' + cleaned;
    }
  }
  
  if (c === 'SA' || c === 'SAUDI ARABIA') {
    if (cleaned.startsWith('00966')) {
      return '+' + cleaned.substring(2);
    }
    if (cleaned.startsWith('966')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('05') && cleaned.length === 10) {
      return '+966' + cleaned.substring(1);
    }
    if (cleaned.startsWith('5') && cleaned.length === 9) {
      return '+966' + cleaned;
    }
  }
  
  if (c === 'KW' || c === 'KUWAIT') {
    if (cleaned.startsWith('00965')) {
      return '+' + cleaned.substring(2);
    }
    if (cleaned.startsWith('965')) {
      return '+' + cleaned;
    }
    if (cleaned.length === 8) {
      return '+965' + cleaned;
    }
  }
  
  return phone;
};

// SYNC FORM WITH STORE
watch(() => authState.user, (u) => {
  if (u) {
    form.name = u.name || u.full_name || ''
    form.email = u.email || ''
    
    // Map country code to uppercase capital country name
    const countryMap = {
      'JO': 'JORDAN',
      'SA': 'SAUDI ARABIA',
      'KW': 'KUWAIT',
      'AE': 'UAE',
      'QA': 'QATAR',
      'BH': 'BAHRAIN',
      'OM': 'OMAN',
      'EG': 'EGYPT'
    }
    const rawCountry = u.country || 'JO'
    form.rawCountryCode = rawCountry
    form.country = (countryMap[rawCountry.toUpperCase()] || rawCountry).toUpperCase()
    
    // Format phone with country code prefix
    form.phone = formatPhoneWithCountryCode(u.phone || '', rawCountry)
  }
}, { immediate: true })

const fetchData = async () => {
  if (!authState.token) return router.push('/')
  loadingData.value = true
  try {
    // Fresh User Data
    const uRes = await api.get('/frontend/user')
    authState.user = uRes.data.data || uRes.data.customer || uRes.data.user || uRes.data

    // Addresses & Orders
    const [addrRes, orderRes] = await Promise.allSettled([
      api.get('/frontend/addresses'),
      api.get('/frontend/orders/me')
    ])

    if (addrRes.status === 'fulfilled') {
      const a = addrRes.value.data?.data || addrRes.value.data || [];
      addressesList.value = Array.isArray(a) ? a : (Array.isArray(a.data) ? a.data : []);
    } else {
      addressesList.value = [];
    }
    if (orderRes.status === 'fulfilled') {
      const o = orderRes.value.data?.data || orderRes.value.data || [];
      ordersList.value = Array.isArray(o) ? o : (Array.isArray(o.data) ? o.data : []);
    } else {
      ordersList.value = [];
    }

    // Returns & Notifications
    fetchNotifications()
    try {
      returnsList.value = await returnsService.listMine()
    } catch (e) {
      returnsList.value = []
    }
  } catch (err) {
    // Silent fallback
  } finally {
    loadingData.value = false
  }
}

const fetchWallet = async () => {
  loadingWallet.value = true
  try {
    const res = await api.get('/frontend/wallet', { timeout: 8000 })
    const payload = res.data?.data || res.data || {}
    walletData.value = {
      balance: Number(payload.balance || 0),
      transactions: Array.isArray(payload.transactions) ? payload.transactions : []
    }
  } catch (err) {
    console.error('Failed to fetch wallet:', err)
    walletData.value = { balance: 0, transactions: [] }
  } finally {
    loadingWallet.value = false
  }
}

onMounted(async () => {
  if (!authState.token) {
    router.replace({ path: '/', query: { openAuth: 'true' } })
    return
  }
  fetchSettings()
  if (currentTab.value === 'wallet') {
    fetchWallet()
  }
  await fetchData()
  fetchOffers()
})

// RE-FETCH ON TAB CHANGE OR URL CHANGE
watch(() => route.query.tab, (newTab) => {
  if (!authState.token) {
    router.replace({ path: '/', query: { openAuth: 'true' } })
    return
  }
  if (newTab === 'wallet') {
    fetchWallet()
  }
  fetchData()
})

// Actions
const updateProfile = async () => {
  loadingData.value = true
  try {
    const payload = { ...form }
    
    // Map capitalized country name back to code if necessary
    const countryReverseMap = {
      'jordan': 'JO',
      'saudi arabia': 'SA',
      'kuwait': 'KW'
    }
    const countryLower = (payload.country || '').trim().toLowerCase()
    payload.country = countryReverseMap[countryLower] || payload.country
    
    const res = await api.put('/frontend/profile', payload)
    authState.user = res.data.data || res.data.customer || res.data.user || res.data
    alert(t('profile.update_success'))
  } catch (err) {
    alert(err.response?.data?.message || t('profile.update_failed'))
  } finally {
    loadingData.value = false
  }
}

const changePassword = async () => {
  loadingData.value = true
  try {
    await api.post('/frontend/change-password', passForm)
    alert(t('profile.password_changed'))
    showPasswordForm.value = false
    Object.assign(passForm, { password: '', password_confirmation: '' })
  } catch (err) {
    alert(err.response?.data?.message || t('profile.password_change_failed'))
  } finally {
    loadingData.value = false
  }
}

const openAddAddress = () => {
  isEditAddress.value = false
  Object.assign(addressForm, { name: '', full_name: '', address: '', city: '', country_id: null, city_id: null, phone: '', is_default: false })
  fetchCountries()
  fetchCities()
  showAddAddress.value = true
}

const editAddress = (addr) => {
  isEditAddress.value = true
  editingAddressId.value = addr.id
  Object.assign(addressForm, { ...addr, is_default: !!addr.is_default })
  fetchCountries()
  if (addr.country_id) {
    fetchCities(addr.country_id)
  } else {
    fetchCities()
  }
  showAddAddress.value = true
}

const saveAddress = async () => {
  loadingData.value = true
  try {
    // Get city name from selected city_id
    const selectedCity = cities.value.find(c => c.id === addressForm.city_id)
    const cityName = selectedCity ? selectedCity.name : ''

    const payload = {
      name: addressForm.name,
      full_name: addressForm.full_name,
      address: addressForm.address,
      city: cityName, // Send city name as string (backend expects this)
      phone: addressForm.phone,
      is_default: addressForm.is_default
    }

    console.log('Saving address payload:', payload)
    console.log('Current user:', authState.user)

    if (isEditAddress.value) {
      await api.put(`/frontend/addresses/${editingAddressId.value}`, payload)
    } else {
      await api.post('/frontend/addresses', payload)
    }
    showAddAddress.value = false
    fetchData()
  } catch (err) {
    console.error('Save address error:', err)
    console.error('Error response:', err.response?.data)
    alert(err.response?.data?.message || t('profile.save_address_failed'))
  } finally {
    loadingData.value = false
  }
}

const deleteAddress = async (id) => {
  if (!confirm(t('profile.delete_address_confirm'))) return
  try {
    await api.delete(`/frontend/addresses/${id}`)
    fetchData()
  } catch (err) { alert(t('profile.delete_failed')) }
}

const toggleOrder = (id) => {
  const i = expandedOrders.value.indexOf(id)
  if (i > -1) expandedOrders.value.splice(i, 1)
  else expandedOrders.value.push(id)
}

const handleLogout = () => authActions.logout()
const formatDate = (date) => new Date(date).toLocaleDateString(locale.value === 'ar' ? 'ar-JO' : 'en-US')
const formatPrice = (price) => parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatStatus = (s) => ({
  pending: t('profile.status_pending'),
  processing: t('profile.status_processing'),
  shipped: t('profile.status_shipped'),
  delivered: t('profile.status_delivered'),
  cancelled: t('profile.status_cancelled'),
  completed: t('profile.status_delivered')
}[s] || s)

const getPaymentLabel = (method) => {
  if (!method) return t('checkout.payment_methods.cash_on_delivery');
  const m = method.toString().toLowerCase().trim();
  if (m === 'card' || m === 'paytabs' || m === 'credit_card') return t('checkout.card');
  if (m === 'wallet') return t('checkout.payment_methods.wallet');
  if (m === 'cod' || m === 'cash') return t('checkout.payment_methods.cash_on_delivery');
  return method;
};

const formatReturnStatus = (s) => ({
  pending: t('profile.return_status_pending'),
  approved: t('profile.return_status_approved'),
  rejected: t('profile.return_status_rejected'),
  refunded: 'تم رد المبلغ'
}[s] || s)

const openReturnForm = () => {
  showReturnForm.value = true
  returnStep.value = 1
  selectedOrderForReturn.value = null
  selectedItemForReturn.value = null
  returnReason.value = ''
}

const submitReturnRequest = async () => {
  loadingData.value = true
  try {
    // Debug: log the data being sent
    console.log('Submitting return request:', {
      order_id: selectedOrderForReturn.value.id,
      order_item_id: selectedItemForReturn.value.id,
      reason: returnReason.value,
      selectedOrderForReturn: selectedOrderForReturn.value,
      selectedItemForReturn: selectedItemForReturn.value
    })

    const res = await returnsService.create({
      order_id: selectedOrderForReturn.value.id,
      order_item_id: selectedItemForReturn.value.id,
      reason: returnReason.value.trim()
    })
    alert(res.data.message)
    showReturnForm.value = false
    fetchData()
  } catch (err) {
    console.error('Return request error:', err)
    console.error('Error response:', err.response?.data)
    alert(err.response?.data?.message || err.message || t('profile.send_request_failed'))
  } finally {
    loadingData.value = false
  }
}

const getStatusIcon = (s) => {
  return {
    pending: 'far fa-clock',
    processing: 'fas fa-cog',
    shipped: 'fas fa-truck',
    delivered: 'fas fa-check-circle',
    cancelled: 'fas fa-times-circle'
  }[s] || 'fas fa-shopping-bag'
}

const isStepDone = (step, currentStatus) => {
  const steps = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = steps.indexOf(currentStatus)
  const stepIndex = steps.indexOf(step)
  return stepIndex <= currentIndex
}

const getStepTime = (order, step) => {
  // If activity log exists, find the date for that step
  if (order.activityLog && Array.isArray(order.activityLog)) {
    const entry = order.activityLog.find(l => l.status === step)
    if (entry) return entry.timestamp
  }
  
  // Fallback to order date if it's the pending step
  if (step === 'pending' && order.date) return order.date
  return ''
}

const printInvoice = async (order) => {
  try {
    // Fetch settings
    const settingsRes = await api.get('/frontend/settings')
    const settings = settingsRes.data.data || settingsRes.data
    
    const isIrisAsset = (val) => {
      if (!val) return false;
      const str = String(val).toLowerCase();
      return str.includes('iris') || str.includes('t3jcwn2n2rvkxvcva') || str.includes('dobvpg934hatbpm5') || str.includes('yugdc4mk4vmsf6el');
    };

    const logoVal = settings.find(s => s.key === 'logo')
    const siteLogo = (logoVal && logoVal.value && !isIrisAsset(logoVal.value))
      ? (logoVal.value.startsWith('http') 
        ? logoVal.value 
        : `${api.defaults.baseURL.replace('/api', '')}/storage/${logoVal.value}`)
      : '/brand/mastergas-logo.png'

    const nameVal = settings.find(s => s.key === 'site_name')
    const siteName = (nameVal && nameVal.value && !isIrisAsset(nameVal.value)) 
      ? nameVal.value 
      : 'ماسترجاز | Mastergas'
    const isRtl = locale.value === 'ar'
    const dir = isRtl ? 'rtl' : 'ltr'
    const textAlign = isRtl ? 'right' : 'left'
    const totalsMargin = isRtl ? 'margin-right: auto;' : 'margin-left: auto;'
    const safeOrderNumber = escapeHtml(order.orderNumber || order.order_number || order.id)
    const safeInvoiceTitle = escapeHtml(t('invoice.title'))
    const safeOrderNumberLabel = escapeHtml(t('checkout.order_number'))
    const safeInvoiceDateLabel = escapeHtml(t('invoice.date'))
    const safeCustomerInfoLabel = escapeHtml(t('invoice.customer_info'))
    const safeNameLabel = escapeHtml(t('auth.name'))
    const safePhoneLabel = escapeHtml(t('auth.phone'))
    const safeEmailLabel = escapeHtml(t('auth.email'))
    const safeShippingAddressLabel = escapeHtml(t('checkout.shipping_address'))
    const safeProductLabel = escapeHtml(t('product.title'))
    const safeQuantityLabel = escapeHtml(t('cart.quantity'))
    const safePriceLabel = escapeHtml(t('products.price'))
    const safeTotalLabel = escapeHtml(t('cart.total'))
    const safeSubtotalLabel = escapeHtml(t('checkout.subtotal'))
    const safeShippingLabel = escapeHtml(t('checkout.shipping'))
    const safeDiscountLabel = escapeHtml(t('offers.discount'))
    const safeCheckoutTotalLabel = escapeHtml(t('checkout.total'))
    const safeThankYou = escapeHtml(t('invoice.thank_you'))
    const safeCurrency = escapeHtml(t('currency'))
    const safeDate = escapeHtml(order.date || '')
    const safeSiteName = escapeHtml(siteName)
    const safeSiteLogo = escapeHtml(siteLogo)
    const safeCustomerName = escapeHtml(order.customerName || order.customer?.name || '')
    const safeCustomerPhone = escapeHtml(order.customerPhone || order.customer?.phone || '')
    const safeCustomerEmail = escapeHtml(order.customerEmail || order.customer?.email || '')
    const safeCustomerAddress = escapeHtml(order.customerAddress || order.shipping_address || '')

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${dir}">
      <head>
        <title>${safeInvoiceTitle} - ${safeOrderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; direction: ${dir}; text-align: ${textAlign}; padding: 30px; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #000000; padding-bottom: 20px; }
          .invoice-title { font-size: 32px; color: #000000; margin: 0; }
          .invoice-detail { color: #64748b; margin: 5px 0; }
          .logo { text-align: ${isRtl ? 'left' : 'right'}; }
          .logo-img { height: 60px; }
          .logo-text { font-size: 24px; color: #000000; font-weight: bold; margin: 0; }
          .invoice-customer { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .section-title { font-size: 16px; color: #000000; font-weight: bold; margin: 0 0 15px 0; grid-column: span 2; }
          .customer-info { color: #1e293b; margin: 5px 0; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .invoice-table thead { background: #000000; }
          .invoice-table th { color: white; padding: 12px 15px; text-align: ${textAlign}; font-weight: bold; }
          .invoice-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
          .invoice-totals { width: 300px; ${totalsMargin} display: flex; flex-direction: column; gap: 10px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 15px; background: #f8fafc; border-radius: 6px; }
          .total-row.grand-total { background: #000000; color: white; }
          .invoice-footer { text-align: center; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #000000; font-weight: bold; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <h2 class="invoice-title">${safeInvoiceTitle}</h2>
            <p class="invoice-detail">${safeOrderNumberLabel}: ${safeOrderNumber}</p>
            <p class="invoice-detail">${safeInvoiceDateLabel}: ${safeDate}</p>
          </div>
          <div class="logo">
            ${safeSiteLogo ? `<img src="${safeSiteLogo}" alt="${safeSiteName}" class="logo-img" />` : ''}
            <h3 class="logo-text">${safeSiteName}</h3>
          </div>
        </div>
        <div class="invoice-customer">
          <h4 class="section-title">${safeCustomerInfoLabel}</h4>
          <p class="customer-info"><strong>${safeNameLabel}:</strong> ${safeCustomerName}</p>
          <p class="customer-info"><strong>${safePhoneLabel}:</strong> ${safeCustomerPhone}</p>
          <p class="customer-info"><strong>${safeEmailLabel}:</strong> ${safeCustomerEmail}</p>
          <p class="customer-info"><strong>${safeShippingAddressLabel}:</strong> ${safeCustomerAddress}</p>
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>${safeProductLabel}</th>
              <th>${safeQuantityLabel}</th>
              <th>${safePriceLabel}</th>
              <th>${safeTotalLabel}</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || order.products || []).map(item => `
              <tr>
                <td>${escapeHtml(localized(item.product || item, 'name'))}</td>
                <td>${escapeHtml(item.quantity)}</td>
                <td>${(item.price || item.unit_price).toFixed(2)} ${safeCurrency}</td>
                <td>${((item.price || item.unit_price) * item.quantity).toFixed(2)} ${safeCurrency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="invoice-totals">
          <div class="total-row">
            <span>${safeSubtotalLabel}:</span>
            <strong>${(order.subtotal || 0).toFixed(2)} ${safeCurrency}</strong>
          </div>
          <div class="total-row">
            <span>${safeShippingLabel}:</span>
            <strong>${(order.shipping || 0).toFixed(2)} ${safeCurrency}</strong>
          </div>
          ${(order.discount > 0 ? `
          <div class="total-row">
            <span>${safeDiscountLabel}:</span>
            <strong>-${(order.discount || 0).toFixed(2)} ${safeCurrency}</strong>
          </div>
          ` : '')}
          <div class="total-row grand-total">
            <span>${safeCheckoutTotalLabel}:</span>
            <strong>${(order.total || order.total_amount).toFixed(2)} ${safeCurrency}</strong>
          </div>
        </div>
        <div class="invoice-footer">
          <p>${safeThankYou}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  } catch (err) {
    console.error('Failed to print invoice', err)
  }
}

const copyOrderID = (order) => {
  const id = order.orderNumber || order.order_number || order.id
  navigator.clipboard.writeText(id)
  alert(`${t('profile.order_number_copied')}: ${id}`)
}

const initiateReturn = (order) => {
  router.push('/profile?tab=returns')
  showReturnForm.value = true
  returnStep.value = 2 // Skip step 1 (order selection)
  selectedOrderForReturn.value = order
  selectedItemForReturn.value = null
  returnReason.value = ''
}

// Rating Logic
const showRatingModal = ref(false)
const ratingOrder = ref(null)
const ratingItem = ref(null)
const ratingValue = ref(5)
const ratingComment = ref('')

const initiateRating = (order) => {
  ratingOrder.value = order
  showRatingModal.value = true
  ratingItem.value = order.items?.[0] || order.products?.[0]
  ratingValue.value = 5
  ratingComment.value = ''
}

const submitRating = async () => {
  if (!ratingItem.value) return
  loadingData.value = true
  try {
    const resolvedProductId = Number(
      ratingItem.value.product?.id ?? ratingItem.value.product_id ?? ratingItem.value.id
    )

    await api.post('/frontend/reviews', {
      product_id: resolvedProductId,
      rating: ratingValue.value,
      comment: ratingComment.value,
      order_id: ratingOrder.value.id
    })
    alert(t('profile.thanks_for_rating'))
    showRatingModal.value = false
  } catch (err) {
    alert(err.response?.data?.message || t('profile.rating_failed'))
  } finally {
    loadingData.value = false
  }
}

const getImageUrl = (i) => {
  if (!i) return 'https://via.placeholder.com/80'
  const p = typeof i === 'object' ? i.image_path : i
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api';
  return p.startsWith('http') ? p : `${baseUrl.replace('/api', '')}/storage/${p}`
}
</script>

<style scoped>
.profile-page {
  padding: 140px 0 100px;
  background: #fcfbff;
  min-height: 100vh;
}
.uppercase-input {
  text-transform: uppercase;
}
.main-container { max-width: 1250px; margin: 0 auto; padding: 0 20px; }
.account-layout { display: grid; grid-template-columns: 280px 1fr; gap: 30px; }

/* Sidebar */
/* Sidebar */
.account-sidebar { position: sticky; top: 120px; }
.sidebar-inner { background: #fff; border-radius: 20px; padding: 10px; border: 1px solid #f0f0f5; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; color: #4b5563; text-decoration: none; font-weight: 700; transition: 0.3s; margin-bottom: 2px; }
.nav-item i { font-size: 16px; width: 20px; }
.nav-item:hover { background: #f8fafc; color: #000000; }
.nav-item.active { background: #000000; color: #fff; }
.count-badge { background: rgba(255,255,255,0.2); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 20px; margin-right: auto; }
.nav-item:not(.active) .count-badge { background: #f1f5f9; color: #64748b; }
.sidebar-footer { margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
.logout-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: none; border: none; color: #ef4444; font-weight: 800; cursor: pointer; border-radius: 10px; transition: 0.3s; }
.logout-btn:hover { background: #fef2f2; }

/* Main Content */
.account-main { background: #fff; border-radius: 25px; padding: 32px; border: 1px solid #f0f0f5; min-height: 600px; box-sizing: border-box; width: 100%; }
.view-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f3f4f6; }
.flex-header { display: flex; justify-content: space-between; align-items: center; }
.view-title { font-size: 24px; font-weight: 800; color: #111827; }
.view-title .count { color: #9ca3af; font-size: 18px; font-weight: 400; }

/* Form Elements */
.profile-form { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 700; font-size: 14px; color: #374151; }
.form-group input, .form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 15px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  transition: 0.2s;
  background: #fff;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.form-group input:focus, .form-group select:focus {
  border-color: #000000;
  outline: none;
  box-shadow: 0 0 0 3px rgba(135, 50, 96, 0.05);
}

.input-relative {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.input-relative input,
.input-relative select {
  width: 100%;
  box-sizing: border-box;
}

.input-relative .input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
  pointer-events: none;
}

[dir="rtl"] .input-relative .input-icon,
html[dir="rtl"] .input-relative .input-icon {
  left: 14px;
  right: auto;
}

[dir="rtl"] .input-relative input,
[dir="rtl"] .input-relative select,
html[dir="rtl"] .input-relative input,
html[dir="rtl"] .input-relative select {
  padding-left: 42px !important;
  padding-right: 15px !important;
}

[dir="ltr"] .input-relative .input-icon,
html[dir="ltr"] .input-relative .input-icon {
  right: 14px;
  left: auto;
}

[dir="ltr"] .input-relative input,
[dir="ltr"] .input-relative select,
html[dir="ltr"] .input-relative input,
html[dir="ltr"] .input-relative select {
  padding-right: 42px !important;
  padding-left: 15px !important;
}

.input-relative select ~ .fa-chevron-down {
  color: #000000 !important;
  font-weight: 900 !important;
}
.form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.save-btn { background: #000000; color: #fff; border: none; padding: 12px 35px; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.3s; }
.save-btn:hover { opacity: 0.9; }
.change-pw-btn { background: none; border: none; color: #000000; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.cancel-btn { background: #f3f4f6; border: none; padding: 12px 25px; border-radius: 10px; color: #4b5563; font-weight: 700; cursor: pointer; transition: 0.3s; }
.cancel-btn:hover { background: #e5e7eb; }

.add-btn {
  background: #000000;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(135, 50, 96, 0.15);
}
.add-btn:hover {
  background: #4a1936;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(135, 50, 96, 0.2);
}

.inner-subtitle {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 20px;
}

.address-form-box {
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 25px;
  border: 1px solid #f1f5f9;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  font-weight: 700;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
}
.checkbox-group input {
  width: 18px;
  height: 18px;
  accent-color: #000000;
  cursor: pointer;
}

/* Addresses Grid */
.addresses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; width: 100%; }
.address-card { border: 1.5px solid #f3f4f6; border-radius: 15px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; width: 100%; box-sizing: border-box; background: #fff; }
.address-card:hover { border-color: rgba(0,0,0,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.addr-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.addr-tag { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.addr-name { font-size: 17px; font-weight: 800; margin: 0; color: #111827; }
.default-badge { font-size: 10px; background: #00000011; color: #000000; padding: 2px 8px; border-radius: 5px; }

.addr-owner {
  font-weight: 700;
  color: #1f2937;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  line-height: 1.5;
}

.addr-owner i,
.addr-country i,
.addr-full-text i,
.addr-phone i {
  color: #000000;
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.addr-country {
  font-weight: 600;
  color: #4b5563;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  line-height: 1.5;
}

.addr-full-text {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.addr-phone {
  font-weight: 700;
  color: #111827;
  font-size: 14px;
  direction: ltr;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  width: fit-content;
  line-height: 1.5;
}

.addr-actions { display: flex; gap: 10px; }
.addr-actions button { border: none; background: #f9fafb; width: 35px; height: 35px; border-radius: 8px; color: #9ca3af; cursor: pointer; transition: 0.2s; }
.addr-actions button:hover { color: #000000; background: #f3f4f6; }
.addr-actions .del-btn:hover { color: #ef4444; background: #fef2f2; }

/* Redesigned Orders V2 */
.header-main-title { display: flex; align-items: center; gap: 10px; }
.view-subtitle-count { color: #94a3b8; font-size: 16px; font-weight: 500; }

.order-filter-tabs-v2 { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; gap: 4px; }
.order-filter-tabs-v2 button { border: none; padding: 8px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; color: #64748b; background: none; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.order-filter-tabs-v2 button.active { background: #000000; color: #fff; }
.tab-count-v2 { font-size: 11px; padding: 2px 6px; border-radius: 6px; background: rgba(0,0,0,0.1); }
.order-filter-tabs-v2 button.active .tab-count-v2 { background: rgba(255,255,255,0.2); }

.filter-icon-btn { border: none; background: #f8fafc; color: #64748b; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #e2e8f0; }

.orders-list-v2 { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; width: 100%; }
.order-card-v2 { background: #fff; border: 1.5px solid #f1f5f9; border-radius: 18px; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; box-sizing: border-box; }
.order-card-v2.expanded { border-color: #000000; box-shadow: 0 10px 30px rgba(135, 50, 96, 0.08); }

.order-summary-v2 { padding: 20px 24px; display: grid; grid-template-columns: 40px 1.5fr 1fr 1fr; align-items: center; cursor: pointer; transition: 0.2s; width: 100%; box-sizing: border-box; }
.order-summary-v2:hover { background: #fcfbff; }

.collapse-icon { color: #cbd5e1; transition: 0.3s; }
.collapse-icon.rotated { transform: rotate(180deg); color: #000000; }

.order-id-v2 { display: flex; flex-direction: column; gap: 4px; }
.id-text { font-weight: 800; color: #1e293b; font-size: 15px; }
.order-date-v2 { font-size: 12px; color: #94a3b8; font-weight: 500; }

.status-badge-v2 { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10px; font-weight: 700; font-size: 13px; }
.status-badge-v2.pending { background: #fff7ed; color: #f97316; }
.status-badge-v2.processing { background: #f0f9ff; color: #0ea5e9; }
.status-badge-v2.shipped { background: #fdf4ff; color: #a21caf; }
.status-badge-v2.delivered { background: #ecfdf5; color: #10b981; }

.order-total-v2 { text-align: left; font-weight: 800; color: #000000; font-size: 17px; }

/* Detailed Content */
.order-detailed-content { background: #fff; padding: 0 25px 25px; border-top: 1px solid #f1f5f9; animation: slideDown 0.4s easeOutQuad; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

.detail-section { padding: 25px 0; border-bottom: 1px solid #f1f5f9; }
.section-title-v2 { font-weight: 800; color: #1e293b; font-size: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
.section-title-v2 i { color: #000000; }

/* Vertical Timeline */
.vertical-timeline { position: relative; padding-left: 10px; margin-top: 10px; }
.vertical-timeline::before { content: ''; position: absolute; right: 26px; top: 10px; bottom: 10px; width: 2px; background: #f1f5f9; }

.timeline-item { position: relative; padding-right: 55px; margin-bottom: 25px; display: flex; align-items: flex-start; }
.timeline-item:last-child { margin-bottom: 0; }
.timeline-dot { position: absolute; right: 18px; top: 0; width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 2px solid #e2e8f0; z-index: 1; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #fff; }
.timeline-item.active .timeline-dot { background: #000000; border-color: #000000; }
.timeline-item.active .timeline-dot::after { content: ''; position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(0, 0, 0, 0.08); }

.timeline-info { display: flex; flex-direction: column; gap: 2px; }
.step-name { font-weight: 700; color: #64748b; font-size: 14px; }
.timeline-item.active .step-name { color: #1e293b; }
.step-time { font-size: 11px; color: #94a3b8; }

/* Products V2 */
.order-products-v2 { display: flex; flex-direction: column; gap: 12px; }
.o-prod-card-v2 { background: #fafafa; padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 15px; }
.o-prod-img-v2 { width: 45px; height: 45px; border-radius: 8px; object-fit: cover; }
.o-prod-details-v2 { flex: 1; }
.o-prod-name-v2 { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
.o-prod-qty-v2 { font-size: 12px; color: #64748b; }
.o-prod-total-price-v2 { font-weight: 800; color: #1e293b; font-size: 14px; }

/* Detail section grid */
.detail-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 25px 0; border-bottom: 1px solid #f1f5f9; }

.info-rows-v2, .summary-rows-v2 { display: flex; flex-direction: column; gap: 12px; }
.info-row-v2, .summary-row-v2 { display: flex; justify-content: space-between; font-size: 14px; }
.info-row-v2 span, .summary-row-v2 span { color: #64748b; font-weight: 500; }
.info-row-v2 strong { color: #1e293b; font-weight: 700; text-align: left; }
.summary-row-v2 span:last-child { color: #1e293b; font-weight: 700; }
.discount-text-v2 { color: #10b981 !important; }
.grand-total-v2 { margin-top: 5px; padding-top: 12px; border-top: 2px dashed #f1f5f9; font-size: 17px; }
.grand-total-v2 span:last-child { color: #000000; font-weight: 900; }

/* Footer Actions */
.order-footer-actions-v2 { display: flex; gap: 12px; padding-top: 25px; }
.btn-inverse-v2 { background: #000000; color: #fff; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
.btn-inverse-v2:hover { background: #4a1936; box-shadow: 0 5px 15px rgba(135, 50, 96, 0.2); }
.btn-outline-v2 { background: #fff; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
.btn-outline-v2:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }

/* Empty State V2 */
.empty-state-v2 { text-align: center; padding: 60px 0; }
.empty-state-v2 .empty-icon { font-size: 80px; opacity: 0.2; margin-bottom: 20px; color: #94a3b8; }
.empty-state-v2 p { color: #94a3b8; font-weight: 600; font-size: 16px; }

/* Adjustments */
.order-details-pane { display: none; } /* Hide old one */

/* Wishlist */
.wishlist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.wish-card { border: 1.5px solid #f3f4f6; border-radius: 20px; padding: 15px; display: flex; gap: 15px; transition: 0.3s; }
.wish-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.03); }
.wish-card img { width: 90px; height: 90px; border-radius: 12px; object-fit: cover; cursor: pointer; }
.wish-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.wish-body h4 { font-size: 16px; font-weight: 800; margin: 0; cursor: pointer; }
.wish-price { font-weight: 800; color: #000000; font-size: 17px; }
.wish-card-actions { display: flex; gap: 8px; }
.wish-add-cart { flex: 1; border: none; background: #f3f4f6; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #000000; cursor: pointer; transition: 0.3s; }
.wish-add-cart:hover { background: #000000; color: #fff; }
.wish-remove { width: 35px; height: 35px; border: none; background: #fee2e2; color: #ef4444; border-radius: 8px; cursor: pointer; }

/* Empty States */
.empty-state, .placeholder-msg, .empty-view { text-align: center; color: #9ca3af; padding: 40px 0; }
.empty-icon { font-size: 50px; margin-bottom: 15px; }
.go-shop-btn { display: inline-block; background: #000000; color: #fff; padding: 10px 25px; border-radius: 10px; text-decoration: none; font-weight: 800; margin-top: 15px; }

/* Country Readonly Input */
.country-readonly-input {
  background-color: #f8fafc !important;
  color: #1f2937 !important;
  font-weight: 700 !important;
  border: 1px solid #e5e7eb !important;
  text-align: left !important;
  cursor: not-allowed;
}

[dir="ltr"] .country-readonly-input,
html[dir="ltr"] .country-readonly-input {
  text-align: left !important;
}

/* Mobile Profile Scroll Tabs */
.profile-mobile-tabs-container {
  display: none;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

.profile-mobile-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 8px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.profile-mobile-tabs::-webkit-scrollbar {
  display: none;
}

.mobile-tab-btn {
  flex: 0 0 auto;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #4b5563;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-sizing: border-box;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.mobile-tab-btn i {
  font-size: 13px;
  color: #6b7280;
  flex-shrink: 0;
}

.mobile-tab-btn span {
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-tab-btn.active {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(135, 50, 96, 0.2);
}

.mobile-tab-btn.active i {
  color: #ffffff;
}

.mobile-tab-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  font-weight: 800;
  background: #f1f5f9;
  color: #64748b;
  margin-left: 2px;
}

.mobile-tab-btn.active .mobile-tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.mobile-tab-badge.danger {
  background: #ef4444;
  color: #ffffff;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .profile-page { padding: 25px 0 25px !important; }
  .account-layout { grid-template-columns: 1fr; gap: 0; }
  .account-sidebar { display: none !important; }
  .profile-mobile-tabs-container { display: block !important; }
  .account-main { padding: 16px 14px !important; border-radius: 16px !important; }
  .wishlist-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}

/* Returns Styles */
.return-form-box {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.return-form-box .custom-select-v2,
.return-form-box textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  transition: 0.2s;
  outline: none;
  background: #fff;
}

.return-form-box .custom-select-v2:focus,
.return-form-box textarea:focus {
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(135, 50, 96, 0.05);
}

.return-form-box .custom-select-v2 {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 12px center;
  padding-left: 35px;
}

.return-form-box textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.return-form-box .char-count {
  font-size: 12px;
  color: #6b7280;
  text-align: left;
  margin-top: 5px;
}

.return-form-box .char-count.valid {
  color: #10b981;
}

.return-form-box .char-count.invalid {
  color: #ef4444;
}

/* Notifications Styles */
.notifications-list-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 16px 20px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #f1f5f9;
  transition: 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.notif-card.unread {
  background: #fdfbff;
  border-color: rgba(135, 50, 96, 0.2);
}

.notif-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f3f4f6;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.notif-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notif-title {
  font-weight: 700;
  font-size: 15px;
  color: #111827;
}

.notif-message {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.notif-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

/* Wallet Styles - Figma Design */
.wallet-view {
  background: transparent;
  min-height: 100%;
}

.wallet-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* Main Balance Card */
.wallet-balance-card {
  background: linear-gradient(135deg, #8E2DE2 0%, #C94B4B 100%);
  color: #fff;
  padding: 32px;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.wallet-balance-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.wallet-balance-card::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: 10%;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.balance-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1;
}

.balance-title {
  font-size: 16px;
  opacity: 0.9;
  font-weight: 500;
}

.balance-value {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
}

.balance-subtitle {
  font-size: 13px;
  opacity: 0.8;
  font-weight: 400;
}

.balance-icon {
  font-size: 56px;
  opacity: 0.3;
  z-index: 1;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
}

.stat-header {
  position: absolute;
  top: 16px;
  right: 16px;
}

.stat-icon {
  font-size: 16px;
  opacity: 0.6;
}

.stat-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  margin-top: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.stat-count {
  display: block;
  font-size: 12px;
  font-weight: 500;
}

.refund-card {
  background: #E6F4EA;
}

.refund-card .stat-title,
.refund-card .stat-count {
  color: #166534;
}

.refund-card .stat-value {
  color: #15803d;
}

.refund-card .stat-icon {
  color: #166534;
}

.purchase-card {
  background: #FDECEC;
}

.purchase-card .stat-title,
.purchase-card .stat-count {
  color: #991b1b;
}

.purchase-card .stat-value {
  color: #b91c1c;
}

.purchase-card .stat-icon {
  color: #991b1b;
}

/* Transactions Section */
.wallet-transactions {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.transactions-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.transaction-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #8E2DE2;
  color: #8E2DE2;
}

.filter-btn.active {
  background: #8E2DE2;
  color: #fff;
  border-color: #8E2DE2;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.transaction-item:hover {
  border-color: #8E2DE2;
  box-shadow: 0 4px 12px rgba(142, 45, 226, 0.1);
}

.transaction-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.transaction-icon.deposit {
  background: #E6F4EA;
  color: #166534;
}

.transaction-icon.purchase {
  background: #FDECEC;
  color: #991b1b;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-desc {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.transaction-subtext {
  font-size: 13px;
  color: #9ca3af;
}

.transaction-amount {
  font-weight: 700;
  font-size: 16px;
}

.transaction-amount.deposit {
  color: #166534;
}

.transaction-amount.purchase {
  color: #991b1b;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .transactions-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .wallet-container {
    padding: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .wallet-balance-card {
    padding: 20px 18px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    box-sizing: border-box;
    width: 100%;
  }

  .balance-value {
    font-size: 26px;
  }
}

.product-selection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 15px 0;
  max-height: 400px;
  overflow-y: auto;
  padding: 5px;
}

.product-select-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border: 1.5px solid #f1f5f9;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
}

.product-select-item:hover {
  background: #fcfbff;
  border-color: rgba(0,0,0,0.15);
}

.product-select-item.selected {
  border-color: #000000;
  background: #f3f4f6;
}

.p-mini-img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.p-mini-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.p-mini-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.p-mini-price {
  font-size: 13px;
  color: #000000;
  font-weight: 600;
}

.p-check {
  color: #000000;
  opacity: 0;
  transition: 0.2s;
}

.product-select-item.selected .p-check {
  opacity: 1;
}

.return-card {
  background: #fff;
  border: 1.5px solid #f1f5f9;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 15px;
}

.ret-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #f1f5f9;
}

.ret-id {
  font-weight: 800;
  color: #1e293b;
}

.ret-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.ret-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
}

.ret-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ret-pname {
  font-weight: 800;
  color: #1e293b;
  font-size: 16px;
}

.ret-order {
  font-size: 13px;
  color: #64748b;
}

.ret-reason, .ret-notes {
  font-size: 14px;
  color: #4b5563;
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
  margin-top: 5px;
}

.ret-refund {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.refund-label {
  font-size: 12px;
  color: #94a3b8;
}

.refund-val {
  font-weight: 800;
  color: #000000;
  font-size: 18px;
}

.ret-footer {
  margin-top: 15px;
  text-align: left;
  font-size: 12px;
  color: #94a3b8;
}

.btn-rate-v2, .btn-return-v2 {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
}

.btn-rate-v2 {
  background: #f3f4f6;
  color: #000000;
  border: 1px solid rgba(0,0,0,0.15);
}
.btn-rate-v2:hover {
  background: #000000;
  color: #fff;
}

.btn-return-v2 {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.btn-return-v2:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Rating Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.rating-modal {
  background: #fff;
  width: 90%;
  max-width: 450px;
  padding: 40px;
  border-radius: 25px;
  position: relative;
  text-align: center;
}

.close-modal {
  position: absolute;
  top: 20px; right: 20px;
  background: none; border: none;
  font-size: 24px; color: #94a3b8;
  cursor: pointer;
}

.modal-title { font-size: 22px; font-weight: 800; margin-bottom: 10px; color: #1e293b; }
.modal-desc { color: #64748b; font-size: 14px; margin-bottom: 25px; }

.rating-item-select { margin-bottom: 20px; }
.rating-item-select label { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 10px; display: block; }
.rating-prods-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; }
.r-item-card { 
  flex: 0 0 100px; padding: 10px; border: 1.5px solid #f1f5f9; border-radius: 12px; cursor: pointer; transition: 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
}
.r-item-card img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; }
.r-item-card span { font-size: 11px; font-weight: 700; color: #64748b; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.r-item-card.active { border-color: #000000; background: #f3f4f6; }
.r-item-card.active span { color: #000000; }

.stars-input { display: flex; justify-content: center; gap: 12px; margin-bottom: 25px; }
.stars-input i { font-size: 32px; color: #e2e8f0; cursor: pointer; transition: 0.2s; }
.stars-input i.active { color: #ffb800; transform: scale(1.1); }

.rating-modal textarea {
  width: 100%; border: 1.5px solid #f1f5f9; border-radius: 15px; padding: 15px; font-family: inherit; margin-bottom: 25px; outline: none;
}
.rating-modal textarea:focus { border-color: #000000; }

.submit-rating-btn {
  width: 100%; background: #000000; color: #fff; border: none; padding: 15px; border-radius: 15px; font-weight: 800; cursor: pointer; transition: 0.3s;
}
.submit-rating-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(135, 50, 96, 0.2); }

.fixed-country-input {
  background-color: #ffffff !important;
  color: #111827 !important;
  font-weight: 700 !important;
  border: 1px solid #e5e7eb !important;
}

.input-relative select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  padding-right: 45px !important;
  padding-left: 15px !important;
}

.input-relative select ~ .fa-chevron-down {
  left: auto !important;
  right: 18px !important;
  color: #000000 !important;
  font-weight: 900 !important;
}

[dir="rtl"] .input-relative select,
html[dir="rtl"] .input-relative select {
  padding-left: 45px !important;
  padding-right: 15px !important;
}

[dir="rtl"] .input-relative select ~ .fa-chevron-down,
html[dir="rtl"] .input-relative select ~ .fa-chevron-down {
  right: auto !important;
  left: 18px !important;
  color: #000000 !important;
  font-weight: 900 !important;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .profile-page { 
    padding: 25px 0 30px !important; 
    overflow-x: hidden; 
    width: 100%; 
  }
  .main-container { 
    padding: 0 16px !important; 
    width: 100% !important; 
    box-sizing: border-box !important; 
  }
  .account-layout { 
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important; 
    width: 100% !important; 
    box-sizing: border-box !important; 
  }
  .account-sidebar { display: none !important; }
  .profile-mobile-tabs-container { 
    display: block !important; 
    width: 100% !important; 
    box-sizing: border-box !important; 
    padding: 0 !important; 
  }
  .account-main { 
    padding: 20px 16px !important; 
    border-radius: 16px !important; 
    width: 100% !important; 
    box-sizing: border-box !important; 
    overflow: hidden !important;
  }
  .wishlist-grid { grid-template-columns: 1fr !important; }
  
  .form-container,
  .profile-form {
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .form-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  }

  .form-group {
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    min-width: 0 !important;
  }

  .form-group input,
  .form-group select {
    width: 100% !important;
    box-sizing: border-box !important;
    max-width: 100% !important;
  }
  
  /* Symmetrical Inner Cards Padding */
  .notif-card,
  .address-card,
  .wish-card,
  .return-card,
  .order-card-v2,
  .wallet-balance-card,
  .stat-card,
  .transaction-item,
  .return-form-box {
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 14px 14px !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  .order-summary-v2 {
    padding: 14px 12px !important;
    grid-template-columns: 24px 1fr auto !important;
    gap: 8px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  
  .order-footer-actions-v2 { flex-direction: column !important; width: 100% !important; }
  .order-footer-actions-v2 button { width: 100% !important; }
}

@media (max-width: 640px) {
  .profile-page { padding: 20px 0 20px !important; }
  .main-container { padding: 0 16px !important; box-sizing: border-box !important; }
}
</style>
