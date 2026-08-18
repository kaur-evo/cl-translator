<template>
  <form-page-template
    :primary-segment-title="$t('quality')"
  >
    <template #primary-segment>
      <v-form
        v-if="Object.keys(factoriesMap).length"
        ref="form"
        v-model="valid"
        @submit="onSave"
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
            class="px-1"
          >
            <v-dialog
              ref="dialog"
              v-model="isStartDateDialogVisible"
              width="290px"
            >
              <template #activator="{ props }">
                <v-text-field
                  :model-value="startDate ? getDateDisplayText(startDate) : ''"
                  :placeholder="$t('Start time')"
                  :hint="$t('Start time')"
                  persistent-hint
                  readonly
                  :prepend-inner-icon="mdiCalendarBlank"
                  required
                  variant="filled"
                  :rules="[!!startDate || !!isStartDateDialogVisible || $t('Start time')]"
                  v-bind="props"
                />
              </template>
              <evocon-v-date-picker
                v-model="startDate"
                @update:model-value="isStartDateDialogVisible = false"
              />
            </v-dialog>
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1"
          >
            <v-dialog
              ref="dialog"
              v-model="isEndDateDialogVisible"
              width="290px"
            >
              <template #activator="{ props }">
                <v-text-field
                  :model-value="endDate ? getDateDisplayText(endDate) : ''"
                  :placeholder="$t('End time')"
                  :hint="$t('End time')"
                  persistent-hint
                  readonly
                  :prepend-inner-icon="mdiCalendarBlank"
                  required
                  validate-on="blur"
                  :rules="[!!endDate && isAfterStartDate(endDate) || !!isEndDateDialogVisible || $t('End date must be later than start date')]"
                  variant="filled"
                  v-bind="props"
                />
              </template>
              <evocon-v-date-picker
                v-model="endDate"
                @update:model-value="isEndDateDialogVisible = false"
              />
            </v-dialog>
          </v-col>
        </v-row>
        <v-list v-model:open="openGroups">
          <v-list-group
            v-for="(factory, id) in factoriesWithWriteAccess"
            :key="`item-${id}`"
            :value="id"
            color="black"
            class="px-1"
          >
            <template #activator="{ props }">
              <v-list-item v-bind="props">
                <v-list-item-subtitle class="text-body-small">
                  {{ $t('Factory') }}
                </v-list-item-subtitle>
                <v-list-item-title>{{ factory.name }}</v-list-item-title>
              </v-list-item>
            </template>
            <v-list-item>
              <v-row class="mb-4">
                <v-col
                  cols="8"
                  class="px-1 d-flex align-center"
                >
                  <span>
                    {{ $t('All stations') }}
                  </span>
                </v-col>
                <v-col
                  cols="4"
                  class="px-1"
                >
                  <evocon-number-input
                    v-model="groupQualityValues[id]"
                    :rules="[qualityRule]"
                    validate-on-blur
                    :placeholder="$t('quality')"
                    suffix="%"
                    density="compact"
                    @update:model-value="setValueForAllStations(groupQualityValues[id], factory)"
                  />
                </v-col>
              </v-row>
              <v-row
                v-for="(station, i) in factory.stations"
                :key="`station-${i}`"
                class="mb-4"
              >
                <v-col
                  cols="8"
                  class="pr-1 pl-10 d-flex align-center"
                >
                  <span>
                    {{ station.name }}
                  </span>
                </v-col>
                <v-col
                  cols="4"
                  class="px-1"
                >
                  <evocon-number-input
                    v-model="stationQualityValues[station.id]"
                    :rules="[qualityRule]"
                    validate-on-blur
                    :placeholder="$t('quality')"
                    suffix="%"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-form>
      <div class="mb-4">
        <v-icon
          size="16"
          color="secondary"
          class="mr-2"
        >
          {{ mdiAlertOutline }}
        </v-icon>
        <span class="text-label-small text-secondary-text font-weight-medium">
          Kui valitud periood kattub mõne eelnevaga, siis kirjutatakse andmed üle
        </span>
      </div>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="goBackToOverview"
      />
      <evocon-v-button
        :text="$t('Save')"
        color="primary"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>

<script>
import { isAfter } from 'date-fns';
import { mapState, mapActions } from 'pinia';
import {
  mdiCalendarBlank, mdiAlertOutline,
} from '@mdi/js';

import useFactoryStore from '@/stores/factory';
import useYieldStore from '@/stores/yield';
import { formatDate } from '@/helpers/date/formatDate';
import EvoconVDatePicker from '@/components/atoms/EvoconVDatePicker/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiCalendarBlank, mdiAlertOutline };

export default {
  name: 'SettingsQualityEdit',
  components: {
    FormPageTemplate,
    EvoconVDatePicker,
    EvoconNumberInput,
    EvoconVButton,
  },
  data() {
    return {
      ...icons,
      valid: true,
      isStartDateDialogVisible: false,
      isEndDateDialogVisible: false,
      startDate: '',
      endDate: '',
      openGroups: [],
      stationQualityValues: {},
      groupQualityValues: {},
    };
  },
  computed: {
    ...mapState(useFactoryStore, ['factoriesWithWriteAccess', 'factoriesMap']),
    qualityRule() {
      return (v) => {
        if (!v) {
          return true;
        }
        if (typeof v === 'number') {
          return v >= 0 && v <= 100;
        }
        const input = parseFloat(v.replace(',', '.'));
        return input >= 0 && input <= 100;
      };
    },
  },
  methods: {
    ...mapActions(useYieldStore, ['saveYields']),
    goBackToOverview() {
      this.$router.push({ name: 'qualityOverview' });
    },
    async onSave() {
      await this.$refs.form.validate();
      if (!this.valid) return;
      const yields = Object.entries(this.stationQualityValues).map(([key, value]) => ({ stationId: Number(key), yield: Number(value) }));
      await this.saveYields({ startDate: this.startDate, endDate: this.endDate, yields });
      this.goBackToOverview();
    },
    getDateDisplayText(date) {
      return formatDate(date, 'long');
    },
    isAfterStartDate(date) {
      return isAfter(new Date(date), new Date(this.startDate));
    },
    setValueForAllStations(value, factory) {
      factory.stations.forEach((station) => {
        this.stationQualityValues[station.id] = value;
      });
    },
  },
};
</script>
