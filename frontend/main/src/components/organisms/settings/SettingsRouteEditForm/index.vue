<template>
  <form-dialog-template
    :primary-segment-title="$t('Station specific details')"
    :secondary-segment-title="$t('Product speed')"
    :secondary-segment-subtitle="$t('Please define target speed')"
    :secondary-segment-subtitle-icon="mdiInformationOutline"
    @secondary-icon-click="openHelp()"
  >
    <template #primary-segment>
      <v-form
        ref="form1"
        v-model="valid"
        @submit="onSaveClick"
      >
        <v-row>
          <v-col
            cols="12"
            class="px-1"
            :class="{ 'pb-0': isMobileView, 'pb-2': !isMobileView }"
          >
            <selection-input
              :model-value="[formData.stationId]"
              :items="dialogData.filteredStations"
              :groups="stationGroups"
              :placeholder="$t('station')"
              :hint="$t('Where is this produced?')"
              is-single-select
              is-grouped-select
              :disabled-values="dialogData.disabledStations"
              required
              @update:model-value="formData.stationId = $event[0]"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #secondary-segment>
      <v-form
        ref="form2"
        v-model="valid"
        @submit="onSaveClick"
      >
        <v-row>
          <v-col
            cols="12"
            sm="4"
            class="px-1 d-flex flex-column align-center"
            :class="{ 'mb-4': isMobileView, 'mb-2': !isMobileView }"
          >
            <v-img
              alt="good-production"
              :src="isMobileView ? getImageAsset('goodProduction-mobile.svg') : getImageAsset('goodProduction.svg')"
              :width="isMobileView ? '100%' : '80%'"
              max-height="80"
            />
            <div class="speed-block">
              <v-icon
                size="8"
                color="primary"
                class="mr-1"
              >
                {{ mdiCircle }}
              </v-icon>
              <span class="font-weight-medium mr-1">{{ `≤${formattedIdealCycleTime}` }}</span>
              {{ $t('sec') }}
            </div>
            <span class="full-width">
              <evocon-v-input-with-selector
                v-model.trim="formData.runTime"
                :hint="$t('Target speed')"
                :rules="[runTimeRule]"
                :items="runTimeTypes"
                :selected-item="formData.runTimeType"
                persistent-hint
                type="number"
                @selection="formData.runTimeType = $event"
              />
            </span>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            class="px-1 d-flex flex-column align-center"
            :class="{ 'mb-4': isMobileView, 'mb-2': !isMobileView }"
          >
            <v-img
              alt="speedloss"
              :src="isMobileView ? getImageAsset('speedloss-mobile.svg') : getImageAsset('speedloss.svg')"
              :width="isMobileView ? '100%' : '80%'"
              max-height="80"
            />
            <div class="speed-block">
              <v-icon
                size="8"
                :color="colorConstants['lw-yellow']"
                class="mr-1"
              >
                {{ mdiCircle }}
              </v-icon>
              <span class="font-weight-medium mr-1">{{ ` ≤${formatNumber(formData.cycleTimeCritical)}` }} </span>
              <span>{{ $t('sec') }} + </span>
              <v-icon
                size="8"
                color="primary"
                class="mx-1"
              >
                {{ mdiCircle }}
              </v-icon>
              <span class="font-weight-medium mr-1">{{ formattedIdealCycleTime }}</span>
              {{ $t('sec') }}
            </div>
            <span class="full-width">
              <evocon-v-input
                :model-value="`${formattedIdealCycleTime}<${$t('Speed loss')}≤${formatNumber(formData.cycleTimeCritical + idealCycleTime)}`"
                disabled
                :hint="$t('Speed loss')"
                :suffix="$t('sec')"
              />
            </span>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            class="px-1 d-flex flex-column align-center"
            :class="{ 'mb-4': isMobileView, 'mb-2': !isMobileView }"
          >
            <v-img
              alt="stoppage"
              :src="isMobileView ? getImageAsset('stoppage-mobile.svg') : getImageAsset('stoppage.svg')"
              :width="isMobileView ? '100%' : '80%'"
              max-height="80"
            />
            <div class="speed-block">
              <v-icon
                size="8"
                color="error"
                class="mr-1"
              >
                {{ mdiCircle }}
              </v-icon>
              <span class="font-weight-medium mr-1">&#62;{{ formatNumber(formData.cycleTimeCritical) }} </span>
              <span> {{ $t('sec') }} + </span>
              <v-icon
                size="8"
                color="primary"
                class="mx-1"
              >
                {{ mdiCircle }}
              </v-icon>
              <span class="font-weight-medium mr-1">{{ formattedIdealCycleTime }}</span>
              {{ $t('sec') }}
            </div>
            <span class="full-width">
              <evocon-number-input
                v-model="formData.cycleTimeCritical"
                :rules="[cycleTimeRule]"
                :suffix="`+${formattedIdealCycleTime} ${$t('sec')}`"
                :hint="$t('Downtime start time')"
              />
            </span>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            v-if="selectedStation.timeModeActive"
            :cols="12"
            class="px-1 mb-2"
          >
            <evocon-number-input
              v-model="formData.target"
              :hint="$t('Target time')"
              :rules="[targetRule]"
              :suffix="unit"
            />
          </v-col>
          <v-col
            :cols="showScrapUnitQty && !isMobileView ? 6 : 12"
            class="px-1 mb-2"
          >
            <evocon-number-input
              v-model="formData.unitQty"
              :hint="$t('Number of units registered per one sensor signal')"
              :rules="[unitQtyRule]"
            />
          </v-col>
          <v-col
            v-if="showScrapUnitQty"
            cols="12"
            sm="6"
            class="px-1 mb-2"
          >
            <evocon-number-input
              id="product-based-scrap"
              v-model="formData.scrapUnitQty"
              :hint="$t('Number of scrap units registered per one sensor signal')"
              :rules="[scrapUnitQtyRule]"
            />
          </v-col>
          <v-col
            v-if="alternativeUnit"
            cols="12"
            class="px-1"
          >
            <evocon-v-input-with-selector
              id="unit-conversion-field"
              v-model.trim="formData.unitConversion"
              :hint="$t('Alternative unit value')"
              :items="unitConversionTypes"
              :rules="[alternativeUnitRule]"
              :selected-item="formData.unitConversionType"
              persistent-hint
              type="number"
              @selection="formData.unitConversionType = $event"
            />
          </v-col>
          <v-col
            v-if="semiFinishedEnabled"
            cols="12"
            class="px-1"
          >
            <evocon-v-checkbox
              v-model="formData.semiFinished"
              class="my-2 ml-3"
              :label="$t('Semi-finished')"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <delete-button
        v-if="formData.id"
        @click="onDeleteClick()"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="onCancelClick()"
      />
      <evocon-v-button
        v-if="dialogData.isEdit"
        id="primary-button"
        :text="$t('Save')"
        color="primary"
        @click="onSaveClick()"
      />
      <evocon-v-button
        v-else
        id="primary-button"
        :text="$t('Apply')"
        type="primary-light"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiCircle, mdiInformationOutline } from '@mdi/js';

