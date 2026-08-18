<template>
  <div
    ref="popover"
    class="shiftview-popover rounded bg-primary-dark"
    :class="$vuetify.display.smAndUp ? 'pa-4' : 'px-4 py-2'"
    :style="{ left: `${xPos}px`, top: `${yPos}px`, 'max-width': isMobileView ? '350px' : '400px' }"
  >
    <div
      id="popover-header"
      ref="popoverHeader"
      class="d-flex"
    >
      <evocon-v-button
        v-if="areArrowsEnabled"
        id="left-arrow"
        class="my-auto"
        color="white"
        size="default"
        :icon="mdiChevronLeft"
        :disabled="!canMoveLeft"
        @click.stop="$emit('left-arrow-click')"
      />
      <div class="mx-3">
        <v-icon
          v-if="dotColor"
          id="popover-dot"
          size="8"
          :color="dotColor"
          class="mr-1"
        >
          {{ mdiCircle }}
        </v-icon>
        <span :class="isMobileView ? 'text-body-small' : 'text-body-medium'">
          <span
            v-if="subtitle"
            id="subtitle"
          >
            {{ subtitle }}
          </span>
          <slot
            v-else
            name="subtitle"
          />
        </span>
        <p
          id="popover-title"
          class="mb-0 line-clamp-3"
          :class="[titleClass, isMobileView ? 'text-body-medium' : '']"
        >
          <v-icon
            v-if="titleIcon"
            size="16"
            class="mr-1"
          >
            {{ titleIcon }}
          </v-icon>
          {{ title }}
        </p>
      </div>
      <evocon-v-button
        v-if="areArrowsEnabled"
        id="right-arrow"
        class="my-auto ml-auto mr-0"
        size="default"
        color="white"
        :icon="mdiChevronRight"
        :disabled="!canMoveRight"
        @click.stop="$emit('right-arrow-click')"
      />
    </div>
    <slot name="events" />
    <v-divider class="my-2" color="tertiary-dark" />
    <div class="shifview-popover-actions-list">
      <v-list-item
        v-for="(item, key) in items"
        :key="key"
        :disabled="disabled || itemDisabled(item)"
        class="px-3 popover-menu-item rounded overflow-hidden list-item--flex"
        :density="isMobileView ? 'compact' : 'default'"
        :min-height="isMobileView ? 40 : 48"
        @click="$emit('item-click', item)"
      >
        <v-tooltip :disabled="!$slots['tooltip-content']">
          <template #activator="{ props }">
            <div v-bind="props" class="d-flex full-width align-center ">
              <v-icon
                class="mr-5 item-icon"
                :color="itemIconColor(item)"
                :size="isMobileView ? 16 : 24"
              >
                {{ itemIcon(item) }}
              </v-icon>
              <div
                class="item-text white-space-nowrap overflow-hidden text-overflow-ellipsis"
                :class="{ 'text-body-medium': isMobileView }"
              >
                {{ itemText(item) }}
              </div>
              <v-icon v-if="item.appendIcon" size="x-small" class="ml-1">
                {{ item.appendIcon }}
              </v-icon>
            </div>
          </template>
          <slot name="tooltip-content" :item="item" />
        </v-tooltip>
      </v-list-item>
    </div>
  </div>
</template>

<script>
import { mdiChevronLeft, mdiChevronRight, mdiCircle } from '@mdi/js';
import { mapState } from 'pinia';
import { nextTick } from 'vue';

import { useDeviceStore } from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { dragElement } from '@/helpers/dragElement';


const icons = { mdiChevronLeft, mdiChevronRight, mdiCircle };

export default {
  name: 'ShiftviewPopover',
  components: { EvoconVButton },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    areArrowsEnabled: {
      type: Boolean,
    },
    canMoveLeft: {
      type: Boolean,
    },
    canMoveRight: {
      type: Boolean,
    },
    dotColor: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    titleClass: {
      type: String,
      default: '',
    },
    titleIcon: {
      type: String,
      default: '',
    },
    itemIconColor: {
      type: Function,
      default: () => '',
    },
    itemIcon: {
      type: Function,
      default: () => '',
    },
    itemText: {
      type: Function,
      default: () => '',
    },
    itemDisabled: {
      type: Function,
      default: () => false,
    },
    targetEl: {
      type: [HTMLDivElement, SVGSVGElement],
      required: true,
    },
    secondaryTargetEl: {
      type: [HTMLDivElement, SVGSVGElement],
      default: null,
    },
    disabled: {
      type: Boolean,
    },
  },
  emits: ['item-click', 'left-arrow-click', 'right-arrow-click', 'outside-click'],
  data() {
    return {
      ...icons,
      xPos: 0,
      yPos: 0,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['screen', 'isMobileView']),
  },
  watch: {
    targetEl() {
      this.rePosition();
    },
    async items() {
      await nextTick();
      this.rePosition();
    },
  },
  mounted() {
    this.rePosition();
    const timelineElem = document.getElementById('shiftview-timeline');
    if (timelineElem) timelineElem.addEventListener('scroll', this.rePosition);
    document.addEventListener('click', this.onDocumentClick);
    if (this.isMobileView) dragElement(this.$refs.popover, this.$refs.popoverHeader);
  },
  beforeUnmount() {
    const timelineElem = document.getElementById('shiftview-timeline');
    if (timelineElem) timelineElem.removeEventListener('scroll', this.rePosition);
    document.removeEventListener('click', this.onDocumentClick);
  },
  methods: {
    rePosition() {
      const target = this.targetEl?.getBoundingClientRect();
      const popoverDimensions = this.$refs.popover?.getBoundingClientRect();
      if (!popoverDimensions || !target) return;
      const marginFromScreenEdge = 5;
      const marginFromTargelEl = 10;
      if (popoverDimensions.height + marginFromScreenEdge + marginFromTargelEl > target.y && this.secondaryTargetEl) { // not enough room to show top of target
        // position to the secondary target
        const secondaryTarget = this.secondaryTargetEl.getBoundingClientRect();
        if (secondaryTarget.y + secondaryTarget.height + marginFromTargelEl + marginFromScreenEdge + popoverDimensions.height > this.screen.height) { // doesn't fit bottom of the secondary target
          this.yPos = Math.max(secondaryTarget.y - marginFromTargelEl - popoverDimensions.height, marginFromScreenEdge);
        } else {
          this.yPos = Math.min(secondaryTarget.y + secondaryTarget.height + marginFromTargelEl, this.screen.height - marginFromScreenEdge - popoverDimensions.height);
        }
        this.xPos = Math.min(secondaryTarget.x + secondaryTarget.width + marginFromTargelEl, this.screen.width - popoverDimensions.width - marginFromScreenEdge);
      } else {
        this.yPos = Math.max(target.y - popoverDimensions.height - marginFromTargelEl, marginFromScreenEdge);
        this.xPos = Math.max(target.x - marginFromTargelEl - popoverDimensions.width, marginFromScreenEdge);
      }
    },
    onDocumentClick(event) {
      const path = event.composedPath();
      const isPopoverElement = (element) => element.classList?.contains('shiftview-popover');
      const isDialogElement = (element) => element.classList?.contains('v-dialog');
      const ignoreClick = path.some((el) => isPopoverElement(el) || isDialogElement(el));
      if (!ignoreClick) this.$emit('outside-click', event);
    },
  },
};
</script>

<style lang="less" scoped>
.shiftview-popover {
  position: fixed;
  z-index: 99;
  min-width: 250px;
}

.shifview-popover-actions-list {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.v-list-item--disabled {
  .v-icon {
    opacity: .3;
  }
}
</style>
