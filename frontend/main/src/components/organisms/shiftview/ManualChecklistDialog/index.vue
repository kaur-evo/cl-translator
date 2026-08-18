<template>
  <div>
    <dialog-toolbar
      id="dialog-toolbar"
      :title="dialogTitle"
    />
    <v-card-text class="py-0">
      <shiftview-cards-list
        :items="templates"
        :selectable="true"
        title-text-key="name"
        :subtitle-items-props="[{ valueKey: 'productString', text: $t('Product') }]"
        border-color-key="borderColor"
        class="card-list pt-4"
        :class="{ 'card-list--mobile': isMobileView, 'card-list--tablet': showFullscreenDialogs && !isMobileView }"
        :dense="isMobileView"
        :primary-action-text="$t('Start_verb')"
        :primary-action-icon="''"
        :secondary-action-icon="''"
        @item-clicked="openEditDialog"
        @primary-action="openEditDialog"
      />
    </v-card-text>
    <v-card-actions
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <v-spacer />
      <evocon-v-button
        :text="$t('Close')"
        type="secondary"
        @click="close"
      />
    </v-card-actions>
  </div>
</template>

<script>
import { mdiCheckCircle } from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import {
  useGenericDialogStore, useStationStore, useDeviceStore, useShiftviewSelectionStore,
} from '@/stores/index';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import listToShortenedString from '@/helpers/list/listToShortenedString';
import productApi from '@/api/productApi';
import { formatTime } from '@/helpers/time/formatTime';
import checklistEditDialogConfig from '@/constants/shiftviewDialogConfigs/checklistEditDialogConfig';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import ShiftviewCardsList from '@/components/organisms/shiftview/ShiftviewCardsList/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiCheckCircle };

export default {
  name: 'ManualChecklistDialog',
  components: {
    DialogToolbar,
    ShiftviewCardsList,
    EvoconVButton,
  },
  data() {
    return {
      ...icons,
      firstProductsMap: {},
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    dialogTitle() {
      return `${this.$t('Start checklist')} ${formatTime(this.dialogData.time)}`;
    },
    templates() {
      return this.dialogData.templates.reduce((acc, item) => {
        const template = {
          ...item,
          borderColor: 'secondary-dark',
          productString: this.getProductsSubtitle(item.frequency),
        };
        acc.push(template);
        return acc;
      }, []).sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  async mounted() {
    this.setProducts();
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openDialog']),
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection']),
    close() {
      this.closeDialog();
      this.clearSliceSelection();
    },
    getProductsSubtitle(frequency) {
      const productsCount = frequency.productIds.length;
      if (productsCount === 0) return this.$t('All');
      return listToShortenedString(
        frequency.productIds.map(
          (productId) => this.firstProductsMap[productId]?.name || '',
        ),
        3,
      );
    },
    openEditDialog({ item }) {
      this.openDialog({ ...checklistEditDialogConfig, data: { item, eventTimeISO: this.dialogData.time, manual: true } });
    },
    async setProducts() {
      const productIds = this.dialogData.templates.reduce((acc, template) => {
        const ids = template.frequency.productIds;
        if (ids.length) {
          acc.push(...ids.slice(0, 3));
        }
        return [...new Set(acc)];
      }, []);
      const products = await productApi.getProducts({
        stationId: this.lineviewStation.id,
        id: productIds,
      });
      this.firstProductsMap = listToKeyMap(products, 'id');
    },
  },
};
</script>

<style lang="less" scoped>
.card-list {
  max-height: calc(var(--app-height) * 0.9px - 124px);
  overflow-y: auto;

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 116px);
  }

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 124px);
  }
}
</style>
