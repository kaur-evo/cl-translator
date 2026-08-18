<template>
  <dialog-template
    :title="$t(globalAnnouncement.title)"
    :title-icon="globalAnnouncement.isAlert ? mdiAlert : ''"
    icon-color="secondary"
  >
    <template #content>
      <v-progress-linear
        :model-value="dialogProgress"
      />
      <div class="px-4 py-2">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <pre class="text-body-large pre-wrap" v-html="translatedText" />
      </div>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Close')"
        type="secondary"
        @click="onClose"
      />
    </template>
  </dialog-template>
</template>

<script>
// Example of usage:
// {
//   "title": "title",
//   "text": "content",
//   "isAlert": true,
//   "timestamp": "2021-01-01T00:00:00.000Z", // in essence it is just id that is used to check if dialog was already shown
//   "visible": true,
//   "allowedRoles": ["SYS_ADMIN"]
// }

import { mapState, mapActions } from 'pinia';
import { mdiAlert } from '@mdi/js';

import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import CustomInterval from '@/helpers/interval/CustomInterval';
import { useConfigurationStore, useGenericDialogStore } from '@/stores/index';

export default {
  name: 'GlobalAnnouncementDialog',
  components: {
    DialogTemplate,
    EvoconVButton,
  },
  data() {
    return {
      mdiAlert,
      dialogOpenedTime: 0,
      dialogPersistanceTime: 10 * 60, // 10 minutes
      interval: null,
    };
  },
  computed: {
    ...mapState(useConfigurationStore, ['globalAnnouncement']),
    dialogProgress() {
      return (this.dialogOpenedTime / this.dialogPersistanceTime) * 100;
    },
    translatedText() {
      return this.$t(this.globalAnnouncement.text).split('\\n').join('\n');
    },
  },
  mounted() {
    this.interval = new CustomInterval(() => {
      this.dialogOpenedTime += 1;
      if (this.dialogOpenedTime >= this.dialogPersistanceTime) {
        this.onClose();
      }
    }, 1000).set();
  },
  unmounted() {
    this.interval = this.interval.clear();
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    onClose() {
      localStorage.setItem('globalAnnouncementTimestamp', this.globalAnnouncement.timestamp);
      // mark dialog read in localstorage
      this.closeDialog();
    },
  },
};

</script>
<style>
.pre-wrap {
  white-space: pre-wrap;       /* Since CSS 2.1 */
  white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
  white-space: -pre-wrap;      /* Opera 4-6 */
  white-space: -o-pre-wrap;    /* Opera 7 */
  word-wrap: break-word;       /* Internet Explorer 5.5+ */
}
</style>
