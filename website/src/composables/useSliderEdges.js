import { ref, onMounted, onBeforeUnmount } from 'vue';

// Tracks whether a horizontally scrolling element can still move backward
// (toward its start) or forward (toward its end). Uses Math.abs(scrollLeft)
// so it behaves the same in LTR and RTL, where scrollLeft is negative.
export function useSliderEdges(sliderRef) {
  const canPrev = ref(false);
  const canNext = ref(false);
  let resizeObserver = null;
  let mutationObserver = null;
  let boundEl = null;

  const update = () => {
    const el = sliderRef.value;
    if (!el) return;
    const position = Math.abs(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;
    canPrev.value = position > 2;
    canNext.value = maxScroll - position > 2;
  };

  onMounted(() => {
    const el = sliderRef.value;
    if (!el) return;
    boundEl = el;
    el.addEventListener('scroll', update, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(el);
    }
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(update);
      mutationObserver.observe(el, { childList: true });
    }
    window.addEventListener('resize', update);
    update();
  });

  onBeforeUnmount(() => {
    boundEl?.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
  });

  return { canPrev, canNext, updateEdges: update };
}
