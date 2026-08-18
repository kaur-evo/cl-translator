<template>
  <div class="d-flex flex-column scaling-padding">
    <div class="d-flex flex-nowrap align-center justify-space-between">
      <div class="flex-nowrap text-truncate align-baseline">
        <span
          :class="widgetTitleClass"
          class="text-truncate pb-1"
        >
          {{ widgetTitle }}
        </span>
        <span
          :class="widgetTextClass"
          class="px-2 text-quaternary-dark-2 text-no-wrap"
        >
          {{ widgetPeriod }}
        </span>
      </div>

      <v-menu v-if="!hideMenu">
        <template #activator="{ props }">
          <evocon-v-button
            class="no-drag"
            :icon="mdiDotsVertical"
            v-bind="props"
            color="white"
            @click.stop=""
          />
        </template>
        <v-list>
          <v-list-item
            v-for="item in items"
            :key="item.id"
            min-width="120px"
            @click="$emit('menu-action', item.value)"
          >
            <v-list-item-title
              :class="item.class"
            >
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <evocon-v-tooltip-wrap :text="widgetSubtitle" :disabled="!showSubtitleTooltip">
      <template #activator="{ props }">
        <span
          v-bind="props"
          ref="subtitle"
          class="text-truncate text-secondary-text"
          :class="widgetTextClass"
        >
          {{ widgetSubtitle }}
        </span>
      </template>
    </evocon-v-tooltip-wrap>
  </div>
</template>
<script>
import { mdiDotsVertical } from '@mdi/js';
import { mapState } from 'pinia';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import { useDeviceStore } from '@/stores/index';

const vectorIcons = {
  mdiDotsVertical,
};
export default {
  name: 'WidgetHeader',
  components: { EvoconVButton, EvoconVTooltipWrap },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    widgetTitle: {
      type: String,
      default: '',
    },
    widgetPeriod: {
      type: String,
      default: '',
    },
    widgetSubtitle: {
      type: String,
      default: '',
    },
    hideMenu: {
      type: Boolean,
    },
  },
  emits: ['menu-action'],
  data() {
    return {
      ...vectorIcons,
      showSubtitleTooltip: false,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    widgetTitleClass() {
      if (this.isMobileView) return 'text-headline-small font-weight-regular';
      if (this.$vuetify.display.mdAndUp) return 'scaling-title';
      return 'text-headline-medium';
    },
    widgetTextClass() {
      if (this.isMobileView) return 'text-body-small';
      if (this.$vuetify.display.mdAndUp) return 'scaling-subtitle';
      return 'text-body-large';
    },
  },
  mounted() {
    const { subtitle } = this.$refs;
    if (subtitle) {
      this.showSubtitleTooltip = subtitle.scrollWidth > subtitle.clientWidth;
    }
  },
};
</script>
<style lang="scss" scoped>
.scaling-title {
  font-size: calc(8px + 0.7vw);
}
.scaling-subtitle {
  font-size: calc(4px + 0.5vw);
}
.scaling-padding {
  padding-top: calc(8px + 0.6vw);
  padding-left: calc(8px + 0.6vw);
  padding-right: calc(8px + 0.6vw);
}
</style>
