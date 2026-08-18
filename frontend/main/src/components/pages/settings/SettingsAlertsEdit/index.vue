<template>
  <removed-entity-view v-if="isRemovedAlert" />
  <form-page-template
    v-else
    :primary-segment-title="`${isEdit ? $t('Edit') : $t('New')}: ${$t('Alert')}`"
    :secondary-segment-title="$t('Conditions')"
    :secondary-segment-icon="mdiInformationOutline"
    :tertiary-segment-title="$t('Channels')"
    :tertiary-segment-icon="mdiInformationOutline"
    :is-loading="isFormLoading"
    @secondary-icon-click="openHelp"
    @tertiary-icon-click="openHelp"
  >
    <template #primary-segment>
      <v-form
        ref="form1"
        v-model="primaryValid"
      >
        <evocon-v-input
          v-model.trim="formData.name"
          :placeholder="$t('Name')"
          :rules="[nameRule]"
          required
          validate-on-blur
          max-length="100"
          autofocus
          :hint="$t('Name')"
          class="mx-1"
        />
      </v-form>
    </template>
    <template #secondary-segment>
      <event-conditions-block
        ref="eventConditionsBlock"
        :event-type="'alert'"
        :requirements="formData.requirements"
        :saved-requirements="savedRequirements"
        :secondary-title="$t('Trigger')"
        :loading="isFormLoading"
        class="mx-1"
        @update:requirements="onRequirementsUpdate"
        @update:requirements-ready="secondaryValid = $event"
        @alert-subtype-change="alertSubtype = $event"
      />
    </template>
    <template #tertiary-segment>
      <div class="px-1">
        <tiny-cards-list
          :items="alertChannels"
          use-slot
        >
          <template #card="props">
            <list-card
              :title="getChannelTypeById(props.item.type).name"
              :icon="getChannelTypeById(props.item.type).icon"
              :subtitle-key-value-pairs="getSubtitle(props.item)"
              :card-buttons="channelCardButtons"
              :button-params="props"
            >
              <template #title-append>
                <v-icon
                  v-if="warningsMap.get(props.item.type)"
                  size="16"
                  color="lw-orange"
                  class="ml-2 my-auto"
                >
                  {{ mdiAlert }}
                </v-icon>
              </template>
            </list-card>
          </template>
        </tiny-cards-list>
        <evocon-v-button
          type="primary-light"
          :text="$t('Channel')"
          :icon="mdiPlus"
          :disabled="alertChannels.length >= 2"
          class="my-2"
          @click="onAddChannel"
        />
        <p
          v-if="hasChannelError"
          class="text-error text-body-small"
        >
          {{ $t('Please add at least one channel') }}
        </p>
        <multi-line-switch
          v-model="formData.active"
          :main-text="$t('Alert status')"
          class="my-2"
        />
      </div>
    </template>
    <template #actions>
      <delete-button
        v-if="isEdit"
        @click="onDelete"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="goBackToOverview"
      />
      <evocon-v-button
        :text="$t('Save')"
        :loading="isSaveLoading"
        color="primary"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiInformationOutline, mdiWebhook, mdiPlus, mdiDelete, mdiAlert, mdiPencil,
} from '@mdi/js';
import { cloneDeep } from 'lodash';
import { defineAsyncComponent } from 'vue';

import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EventConditionsBlock from '@/components/organisms/settings/EventConditionsBlock/index.vue';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import TinyCardsList from '@/components/molecules/TinyCardsList/index.vue';
import ListCard from '@/components/molecules/ListCard/index.vue';
import {
  alertTypes, alertSubtypes, channelTypes, getChannelTypesArray, getChannelTypeById, getEmailTemplate,
} from '@/constants/alerts';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';
import useAlertStore from '@/stores/alert';
import useStationStore from '@/stores/station';
import useFeatureStore from '@/stores/feature';
import useGenericNotificationStore from '@/stores/genericNotification';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericDialogStore from '@/stores/genericDialog';
import usePositionStore from '@/stores/position';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import useShiftTemplateStore from '@/stores/shiftTemplate';

const icons = {
  mdiInformationOutline, mdiWebhook, mdiPlus, mdiAlert,
};

const defaultRequirements = {
  type: null,
  factoryIds: [],
  stationIds: [],
  productIds: [],
  operatorIds: [],
  shiftTemplateIds: [],
  positionIds: [],
};

