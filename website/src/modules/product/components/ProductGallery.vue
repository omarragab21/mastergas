<template>
          <div class="gallery-column">
            <!-- Main Image Container -->
            <div class="main-image-container" @click="openLightbox(currentImageIndex)">
              <img 
                :src="allImages[currentImageIndex]" 
                :alt="localized(product, 'name')" 
                class="main-image"
                @error="handleImageError($event, currentImageIndex)"
              />
            </div>

            <!-- Thumbnail Row (4 Thumbnails) -->
            <div class="thumbnail-row" v-if="allImages.length > 1">
              <div 
                v-for="(img, index) in allImages.slice(0, 4)" 
                :key="index" 
                class="thumb-box"
                :class="{ 'thumb-active': currentImageIndex === index }"
                @click="selectImage(index)"
              >
                <img 
                  :src="img" 
                  :alt="localized(product, 'name')" 
                  class="thumb-img"
                  @error="handleImageError($event, index)"
                />
              </div>
            </div>
          </div>
</template>
<script setup>
import { toRefs } from 'vue';
const props = defineProps({ product: { type: Object, required: true }, allImages: { type: Array, default: () => [] }, currentImageIndex: { type: Number, default: 0 }, localized: { type: Function, required: true }, handleImageError: { type: Function, required: true } });
const emit = defineEmits(['open-lightbox', 'select-image']);
const { product, allImages, currentImageIndex, localized } = toRefs(props);
const openLightbox = (index) => emit('open-lightbox', index);
const selectImage = (index) => emit('select-image', index);
</script>
