<template>
  <div ref="intersection">
    <slot v-if="isInView || notSupported" />
  </div>
</template>

<script>
export default {
  name: 'RenderInViewport',
  props: {
    dragParent: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isInView: false,
      intersectionObserver: null,
      mutationObserver: null,
    };
  },
  computed: {
    notSupported() {
      return !('IntersectionObserver' in window)
        || !('IntersectionObserverEntry' in window)
        || !('intersectionRatio' in window.IntersectionObserverEntry.prototype);
    },
  },
  mounted() {
    this.intersectionObserver = new IntersectionObserver((elements) => {
      this.isInView = elements[0].intersectionRatio !== 0;
    });
    this.intersectionObserver.observe(this.$refs.intersection);

    if (this.dragParent) {
      this.mutationObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            this.intersectionObserver.unobserve(this.$refs.intersection);
            this.intersectionObserver.observe(this.$refs.intersection);
          }
        }
      });
      this.mutationObserver.observe(this.dragParent, { childList: true });
    }
  },
  beforeUnmount() {
    this.intersectionObserver?.disconnect();
    this.mutationObserver?.disconnect();
  },
};
</script>
