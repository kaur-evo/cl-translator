<template>
  <form-dialog-template :primary-segment-title="dialogTitle">
    <template #primary-segment>
      <v-form ref="form" v-model="isValid" class="px-1">
        <selection-input
          :model-value="[formData.type]"
          :items="dialogData.availableTypes"
          :hint="$t('Type')"
          :placeholder="$t('Type')"
          :disabled="dialogData.availableTypes.length < 2"
          is-single-select
          hide-search
          required
          menu-input-class="mb-2 mx-1"
          @update:model-value="onSelectType($event)"
        />
        <template v-if="formData.type === channelTypes.EMAIL">
          <v-row class="px-1">
            <v-col cols="12" class="mb-2">
              <evocon-email-input
                ref="emailInput"
                v-model="formData.targets"
                class="my-2"
                required
                validate-on-blur
              />
            </v-col>
            <v-col cols="12" class="mb-2">
              <evocon-text-editor
                id="subject"
                ref="subject"
                v-model="formData.subject"
                :placeholder="$t('Subject')"
                :hint="$t('Subject')"
                :allowed-variables="mappedVariables"
                :rules="[subjectRule]"
                has-highlight
              >
                <template #append>
                  <alert-variables-menu
                    :variables="variables"
                    :btn-tooltip-text="$t('Insert variable')"
                    @variable-selected="onVariableSelected('subject', $event)"
                  />
                </template>
              </evocon-text-editor>
            </v-col>
          </v-row>
        </template>
        <evocon-v-input
          v-if="formData.type === channelTypes.WEBHOOK"
          v-model="formData.url"
          :hint="$t('URL')"
          :placeholder="$t('URL')"
          class="my-2 mx-1"
          :rules="[urlRule]"
        />
        <evocon-text-editor
          v-if="formData.type"
          ref="message"
          v-model="formData.message"
          :placeholder="$t('Message')"
          :hint="$t('Message')"
          :allowed-variables="mappedVariables"
          :height="editorHeight"
          :allow-new-line="formData.type === channelTypes.EMAIL"
          :rules="[messageRule]"
          :has-text-styling="formData.type === channelTypes.EMAIL"
          has-highlight
          wrapper-class="mx-1"
        >
          <template #prepend>
            <div class="text-editor-prepend">
              <em class="text-body-large prepend-hint-text">{{ $t('Add content to the alert by using the “{value}” button.', { value: '{}' }) }}</em>
              <alert-variables-menu
                :variables="variables"
                :btn-tooltip-text="$t('Insert variable')"
                @variable-selected="onVariableSelected('message', $event)"
              />
            </div>
          </template>
        </evocon-text-editor>
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        type="secondary"
        :text="$t('Cancel')"
        @click="onCancel()"
      />
      <evocon-v-button
        id="save-button"
        type="primary-light"
        :text="$t('Apply')"
        @click="onSave()"
      />
    </template>
  </form-dialog-template>
</template>

<script>
import { cloneDeep } from 'lodash';
import { mapState, mapActions } from 'pinia';

import useGenericDialogStore from '@/stores/genericDialog';
import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconEmailInput from '@/components/molecules/EvoconEmailInput/index.vue';
import EvoconTextEditor from '@/components/atoms/EvoconTextEditor/index.vue';
import AlertVariablesMenu from '@/components/organisms/settings/AlertVariablesMenu/index.vue';
import { channelTypes, getAlertVariables, getEmailTemplate } from '@/constants/alerts';

export default {
  name: 'SettingsAddAlertChannelDialog',
  components: {
    FormDialogTemplate,
    SelectionInput,
    EvoconVButton,
    EvoconEmailInput,
    EvoconTextEditor,
    AlertVariablesMenu,
    EvoconVInput,
  },
  data() {
    return {
      isValid: true,
      channelTypes,
      formData: {
        type: '',
        targets: [],
        subject: '',
        message: '',
        url: '',
      },
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useProfileStore, ['currentUser']),
    ...mapState(useDeviceStore, ['isMobileView', 'screenHeight']),
    dialogTitle() {
      if (this.formData.type) return this.$t('Channel');
      return `${this.$t('New')}: ${this.$t('Channel')}`;
    },
    variables() {
      return getAlertVariables(this.alertType, this.alertSubtype);
    },
    mappedVariables() {
      return this.variables.map((el) => el.variableName);
    },
    subjectRule() {
      return this.formData.subject.length > 0 || this.$t('Subject');
    },
    messageRule() {
      return this.formData.message.length > 0 || this.$t('Message');
    },
    urlRule() {
      return this.formData.url.length > 0 || this.$t('URL');
    },
    alertType() {
      return this.dialogData.alertType;
    },
    alertSubtype() {
      return this.dialogData.alertSubtype;
    },
    emailTemplate() {
      return getEmailTemplate(this.alertType, this.alertSubtype);
    },
    isDialogValid() {
      if (this.formData.type === channelTypes.EMAIL) {
        return this.isValid && this.$refs.emailInput?.isValid;
      }
      return this.isValid;
    },
    editorHeight() {
      const defaultHeight = 320;
      if (this.isMobileView) {
        const toolbarHeight = 64;
        const footerHeight = 60;
        const inputHeight = 62;
        const inputs = this.formData.type === channelTypes.EMAIL ? 3 : 2;
        const paddings = 150;
        return this.screenHeight - toolbarHeight - footerHeight - (inputHeight * inputs) - paddings;
      }
      return defaultHeight;
    },
  },
  mounted() {
    if (this.dialogData.channel) {
      this.formData = cloneDeep(this.dialogData.channel);
    } else {
      this.onSelectType([this.dialogData.availableTypes[0].id]);
      if (this.formData.type === channelTypes.EMAIL) {
        this.formData.targets = [this.currentUser.email];
      }
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    async onVariableSelected(field, variable) {
      const { editor } = this.$refs[field];
      editor.chain().focus().insertContent(variable, {
        parseOptions: {
          preserveWhitespace: 'full',
        },
      }).run();
      editor.commands.focus(editor.getText().indexOf(variable) + variable.length + 1);
    },
    onSelectType(type) {
      [this.formData.type] = type;
      // set defaults
      if (this.formData.type === channelTypes.EMAIL) {
        this.formData.targets = [];
        this.formData.subject = this.emailTemplate.subject;
        this.formData.message = this.emailTemplate.message;
      } else if (this.formData.type === channelTypes.WEBHOOK) {
        this.formData.url = '';
        this.formData.message = '';
      }
    },
    onCancel() {
      this.dialogData.cancel();
      this.closeDialog();
    },
    async validate() {
      await this.$refs.form.validate();
    },
    async onSave() {
      // remove unnecessary properties
      if (this.formData.type === channelTypes.EMAIL) {
        delete this.formData.url;
        this.formData.targets = this.formData.targets.filter((email) => email.length > 0);
      } else if (this.formData.type === channelTypes.WEBHOOK) {
        delete this.formData.targets;
        delete this.formData.subject;
      }
      await this.validate();
      if (this.isDialogValid) {
        this.dialogData.action(this.formData);
        this.closeDialog();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.text-editor-prepend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  margin-left: 16px;
  margin-right: 20px;
}

.prepend-hint-text {
  color: rgb(var(--v-theme-secondary-dark));
}
</style>
