<template>
  <div
    v-if="items && !!items.length"
    class="v-row mx-n4 px-4 py-2"
  >
    <v-col
      v-for="(item, i) in items"
      :key="i"
      cols="12"
      :class="{ 'mb-2': i !== items.length - 1 }"
    >
      <v-hover v-slot="{ isHovering, props } = {}">
        <v-card
          :elevation="isHovering ? 3 : 2"
          :ripple="!disabled"
          v-bind="props"
          class="pa-0"
        >
          <div
            :ref="`select-item-${item.id}`"
            class="list-item d-flex flex-column"
            :class="{ 'pa-2': dense, 'py-2 px-4': !dense }"
            :style="{ '--borderColor': colors[getBorderColor(item)] }"
            :ripple="!disabled"
            @click="disabled ? '' : $emit('item-clicked', { item, i })"
          >
            <div class="d-flex full-width">
              <v-icon
                v-if="iconFn(item)"
                class="mr-4 my-auto"
                :color="iconColorFn(item)"
              >
                {{ iconFn(item) }}
              </v-icon>
              <div class="overflow-hidden flex-grow-1">
                <v-tooltip
                  :model-value="tooltipVisibleIndex === i"
                  :text="getCardTitle(item)"
                  :disabled="tooltipVisibleIndex !== i"
                  location="top"
                >
                  <template #activator="tooltipProps">
                    <span v-bind="tooltipProps.props" class="d-flex align-center">
                      <v-icon
                        v-if="titleIconFn(item)"
                        size="16"
                        class="mr-1"
                      >
                        {{ titleIconFn(item) }}
                      </v-icon>
                      <v-list-item-title
                        class="text-body-large font-weight-medium"
                        :class="{ 'list-item-title--dense': dense }"
                        @mouseenter="onMouseEnterTitle($event, i)"
                        @mouseleave="onMouseLeaveTitle"
                      >
                        {{ getCardTitle(item) }}
                      </v-list-item-title>
                    </span>
                  </template>
                </v-tooltip>
                <v-list-item-subtitle
                  class="d-flex mt-1"
                  :class="verticalSubtitle ? 'flex-column align-start' : 'flex-wrap align-center'"
                >
                  <template v-for="(subtitleItem, s) in getSubtitleItemsProps(item)" :key="`subtitle-${s}`">
                    <list-item-subtitle-content
                      v-if="item[subtitleItem.valueKey]"
                      :icon="subtitleItem.icon"
                      :title="subtitleItem.text"
                      :primary-value="item[subtitleItem.valueKey]"
                      :primary-value-class="subtitleItem.primaryValueClass"
                      :secondary-value="subtitleItem.secondaryValueKey ? item[subtitleItem.secondaryValueKey] : ''"
                      :secondary-value-class="subtitleItem.secondaryValueClass"
                      :tertiary-value="subtitleItem.tertiaryValueKey ? item[subtitleItem.tertiaryValueKey] : ''"
                      :tertiary-value-class="subtitleItem.tertiaryValueClass"
                      class="mr-4"
                    />
                  </template>
                </v-list-item-subtitle>
              </div>
              <div v-if="!disabled" class="shiftview-card__actions d-flex">
                <v-tooltip
                  v-if="getTertiaryActionIcon(item)"
                  location="top"
                  :text="tertiaryActionTooltip"
                >
                  <template #activator="tooltipProps">
                    <span v-bind="tooltipProps.props" class="d-flex">
                      <evocon-v-button
                        :icon="getTertiaryActionIcon(item)"
                        class="ml-2 my-auto"
                        @click.stop="$emit('tertiary-action', { item, i })"
                      />
                    </span>
                  </template>
                </v-tooltip>
                <v-tooltip
                  v-if="getSecondaryActionIcon(item)"
                  location="top"
                  :text="secondaryActionTooltip || $t('Delete')"
                >
                  <template #activator="tooltipProps">
                    <span v-bind="tooltipProps.props" class="d-flex">
                      <evocon-v-button
                        :icon="getSecondaryActionIcon(item)"
                        class="ml-2 my-auto"
                        @click.stop="$emit('secondary-action', { item, i })"
                      />
                    </span>
                  </template>
                </v-tooltip>
                <v-tooltip
                  v-if="getPrimaryActionIcon(item) || getPrimaryActionText(item)"
                  location="top"
                  :text="primaryActionTooltip || $t('Edit')"
                  :disabled="!!getPrimaryActionText(item)"
                >
                  <template #activator="tooltipProps">
                    <span v-bind="tooltipProps.props" class="d-flex">
                      <evocon-v-button
                        :text="getPrimaryActionText(item)"
                        :color="getPrimaryActionText(item) ? 'primary' : ''"
                        :icon="getPrimaryActionIcon(item)"
                        class="ml-2 my-auto"
                        @click.stop="$emit('primary-action', { item, i })"
                      />
                    </span>
                  </template>
                </v-tooltip>
                <slot name="expansion-btn" :item="item" :i="i" />
              </div>
            </div>
            <v-list-item-subtitle
              v-if="additionalLineProps.valueKey && item[additionalLineProps.valueKey]"
              class="mt-1"
              :class="{ 'ml-9': iconFn(item) }"
            >
              <list-item-subtitle-content
                v-if="item[additionalLineProps.valueKey]"
                :icon="additionalLineProps.icon"
                :title="additionalLineProps.text"
                :primary-value="item[additionalLineProps.valueKey]"
                allow-multiple-lines
              />
            </v-list-item-subtitle>
            <slot name="expansion-content" :item="item" :i="i" />
          </div>
        </v-card>
      </v-hover>
    </v-col>
  </div>
