<template>
  <settings-security-wrapper
    :sections="[{ title: $t('Security profiles'), items: securityProfiles }]"
    :is-loading="isLoading"
  >
    <template #title-append>
      <icon-with-tooltip
        additional-classes="ml-2"
        :icon="mdiInformationOutline"
        :tooltip-text="$t('Learn more')"
        :icon-clicked-fn="onInfoClick"
      />
    </template>
    <template #items=" { items }">
      <tiny-cards-list
        v-if="items.length"
        :items="items"
        :card-buttons="cardListButtons"
        title-text-key="name"
        :subtitle-key-value-pairs="getSubtitleKeyValuePairs"
        class="mx-4"
      />
      <empty-view
        v-else
        :description="$t('Create reusable profiles to enforce security rules. Profiles can be attached in user settings.')"
        :secondary-btn="$t('Security profile')"
        :secondary-btn-icon="mdiPlus"
        secondary-btn-color="primary"
        img-url="security"
        @secondary-btn-clicked="onEdit"
      />
      <evocon-v-button
        v-if="items.length"
        :text="$t('Security profile')"
        type="primary-light"
        class="ml-4 mt-2"
        :icon="mdiPlus"
        @click="onEdit"
      />
      <v-card-actions>
        <v-spacer />
        <evocon-v-button
          :text="$t('Cancel')"
          type="secondary"
          @click="goBack"
        />
      </v-card-actions>
    </template>
  </settings-security-wrapper>
</template>
<script setup name="SettingsSecurityProfilesOverview">
import { computed, onMounted, defineAsyncComponent } from 'vue';
import { mdiPlus, mdiPencil, mdiDelete, mdiInformationOutline } from '@mdi/js';
import { useRouter } from 'vue-router';

import useSecurityProfileStore from '@/stores/securityProfile';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericDialogStore from '@/stores/genericDialog';
import { convertMinutesToDays } from '@/helpers/time/convertMinutesAndDays';
import i18n from '@/services/i18n';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import TinyCardsList from '@/components/molecules/TinyCardsList/index.vue';
import SettingsSecurityWrapper from '@/components/templates/SettingsSecurityWrapper/index.vue';

const securityProfileStore = useSecurityProfileStore();
const confirmDialogStore = useConfirmDialogStore();
const genericDialogStore = useGenericDialogStore();
const router = useRouter();

const securityProfiles = computed(() => securityProfileStore.securityProfiles);
const isLoading = computed(() => securityProfileStore.isLoading);

const cardListButtons = computed(() => [
  {
    icon: mdiPencil,
    text: i18n.global.t('Edit'),
    tooltip: i18n.global.t('Edit'),
    action: onEdit,
  },
  {
    icon: mdiDelete,
    text: i18n.global.t('Delete'),
    tooltip: i18n.global.t('Delete'),
    action: onDelete,
  },
]);

const getSubtitleKeyValuePairs = (item) => {
  const pairs = [
    {
      key: '2FA',
      value: item.twoFactorAuthenticationRequired ? i18n.global.t('Yes') : i18n.global.t('No'),
    },
    {
      key: 'SSO',
      value: item.singleSignOnRequired ? i18n.global.t('Yes') : i18n.global.t('No'),
    },
  ];

  if (item.absoluteTimeoutMinutes) {
    const days = convertMinutesToDays(item.absoluteTimeoutMinutes);
    pairs.push({
      key: i18n.global.t('Log out'),
      value: `${days} ${days === 1 ? i18n.global.t('Day').toLowerCase() : i18n.global.t('daysGenitive')}`,
    });
  }

  return pairs;
};

const onEdit = (props) => {
  const dialogConfig = {
    component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsSecurityProfileEditDialog/index.vue')),
    allowFullscreen: true,
    width: 900,
    data: {
      item: props?.item || {},
    },
  };
  genericDialogStore.openDialog(dialogConfig);
};

const onDelete = ({ item }) => {
  const confirmDialogConfig = {
    title: i18n.global.t('Confirmation'),
    text: i18n.global.t('Are you sure you want to delete {value}?', { value: item.name }),
    action: () => deleteProfile(item),
    confirmText: i18n.global.t('Delete'),
    cancelText: i18n.global.t('Cancel'),
  };
  confirmDialogStore.openConfirmDialog(confirmDialogConfig);
};

const deleteProfile = async (item) => {
  await securityProfileStore.deleteSecurityProfile(item);
};

const goBack = () => {
  router.push({ name: 'securityOverview' });
};

const onInfoClick = () => {
  window.open('https://support.evocon.com/Managing-security-settings-2cbdae0ba80280ffb49ec903a7b0216d?pvs=73', '_blank');
};

onMounted(async () => {
  await securityProfileStore.fetchSecurityProfiles();
});
</script>
