<template>
  <removed-entity-view v-if="isRemovedOperator" />
  <form-page-template
    v-else
    :primary-segment-title="cardTitle"
    :secondary-segment-title="$t('Checklists authentication')"
    :secondary-segment-icon="mdiInformationOutline"
    :is-loading="isLoading"
    @secondary-icon-click="openChecklistAuthHelp"
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
              v-model.trim="formData.firstname"
              variant="filled"
              :rules="[(v) => !!v && !!v.trim() || $t('First name')]"
              required
              validate-on="blur"
              maxlength="200"
              counter="200"
              autofocus
              :placeholder="$t('First name')"
              :hint="$t('First name')"
              persistent-hint
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model.trim="formData.lastname"
              :placeholder="$t('Last name')"
              :hint="$t('Last name')"
              persistent-hint
              variant="filled"
              :rules="[(v) => !!v && !!v.trim() || $t('Last name')]"
              required
              validate-on="blur"
              maxlength="100"
              counter="100"
            />
          </v-col>
          <v-col class="px-1 mb-2">
            <selection-input
              v-model="formData.stationIds"
              :items="stationsWithAdminPermissions"
              :items-map="stationsMap"
              :groups="stationGroups"
              :placeholder="$t('Stations')"
              :hint="$t('Stations')"
              is-grouped-select
              required
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template v-if="checklistsEnabled" #secondary-segment>
      <list-card
        v-if="operatorId"
        :icon="mdiKey"
        class="mx-1"
        :title="formData.passcodeCreatedAt ? $t('Passcode') : $t('No passcode created')"
        :subtitle-key-value-pairs="formData.passcodeCreatedAt ? [{ key: $t('Created'), value: formatDate(formData.passcodeCreatedAt, 'long') }] : ''"
        :primary-action-text="cardPrimaryActionText"
        :card-buttons="formData.passcodeCreatedAt ? passcodeCardButtons : []"
        @primary-action="onGeneratePasscode"
      />
      <info-block
        v-else
        class="mx-1"
        :body="$t('Please save the operator details first, then return to generate a passcode.')"
        :icon="mdiAlertCircleOutline"
      />
    </template>
    <template #actions>
      <delete-button
        v-if="formData.id"
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
        color="primary"
        :loading="isLoading"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { defineAsyncComponent } from 'vue';
import {
  mdiKey, mdiDelete, mdiInformationOutline, mdiAlertCircleOutline, mdiRefresh,
} from '@mdi/js';

import useOperatorStore from '@/stores/operator';
import useStationStore from '@/stores/station';
import useFeatureStore from '@/stores/feature';
import useDeviceStore from '@/stores/device';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericDialogStore from '@/stores/genericDialog';
import { formatDate } from '@/helpers/date/formatDate';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import ListCard from '@/components/molecules/ListCard/index.vue';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';

const icons = { mdiKey, mdiInformationOutline, mdiAlertCircleOutline };

