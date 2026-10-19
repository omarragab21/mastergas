<template>
    <!-- Share Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="visible" class="share-modal-overlay" @click.self="emit('close')">
          <div class="share-card" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
            <div class="share-card-header">
              <h3 class="share-card-title">{{ t('product.share_product') }}</h3>
              <button class="share-card-close" type="button" @click="emit('close')">
                <img :src="shareCloseIcon" alt="" />
              </button>
            </div>
            <div class="share-card-options">
              <button class="share-card-option" type="button" @click="shareTo('whatsapp')">
                <span class="share-card-circle whatsapp"><img class="flip" :src="shareWhatsappIcon" alt="" /></span>
                <span class="share-card-label">{{ t('product.share_whatsapp') }}</span>
              </button>
              <button class="share-card-option" type="button" @click="shareTo('facebook')">
                <span class="share-card-circle facebook"><img class="flip" :src="shareFacebookIcon" alt="" /></span>
                <span class="share-card-label">{{ t('product.share_facebook') }}</span>
              </button>
              <a class="share-card-option" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                <span class="share-card-circle instagram"><img class="flip" :src="shareInstagramIcon" alt="" /></span>
                <span class="share-card-label">{{ t('product.share_instagram') }}</span>
              </a>
              <button class="share-card-option" type="button" @click="copyLink">
                <span class="share-card-circle copy"><img :src="shareCopyLinkIcon" alt="" /></span>
                <span class="share-card-label">{{ t('product.copy_link') }}</span>
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
import shareCloseIcon from '../../../assets/share-close.svg';
import shareCopyLinkIcon from '../../../assets/share-copy-link.svg';
import shareInstagramIcon from '../../../assets/share-instagram.svg';
import shareFacebookIcon from '../../../assets/share-facebook.svg';
import shareWhatsappIcon from '../../../assets/share-whatsapp.svg';
defineProps({ visible: { type: Boolean, default: false }, linkCopied: { type: Boolean, default: false }, shareTo: { type: Function, required: true }, copyLink: { type: Function, required: true } });
const emit = defineEmits(['close']);
const { t, locale } = useI18n();
</script>
