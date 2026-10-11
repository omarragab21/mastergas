<template>
    <transition name="fade">
      <div v-if="visible" class="lightbox-overlay" @click.self="closeLightbox">
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
            @click="selectImage(idx)"
          >
            <img :src="img" @error="handleImageError($event, idx)" />
          </div>
        </div>
      </div>
    </transition>
</template>
<script setup>
import { toRefs } from 'vue';
const props = defineProps({ visible: { type: Boolean, default: false }, allImages: { type: Array, default: () => [] }, lightboxIndex: { type: Number, default: 0 }, product: { type: Object, default: null }, handleImageError: { type: Function, required: true } });
const emit = defineEmits(['close', 'next', 'prev', 'select']);
const { visible, allImages, lightboxIndex, product } = toRefs(props);
const closeLightbox = () => emit('close');
const nextLightbox = () => emit('next');
const prevLightbox = () => emit('prev');
const selectImage = (index) => emit('select', index);
</script>
