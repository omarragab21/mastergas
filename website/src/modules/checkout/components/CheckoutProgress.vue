<template>
  <div v-if="currentStep < 5" class="checkout-progress-wrapper">
    <div class="checkout-progress">
      <div
        v-for="step in steps"
        :key="step.id"
        class="step-item"
        :class="{ active: currentStep === step.id, completed: currentStep > step.id }"
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
</template>

<script setup>
defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, required: true },
});
</script>

<style scoped>
.checkout-progress-wrapper { margin-bottom: 60px; }
.checkout-progress { display: flex; justify-content: space-between; position: relative; max-width: 800px; margin: 0 auto; }
.progress-line { position: absolute; top: 18px; left: 0; width: 100%; height: 2px; background: #e5e7eb; z-index: 1; }
.step-item { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100px; }
.step-circle { width: 38px; height: 38px; border-radius: 50%; background: #fff; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #9ca3af; transition: all 0.3s; }
.step-label { font-size: 14px; font-weight: 600; color: #9ca3af; }
.step-item.active .step-circle { border-color: #000; color: #000; box-shadow: 0 0 0 5px rgba(135, 50, 96, 0.1); }
.step-item.active .step-label { color: #000; font-weight: 700; }
.step-item.completed .step-circle { background: #000; border-color: #000; color: #fff; }
.step-item.completed .step-label { color: #000; }
@media (max-width: 768px) { .checkout-progress-wrapper { margin-bottom: 40px; } }
</style>
