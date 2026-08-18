<template>
  <settings-entities-overview
    entity-name="device"
    :overview-header="$t('Devices overview')"
    :filter-configuration="createFilterConfiguration()"
    :items="tableDevices"
    :table-headers="createTableHeadersConf()"
    :loading="isLoading"
    empty-view-description-override=""
  >
    <template #header-btn>
      <evocon-v-button
        color="quaternary-dark"
        :text="$t('Contact support')"
        @click="openSupportDialog"
      />
    </template>
  </settings-entities-overview>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/devicesFilterBarConf';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/devicesTableHeadersConf';
import getFactoryId from '@/helpers/factory-helper';
import { deviceLastOnline, deviceStatus, getFormattedDeviceInput } from '@/helpers/device/device-helpers';
import openSupportDialog from '@/helpers/support/openSupportDialog';
import { useEvoconDevicesStore, useStationStore } from '@/stores/index';

export default {
  name: 'SettingsDevicesOverview',
  components: {
    EvoconVButton,
    SettingsEntitiesOverview,
  },
  computed: {
    ...mapState(useEvoconDevicesStore, ['devices', 'isLoading']),
    ...mapState(useStationStore, ['stationsMap']),
    tableDevices() {
      return Object.values(this.devices).reduce((result, device) => {
        const status = deviceStatus(device.lastOnline, device.offlineNotificationInterval);
        const deviceObj = {
          ...device,
          status,
          id: device.deviceId,
          factoryId: getFactoryId(this.stationsMap, device.inputs[0]?.stationId),
          stationIds: this.getDeviceStationIds(device.inputs),
          lastOnline: status === 'offline' ? deviceLastOnline(device.lastOnline) : '',
          input1: getFormattedDeviceInput(device.inputs, 1),
          input2: getFormattedDeviceInput(device.inputs, 2),
          input3: getFormattedDeviceInput(device.inputs, 3),
          input4: getFormattedDeviceInput(device.inputs, 4),
        };
        result.push(deviceObj);
        return result;
      }, []);
    },
  },
  mounted() {
    this.fetchDevices();
  },
  methods: {
    ...mapActions(useEvoconDevicesStore, ['fetchDevices']),
    createFilterConfiguration,
    createTableHeadersConf,
    openSupportDialog,
    getDeviceStationIds(deviceInputs) {
      return deviceInputs.reduce((result, deviceInput) => {
        if (!result.includes(deviceInput.stationId)) result.push(deviceInput.stationId);
        return result;
      }, []);
    },
  },
};
</script>