export default {
  name: 'SettingsOperatorsEdit',
  components: {
    FormPageTemplate,
    SelectionInput,
    EvoconVButton,
    DeleteButton,
    ListCard,
    InfoBlock,
    EvoconVInput,
    RemovedEntityView,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const groupId = Number(from.query.groupId);
      if (!Number.isNaN(groupId) && !to.params.id) {
        // default to group we entered from
        // eslint-disable-next-line no-param-reassign
        vm.formData.stationIds = [groupId];
      }
    });
  },
  data() {
    return {
      ...icons,
      valid: true,
      formData: {
        firstname: '',
        lastname: '',
        stationIds: [],
        id: undefined,
        passcodeCreatedAt: null,
      },
    };
  },
  computed: {
    ...mapState(useOperatorStore, ['isLoading', 'operatorsMap']),
    ...mapState(useStationStore, ['stationGroups', 'stationsWithAdminPermissions', 'stationsMap']),
    ...mapState(useFeatureStore, ['checklistsEnabled']),
    ...mapState(useDeviceStore, ['isMobileView']),
    operatorId() {
      return Number(this.$route.params.id);
    },
    operator() {
      return this.operatorsMap[this.operatorId];
    },
    cardTitle() {
      return this.operator
        ? `${this.operator.firstname} ${this.operator.lastname}`
        : `${this.$t('New')}: ${this.$t('operator')}`;
    },
    cardPrimaryActionText() {
      if (this.formData.passcodeCreatedAt && this.isMobileView) return '';
      if (this.formData.passcodeCreatedAt) return this.$t('Regenerate');
      return this.$t('Generate');
    },
    passcodeCardButtons() {
      const actions = [
        {
          icon: mdiDelete,
          text: this.$t('Delete'),
          tooltip: this.$t('Delete'),
          action: this.onDeletePasscode,
        },
      ];
      if (this.isMobileView) {
        actions.unshift({
          icon: mdiRefresh,
          text: this.$t('Regenerate'),
          action: this.onGeneratePasscode,
        });
      }
      return actions;
    },
    isRemovedOperator() {
      const operatorExists = this.operator && !this.operator.deleted;
      return !this.isLoading && !Number.isNaN(this.operatorId) && !operatorExists;
    },
  },
  watch: {
    operatorsMap() {
      this.setFormData();
    },
    operatorId() {
      this.setFormData();
    },
  },
  async mounted() {
    this.setFormData();
  },
  methods: {
    ...mapActions(useOperatorStore, ['saveOperator', 'deleteOperator', 'generatePasscode', 'deletePasscode']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    formatDate,
    setFormData() {
      if (this.operator) {
        this.formData = {
          firstname: this.operator.firstname,
          lastname: this.operator.lastname,
          id: this.operator.id,
          stationIds: this.operator.stationIds,
          passcodeCreatedAt: this.operator.passcodeCreatedAt,
        };
      }
    },
    async validate() {
      await this.$refs.form.validate();
    },
    async onSave() {
      await this.validate();
      if (!this.valid) return;
      const operator = await this.saveOperator({ ...this.formData, name: `${this.formData.firstname} ${this.formData.lastname}` });
      if (operator.id) this.goBackToOverview();
    },
    onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: `${this.formData.firstname} ${this.formData.lastname}` }),
        action: () => {
          this.deleteOperator(this.formData);
          this.goBackToOverview();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    goBackToOverview() {
      this.$router.push({
        name: 'operatorOverview',
        query: this.$route.query ? { ...this.$route.query } : {},
      });
    },
    openChecklistAuthHelp() {
      window.open('https://support.evocon.com/Checklist-Authentication-e3874ac4def74a2b866d8702fb7c803a', '_blank');
    },
    onDeletePasscode() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this passcode?'),
        action: async () => {
          await this.deletePasscode(this.operatorId);
          this.setFormData();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    async onGeneratePasscode() {
      if (this.formData.passcodeCreatedAt) {
        const dialogConfig = {
          title: this.$t('Confirmation'),
          text: this.$t('Are you sure you want to proceed? Regenerating the passcode will replace the existing one.'),
          action: () => this.generatePassword(true),
          confirmText: this.$t('Regenerate'),
          cancelText: this.$t('Cancel'),
          color: 'primary',
        };
        this.openConfirmDialog(dialogConfig);
      } else {
        this.generatePassword(false);
      }
    },
    async generatePassword(isRegenerate) {
      const passcode = await this.generatePasscode({
        operatorId: this.formData.id,
        isRegenerate,
        callback: this.openPasscodeGenerationDialog,
      });
      this.formData.passcodeCreatedAt = passcode?.passcodeCreatedAt;
    },
    openPasscodeGenerationDialog(passcode) {
      this.openDialog({
        persistent: true,
        data: { passcode },
        component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsPasscodeGenerationDialog/index.vue')),
      });
    },
  },
};
</script>
