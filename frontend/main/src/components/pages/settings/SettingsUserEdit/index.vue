<template>
  <removed-entity-view v-if="isRemovedUser" />
  <form-page-template
    v-else
    :primary-segment-title="username && selectedUser ? selectedUser.username : `${$t('New')}: ${$t('User')}`"
    :secondary-segment-subtitle="$t('Please define roles for this user')"
    :secondary-segment-title="$t('Manage roles')"
    :is-loading="isLoading"
  >
    <template #primary-segment>
      <v-form ref="primaryForm" v-model="primaryValid">
        <v-row class="mb-4">
          <v-col
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <evocon-v-input
              v-model.trim="formData.fullName"
              :counter="100"
              variant="filled"
              :hint="$t('Name_Person')"
              :maxlength="100"
              persistent-hint
              :placeholder="$t('Name_Person')"
              required
              :rules="[(v) => isRequired(v, $t('Name_Person'))]"
              validate-on="blur"
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <evocon-v-input
              v-model.trim="formData.username"
              :disabled="!!username"
              :read-only="!!username"
              :counter="100"
              variant="filled"
              :hint="$t('Username should be in name{at}company format', { at: '@' })"
              :maxlength="100"
              :placeholder="$t('Username')"
              required
              :rules="[usernameRule]"
              validate-on="blur"
              persistent-hint
              autocomplete="off"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #secondary-segment>
      <v-form ref="secondaryForm" v-model="secondaryValid">
        <settings-user-rights-section
          ref="user-rights-section"
          v-model:roles="formData.roles"
          v-model:allowed-stations="formData.allowedStations"
          v-model:lineview-time-restriction-value="formData.lineviewTimeRestrictionValue"
          v-model:lineview-time-restriction-type="formData.lineviewTimeRestrictionType"
          class="mt-4"
        />
        <v-row v-if="!!Object.values(formData.roles).length">
          <v-col
            class="px-1 mb-2"
            cols="12"
            :md="isLineviewUser ? 12 : 6"
          >
            <evocon-v-input
              v-model.trim="formData.email"
              :counter="200"
              variant="filled"
              :hint="$t('Email')"
              :maxlength="200"
              persistent-hint
              :placeholder="$t('Email')"
              required
              :rules="[(v) => isRequired(v, $t('Email')), isValidEmail]"
              validate-on="blur"
            />
          </v-col>
          <v-col
            v-if="!isLineviewUser"
            class="px-1 mb-2"
            cols="12"
            md="6"
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
            v-if="isLineviewUser"
            class="px-0 mb-2"
          >
            <v-row class="mb-4">
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
              id="lineview-user-preferences-form"
              :stations-filter="Object.keys(formData.allowedStations).map(el => Number(el))"
              :is-lineview-user="isLineviewUser"
              :form-data="{
                defaultStationId: formData.defaultStationId,
                decimalSeparator: formData.decimalSeparator,
                groupSeparator: formData.groupSeparator,
                dateFormat: formData.dateFormat,
                timeFormat: formData.timeFormat,
                firstDayOfWeek: formData.firstDayOfWeek,
                decimalPlaces: formData.decimalPlaces,
                pctDecimalPlaces: formData.pctDecimalPlaces,
                lineviewLanguages: formData.lineviewLanguages,
              }"
              @update-preference="onPreferenceUpdate"
            />
            <v-row class="mb-4">
              <v-col class="text-center">
                <div class="text-body-large font-weight-bold">
                  {{ $t('Password') }}
                </div>
              </v-col>
            </v-row>
            <v-btn
              v-if="!arePasswordFieldsVisible && !!username"
              color="quaternary-dark"
              class="elevation-0"
              @click="arePasswordFieldsVisible = true"
            >
              {{ $t('Change password') }}
            </v-btn>
            <v-row v-else>
              <v-col
                v-if="username"
                cols="12"
                class="px-1 mb-2"
              >
                <evocon-v-input
                  v-model="formData.currentPassword"
                  :append-inner-icon="currentPasswordVisible ? mdiEyeOff : mdiEye"
                  :type="currentPasswordVisible ? 'text' : 'password'"
                  :placeholder="$t('Current password')"
                  :hint="$t('Current password')"
                  :rules="[(v) => !!v || !formData.password || $t('Current password required')]"
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
                  :hint="$t('New password')"
                  :rules="[(v) => v ? isCognitoPassword(v): isRequired(v, $t('New password'))]"
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
                  :hint="$t('Confirm new password')"
                  :rules="[(v) => v ? passwordMatchRule : isRequired(v, $t('Confirm new password'))]"
                  @click:append-inner="confirmPasswordVisible = !confirmPasswordVisible"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <template v-if="securitySettingsEnabled && highestRoleAllows('securitySettings')">
          <selection-input
            :model-value="[formData.securityProfileId]"
            :items="securityProfilesWithSubtitle"
            :placeholder="$t('Security profile')"
            :hint="$t('Security profile')"
            :prepend-inner-icon="mdiSecurity"
            item-secondary-text="subtitle"
            menu-input-class="my-2 mx-1"
            is-single-select
            hide-search
            @update:model-value="formData.securityProfileId = $event[0] ?? null"
          />
          <evocon-v-button
            color="quaternary-dark"
            :text="$t('Security profiles')"
            :icon="mdiOpenInNew"
            class="ml-1"
            @click="goToSecurityProfiles"
          />
        </template>
      </v-form>
    </template>
    <template #actions>
      <delete-button
        v-if="!!username"
        @click="onDelete"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="onCancel"
      />
      <evocon-v-button
        id="save-btn"
        color="primary"
        :text="$t('Save')"
        :loading="isLoading"
        :disabled="isSaveBtnDisabled"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiEye, mdiEyeOff, mdiSecurity, mdiOpenInNew } from '@mdi/js';
