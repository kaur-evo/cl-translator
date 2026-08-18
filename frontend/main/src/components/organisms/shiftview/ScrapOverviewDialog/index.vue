<template>
  <div>
    <dialog-toolbar
      :title-icon="mdiMinusCircleOutline"
      :title="$t('Scrap overview')"
      icon-color="secondary"
    />
    <v-card-text
      class="pa-0 overview-cards"
      :class="{ 'overview-cards--mobile': isMobileView, 'overview-cards--tablet': showFullscreenDialogs && !isMobileView }"
    >
      <template v-if="batchesWithScrap.length">
        <v-list v-model:opened="openPanels" class="py-4">
          <v-card
            v-for="(batch, i) in batchesWithScrap"
            :key="`scrap-group-${batch.id}`"
            class="mx-4 scrap-card"
            :class="{ 'mb-2': i !== batchesWithScrap.length - 1 }"
          >
            <v-list-group :value="batch.id">
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :class="isMobileView ? 'pa-2' : 'py-2 px-4'"
                  :density="isMobileView ? 'compact' : 'default'"
                >
                  <v-list-item-title class="font-weight-medium mb-1">
                    {{ batch.productName }}
                    <span v-if="batch.productSku">
                      ({{ batch.productSku }})
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle class="d-flex flex-wrap align-center">
                    <list-item-subtitle-content
                      class="mr-4"
                      :title="$t('Good quantity')"
                      :primary-value="formatPrimaryQtyVal(batch, scrapBatches[batch.id].qty - scrapBatches[batch.id].scrapQty)"
                      :secondary-value="formatSecondaryQtyVal(batch, scrapBatches[batch.id].qty - scrapBatches[batch.id].scrapQty)"
                    />
                    <list-item-subtitle-content
                      class="mr-4"
                      :title="$t('Total scrap')"
                      :primary-value="formatPrimaryQtyVal(batch, scrapBatches[batch.id].scrapQty)"
                      :secondary-value="formatSecondaryQtyVal(batch, scrapBatches[batch.id].scrapQty)"
                    />
                    <list-item-subtitle-content
                      v-if="batch.productionOrder"
                      class="mr-4"
                      :title="$t('Order')"
                      :primary-value="batch.productionOrder"
                    />
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
              <v-divider />
              <template
                v-for="(scrapItem, j) in groupedScrap[batch.id]"
                :key="`scrap-item-${j}`"
              >
                <v-list-item
                  :density="isMobileView ? 'compact' : 'default'"
                  class="py-2 px-2"
                >
                  <div class="d-flex">
                    <div class="d-flex flex-column flex-grow-1 overflow-hidden">
                      <v-list-item-title class="font-weight-medium mb-1">
                        {{ scrapReasonsRealMap.has(scrapItem.scrapReasonId) ? scrapReasonsRealMap.get(scrapItem.scrapReasonId).name : '' }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <list-item-subtitle-content
                          :title="$t('quantity')"
                          :primary-value="formatPrimaryQtyVal(batch, scrapItem.scrapQty)"
                          :secondary-value="formatSecondaryQtyVal(batch, scrapItem.scrapQty)"
                        />
                      </v-list-item-subtitle>
                    </div>
                    <div v-if="!isReadOnly" class="d-flex flex-shrink-0">
                      <v-tooltip location="top" :text="$t('Delete')">
                        <template #activator="{ props }">
                          <span v-bind="props">
                            <evocon-v-button
                              :icon="mdiDelete"
                              class="mr-1"
                              @click="deleteScrap(scrapItem)"
                            />
                          </span>
                        </template>
                      </v-tooltip>
                      <v-tooltip location="top" :text="$t('Edit')">
                        <template #activator="{ props }">
                          <span v-bind="props">
                            <evocon-v-button
                              :icon="mdiPencil"
                              @click="editScrap(scrapItem, batch.id)"
                            />
                          </span>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <v-list-item-subtitle v-if="scrapItem.scrapNotes" class="d-flex mt-1">
                    <list-item-subtitle-content
                      :icon="mdiMessageReply"
                      :primary-value="scrapItem.scrapNotes"
                      allow-multiple-lines
                    />
                  </v-list-item-subtitle>
                </v-list-item>
                <v-divider
                  v-if="j !== 0"
                  :key="j"
                  :class="isMobileView ? 'ml-6' : 'ml-8'"
                />
              </template>
            </v-list-group>
          </v-card>
        </v-list>
      </template>
      <empty-view
        v-else
        id="scrap-overview-empty-view"
        :header="$t('No scrap added')"
        :description="$t('Click the add scrap button to start recording quality issues.')"
        img-url="scrap"
        :img-width="isMobileView ? '210px' : '340px'"
        :class="{ 'pt-0 pb-2 ': isMobileView }"
        :small="isMobileView"
      />
    </v-card-text>
    <v-card-actions
      class="justify-end"
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <evocon-v-button
        v-if="!isReadOnly"
        id="add-scrap-button"
        :depressed="$vuetify.display.smAndUp"
        type="primary-light"
        :disabled="!canAddScrap"
        :icon="mdiPlus"
        :text="$t('Scrap')"
        @click="addScrap"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Close')"
        type="secondary"
        @click="closeDialog"
      />
    </v-card-actions>
  </div>
</template>
<script>
import {
  mdiPlus, mdiMinusCircleOutline, mdiDelete, mdiPencil, mdiMessageReply,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import {
  useProfileStore, useDeviceStore, useStationStore, useScrapReasonStore,
  useShiftStore, useShiftviewTimelineStore, useUserPreferencesStore,
  useGenericDialogStore, useConfirmDialogStore, useGenericNotificationStore,
} from '@/stores/index';
import scrapApi from '@/api/scrapReasonApi';
import groupScrap from '@/helpers/timeline/groupScrap';
import groupScrapArray from '@/helpers/timeline/groupScrapArray';
import editScrapDialogConfig from '@/constants/shiftviewDialogConfigs/editScrapDialogConfig';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ListItemSubtitleContent from '@/components/atoms/ListItemSubtitleContent/index.vue';
import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';

const vectorIcons = {
  mdiPlus, mdiMinusCircleOutline, mdiDelete, mdiPencil, mdiMessageReply,
};

export default {
  name: 'ScrapOverview',
  components: {
    EmptyView,
    DialogToolbar,
    EvoconVButton,
    ListItemSubtitleContent,
  },
  data() {
    return {
      ...vectorIcons,
      openPanels: [],
    };
  },
  computed: {
    ...mapState(useProfileStore, ['isReadOnly']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useScrapReasonStore, ['scrapReasonsRealMap']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useShiftviewTimelineStore, ['timeline', 'batches', 'slicesByType']),
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    groupedScrap() {
      const scrapArray = this.slicesByType.products.filter((elem) => elem.scrapQty > 0);
      return groupScrapArray(scrapArray);
    },
    scrapBatches() {
      return groupScrap(this.timeline);
    },
    canAddScrap() {
      return this.timeline.some((slice) => slice.scrapQty === 0);
    },
    batchesWithScrap() {
      return Array.from(this.batches.values()).filter((batch) => batch.id in this.groupedScrap);
    },
  },
  watch: {
    groupedScrap(newVal, oldVal) {
      if (Object.keys(oldVal).length > 0 && Object.keys(newVal).length === 0) this.closeDialog();
    },
  },
  mounted() {
    this.openPanels = this.batchesWithScrap.map((batch) => batch.id);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openDialog']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    addScrap() {
      this.openDialog(editScrapDialogConfig);
    },
    editScrap(selectedScrap, batchId) {
      const dialogConfig = {
        ...editScrapDialogConfig,
        data: {
          selectedScrapBatch: { ...selectedScrap, batchId },
        },
      };
      this.openDialog(dialogConfig);
    },
    deleteScrap(selectedScrap) {
      const requestBody = {
        scrapRanges: selectedScrap.scrapRanges,
        scrapQty: 0 - selectedScrap.scrapQty,
        scrapReasonId: selectedScrap.scrapReasonId || 0,
        qtyType: 'delta',
        overwrite: false,
        shiftId: this.shift.id,
      };
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete scrap?'),
        action: () => {
          this.saveScrap(requestBody);
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    async saveScrap(data) {
      const scrapResult = await scrapApi.saveScrap(this.lineviewStation.id, data);
      if (scrapResult.every((res) => res.body.success)) {
        this.notifySuccess(this.$t('Scrap deleted'));
      } else {
        this.notifyError(this.$t(scrapResult.find((res) => !res.body.success).body.message));
      }
    },
    formatPrimaryQtyVal(batch, quantity) {
      if (batch.alternativeUnitId && !this.viewSettings.usePrimaryUnit) {
        const conversionVal = getBatchMainToAltUnitConversion(batch);
        return `${formatNumber(quantity * conversionVal)} ${batch.alternativeUnitId}`;
      }
      return `${formatNumber(quantity)} ${batch.unitId}`;
    },
    formatSecondaryQtyVal(batch, quantity) {
      if (batch.alternativeUnitId && !this.viewSettings.usePrimaryUnit) {
        return `${formatNumber(quantity)} ${batch.unitId}`;
      }
      if (batch.alternativeUnitId) {
        const conversionVal = getBatchMainToAltUnitConversion(batch);
        return `${formatNumber(quantity * conversionVal)} ${batch.alternativeUnitId}`;
      }
      return '';
    },
  },
};
</script>
<style lang="scss" scoped>
.scrap-card {
  border-left: 6px solid rgb(var(--v-theme-lw-orange));
}

.v-list-group__items .v-list-item {
  &.v-list-item--density-compact {
    padding-inline-start: 24px !important;
  }
  &.v-list-item--density-default {
    padding-inline-start: 32px !important;
  }
}

.overview-cards {
  max-height: calc(var(--app-height) * 0.9px - 132px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 124px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 116px);
  }
}
</style>
