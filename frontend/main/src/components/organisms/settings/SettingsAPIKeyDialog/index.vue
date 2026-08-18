<template>
  <form-dialog-template
    :primary-segment-title="`${$t('New')}: ${$t('API key')}`"
    :secondary-segment-title="$t('Key rights')"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSave"
      >
        <evocon-v-input
          v-model="formData.name"
          :placeholder="$t('Name')"
          :hint="$t('Name')"
          max-length="200"
          :rules="[v => !!v || $t('Name')]"
        />
      </v-form>
    </template>
    <template #secondary-segment>
      <selection-input
        :model-value="[showUsersSelection]"
        :items="APIKeyRights.filter((right) => !right.hidden)"
        :placeholder="$t('Key rights')"
        :hint="$t('Key rights')"
        :disabled="isFactoryAdmin"
        item-value="value"
        is-single-select
        hide-search
        required
        @update:model-value="[showUsersSelection] = $event"
      />
      <selection-input
        v-if="showUsersSelection"
        :model-value="[formData.userId]"
        :items="usersInSelection"
        :placeholder="$t('Name')"
        :hint="$t('User')"
        :disabled="isFactoryAdmin"
        item-text="fullName"
        item-value="username"
        item-secondary-text="userRoles"
        menu-input-class="mt-4"
        is-single-select
        required
        @update:model-value="[formData.userId] = $event"
      />
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="closeDialog"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Create')"
        :loading="isLoading"
        @click="onSave"
      />
    </template>
  </form-dialog-template>
</template>
<script setup name="APIKeyDialog">
import {
  defineAsyncComponent, computed, ref, reactive, onMounted,
} from 'vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useProfileStore from '@/stores/profile';
import useUserStore from '@/stores/user';
import useAPIKeysStore from '@/stores/APIKeys';
import i18n from '@/services/i18n';
import roleType, { getRoleTranslation } from '@/constants/userRoles';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';

const genericDialogStore = useGenericDialogStore();
const profileStore = useProfileStore();
const userStore = useUserStore();
const apiKeysStore = useAPIKeysStore();

const showUsersSelection = ref(false);
const form = ref(null);
const valid = ref(true);

const formData = reactive({
  name: '',
  userId: null,
});

const isLoading = computed(() => apiKeysStore.isLoading);
const closeDialog = () => genericDialogStore.closeDialog();
const currentUser = computed(() => profileStore.currentUser);

const isFactoryAdmin = computed(() => profileStore.highestUserRole === roleType.FACTORY_ADMIN);
const usersInSelection = computed(() => {
  if (isFactoryAdmin.value) return [currentUser.value];
  return [currentUser.value, ...userStore.users].map((user) => {
    const rolesArray = [...new Set(Object.values(user.roles))].map((role) => getRoleTranslation(role));
    return {
      ...user,
      userRoles: rolesArray.sort((a, b) => a.localeCompare(b)).join(', '),
    };
  });
});

const APIKeyRights = computed(() => [
  { value: false, name: i18n.global.t('Custom reports'), hidden: isFactoryAdmin.value },
  { value: true, name: i18n.global.t('User rights') },
]);

onMounted(() => {
  if (isFactoryAdmin.value) {
    showUsersSelection.value = true;
    formData.userId = currentUser.value.username;
  }
});

async function onSave() {
  await form.value.validate();
  if (!valid.value) return;
  if (!showUsersSelection.value && formData.userId) {
    formData.userId = null;
  }
  const APIKey = await apiKeysStore.saveAPIKey(formData);
  closeDialog();
  if (APIKey && APIKey.keyId) {
    genericDialogStore.openDialog({
      data: { APIKey },
      component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsAPIKeyCompletionDialog/index.vue')),
      allowFullscreen: true,
    });
  }
}
</script>