export default {
  name: 'SettingsAlertEdit',
  components: {
    FormPageTemplate,
    EvoconVButton,
    EvoconVInput,
    EventConditionsBlock,
    MultiLineSwitch,
    TinyCardsList,
    ListCard,
    DeleteButton,
    RemovedEntityView,
  },
  data() {
    return {
      ...icons,
      primaryValid: true,
      secondaryValid: false,
      hasChannelError: false,
      isFormLoading: false,
      isSaveLoading: false,
      formData: {
        active: false,
        name: '',
        requirements: { ...defaultRequirements },
        output: {
          channels: [],
        },
      },
      alertSubtype: null,
      warningsMap: new Map(),
    };
  },
  computed: {
    ...mapState(useAlertStore, ['alertsMap']),
    ...mapState(useStationStore, ['stationsWithAdminPermissions']),
    ...mapState(useFeatureStore, ['checklistsEnabled']),
    ...mapState(useGenericNotificationStore, ['isNotificationOpen', 'notificationType']),
    isEdit() {
      return !!this.$route.params.id;
    },
    nameRule() {
      return !!this.formData.name || this.$t('Name');
    },
    currentAlert() {
      return this.alertsMap[this.$route.params.id];
    },
    savedRequirements() {
      return this.isEdit
        ? { ...defaultRequirements, ...this.currentAlert?.requirements }
        : { ...defaultRequirements };
    },
    alertChannels: {
      get() {
        return this.formData.output.channels;
      },
      set(val) {
        this.formData.output.channels = val;
      },
    },
    defaultEmailTemplate() {
      return getEmailTemplate(this.formData.requirements.type, this.alertSubtype);
    },
    channelCardButtons() {
      return [
        {
          icon: mdiPencil,
          text: this.$t('Edit'),
          tooltip: this.$t('Edit'),
          action: (props) => this.onAddChannel(props),
        },
        {
          icon: mdiDelete,
          text: this.$t('Delete'),
          tooltip: this.$t('Delete'),
          action: (props) => this.removeChannel(props),
        },
      ];
    },
    isRemovedAlert() {
      const alertExists = this.currentAlert && !this.currentAlert.deleted;
      return !this.isFormLoading && this.isEdit && !alertExists;
    },
  },
  watch: {
    alertSubtype(newVal, oldVal) {
      if (oldVal) {
        this.addWarningAndReplaceChannelContent(oldVal);
      }
    },
  },
  async mounted() {
    this.isFormLoading = true;
    await Promise.all([
      this.fetchAlerts(),
      this.fetchShiftTemplates(),
      this.fetchPositions(),
    ]);
    if (this.checklistsEnabled) {
      await this.fetchChecklistGroups();
      await this.fetchChecklists();
    }
    if (this.isEdit && this.currentAlert) {
      this.formData = cloneDeep(this.currentAlert);
      this.formData.requirements = { ...defaultRequirements, ...this.formData.requirements };
    }
    this.warningsMap = new Map(getChannelTypesArray().map((type) => [type.id, false]));
    this.isFormLoading = false;
  },
  unmounted() {
    if (this.isNotificationOpen && this.notificationType === 'warning') this.closeNotification();
  },
  methods: {
    ...mapActions(useGenericNotificationStore, ['notifyWarning', 'closeNotification']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useAlertStore, ['saveAlert', 'deleteAlert', 'fetchAlerts']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useChecklistTemplateStore, ['fetchChecklists', 'fetchChecklistGroups']),
    ...mapActions(useShiftTemplateStore, ['fetchShiftTemplates']),
    ...mapActions(usePositionStore, ['fetchPositions']),
    getChannelTypeById,
    goBackToOverview() {
      this.$router.push({ name: 'alertOverview', query: this.$route.query ? { ...this.$route.query } : {} });
    },
    async onSave() {
      this.$refs.form1.validate();
      if (this.alertChannels.length === 0) this.hasChannelError = true;
      if (!this.secondaryValid) {
        this.$refs.eventConditionsBlock.$refs.alertTriggerBlock.validate();
        if (this.formData.requirements.type === alertTypes.STOPREASON) {
          this.formData.requirements.setpoint = 0;
          this.formData.requirements.count = 0;
        }
        if (this.formData.requirements.type === alertTypes.SCRAPREASON) this.formData.requirements.intervalQty = 0;
      }
      if (!this.primaryValid || !this.secondaryValid || this.hasChannelError) {
        return;
      }
      this.isSaveLoading = true;
      const alert = await this.saveAlert({
        ...this.formData,
        requirements: {
          ...this.formData.requirements,
          stationIds: this.getStationIds(),
        },
      });
      this.isSaveLoading = false;
      if (alert.id) this.goBackToOverview();
    },
    async onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.formData.name }),
        action: () => {
          this.deleteAlert(this.currentAlert);
          this.goBackToOverview();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    openHelp() {
      window.open('https://support.evocon.com/Managing-alerts-2d9209b4286642ffa42e92845944017e', '_blank');
    },
    onRequirementsUpdate(updates) {
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'type') this.onAlertTypeChange(value);
        else this.formData.requirements = { ...this.formData.requirements, [key]: value };
      });
    },
    onAddChannel({ item, index }) {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../../../organisms/settings/SettingsAddAlertChannelDialog/index.vue')),
        width: 732,
        saveOnEnter: false,
        data: {
          channel: item,
          availableTypes: getChannelTypesArray().filter((channel) => !this.alertChannels.find((c, i) => c.type === channel.id && i !== index)),
          alertType: this.formData.requirements.type,
          alertSubtype: this.alertSubtype,
          action: (data) => {
            this.hasChannelError = false;
            if (index >= 0) this.alertChannels.splice(index, 1, data);
            else this.alertChannels.push(data);
            if (this.warningsMap.get(data.type)) this.removeWarningFromChannel(data.type);
          },
          cancel: () => {
            if (item && this.warningsMap.get(item.type)) this.removeWarningFromChannel(item.type);
          },
        },
      };
      this.openDialog(dialogConfig);
    },
    removeChannel({ index }) {
      this.alertChannels.splice(index, 1);
    },
    getSubtitle(item) {
      const key = item.type === channelTypes.EMAIL ? this.$t('Emails') : this.$t('URL');
      const value = item.type === channelTypes.EMAIL ? item.targets?.join(', ') : item.url;
      return [{ key, value }];
    },
    getStationIds() {
      const { requirements } = this.formData;
      if (requirements.stationIds.length > 0) return requirements.stationIds;
      if (requirements.factoryIds.length > 0) {
        return this.stationsWithAdminPermissions.reduce((acc, station) => {
          if (requirements.factoryIds.includes(station.factoryId)) acc.push(station.id);
          return acc;
        }, []);
      }
      return this.stationsWithAdminPermissions.map((station) => station.id);
    },
    onAlertTypeChange(type) {
      if (type === this.formData.requirements.type) return;
      this.formData.requirements = {
        type,
        factoryIds: this.formData.requirements.factoryIds,
        stationIds: this.formData.requirements.stationIds,
        productIds: this.formData.requirements.productIds,
        operatorIds: this.formData.requirements.operatorIds,
        shiftTemplateIds: this.formData.requirements.shiftTemplateIds,
        positionIds: this.formData.requirements.positionIds,
      };
      switch (type) {
        case alertTypes.STOPREASON:
          this.formData.requirements.setpoint = null;
          this.formData.requirements.commentIds = [];
          break;
        case alertTypes.SCRAPREASON:
          this.formData.requirements.subType = alertSubtypes.SCRAP_QTY;
          this.formData.requirements.intervalQty = null;
          this.formData.requirements.scrapReasonIds = [];
          break;
        case alertTypes.CHANGEOVER:
          this.formData.requirements.subType = alertSubtypes.ADDED;
          break;
        case alertTypes.CHECKLIST:
          this.formData.requirements.checklistIds = [];
          this.formData.requirements.checklistStatuses = [];
          break;
        default:
          break;
      }
      this.addWarningAndReplaceChannelContent();
    },
    addWarningAndReplaceChannelContent(prevSubtype) {
      const emailTemplateForPrevSubtype = prevSubtype ? getEmailTemplate(this.formData.requirements.type, prevSubtype) : this.defaultEmailTemplate;
      this.alertChannels = this.alertChannels.map((channel) => {
        const channelCopy = { ...channel };
        const isNotDefaultEmailTemplate = channel.type === channelTypes.EMAIL
          && (channel.subject !== emailTemplateForPrevSubtype.subject || channel.message !== emailTemplateForPrevSubtype.message);
        const isNotDefaultWebhook = channel.type === channelTypes.WEBHOOK && channel.message !== '';
        if (isNotDefaultEmailTemplate || isNotDefaultWebhook) {
          this.warningsMap.set(channel.type, true);
          this.notifyWarning({ text: this.$t('Trigger change has reset the alert message.'), timeout: -1 });
        }
        if (channel.type === channelTypes.EMAIL) {
          channelCopy.subject = this.defaultEmailTemplate.subject;
          channelCopy.message = this.defaultEmailTemplate.message;
        } else {
          channelCopy.message = '';
        }
        return channelCopy;
      });
    },
    removeWarningFromChannel(channelType) {
      this.warningsMap.set(channelType, false);
      if ([...this.warningsMap.values()].every((val) => val === false)) this.closeNotification();
    },
  },
};
</script>
