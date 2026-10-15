<template>
    <!-- Add Review Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="visible" class="share-modal-overlay" @click.self="emit('close')">
          <div class="share-modal-content review-modal-card">
            <div class="share-header">
              <button class="share-close" @click="emit('close')"><i class="fas fa-times"></i></button>
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
                    @click="emit('update-rating', i)"
                  ></i>
                </div>
              </div>
              
              <div class="form-group">
                <label>{{ t('product.your_opinion') }}:</label>
                <textarea :value="reviewForm.comment" :placeholder="t('product.review_placeholder')" rows="4" @input="emit('update-comment', $event.target.value)"></textarea>
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
</template>
<script setup>
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
const props = defineProps({ visible: { type: Boolean, default: false }, user: { type: Object, default: null }, reviewForm: { type: Object, required: true }, isSubmittingReview: { type: Boolean, default: false }, reviewMessage: { type: String, default: '' }, reviewStatus: { type: String, default: '' }, openLoginModal: { type: Function, required: true }, submitReview: { type: Function, required: true } });
const emit = defineEmits(['close', 'update-rating', 'update-comment']);
const { t, locale } = useI18n();
const { reviewForm } = toRefs(props);
</script>
