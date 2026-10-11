<template>
    <!-- Share Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="visible" class="share-modal-overlay" @click.self="emit('close')">
          <div class="share-modal-content">
            <div class="share-header">
              <button class="share-close" @click="emit('close')"><i class="fas fa-times"></i></button>
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
</template>
<script setup>
import { useI18n } from 'vue-i18n';
defineProps({ visible: { type: Boolean, default: false }, linkCopied: { type: Boolean, default: false }, shareTo: { type: Function, required: true }, copyLink: { type: Function, required: true } });
const emit = defineEmits(['close']);
const { t } = useI18n();
</script>
