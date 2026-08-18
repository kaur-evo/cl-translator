<template>
  <div
    class="d-flex pa-2 rounded"
    :class="{ 'align-center': !collapsible, 'cursor-pointer': collapsible && isBodyTruncated }"
    :style="{ 'background-color': hexToRgba(color) }"
    @click="isCollapsed = !isCollapsed"
  >
    <v-icon
      v-if="icon"
      class="mr-2"
      size="18"
      :color="color"
    >
      {{ icon }}
    </v-icon>
    <div class="d-flex flex-column flex-grow-1 overflow-hidden">
      <span
        class="text-body-small"
        :class="headerTextColor"
      >
        {{ header }}
      </span>
      <div
        v-for="(line, i) in visbleLines"
        :ref="`body-line-${i}`"
        :key="`body-line-${i}`"
        class="text-body-medium"
        :class="{ 'overflow-hidden white-space-nowrap text-overflow-ellipsis': isCollapsed && collapsible }"
      >
        <text-with-url :text="line" />
      </div>
    </div>
    <v-icon
      v-if="collapsible && isBodyTruncated"
      class="m-2"
      size="18"
    >
      {{ isCollapsed ? mdiChevronDown : mdiChevronUp }}
    </v-icon>
  </div>
</template>

<script>
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';

import hexToRgb from '@/helpers/color/hexToRgb';
import TextWithUrl from '@/components/atoms/TextWithUrl/index.vue';

export default {
  name: 'InfoBlock',
  components: {
    TextWithUrl,
  },
  props: {
    header: {
      type: String,
      default: '',
    },
    body: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#9E9E9E',
    },
    headerTextColor: {
      type: String,
      default: 'text-secondary-text',
    },
    collapsible: {
      type: Boolean,
    },
  },
  data() {
    return {
      mdiChevronDown,
      mdiChevronUp,
      isCollapsed: true,
      isBodyTruncated: false,
    };
  },
  computed: {
    bodyByLines() {
      return this.body.split('\n');
    },
    visbleLines() {
      return this.isCollapsed && this.collapsible ? this.bodyByLines.slice(0, 1) : this.bodyByLines;
    },
  },
  mounted() {
    const bodyRow = this.$refs['body-line-0'][0];
    if (!bodyRow) return;
    this.isBodyTruncated = bodyRow.offsetWidth < bodyRow.scrollWidth || this.bodyByLines.length > 1;
  },
  methods: {
    hexToRgba(color) {
      return `rgba(${hexToRgb(color).join(',')}, 0.12)`;
    },
  },
};
</script>
