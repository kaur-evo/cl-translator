<template>
  <form-dialog-template
    :primary-segment-title="isEdit ? selectedIP.ipAddress : `${$t('New')}: ${$t('IP address')}`"
  >
    <template #primary-segment>
      <v-form ref="form" v-model="isFormValid">
        <evocon-v-input
          v-model.trim="formData.ipAddress"
          :placeholder="$t('Public IP address')"
          :hint="$t('Public IP address')"
          :rules="ipAddressRules"
          class="mb-2"
          validate-on-blur
          required
        >
          <template #append-inner>
            <evocon-v-button
              :text="$t('Get my IP')"
              :icon="mdiWifi"
              size="small"
              color="quaternary-dark"
              @click="getMyIP"
            />
          </template>
        </evocon-v-input>
        <evocon-v-input
          v-model.trim="formData.description"
          :placeholder="$t('Description')"
          :hint="$t('Description')"
          :rules="[(v) => !!v && !!v.trim() || $t('Description')]"
          class="mb-2"
          validate-on-blur
          required
        />
        <selection-input
          v-model="formData.roles"
          :items="roles"
          :placeholder="$t('Roles')"
          :hint="$t('Roles')"
          hide-search
          required
        />
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="closeDialog"
      />
      <evocon-v-button
        type="primary-light"
        :text="$t('Apply')"
        @click="onApply"
      />
    </template>
  </form-dialog-template>
</template>
<script setup name="SettingsAllowedIPDialog">
import { ref, computed, onMounted } from 'vue';
import { mdiWifi } from '@mdi/js';

import useGenericDialogStore from '@/stores/genericDialog';
import i18n from '@/services/i18n';
import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';
import allowedIPsApi from '@/api/allowedIPsApi';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';

const genericDialogStore = useGenericDialogStore();
const genericNotificationStore = useGenericNotificationStore();
const profileStore = useProfileStore();

// eslint-disable-next-line sonarjs/regex-complexity
const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})(\.(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})){3}$/;

const IPWhitelist = computed(() => genericDialogStore.dialogData.IPWhitelist || []);
const selectedIP = computed(() => genericDialogStore.dialogData.item || {});
const isEdit = computed(() => !!selectedIP.value.ipAddress);

const roles = computed(() => profileStore.visibleUserRolesFormatted);

const ipAddressRules = computed(() => [
  (v) => (!!v && !!v.trim()) || i18n.global.t('Public IP address'),
  (v) => ipv4Regex.test(v) || i18n.global.t('Public IP not in correct format (IPv4)'),
]);

const form = ref(null);
const isFormValid = ref(true);
const originalIpAddress = ref('');
const formData = ref({
  ipAddress: '',
  description: '',
  roles: [],
});

const getMyIP = async () => {
  const ip = await allowedIPsApi.getMyIP();
  formData.value.ipAddress = ip ?? '';
};

const closeDialog = () => {
  genericDialogStore.closeDialog();
};

const onApply = async () => {
  await form.value.validate();

  if (isFormValid.value) {
    const isDuplicate = IPWhitelist.value.some((ip) => ip.ipAddress === formData.value.ipAddress && ip.ipAddress !== originalIpAddress.value);
    if (isDuplicate) {
      genericNotificationStore.notifyError(i18n.global.t('{value} already exists', { value: formData.value.ipAddress }));
      return;
    }

    genericDialogStore.dialogData.action(formData.value);
    closeDialog();
  }
};

onMounted(() => {
  formData.value = { ...selectedIP.value };
  originalIpAddress.value = selectedIP.value.ipAddress || '';
});
</script>
