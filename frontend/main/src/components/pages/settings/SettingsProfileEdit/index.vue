<template>
  <form-page-template
    :primary-segment-title="$t('Edit profile')"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSave"
      >
        <profile-picture
          :img="formData.avatar"
          editable
          :class-names="'mb-4 mx-auto'"
          @on-click="openProfilePictureDialog"
        />
        <v-row>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model.trim="formData.fullName"
              :placeholder="$t('Name_Person')"
              variant="filled"
              :rules="[(v) => !!v && !!v.trim() || $t('Name_Person')]"
              required
              validate-on="blur"
              :counter="100"
              :maxlength="100"
              autofocus
              :hint="$t('Name_Person')"
              persistent-hint
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model.trim="formData.email"
              :placeholder="$t('Email')"
              variant="filled"
              :counter="100"
              :maxlength="100"
              :hint="$t('Email')"
              persistent-hint
              :rules="[(v) => isValidEmail(v)]"
              validate-on="blur"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model.trim="formData.username"
              variant="filled"
              :hint="$t('Username')"
              persistent-hint
              disabled
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <selection-input
              :model-value="[formData.language]"
              :items="languages"
              :placeholder="$t('Language')"
              :hint="$t('Language')"
              item-value="languageId"
              item-flag="languageId"
              :checkbox="false"
              is-single-select
              hide-search
              required
              @update:model-value="formData.language = $event[0]"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              :model-value="currentUserRoles"
              variant="filled"
              disabled
              :hint="$t('Role')"
              persistent-hint
            />
          </v-col>
        </v-row>
        <v-row class="py-6">
          <v-col class="text-center">
            <div class="text-body-large font-weight-bold">
              {{ $t('Preferences') }}
            </div>
            <div class="text-body-medium text-secondary-text">
              {{ $t('Choose display preferences in Evocon') }}
            </div>
          </v-col>
        </v-row>
        <user-preferences-form
          :has-start-page-option="true"
          :form-data="formData"
          @update-preference="onUpdatePreference"
        />
        <div class="d-flex justify-center my-4">
          <span class="text-body-large font-weight-bold">
            {{ $t('Security') }}
          </span>
        </div>

        <v-row v-if="arePasswordFieldsVisible">
          <v-col
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model="formData.currentPassword"
              :append-inner-icon="currentPasswordVisible ? mdiEyeOff : mdiEye"
              :type="currentPasswordVisible ? 'text' : 'password'"
              :placeholder="$t('Current password')"
              :hint="$t('Current password')"
              :rules="[(v) => !!v || !formData.password || $t('Password required')]"
              @click:append-inner="currentPasswordVisible = !currentPasswordVisible"
            />
          </v-col>
          <v-col
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model="formData.password"
              :append-inner-icon="passwordVisible ? mdiEyeOff : mdiEye"
              :type="passwordVisible ? 'text' : 'password'"
              :placeholder="$t('New password')"
              :rules="[(v) => isCognitoPassword(v) || $t('New password')]"
              :hint="$t('New password')"
              @click:append-inner="passwordVisible = !passwordVisible"
            />
          </v-col>
          <v-col
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model="formData.confirmPassword"
              :append-inner-icon="confirmPasswordVisible ? mdiEyeOff : mdiEye"
              :type="confirmPasswordVisible ? 'text' : 'password'"
              :placeholder="$t('Confirm new password')"
              :rules="[confirmPasswordRule]"
              :hint="$t('Confirm new password')"
              @click:append-inner="confirmPasswordVisible = !confirmPasswordVisible"
            />
          </v-col>
        </v-row>

        <div v-else class="d-flex justify-space-between align-center my-4">
          <input-label
            :label="$t('Password')"
            :sub-label="`${$t('For security purposes, make sure you choose a strong password')}.`"
            :dark="false"
            class="ml-1"
          />
          <evocon-v-button
            v-if="!arePasswordFieldsVisible"
            :text=" $t('Change password')"
            class="mx-1"
            color="quaternary-dark"
            @click="arePasswordFieldsVisible = true"
          />
        </div>

        <div class="my-4">
          <div class="d-flex justify-space-between align-center">
            <input-label
              :label="$t('Two-factor authentication')"
              :sub-label="$t('Add an additional layer of security to your account.')"
              :dark="false"
              class="ml-1"
            />
            <template v-if="MFAPreference !== null">
              <evocon-v-button
                v-if="MFAEnabled && currentUser.twoFactorAuthenticationRequired"
                :text="$t('Reset')"
                class="mx-1"
                color="quaternary-dark"
                :loading="isMFALoading"
                :disabled="isMFALoading"
                @click="open2FASetupDialog"
              />
              <span v-else>
                <multi-line-switch
                  :key="isDialogOpened"
                  :model-value="MFAEnabled"
                  :loading="isMFALoading"
                  :disabled="isMFALoading"
                  @update:model-value="onToggleMFA"
                />
              </span>
            </template>
          </div>
          <info-block
            v-if="MFAPreference === null"
            :body="$t('To change two-factor authentication settings, please re-login.')"
            :icon="mdiInformationOutline"
            class="mt-2 ml-1"
          />
        </div>
        <selection-input
          v-if="securitySettingsEnabled && highestRoleAllows('securitySettings')"
          :model-value="[formData.securityProfileId]"
          :items="securityProfilesWithSubtitle"
          :placeholder="$t('Security profile')"
          :hint="$t('Security profile')"
          :prepend-inner-icon="mdiSecurity"
          item-secondary-text="subtitle"
          is-single-select
          hide-search
          @update:model-value="formData.securityProfileId = $event[0]"
        />
      </v-form>
      <div v-if="providerLinks.length" class="pb-6 mx-1">
        <div class="d-flex justify-center my-4">
          <span class="text-body-large font-weight-bold">
            {{ $t("Single sign-on providers") }}
          </span>
        </div>
        <v-row>
          <v-col
            v-for="(link, idx) in providerLinks"
            :key="idx"
            cols="12"
            md="6"
            class="d-flex justify-space-between px-2"
          >
            <div class="d-flex flex-column">
              <span class="text-body-small text-secondary-text">
                {{ $t("Service provider") }}
              </span>
              <span class="text-body-large">
                {{ link.providerName }}
              </span>
            </div>
            <div class="d-flex flex-column align-end">
              <span class="text-body-small text-secondary-text">
                {{ $t("Identificator") }}
              </span>
              <span class="text-body-large">
                {{ link.userId }}
              </span>
            </div>
          </v-col>
        </v-row>
      </div>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="onCancel"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Save')"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiPlus, mdiBell, mdiPencil, mdiDelete, mdiEyeOff, mdiEye, mdiSecurity, mdiInformationOutline,
} from '@mdi/js';
import { isNumber } from 'lodash';
import { updateMFAPreference } from 'aws-amplify/auth';
import { defineAsyncComponent } from 'vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useSecurityProfileStore from '@/stores/securityProfile';
import useProfileStore from '@/stores/profile';
import useFeatureStore from '@/stores/feature';
import useGenericNotificationStore from '@/stores/genericNotification';
import ProfilePicture from '@/components/atoms/ProfilePicture/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import { isValidEmail, isCognitoPassword } from '@/helpers/validationRules';
import UserPreferencesForm from '@/components/organisms/settings/UserPreferencesForm/index.vue';
import { defaultLocalizationOptions } from '@/constants/formattingConstants';
import { getRoleTranslation } from '@/constants/userRoles';
import MFAType from '@/constants/multiFactorAuth';
import InputLabel from '@/components/atoms/InputLabel/index.vue';
import authConfigApi from '@/api/authConfiguration';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import { languages } from '@/constants/languages';

