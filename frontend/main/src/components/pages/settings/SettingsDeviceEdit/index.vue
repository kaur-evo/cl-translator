<template>
  <form-page-template
    :is-loading="isLoading"
    class="fit-screen"
    :secondary-segment-title="$t('Inputs')"
  >
    <template #title-segment>
      <div class="d-flex pa-4 align-center justify-center">
        <div>
          <v-card-title class="d-flex align-center justify-center pa-0">
            <v-icon
              :color="formData.status === 'online' ? 'primary' : 'error'"
              size="9"
              class="mr-2"
            >
              {{ mdiCircle }}
            </v-icon>
            {{ formData.serialNumber }}
          </v-card-title>
          <v-card-subtitle
            class="d-flex justify-center pa-0 text-body-medium"
          >
            {{ subtitle }}
          </v-card-subtitle>
        </div>
        <div class="status-icon-wrapper">
          <v-tooltip v-if="(formData.version === 'v2' && formData.status === 'offline') || formData.version === 'v3'" location="top">
            <template #activator="{ props }">
              <v-icon
                class="status-icon"
                :color="formData.status === 'offline' ? 'secondary' : ''"
                v-bind="props"
                @click="onIconClick(formData.status)"
              >
                {{ formData.status === 'online' ? mdiInformationOutline : mdiAlertCircleOutline }}
              </v-icon>
            </template>
            <span>{{ formData.status === 'online' ? $t('Learn more') : $t('Troubleshoot') }}</span>
          </v-tooltip>
        </div>
      </div>
    </template>
    <template #primary-segment>
      <v-row>
        <v-col>
          <evocon-v-textarea
            v-model.trim="formData.description"
            :hint="`${$t('Description')} (${$t('Optional').toLowerCase()})`"
            max-length="200"
          />
        </v-col>
      </v-row>
      <v-row class="pt-2">
        <v-col :cols="columnSize">
          <content-column
            :class="isMobileView ? 'mb-2' : 'mr-1'"
            :content-header="$t('Hostname')"
            :content-value="formData.hostname"
          />
        </v-col>
        <v-col v-if="formData.version === 'v3'" :cols="columnSize">
          <content-column
            :class="isMobileView ? 'mb-2' : 'mx-1'"
            :content-header="$t('Wifi')"
            :content-value="formData.wifiMac"
          />
        </v-col>
        <v-col :cols="columnSize">
          <content-column
            :class="{ 'ml-1': !isMobileView }"
            :content-header="$t('Ethernet')"
            :content-value="formData.ethernetMac"
          />
        </v-col>
      </v-row>
      <v-row v-if="formData.version === 'v3'">
        <v-col class="mt-2">
          <content-column
            :content-header="$t('Command line password')"
            :content-value="formData.commandLinePassword"
          />
        </v-col>
      </v-row>
    </template>
    <template #secondary-segment>
      <div
        v-for="(input, i) in formData.inputs"
        :key="i"
        class="px-1 mb-4"
      >
        <list-card
          v-if="input.station"
          :title="input.name"
          :subtitle-key-value-pairs="[{ key: $t('station'), value: input.station }]"
        />
        <info-block
          v-else
          :header="`${input.name}: ${$t('Inactive')}`"
          :body="$t('To use this input, please contact your Evocon account representative')"
          :icon="mdiInformationOutline"
        />
      </div>
      <evocon-v-button
        v-if="isMobileView"
        class="mb-4"
        color="quaternary-dark"
        :text="$t('Contact support')"
        @click="openSupportDialog"
      />
    </template>
    <template #actions>
      <evocon-v-button
        v-if="!isMobileView"
        color="quaternary-dark"
        :text="$t('Contact support')"
        @click="openSupportDialog"
      />
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="goBackToOverview()"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Save')"
        @click="onSaveClick()"
      />
    </template>
  </form-page-template>
</template>
<script>
import sortBy from 'lodash/sortBy';
import { mapState, mapActions } from 'pinia';
import { mdiCircle, mdiInformationOutline, mdiAlertCircleOutline } from '@mdi/js';

import { deviceLastOnline, deviceStatus } from '@/helpers/device/device-helpers';
import devicesApi from '@/api/devicesApi';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import ListCard from '@/components/molecules/ListCard/index.vue';
import ContentColumn from '@/components/molecules/ContentColumn/index.vue';
import openSupportDialog from '@/helpers/support/openSupportDialog';
import {
  useStationStore,
  useDeviceStore,
  useGenericNotificationStore,
  useEvoconDevicesStore,
} from '@/stores/index';

const vectorIcons = { mdiCircle, mdiInformationOutline, mdiAlertCircleOutline };

export default {
  name: 'SettingsDeviceEdit',
  components: {
    EvoconVTextarea,
    EvoconVButton,
    FormPageTemplate,
    InfoBlock,
    ListCard,
    ContentColumn,
  },
  data() {
    return {
      ...vectorIcons,
      deviceId: null,
      formData: {},
      isLoading: false,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsMap']),
    ...mapState(useDeviceStore, ['isMobileView']),
    subtitle() {
      if (this.formData.lastOnline) return deviceLastOnline(this.formData.lastOnline);
      return '';
    },
    columnSize() {
      if (this.isMobileView) return 12;
      // eslint-disable-next-line no-magic-numbers
      return this.formData.version === 'v3' ? 4 : 6;
    },
  },
  async mounted() {
    try {
      this.isLoading = true;
      this.deviceId = this.$route.params.id;
      const deviceResponse = await devicesApi.getDeviceById(this.deviceId);
      this.formData = {
        ...deviceResponse,
        serialNumber: String(deviceResponse.serialNumber),
        status: deviceStatus(deviceResponse.lastOnline, deviceResponse.offlineNotificationInterval),
        inputs: this.getModifiedDeviceInputs(deviceResponse.inputs),
      };
    } catch (err) {
      this.notifyError(err);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    openSupportDialog,
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    ...mapActions(useEvoconDevicesStore, ['saveDevice']),
    getModifiedDeviceInputs(inputs) {
      const sortedInputs = sortBy(inputs, ['inputNumber']);
      return sortedInputs.map((input) => ({
        name: `${this.$t('Input')} ${input.inputNumber}`,
        station: input.stationId ? this.stationsMap[input.stationId]?.name : '',
      }));
    },
    goBackToOverview() {
      const query = this.$route.query ? { ...this.$route.query } : {};
      this.$router.push({ name: 'deviceOverview', query });
    },
    async onSaveClick() {
      await this.saveDevice({ deviceId: this.deviceId, description: this.formData.description });
      this.goBackToOverview();
    },
    onIconClick(status) {
      if (status === 'offline') {
        window.open('https://support.evocon.com/Steps-to-follow-in-case-the-Evocon-device-is-offline-04b5c643c69e4f838642a80cbf078c00');
      } else {
        window.open('https://support.evocon.com/Evoconverter-3-Command-line-interface-8cd0a4a6aa8d415d88e42243c26d913d');
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.status-icon-wrapper {
  position: absolute;
  right: 12px;
}
.fit-screen {
  max-width: calc(100vw - 32px) !important;
}
</style>
