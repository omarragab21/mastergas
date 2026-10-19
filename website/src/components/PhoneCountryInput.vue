<template>
  <div class="phone-input-wrapper" :class="{ 'has-error': error }" :data-dir="dir">
    <!-- Country selector: dial code, flag and a native dropdown -->
    <div class="country-selector-box">
      <span class="country-dial-badge">{{ activeCountry.dialCode }}</span>
      <span class="country-flag-badge">{{ activeCountry.flag }}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
      <select
        class="native-country-select"
        :value="country"
        :dir="dir"
        :aria-label="countryLabel"
        @change="$emit('update:country', $event.target.value)"
      >
        <option v-for="c in countries" :key="c.code" :value="c.code">
          {{ c.dialCode }} {{ c.flag }} - {{ dir === 'rtl' ? c.nameAr : c.nameEn }}
        </option>
      </select>
    </div>

    <!-- Phone number -->
    <input
      type="tel"
      class="phone-field"
      :value="modelValue"
      :placeholder="activeCountry.placeholder"
      :maxlength="activeCountry.maxLength"
      :aria-invalid="error"
      dir="ltr"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { countries, findCountryByCode } from '../data/countries';

const props = defineProps({
  modelValue: { type: String, default: '' },
  country: { type: String, default: 'JO' },
  error: { type: Boolean, default: false },
  dir: { type: String, default: 'rtl' },
  countryLabel: { type: String, default: '' },
});

defineEmits(['update:modelValue', 'update:country']);

const activeCountry = computed(() => findCountryByCode(props.country));
</script>

<style scoped>
/* Size, radius, border and type can be themed by the parent through these variables */
.phone-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--phone-height, 48px);
  direction: ltr;
  border: 1px solid var(--phone-border, #e5e7eb);
  border-radius: var(--phone-radius, 10px);
  background: #ffffff;
  overflow: hidden;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.phone-input-wrapper:focus-within {
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
}

.phone-input-wrapper.has-error {
  border-color: #dc2626;
}

.country-selector-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 100%;
  padding: 0 10px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  border-left: none;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
}

.country-dial-badge {
  font-family: 'IBM Plex Sans Arabic', system-ui, -apple-system, sans-serif;
  font-size: var(--phone-dial-size, 13px);
  font-weight: var(--phone-dial-weight, 700);
  color: var(--phone-color, #1f2937);
  direction: ltr;
  line-height: 1;
}

.country-flag-badge {
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

.chevron-icon {
  color: #6b7280;
  margin-right: 2px;
  flex-shrink: 0;
}

.native-country-select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  margin: 0;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  z-index: 10;
}

.native-country-select option {
  opacity: 1;
  background: #ffffff;
  color: #1f2937;
  padding: 10px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 14px;
  direction: rtl;
  text-align: right;
}

.phone-field {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 14px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: var(--phone-font-size, 14px);
  font-weight: var(--phone-font-weight, 600);
  color: var(--phone-color, #1f2937);
  text-align: right;
  box-sizing: border-box;
}

.phone-input-wrapper[data-dir="ltr"] .phone-field {
  text-align: left;
}

.phone-field::placeholder {
  color: #9ca3af;
}
</style>
