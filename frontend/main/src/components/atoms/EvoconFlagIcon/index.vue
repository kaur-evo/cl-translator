<template>
  <div>
    <div
      class="flag mb-n1"
      :class="{ 'rounded-flag-icon': rounded }"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="flagHtml" />
    </div>
  </div>
</template>
<script>
import { languageMap } from '@/constants/languages';

export default {
  name: 'EvoconFlagIcon',
  props: {
    flagCountryCode: {
      type: String,
      default: '',
    },
    squared: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    addBorder: {
      type: Boolean,
    },
  },
  data() {
    return {
      flagHtml: '',
    };
  },
  watch: {
    flagCountryCode() {
      this.setFlagHtml();
    },
    squared() {
      this.setFlagHtml();
    },
    rounded() {
      this.setFlagHtml();
    },
  },
  created() {
    this.setFlagHtml();
  },
  methods: {
    async setFlagHtml() {
      const convertedLang = languageMap[this.flagCountryCode]?.countryCode || this.flagCountryCode;
      const importCode = String(convertedLang).toUpperCase();
      let flagModule = null;
      try {
        if (this.squared) {
          flagModule = await import(`../../../../node_modules/country-flag-icons/string/1x1/${importCode}.js`);
        } else {
          flagModule = await import(`../../../../node_modules/country-flag-icons/string/3x2/${importCode}.js`);
        }
        this.flagHtml = flagModule.default;
        if (this.addBorder) {
          const svgTagEnd = this.flagHtml.indexOf('>');
          this.flagHtml = `${this.flagHtml.slice(0, svgTagEnd)} style="border: 1px solid rgba(0, 0, 0, 0.12)"${this.flagHtml.slice(svgTagEnd)}`;
        }
      } catch {
        this.flagHtml = '';
      }
    },
  },
};
</script>
<style lang="less" scoped>
.flag {
  width: 22px;
}
.rounded-flag-icon :deep(svg) {
  width: 20px !important;
  height: 20px;
  border-radius: 50%;
}
</style>