import isEqual from 'lodash/isEqual';

import useUserStore from '@/stores/user';
import useProfileStore from '@/stores/profile';
import useSecurityProfileStore from '@/stores/securityProfile';
import useFeatureStore from '@/stores/feature';
import useConfirmDialogStore from '@/stores/confirmDialog';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import SettingsUserRightsSection from '@/components/organisms/settings/SettingsUserRightsSection/index.vue';
import UserPreferencesForm from '@/components/organisms/settings/UserPreferencesForm/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import {
  isValidEmail, isRequired, isUsername, isCognitoPassword,
} from '@/helpers/validationRules';
import { DAYS } from '@/constants/shiftViewTimeRestrictionTypes';
import { LINEVIEW_USER } from '@/constants/userRoles';
import { defaultLocalizationOptions } from '@/constants/formattingConstants';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';
import { languages } from '@/constants/languages';

const vectorIcons = { mdiEye, mdiEyeOff, mdiSecurity, mdiOpenInNew };
const validationRules = {
  isValidEmail, isRequired, isUsername, isCognitoPassword,
};

export default {
  name: 'SettingsUsersEdit',
  components: {
    FormPageTemplate,
    SettingsUserRightsSection,
    UserPreferencesForm,
    SelectionInput,
    EvoconVButton,
    EvoconVInput,
    DeleteButton,
    RemovedEntityView,
  },
  beforeRouteLeave(to, from, next) {
    if (this.haveUserRightsChanged && !this.leaveWithoutChangesConfirmed) {
      this.promptSavingUserRightsChanges(to.fullPath);
    } else {
      next();
    }
  },
  data() {
    return {
      ...vectorIcons,
      primaryValid: true,
      secondaryValid: true,
      arePasswordFieldsVisible: false,
      passwordVisible: false,
      confirmPasswordVisible: false,
      currentPasswordVisible: false,
      formData: {
        email: '',
        language: '',
        username: '',
        fullName: '',
        defaultStationId: 0,
        roles: {},
        allowedStations: {},
        lineviewTimeRestrictionValue: 0,
        lineviewTimeRestrictionType: DAYS,
        currentPassword: '',
        password: '',
        confirmPassword: '',
        lineviewLanguages: [],
        securityProfileId: null,
        decimalSeparator: defaultLocalizationOptions.decimalSeparator,
        groupSeparator: defaultLocalizationOptions.groupSeparator,
        timeFormat: defaultLocalizationOptions.timeFormat,
        dateFormat: defaultLocalizationOptions.dateFormat,
        firstDayOfWeek: defaultLocalizationOptions.firstDayOfWeek,
        decimalPlaces: defaultLocalizationOptions.decimalPlaces,
        pctDecimalPlaces: defaultLocalizationOptions.decimalPlaces,
      },
      leaveWithoutChangesConfirmed: false,
      languages,
    };
  },
  computed: {
    ...mapState(useUserStore, ['isLoading', 'usersMap']),
    ...mapState(useProfileStore, ['currentUser', 'highestRoleAllows']),
    ...mapState(useSecurityProfileStore, ['securityProfilesWithSubtitle']),
    ...mapState(useFeatureStore, ['securitySettingsEnabled']),
    isSaveBtnDisabled() {
      const disabledBasicRule = !this.formData.fullName || !this.formData.username || !this.formData.email || !Object.keys(this.formData.roles).length;
      const passwordFieldsEmpty = !this.formData.password || !this.formData.confirmPassword;
      const disabledLineviewUserRule = !this.formData.lineviewLanguages.length || (this.arePasswordFieldsVisible && passwordFieldsEmpty);
      if (this.isLineviewUser) return disabledBasicRule || disabledLineviewUserRule;
      return disabledBasicRule || !this.formData.language;
    },
    isLineviewUser() {
      return this.formData.roles && Object.values(this.formData.roles).includes(LINEVIEW_USER);
    },
    username() {
      return this.$route.params.id ? String(this.$route.params.id) : '';
    },
    selectedUser() {
      return this.usersMap[this.username];
    },
    isNewUser() {
      return !this.username;
    },
    haveUserRightsChanged() {
      if (!this.username) return Object.keys(this.formData.roles).length > 0;
      const previousRights = this.usersMap[this.username];
      return !isEqual(previousRights.roles, this.formData.roles)
        || !isEqual(previousRights.allowedStations, this.formData.allowedStations)
        || !isEqual(previousRights.lineviewTimeRestrictionValue, this.formData.lineviewTimeRestrictionValue)
        || !isEqual(previousRights.lineviewTimeRestrictionType, this.formData.lineviewTimeRestrictionType);
    },
    passwordMatchRule() {
      return this.formData.password === this.formData.confirmPassword || this.$t('Please make sure passwords match');
    },
    usernameRule() {
      if (!this.isNewUser) return true; // username cannot be changed
      if (!this.formData.username) return this.$t('Please enter {fieldName}', { fieldName: this.$t('Username').toLowerCase() });
      if (this.formData.username.includes('@evocon') && this.formData.email && (!this.formData.email.includes('@evocon.com') || !this.currentUser.email.includes('@evocon.com'))) {
        return this.$t('Your email does not contain {at}evocon, use another format', { at: '@' });
      }
      return isUsername(this.formData.username);
    },
    isRemovedUser() {
      const userExists = this.selectedUser && !this.selectedUser.deleted;
      return !this.isLoading && !this.isNewUser && !userExists;
    },
  },
  watch: {
    usersMap() {
      this.setFormData();
    },
    username() {
      this.setFormData();
    },
    isLineviewUser(val, prev) {
      if (val && !prev && !this.formData.email && this.isNewUser) {
        this.formData.email = this.currentUser.email;
      }
    },
  },
  mounted() {
    this.setFormData();
  },
  methods: {
    ...validationRules,
    ...mapActions(useUserStore, ['saveUser', 'deleteUser']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    setFormData() {
      if (this.username) {
        if (this.usersMap[this.username]) {
          this.formData = { ...this.usersMap[this.username] };
        }
      }
    },
    goBackToOverview() {
      this.$router.push({
        name: 'userOverview',
        query: this.$route.query ? { ...this.$route.query } : {},
      });
    },
    async validate() {
      await this.$refs.primaryForm?.validate();
      await this.$refs.secondaryForm?.validate();
    },
    async onSave(navigateToOverview = true) {
      await this.validate();
      if (!this.primaryValid || !this.secondaryValid) return;
      const userData = {
        ...this.formData,
        newUser: this.isNewUser,
      };
      if (this.username) {
        userData.username = this.username;
      }
      const newUser = await this.saveUser(userData);
      if (newUser && newUser.username) {
        this.leaveWithoutChangesConfirmed = true;
        if (navigateToOverview) {
          this.goBackToOverview();
        }
      }
    },
    onCancel() {
      this.goBackToOverview();
    },
    onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.selectedUser.username }),
        action: () => {
          this.deleteUser(this.selectedUser);
          this.goBackToOverview();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    promptSavingUserRightsChanges(navigateToPath) {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('You are about to exit without saving changes. Do you want to save changes?'),
        action: async () => {
          await this.onSave(false);
          this.$router.push({ path: navigateToPath });
        },
        closeAction: () => {
          this.leaveWithoutChangesConfirmed = true;
          this.$router.push({ path: navigateToPath });
        },
        confirmText: this.$t('Save'),
        cancelText: this.$t('Don\'t save'),
        width: '500px',
        color: 'primary',
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    onPreferenceUpdate({ key, value }) {
      this.formData[key] = value;
    },
    goToSecurityProfiles() {
      const route = this.$router.resolve({ name: 'securityProfilesOverview' });
      window.open(route.href, '_blank');
    },
  },
};
</script>
