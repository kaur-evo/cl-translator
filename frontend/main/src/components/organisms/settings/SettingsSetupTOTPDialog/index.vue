<template>
  <dialog-template
    :title="$t('Set Up Two-factor authentication')"
  >
    <template #content>
      <v-form
        ref="form"
        v-model="valid"
        @submit="verify2FASetup"
      >
        <div class="py-0 px-2">
          <div class="d-flex justify-center pa-6 align-end">
            <div class="space-balancer" />
            <qr-code-vue :value="qrCodeString" :size="200" level="H" />
            <img
              src="@/assets/images/happy-notice.svg"
              alt="Mr Evocon"
            >
          </div>
          <div class="pb-4 text-body-medium text-center text-secondary-text">
            {{ $t("Scan the QR code with the authenticator app.") }}
          </div>
          <div>
            <div class="text-body-large font-weight-bold text-center">
              {{ $t("Authenticator code") }}
            </div>
            <div class="d-flex justify-center otp-input-width mx-auto">
              <otp-input
                v-model="MFAToken"
                :digit-count="6"
                :invalid="!valid"
                :label="label"
              />
            </div>
            <div class="py-2" :class="{ 'text-center': !showManualSetup }">
              <evocon-v-button
                v-show="!showManualSetup"
                type="secondary"
                :text="$t('Can\'t scan the QR code?')"
                @click="showManualSetup = true"
              />
              <div v-show="showManualSetup">
                <content-column
                  :content-header="`${$t('Enter this code manually into your authenticator app')}:`"
                  :content-value="MFASecret"
                  :prepend-icon="mdiCellphoneKey"
                />
              </div>
            </div>
          </div>
        </div>
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog"
      />
      <evocon-v-button
        id="save-button"
        color="primary"
        :text="$t('Save')"
        :loading="loading"
        @click="verify2FASetup"
      />
    </template>
  </dialog-template>
</template>
<script>
import {
  getCurrentUser, setUpTOTP, verifyTOTPSetup, updateMFAPreference,
} from 'aws-amplify/auth';
import { mdiCellphoneKey } from '@mdi/js';
import QrCodeVue from 'qrcode.vue';
import { mapActions } from 'pinia';

import useGenericDialogStore from '@/stores/genericDialog';
import useProfileStore from '@/stores/profile';
import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';
import MFAType from '@/constants/multiFactorAuth';
import OtpInput from '@/components/atoms/OTPInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ContentColumn from '@/components/molecules/ContentColumn/index.vue';

const icons = { mdiCellphoneKey };

export default {
  name: 'SettingsSetupTOTPDialog',
  components: {
    QrCodeVue,
    DialogTemplate,
    OtpInput,
    EvoconVButton,
    ContentColumn,
  },
  data() {
    return {
      ...icons,
      loading: false,
      user: null,
      MFASecret: '',
      MFAToken: null,
      valid: true,
      showManualSetup: false,
      error: false,
    };
  },
  computed: {
    qrCodeString() {
      const issuer = import.meta.env.VITE_VUE_APP_BASE_URL;
      const { username } = this.user ?? {};
      const code = this.MFASecret;
      return `otpauth://totp/AWSCognito:${username}?secret=${code}&issuer=${issuer}`;
    },
    label() {
      if (!this.valid) this.$t('Wrong code. Please try again.');
      if (this.error) this.$t('Something went wrong. Please try again.');
      return '';
    },
  },
  watch: {
    MFAToken() {
      this.valid = true;
      this.error = false;
    },
  },
  mounted() {
    this.init2FASetup();
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useProfileStore, ['setMFAPreference']),
    async init2FASetup() {
      this.loading = true;
      try {
        this.user = await getCurrentUser();
        const code = await setUpTOTP();
        this.MFASecret = code.sharedSecret;
      } catch {
        this.error = true;
      }
      this.loading = false;
    },
    async verify2FASetup() {
      this.loading = true;
      try {
        await verifyTOTPSetup({ code: this.MFAToken });
        await updateMFAPreference({ [MFAType.TOTP]: 'PREFERRED' });
        this.setMFAPreference(MFAType.TOTP);
        this.closeDialog();
      } catch {
        this.valid = false;
      }
      this.loading = false;
    },
  },
};

</script>
<style scoped>
.space-balancer {
  width: 81px;
}
.otp-input-width {
  max-width: 330px;
}
</style>