const validationRules = { isValidEmail, isCognitoPassword };

const vectorIcons = {
  mdiPlus, mdiBell, mdiPencil, mdiDelete, mdiEyeOff, mdiEye, mdiSecurity, mdiInformationOutline,
};

export default {
  name: 'SettingsProfileEdit',
  components: {
    FormPageTemplate,
    ProfilePicture,
    UserPreferencesForm,
    InputLabel,
    EvoconVButton,
    SelectionInput,
    MultiLineSwitch,
    EvoconVInput,
    InfoBlock,
  },
  data() {
    return {
      ...vectorIcons,
      valid: true,
      formData: {
        fullName: '',
        email: '',
        username: '',
        language: '',
        defaultStationId: 0,
        currentPassword: '',
        password: '',
        confirmPassword: '',
        avatar: '',
        startPage: '',
        securityProfileId: null,
        decimalPlaces: defaultLocalizationOptions.decimalPlaces,
        pctDecimalPlaces: defaultLocalizationOptions.decimalPlaces,
        groupSeparator: defaultLocalizationOptions.groupSeparator,
        decimalSeparator: defaultLocalizationOptions.decimalSeparator,
        dateFormat: defaultLocalizationOptions.dateFormat,
        firstDayOfWeek: defaultLocalizationOptions.firstDayOfWeek,
        timeFormat: defaultLocalizationOptions.timeFormat,
      },
      arePasswordFieldsVisible: false,
      currentPasswordVisible: false,
      passwordVisible: false,
      confirmPasswordVisible: false,
      isMFALoading: false,
      providerLinks: [],
      languages,
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['isDialogOpened']),
    ...mapState(useSecurityProfileStore, ['securityProfilesWithSubtitle']),
    ...mapState(useProfileStore, ['currentUser', 'highestRoleAllows', 'MFAPreference']),
    ...mapState(useFeatureStore, ['securitySettingsEnabled']),
    currentUserRoles() {
      const rolesArrayWithoutDuplicates = [...new Set(Object.values(this.currentUser.roles))];
      return rolesArrayWithoutDuplicates.map((role) => getRoleTranslation(role));
    },
    MFAEnabled() {
      return !!this.MFAPreference && this.MFAPreference !== MFAType.NOMFA;
    },
    confirmPasswordRule() {
      if (!!this.formData.password && !this.formData.confirmPassword) return this.$t('Password required');
      if (this.formData.password !== this.formData.confirmPassword) return this.$t('Please make sure passwords match');
      return true;
    },
  },
  async mounted() {
    this.formData = {
      fullName: this.currentUser.fullName,
      email: this.currentUser.email,
      username: this.currentUser.username,
      language: this.currentUser.language,
      defaultStationId: this.currentUser.defaultStationId,
      avatar: this.currentUser.avatar,
      startPage: this.currentUser.startPage,
      securityProfileId: this.currentUser.securityProfileId,
      decimalPlaces: isNumber(this.currentUser.decimalPlaces) ? this.currentUser.decimalPlaces : defaultLocalizationOptions.decimalPlaces,
      pctDecimalPlaces: isNumber(this.currentUser.pctDecimalPlaces) ? this.currentUser.pctDecimalPlaces : defaultLocalizationOptions.decimalPlaces,
      groupSeparator: this.currentUser.groupSeparator || defaultLocalizationOptions.groupSeparator,
      decimalSeparator: this.currentUser.decimalSeparator || defaultLocalizationOptions.decimalSeparator,
      dateFormat: this.currentUser.dateFormat || defaultLocalizationOptions.dateFormat,
      firstDayOfWeek: this.currentUser.firstDayOfWeek || defaultLocalizationOptions.firstDayOfWeek,
      timeFormat: this.currentUser.timeFormat || defaultLocalizationOptions.timeFormat,
    };
    if (this.highestRoleAllows('securitySettings')) await this.fetchSecurityProfiles();
    this.loadProviderLinks();

    if (this.$route.query.openMFADialog) {
      await this.$router.replace({ query: {} });
      this.open2FASetupDialog();
    }
  },
  methods: {
    ...validationRules,
    ...mapActions(useProfileStore, ['saveCurrentUser', 'setMFAPreference']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    ...mapActions(useSecurityProfileStore, ['fetchSecurityProfiles']),
    async onSave() {
      await this.$refs.form.validate();
      if (!this.valid) return;
      const user = await this.saveCurrentUser(this.formData);
      this.$vuetify.locale.current = user.language === 'zh' ? 'zhHans' : user.language;
      if (user && user.username) {
        this.goBack();
      }
    },
    onCancel() {
      this.goBack();
    },
    goBack() {
      if (this.highestRoleAllows('settings')) {
        this.$router.push({ name: 'settings' });
      } else {
        this.$router.go(-1);
      }
    },
    openProfilePictureDialog() {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../../../organisms/settings/ProfilePictureDialog/index.vue')),
        width: 716,
        data: {
          currentSelected: this.formData.avatar,
          action: (item) => {
            this.formData.avatar = item;
          },
        },
      };
      this.openDialog(dialogConfig);
    },
    onUpdatePreference({ key, value }) {
      this.formData[key] = value;
    },
    async open2FASetupDialog() {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../../../organisms/settings/SettingsSetupTOTPDialog/index.vue')),
        persistent: true,
      };
      this.openDialog(dialogConfig);
    },
    async loadProviderLinks() {
      try {
        this.providerLinks = await authConfigApi.getProviderLinks();
      } catch (err) {
        this.notifyError(err.message);
      }
    },
    async disableMFA() {
      this.isMFALoading = true;
      try {
        await updateMFAPreference({ [MFAType.NOMFA]: 'PREFERRED', [MFAType.TOTP]: 'DISABLED' });
        this.setMFAPreference(MFAType.NOMFA);
      } catch (err) {
        this.notifyError(err.message);
      }
      this.isMFALoading = false;
    },
    onToggleMFA() {
      if (this.isMFALoading) return;
      if (this.MFAEnabled) {
        this.disableMFA();
      } else {
        this.open2FASetupDialog();
      }
    },
  },
};
</script>