import useGenericDialogStore from '@/stores/genericDialog';
import useStationStore from '@/stores/station';
import useConfigurationStore from '@/stores/configuration';
import useFeatureStore from '@/stores/feature';
import useDeviceStore from '@/stores/device';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import EvoconVInputWithSelector from '@/components/atoms/EvoconVInputWithSelector/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import colorConstants from '@/constants/colorConstants';
import { getRunTimeTypes, getUnitConversionTypes } from '@/constants/productRouteConstants';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import { getImageAsset } from '@/helpers/file/getAsset';

const icons = { mdiCircle, mdiInformationOutline };

export default {
  name: 'SettingsRouteEditForm',
  components: {
    FormDialogTemplate,
    EvoconNumberInput,
    EvoconVButton,
    EvoconVCheckbox,
    EvoconVInputWithSelector,
    EvoconVInput,
    SelectionInput,
    DeleteButton,
  },
  data() {
    return {
      ...icons,
      colorConstants: colorConstants.dark,
      valid: true,
      formData: {
        id: null,
        stationId: null,
        runTimeType: 'UNIT_PER_MINUTE',
        runTime: 1,
        cycleTimeCritical: 180,
        unitQty: 1,
        semiFinished: null,
        scrapUnitQty: 1,
        unitConversion: 1,
        unitConversionType: 'PRIMARY_TO_ALT',
        target: null,
      },
      unit: '',
      alternativeUnit: '',
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useStationStore, ['stationGroups', 'stationsMap']),
    ...mapState(useConfigurationStore, ['configuration']),
    ...mapState(useFeatureStore, ['semiFinishedEnabled']),
    ...mapState(useDeviceStore, ['isMobileView']),
    runTimeTypes() {
      return getRunTimeTypes(this.unit);
    },
    showScrapUnitQty() {
      return this.configuration.productBasedScrap && this.configuration.productBasedScrap.includes(this.formData.stationId);
    },
    alternativeUnitRule() {
      return this.formData.unitConversion > 0 || this.$t('Alternative unit value');
    },
    unitConversionTypes() {
      if (!this.alternativeUnit) return [];
      return getUnitConversionTypes(this.unit, this.alternativeUnit);
    },
    idealCycleTime() {
      let result = 0;
      switch (this.formData.runTimeType) {
        case 'UNIT_PER_SECOND':
          result = 1 / this.formData.runTime;
          break;
        case 'UNIT_PER_MINUTE':
          result = 60 / this.formData.runTime;
          break;
        case 'UNIT_PER_HOUR':
          result = 3600 / this.formData.runTime;
          break;
        default:
          result = this.formData.runTime;
      }
      return result;
    },
    formattedIdealCycleTime() {
      return formatNumber(this.idealCycleTime);
    },
    runTimeRule() {
      return !!this.formData.runTime || this.$t('Ideal cycle time');
    },
    cycleTimeRule() {
      return !!this.formData.cycleTimeCritical || this.$t('Downtime start time');
    },
    unitQtyRule() {
      return !!this.formData.unitQty || this.$t('Number of units registered per one sensor signal');
    },
    scrapUnitQtyRule() {
      return !!this.formData.scrapUnitQty || this.$t('Number of scrap units registered per one sensor signal');
    },
    targetRule() {
      if (!this.selectedStation.timeModeActive) return true;
      return !!this.formData.target || this.$t('Target time');
    },
    selectedStation() {
      return this.stationsMap[this.formData.stationId] || {};
    },
  },
  mounted() {
    const route = this.dialogData.route && this.dialogData.route.item;
    if (route) {
      this.formData = {
        stationId: route.stationId,
        runTimeType: route.runTimeType,
        runTime: route.runTime,
        cycleTimeCritical: route.cycleTimeCritical,
        unitQty: route.unitQty,
        semiFinished: route.semiFinished,
        id: route.id,
        scrapUnitQty: route.scrapUnitQty,
        unitConversion: route.unitConversion,
        unitConversionType: route.unitConversionType,
        target: route.target,
      };
    }
    this.unit = this.dialogData.unit;
    this.alternativeUnit = this.dialogData.alternativeUnit;
  },
  methods: {
    getImageAsset,
    formatNumber,
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    async validate() {
      this.$refs.form1.validate();
      this.$refs.form2.validate();
      if (this.valid) {
        this.valid = !!this.formData.stationId;
      }
    },
    async onSaveClick() {
      await this.validate();
      if (this.valid && this.formData.stationId) {
        await this.dialogData.action(this.formData);
        this.closeDialog();
      }
    },
    onCancelClick() {
      this.closeDialog();
    },
    onDeleteClick() {
      this.dialogData.onDelete(this.formData);
      this.closeDialog();
    },
    openHelp() {
      window.open('https://support.evocon.com/Adding-and-managing-products-28671dfc634a4e5caa68cf96ece476fd', '_blank');
    },
  },
};
</script>

<style lang="less" scoped>
.speed-block {
  font-size: .75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: rgb(var(--v-theme-quaternary-dark));
  padding: 8px 0;
  margin: 8px 0;
  width: 100%;
}

.full-width {
  width: 100%;
}
</style>