</template>
<script>
import { mdiDelete, mdiPencil } from '@mdi/js';
import { nextTick } from 'vue';

import colorConstants from '@/constants/colorConstants';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ListItemSubtitleContent from '@/components/atoms/ListItemSubtitleContent/index.vue';

export default {
  name: 'ShiftviewCardsList',
  components: { EvoconVButton, ListItemSubtitleContent },
  props: {
    items: {
      type: Array,
      required: true,
    },
    titleTextKey: {
      type: [String, Function],
      required: true,
    },
    subtitleItemsProps: {
      type: [Array, Function],
      default: () => [],
    },
    verticalSubtitle: Boolean,
    additionalLineProps: {
      type: Object,
      default: () => ({}),
    },
    primaryActionText: {
      type: [String, Function],
      default: '',
    },
    primaryActionIcon: {
      type: [String, Function],
      default: mdiPencil,
    },
    primaryActionTooltip: {
      type: String,
      default: '',
    },
    secondaryActionIcon: {
      type: [String, Function],
      default: mdiDelete,
    },
    secondaryActionTooltip: {
      type: String,
      default: '',
    },
    tertiaryActionIcon: {
      type: [String, Function],
      default: '',
    },
    tertiaryActionTooltip: {
      type: String,
      default: '',
    },
    titleIconFn: {
      type: Function,
      default: () => '',
    },
    iconFn: {
      type: Function,
      default: () => '',
    },
    iconColorFn: {
      type: Function,
      default: () => '',
    },
    borderColorKey: {
      type: [String, Function],
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    selectedItem: {
      type: Object,
      default: () => {},
    },
    dense: {
      type: Boolean,
    },
  },
  emits: [
    'item-clicked',
    'primary-action',
    'secondary-action',
    'tertiary-action',
  ],
  data() {
    return {
      tooltipVisibleIndex: -1,
    };
  },
  computed: {
    colors() {
      return colorConstants[this.$vuetify.theme.name];
    },
  },
  watch: {
    async selectedItem(newVal) {
      if (!newVal || !newVal.id) return;

      await nextTick();
      const selectedItem = this.$refs[`select-item-${newVal.id}`];
      if (!selectedItem || !selectedItem.length) return;
      selectedItem[0].scrollIntoView({ behavior: 'instant', block: 'center' });
    },
  },
  methods: {
    getBorderColor(item) {
      return typeof this.borderColorKey === 'function'
        ? this.borderColorKey(item)
        : item[this.borderColorKey];
    },
    getCardTitle(item) {
      return typeof this.titleTextKey === 'function'
        ? this.titleTextKey(item)
        : item[this.titleTextKey];
    },
    getTertiaryActionIcon(item) {
      return typeof this.tertiaryActionIcon === 'function'
        ? this.tertiaryActionIcon(item)
        : this.tertiaryActionIcon;
    },
    getSecondaryActionIcon(item) {
      return typeof this.secondaryActionIcon === 'function'
        ? this.secondaryActionIcon(item)
        : this.secondaryActionIcon;
    },
    getPrimaryActionIcon(item) {
      return typeof this.primaryActionIcon === 'function'
        ? this.primaryActionIcon(item)
        : this.primaryActionIcon;
    },
    getPrimaryActionText(item) {
      return typeof this.primaryActionText === 'function'
        ? this.primaryActionText(item)
        : this.primaryActionText;
    },
    getSubtitleItemsProps(item) {
      return typeof this.subtitleItemsProps === 'function'
        ? this.subtitleItemsProps(item)
        : this.subtitleItemsProps;
    },
    onMouseEnterTitle(ev, index) {
      if (ev.target.scrollWidth > ev.target.clientWidth) this.tooltipVisibleIndex = index;
    },
    onMouseLeaveTitle() {
      this.tooltipVisibleIndex = -1;
    },
  },
};
</script>

<style scoped>
.list-item {
  border-left: 6px solid var(--borderColor);
}
.list-item-title--dense {
  font-size: 14px !important;
}
.shiftview-card__actions {
  height: 45px;
}
</style>
