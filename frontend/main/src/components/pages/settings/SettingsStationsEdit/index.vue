<template>
  <removed-entity-view v-if="isRemovedStation" />
  <form-page-template
    v-else
    :primary-segment-title="stationsMap[stationId] ? stationsMap[stationId].name : ''"
    :is-loading="isLoading"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSave"
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model.trim="formData.name"
              :placeholder="$t('Name')"
              variant="filled"
              :rules="[(v) => !!v && !!v.trim() || $t('Station name')]"
              required
              validate-on="blur"
              :counter="200"
              :maxlength="200"
              autofocus
              :hint="$t('Station name')"
              persistent-hint
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <selection-input
              :model-value="[formData.groupId]"
              :placeholder="$t('Group')"
              :items="filteredGroups"
              :items-map="stationGroupsMap"
              :hint="$t('Group')"
              is-single-select
              required
              @update:model-value="formData.groupId = $event[0]"
            />
          </v-col>
          <v-col
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model.trim="formData.description"
              :placeholder="$t('Description')"
              variant="filled"
              :counter="200"
              :maxlength="200"
              :hint="`${$t('Description')} (${$t('Optional')}) `"
              persistent-hint
            />
          </v-col>
        </v-row>
        <v-row class="my-4">
          <v-col class="text-center">
            <div class="text-body-large font-weight-bold">
              {{ $t('Notification emails') }}
            </div>
            <div class="text-body-medium text-secondary-text">
              {{ $t('Who should receive messages from this station?') }}
            </div>
          </v-col>
        </v-row>
        <div class="mt-4 px-1 mb-2">
          <evocon-email-input
            ref="emailInput"
            v-model="formData.notificationEmails"
            :placeholder="$t('Notification emails')"
          />
        </div>
        <info-block
          :header="$t('Use this email to send messages directly to this station')"
          :body="stationAddress"
          :icon="mdiInformationOutline"
          class="mx-1 mt-2"
        />
        <v-row class="my-4">
          <v-col class="text-center">
            <div class="text-body-large font-weight-bold">
              {{ $t('OEE settings') }}
            </div>
            <div class="text-body-medium text-secondary-text">
              {{ $t('Define OEE and hourly quantities targets in Shift View') }}
            </div>
          </v-col>
        </v-row>
        <v-row class="mb-2">
          <v-col
            md="4"
          >
            <static-mr-evocon
              id="mr-evocon-negative"
              state="negative"
              class="d-flex mx-auto"
              :max-height="'100px'"
              :max-width="'100px'"
            />
          </v-col>
          <v-col
            md="4"
          >
            <static-mr-evocon
              id="mr-evocon-neutral"
              state="neutral"
              class="d-flex mx-auto"
              :max-height="'100px'"
              :max-width="'100px'"
            />
          </v-col>
          <v-col
            md="4"
          >
            <static-mr-evocon
              id="mr-evocon-positive"
              state="positive"
              class="d-flex mx-auto"
              :max-height="'100px'"
              :max-width="'100px'"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            md="4"
            class="px-1"
          >
            <evocon-number-input
              v-model="formData.oeeGoalSad"
              :placeholder="$t('Mr Evocon unhappy %')"
              validate-on-blur
              :hint="$t('Mr Evocon unhappy %')"
              suffix="%"
              :rules="[unHappyRule]"
            />
          </v-col>
          <v-col
            md="4"
            class="px-1"
          >
            <evocon-v-input
              :model-value="mrEvoconNeutralValues"
              disabled
              :hint="$t('Mr Evocon neutral %')"
              suffix="%"
            />
          </v-col>
          <v-col
            md="4"
            class="px-1"
          >
            <evocon-number-input
              v-model="formData.oeeGoalHappy"
              :placeholder="$t('Mr Evocon happy %')"
              validate-on-blur
              :hint="$t('Mr Evocon happy %')"
              :rules="[happyRule]"
              suffix="%"
            />
          </v-col>
        </v-row>
        <v-card class="my-4">
          <v-card-title class="text-body-large font-weight-bold align-center v-row justify-center text-center py-4 px-6">
            <span>{{ $t('Shift View settings') }}</span>
            <icon-with-tooltip
              additional-classes="ml-2"
              :icon="mdiInformationOutline"
              :tooltip-text="$t('Learn more')"
              :icon-clicked-fn="onOpenHelp"
            />
          </v-card-title>
          <v-card-text class="px-6">
            <div class="text-body-medium font-weight-bold my-4">
              {{ $t('Default reasons') }}
            </div>
            <div class="mt-2">
              <v-sheet class="py-1 px-3 d-flex flex-wrap">
                <selection-input
                  :model-value="[formData.emptyShiftCommentId]"
                  :items="allowedComments"
                  :items-map="commentsMapExcludeDeleted"
                  :groups="commentGroups"
                  :placeholder="emptyShiftReasonPlaceholder"
                  :hint="`${$t('Empty shift reason')} (${$t('Optional')}) `"
                  use-chips
                  is-single-select
                  is-grouped-select
                  class="ma-1"
                  :prepend-text="$t('Empty shift reason') + ': '"
                  :prepend-inner-icon="mdiCalendarRemove"
                  @update:model-value="formData.emptyShiftCommentId = $event[0]"
                />
                <selection-input
                  :model-value="[formData.productChangeCommentId]"
                  :items="allowedComments"
                  :items-map="commentsMap"
                  :groups="commentGroups"
                  :placeholder="$t('Product changeover reason')"
                  :hint="`${$t('Product changeover reason')} (${$t('Optional')}) `"
                  use-chips
                  is-single-select
                  is-grouped-select
                  class="ma-1"
                  :prepend-text="$t('Product changeover reason') + ': '"
                  :prepend-inner-icon="mdiAutorenew"
                  @update:model-value="formData.productChangeCommentId = $event[0]"
                />
                <selection-input
                  :model-value="[formData.defaultScrapReasonId]"
                  :items="stationScrapReasons"
                  :items-map="scrapReasonsMap"
                  :groups="scrapReasonGroups"
                  :placeholder="$t('Default scrap reason')"
                  :hint="`${$t('Default scrap reason')} (${$t('Optional')}) `"
                  use-chips
                  is-single-select
                  is-grouped-select
                  class="ma-1"
                  :prepend-text="$t('Default scrap reason') + ': '"
                  :prepend-inner-icon="mdiMinusCircleOutline"
                  @update:model-value="formData.defaultScrapReasonId = $event[0]"
                />
              </v-sheet>
            </div>
            <div class="text-body-medium font-weight-bold my-4">
              {{ $t('Advanced settings') }}
            </div>
            <v-row>
              <v-col
                cols="12"
                class="px-1 my-1"
              >
                <evocon-v-checkbox
                  v-model="formData.requireOperator"
                  :label="$t('Operator selection is mandatory for each shift')"
                />
              </v-col>
              <v-col
                cols="12"
                class="px-1 my-1 d-flex align-center"
              >
                <evocon-v-checkbox
                  v-model="formData.extendStopReason"
                  :label="$t('Automatically carry stop reason to next shift')"
                />
                <icon-with-tooltip
                  :icon="mdiInformationOutline"
                  :tooltip-text="$t('If the next shift starts immediately after, the stop reason is carried over.')"
                  additional-classes="ml-2"
                />
              </v-col>
              <v-col
                cols="12"
                class="px-1 my-1"
              >
                <evocon-v-checkbox
                  v-model="formData.requireChangeoverNote"
                  :label="$t('Require extra note on changeovers')"
                />
              </v-col>
              <v-col
                cols="12"
                class="px-1 my-1"
              >
                <evocon-v-checkbox
                  v-model="formData.requireLotBatch"
                  :label="$t('Require LOT/Batch number on changeovers')"
                />
              </v-col>
              <v-col
                cols="12"
                class="px-1 my-1"
              >
                <evocon-v-checkbox
                  v-model="formData.deleteSliceAllowed"
                  :label="$t('Allow operators to delete production signals (circles)')"
                />
              </v-col>
              <v-col
                cols="12"
                class="px-1 my-1"
              >
                <evocon-v-checkbox
                  v-model="formData.showManualShift"
                  :label="$t('Allow manual shift management')"
                />
                <evocon-v-input
                  id="manual-shift-name-input"
                  v-model.trim="formData.manualShiftName"
                  :disabled="!formData.showManualShift"
                  :placeholder="$t('Extra shift')"
                  variant="filled"
                  :rules="[(v) => !formData.showManualShift || !!(v && v.trim()) || $t('Please enter extra shift name (e.g weekend shift)')]"
                  required
                  validate-on="blur"
                  :counter="200"
                  :maxlength="200"
                  :hint="$t('Please enter extra shift name (e.g weekend shift)')"
                  persistent-hint
                  class="mt-2"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="onCancel"
      />
      <evocon-v-button
        :text="$t('Save')"
        color="primary"
        :loading="isLoading"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { mdiInformationOutline, mdiMinusCircleOutline, mdiAutorenew, mdiCalendarRemove } from '@mdi/js';

