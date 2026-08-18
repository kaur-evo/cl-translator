<template>
  <evocon-v-input
    ref="search"
    v-bind="$attrs"
    :class="{ 'mx-3 mt-3': isDropdown }"
    :label="label === null ? $t('Search') : label"
    hide-details
    single-line
    :density="density"
    @click.stop=""
    @keydown.space.stop=""
  >
    <template #prepend-inner>
      <v-icon size="24">
        {{ mdiMagnify }}
      </v-icon>
    </template>
  </evocon-v-input>
</template>
<script>
import { mdiMagnify } from '@mdi/js';

import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';

export default {
  name: 'SelectionListSearchInput',
  components: {
    EvoconVInput,
  },
  props: {
    label: {
      type: String,
      default: null,
    },
    isDropdown: { type: Boolean },
    isFocused: { type: Boolean },
  },
  data() {
    return {
      mdiMagnify,
    };
  },
  computed: {
    density() {
      if (this.$attrs.density) return this.$attrs.density;
      return this.isDropdown ? 'compact' : 'default';
    },
  },
  watch: {
    isFocused(val) {
      if (val) {
        this.setFocus();
      }
    },
  },
  mounted() {
    this.setFocus();
  },
  methods: {
    setFocus() {
      setTimeout(() => {
        if (this.$refs.search) {
          this.$refs.search.$refs.evoconTextField?.focus();
        }
      }, 300);
    },
  },
};
</script>
