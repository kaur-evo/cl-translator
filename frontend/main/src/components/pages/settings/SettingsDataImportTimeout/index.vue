<template>
  <form-page-template
    v-if="$route.name.endsWith('_dataImportTimeout')"
    id="data-import-timeout"
  >
    <template #primary-segment>
      <v-row>
        <v-col
          cols="12"
          class="pt-4 px-1"
        >
          <empty-view
            id="empty-state"
            :header="isRetry ? $t('Problem loading data') : $t('Timeout')"
            :description="$t('Something went wrong. Please try again.')"
            :primary-btn="isRetry ? '' : $t('Retry')"
            :secondary-btn="isRetry ? $t('Contact support') : ''"
            :img-url="isRetry ? 'settings-timeout-2' : 'settings-timeout-1'"
            @button-clicked="retry"
            @secondary-btn-clicked="openSupportDialog"
          />
        </v-col>
      </v-row>
    </template>
  </form-page-template>
  <router-view v-else />
</template>

<script>
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import openSupportDialog from '@/helpers/support/openSupportDialog';

export default {
  name: 'SettingsDataImportUpload',
  components: {
    FormPageTemplate,
    EmptyView,
  },
  computed: {
    canGoBack() {
      return this.$route.matched && this.$route.matched.length > 1;
    },
    isRetry() {
      return this.$route.params && this.$route.params.retry === true;
    },
  },
  methods: {
    openSupportDialog,
    retry() {
      if (this.canGoBack) {
        const { path } = this.$route.matched[this.$route.matched.length - 2];
        const params = { ...this.$route.params, retry: true };
        this.$router.push({ path, query: { ...this.$route.query }, params });
      }
    },
  },
};
</script>
