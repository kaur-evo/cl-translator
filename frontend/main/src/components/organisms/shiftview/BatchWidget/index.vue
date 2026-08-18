<template>
  <div v-if="productlist.length">
    <div
      v-for="(item, i) in productlist"
      :id="`product-item-row-${i}`"
      :key="`product-row${i}`"
      class="d-flex text-no-wrap"
    >
      <div class="font-weight-regular overflow-hidden text-overflow-ellipsis pr-1" :class="valueClass">
        <span
          v-if="item.productionOrder"
          id="product-order-number"
          class="mr-3"
          @mouseenter="onMouseEnter($event, item)"
          @mouseleave="onMouseLeave"
        >
          {{ item.productionOrder }}
        </span>
        <span
          v-if="item.productSku && item.productSku !== item.productName"
          id="product-sku"
          class="mr-3"
          @mouseenter="onMouseEnter($event, item)"
          @mouseleave="onMouseLeave"
        >
          {{ item.productSku }}
        </span>
        <span
          id="product-name"
          @mouseenter="onMouseEnter($event, item)"
          @mouseleave="onMouseLeave"
        >
          {{ item.productName }}
        </span>
      </div>
      <batch-quantity-amount
        class="ml-auto mr-0 flex-shrink-0"
        :class="valueClass"
        :show-good-qty="!title || title === 'Previous'"
        :batch="item"
        @mouseenter="onMouseEnter($event, item)"
        @mouseleave="onMouseLeave"
      />
    </div>
    <v-tooltip
      v-if="tooltipProps"
      :model-value="true"
      location="top"
      :target="[tooltipProps.x, tooltipProps.y - 20]"
    >
      <evocon-v-tooltip
        :type="$t('Changeover')"
        :title="getBatchTitle(tooltipProps.batch)"
        :icon-color="colorConstants.dark['lw-blue']"
        :rows="getBatchTooltipRows(tooltipProps.batch, shift.shiftDate)"
      />
    </v-tooltip>
  </div>
  <small-placeholder-text
    v-else
    :primary-text="$t('No data available')"
  />
</template>
<script>
import { mapState } from 'pinia';

import SmallPlaceholderText from '@/components/atoms/SmallPlaceholderText/index.vue';
import BatchQuantityAmount from '@/components/organisms/shiftview/BatchQuantityAmount/index.vue';
import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import colorConstants from '@/constants/colorConstants';
import { getBatchTitle, getBatchTooltipRows } from '@/helpers/batch/batchHelpers';
import { useShiftStore } from '@/stores';

export default {
  name: 'BatchWidget',
  components: {
    SmallPlaceholderText,
    BatchQuantityAmount,
    EvoconVTooltip,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    productlist: {
      type: Array,
      default: () => [],
    },
    showTooltip: { type: Boolean },
    valueClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      colorConstants,
      tooltipProps: null,
    };
  },
  computed: {
    ...mapState(useShiftStore, ['shift']),
  },
  methods: {
    getBatchTitle,
    getBatchTooltipRows,
    onMouseEnter(event, batch) {
      if (this.showTooltip) this.tooltipProps = { x: event.x, y: event.y, batch };
    },
    onMouseLeave() {
      this.tooltipProps = null;
    },
  },
};
</script>