import useCommentStore from '@/stores/comment';
import useScrapReasonStore from '@/stores/scrapReason';
import useStationStore from '@/stores/station';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import messageApi from '@/api/messageApi';
import StaticMrEvocon from '@/components/atoms/StaticMrEvocon/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconEmailInput from '@/components/molecules/EvoconEmailInput/index.vue';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';


const icons = { mdiInformationOutline, mdiMinusCircleOutline, mdiAutorenew, mdiCalendarRemove };

export default {
  name: 'SettingsStationsEdit',
  components: {
    FormPageTemplate,
    EvoconVCheckbox,
    IconWithTooltip,
    StaticMrEvocon,
    EvoconVInput,
    EvoconNumberInput,
    SelectionInput,
    InfoBlock,
    EvoconVButton,
    EvoconEmailInput,
    RemovedEntityView,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const { groupId } = from.query;
      if (groupId && !to.params.id) {
        // default to group we entered from
        // eslint-disable-next-line no-param-reassign
        vm.formData.groupId = Number(groupId);
      }
    });
  },
  data() {
    return {
      ...icons,
      valid: true,
      stationAddress: '',
      formData: {
        name: '',
        groupId: null,
        description: '',
        notificationEmails: [],
        oeeGoalSad: null,
        oeeGoalHappy: null,
        productChangeCommentId: null,
        emptyShiftCommentId: null,
        deleteSliceAllowed: true,
        requireOperator: true,
        extendStopReason: false,
        showManualShift: true,
        manualShiftName: '',
        defaultScrapReasonId: null,
        requireLotBatch: false,
        requireChangeoverNote: false,
      },
    };
  },
  computed: {
    ...mapState(useCommentStore, ['commentsExcludePredefined', 'commentGroups', 'commentsMap', 'commentsMapExcludeDeleted']),
    ...mapState(useScrapReasonStore, ['scrapReasonGroups', 'scrapReasonsMap']),
    ...mapState(useStationStore, ['isLoading', 'stationsMap', 'stationGroups', 'stationGroupsMap']),
    ...mapState(useScrapReasonStore, ['scrapReasons']),
    stationScrapReasons() {
      return this.scrapReasons.filter((reason) => reason.stationIds.includes(this.station.id));
    },
    mrEvoconNeutralValues() {
      if (this.formData.oeeGoalHappy - this.formData.oeeGoalSad <= 1) return 'N/A';
      const lowerVal = this.formData.oeeGoalSad ? Number(this.formData.oeeGoalSad) + 1 : 0;
      const upperVal = this.formData.oeeGoalHappy ? Number(this.formData.oeeGoalHappy) - 1 : 100;
      return `${formatNumber(lowerVal, { decimalPlaces: null })} - ${formatNumber(upperVal, { decimalPlaces: null })}`;
    },
    stationId() {
      return this.$route.params.id ? String(this.$route.params.id) : '';
    },
    station() {
      return this.stationsMap[this.stationId];
    },
    allowedComments() {
      return this.commentsExcludePredefined.filter((comment) => comment.stationIds.includes(this.station.id) && !comment.deleted);
    },
    unHappyRule() {
      const isWithinRange = this.formData.oeeGoalSad <= 100 && this.formData.oeeGoalSad >= 0;
      const isSmallerThanHappy = !this.formData.oeeGoalHappy || this.formData.oeeGoalHappy > this.formData.oeeGoalSad;
      return (isWithinRange && isSmallerThanHappy) || this.$t('Mr Evocon unhappy %');
    },
    happyRule() {
      const isWithinRange = this.formData.oeeGoalHappy <= 100 && this.formData.oeeGoalHappy >= 0;
      const isBiggerThanSad = !this.formData.oeeGoalSad || this.formData.oeeGoalHappy > this.formData.oeeGoalSad;
      return (isWithinRange && isBiggerThanSad) || this.$t('Mr Evocon happy %');
    },
    filteredGroups() {
      return this.stationGroups.filter((group) => group.factoryId === this.stationsMap[this.stationId].factoryId);
    },
    emptyShiftReasonPlaceholder() {
      if (!this.formData.emptyShiftCommentId) return this.$t('Empty shift reason');
      return `(${this.$t('Deleted').toLowerCase()}) ${this.commentsMap[this.formData.emptyShiftCommentId].name}`;
    },
    isFormValid() {
      return this.valid && this.$refs.emailInput.isValid;
    },
    isRemovedStation() {
      const stationExists = this.station && !this.station.deleted;
      return !this.isLoading && !stationExists;
    },
  },
  watch: {
    stationsMap() {
      this.setFormData();
    },
    stationId(val) {
      this.setFormData();
      if (val) {
        this.fetchStationAddress(val);
      }
    },
  },
  async mounted() {
    this.setFormData();
    this.fetchStationAddress(this.stationId);
  },
  methods: {
    ...mapActions(useStationStore, ['saveStation']),
    async fetchStationAddress(stationId) {
      this.stationAddress = await messageApi.getStationAddress(stationId);
    },
    setFormData() {
      if (this.stationId) {
        const station = this.stationsMap[this.stationId];
        if (!station) return; // data not loaded yet
        this.formData = {
          name: station.name,
          groupId: station.groupId,
          description: station.description,
          notificationEmails: station.notificationEmails ? station.notificationEmails.split(',') : [],
          id: station.id,
          oeeGoalSad: station.oeeGoalSad,
          oeeGoalHappy: station.oeeGoalHappy,
          productChangeCommentId: station.productChangeCommentId,
          emptyShiftCommentId: station.emptyShiftCommentId,
          deleteSliceAllowed: station.deleteSliceAllowed,
          requireOperator: station.requireOperator,
          extendStopReason: station.extendStopReason,
          showManualShift: station.showManualShift,
          manualShiftName: station.manualShiftName,
          defaultScrapReasonId: station.defaultScrapReasonId,
          requireLotBatch: station.requireLotBatch,
          requireChangeoverNote: station.requireChangeoverNote,
        };
      }
    },
    async validate() {
      await this.$refs.form.validate();
    },
    async onSave() {
      await this.validate();
      if (!this.isFormValid) return;
      const station = await this.saveStation({ ...this.formData, notificationEmails: this.formData.notificationEmails.join(',') });
      if (station.id) this.goBackToOverview();
    },
    onCancel() {
      this.goBackToOverview();
    },
    goBackToOverview() {
      this.$router.push({ name: 'stationOverview', query: this.$route.query ? { ...this.$route.query } : {} });
    },
    onOpenHelp() {
      window.open('https://support.evocon.com/Managing-stations-88fd2a25fc8449c3abbac2416ec85234', '_blank');
    },
  },
};
</script>
