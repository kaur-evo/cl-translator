<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span v-html="formatHighlight(sanitizedText)" />
</template>
<script>
import DOMPurify from 'dompurify';

export default {
  name: 'TextHighlight',
  props: {
    text: {
      type: String,
      default: '',
    },
    highlight: {
      type: String,
      default: '',
    },
  },
  computed: {
    sanitizedText() {
      return DOMPurify.sanitize(this.text);
    },
  },
  methods: {
    escapeRegExp(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    },
    formatHighlight(word) {
      const colorClass = 'bg-quaternary-dark-2';
      if (!word) return '';
      if (!this.highlight) return word;
      const SEARCH_REGEXP = new RegExp(this.escapeRegExp(this.highlight), 'gi');
      if (SEARCH_REGEXP.test(word)) {
        return word.replace(
          SEARCH_REGEXP,
          (match) => `<span class="${colorClass}">${match}</span>`,
        );
      }
      return word;
    },
  },
};
</script>
