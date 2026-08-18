<template>
  <form-dialog-template
    :primary-segment-title="isEdit ? selectedProfile.name : `${$t('New')}: ${$t('Security profile')}`"
    :primary-segment-subtitle="$t('Settings that apply to all users attached to this security profile')"
  >
    <template #primary-segment>
      <v-form ref="form" v-model="isFormValid" class="px-1">
        <evocon-v-input
          v-model.trim="formData.name"
          :placeholder="$t('Name')"
          :hint="$t('Name')"
          :rules="[(v) => !!v && !!v.trim() || $t('Name')]"
          counter="100"
          max-length="100"
          validate-on-blur
          required
        />
        <multi-line-switch
          v-model="formData.singleSignOnRequired"
          :main-text="$t('Require single sign-on (SSO)')"
          :help-text="$t('Users can only use single sign-on to log in.')"
          class="mt-1"
          @update:model-value="onSSOToggle"
        />
        <evocon-v-tooltip-wrap
          :disabled="!formData.singleSignOnRequired"
          :text="$t('2FA is handled by your SSO provider')"
          location="top center"
          offset="-6"
        >
          <template #activator="{ props }">
            <span v-bind="props" class="d-inline-block">
              <multi-line-switch
                v-model="formData.twoFactorAuthenticationRequired"
                :main-text="$t('Require enabling two-factor authentication (2FA)')"
                :help-text="$t('Users will be prompted to enable Evocon 2FA when applicable.')"
                :disabled="formData.singleSignOnRequired"
                class="my-1"
              >
                <template #label-additions>
                  <icon-with-tooltip
                    :icon="mdiInformationOutline"
                    :tooltip-text="$t('Users will see a reminder across the app until they enable 2FA from their profile settings.')"
                    additional-classes="ml-2"
                  />
                </template>
              </multi-line-switch>
            </span>
          </template>
        </evocon-v-tooltip-wrap>
        <div class="d-flex align-center mb-2">
          <multi-line-switch
            :model-value="isAbsoluteTimeoutEnabled"
            :main-text="$t('User will be logged out after')"
            @update:model-value="onAbsoluteTimeoutToggle"
          />
          <evocon-number-input
            v-model="absoluteTimeoutDays"
            :suffix="absoluteTimeoutDays === 1 ? $t('Day').toLowerCase() : $t('daysGenitive')"
            :error="hasAbsoluteTimeoutError"
            :disabled="!isAbsoluteTimeoutEnabled"
            use-chip
            grow
            class="ml-2"
          />
        </div>
        <span
          v-if="hasAbsoluteTimeoutError"
          class="text-body-small text-error"
        >
          {{ $t('Value must be between {min} and {max}', { min: ABSOLUTE_TIMEOUT_MIN_DAYS, max: ABSOLUTE_TIMEOUT_MAX_DAYS }) }}
        </span>
      </v-form>
    </template>
    <template #actions>
      <delete-button v-if="isEdit" @click="onDelete" />
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Save')"
        :loading="isLoading"
        @click="onSave"
      />
    </template>
  </form-dialog-template>
</template>
<script setup name="SettingsSecurityProfileEditDialog">
import { ref, computed, onMounted } from 'vue';
import { mdiInformationOutline } from '@mdi/js';

import useGenericDialogStore from '@/stores/genericDialog';
import useSecurityProfileStore from '@/stores/securityProfile';
import useConfirmDialogStore from '@/stores/confirmDialog';
import i18n from '@/services/i18n';
import { convertDaysToMinutes, convertMinutesToDays } from '@/helpers/time/convertMinutesAndDays';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';

const genericDialogStore = useGenericDialogStore();
const securityProfileStore = useSecurityProfileStore();
const confirmDialogStore = useConfirmDialogStore();

const ABSOLUTE_TIMEOUT_MIN_DAYS = 1;
const ABSOLUTE_TIMEOUT_MAX_DAYS = 365;

const form = ref(null);
const isFormValid = ref(true);
const isAbsoluteTimeoutEnabled = ref(false);
const absoluteTimeoutDays = ref(null);
const formData = ref({
  name: '',
  singleSignOnRequired: false,
  twoFactorAuthenticationRequired: false,
  absoluteTimeoutMinutes: 0,
});

const selectedProfile = computed(() => genericDialogStore.dialogData?.item || {});
const isLoading = computed(() => securityProfileStore.isLoading);

const isEdit = computed(() => !!selectedProfile.value.id);
const hasAbsoluteTimeoutError = computed(() => {
  if (!isAbsoluteTimeoutEnabled.value) return false;
  return absoluteTimeoutDays.value !== null && (absoluteTimeoutDays.value < ABSOLUTE_TIMEOUT_MIN_DAYS || absoluteTimeoutDays.value > ABSOLUTE_TIMEOUT_MAX_DAYS);
});

const onSSOToggle = (isSSOEnabled) => {
  if (isSSOEnabled) {
    formData.value.twoFactorAuthenticationRequired = false;
  }
};

const onAbsoluteTimeoutToggle = (value) => {
  isAbsoluteTimeoutEnabled.value = value;
  if (!value) {
    absoluteTimeoutDays.value = null;
  }
};

onMounted(() => {
  if (isEdit.value) {
    formData.value = { ...selectedProfile.value };
    isAbsoluteTimeoutEnabled.value = formData.value.absoluteTimeoutMinutes !== 0;
    if (isAbsoluteTimeoutEnabled.value) absoluteTimeoutDays.value = convertMinutesToDays(formData.value.absoluteTimeoutMinutes);
  }
});

const closeDialog = () => {
  genericDialogStore.closeDialog();
};

const onSave = async () => {
  await form.value.validate();
  const isAbsoluteTimeoutInvalid = isAbsoluteTimeoutEnabled.value && absoluteTimeoutDays.value === null;
  if (isAbsoluteTimeoutInvalid) absoluteTimeoutDays.value = 0;
  if (!isFormValid.value || hasAbsoluteTimeoutError.value) return;
  const payload = { ...formData.value, absoluteTimeoutMinutes: convertDaysToMinutes(absoluteTimeoutDays.value) };
  await securityProfileStore.saveSecurityProfile(payload);
  closeDialog();
};

const onDelete = async () => {
  const confirmDialogConfig = {
    title: i18n.global.t('Confirmation'),
    text: i18n.global.t('Are you sure you want to delete {value}?', { value: formData.value.name }),
    action: async () => {
      await deleteProfile();
      closeDialog();
    },
    confirmText: i18n.global.t('Delete'),
    cancelText: i18n.global.t('Cancel'),
  };
  confirmDialogStore.openConfirmDialog(confirmDialogConfig);
};

const deleteProfile = async () => {
  await securityProfileStore.deleteSecurityProfile(formData.value);
};
</script>
