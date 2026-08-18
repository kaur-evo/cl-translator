<template>
  <evocon-v-tooltip-wrap
    :text="isText ? $t('Click to copy') : $t('Copy link')"
  >
    <template #activator="{ props }">
      <evocon-v-button
        v-bind="props"
        id="share-button"
        :icon="isText ? mdiContentCopy : mdiShareVariant"
        class="mx-1"
        @click="isText ? copyToClipboard(content) : copyShareLink()"
      />
    </template>
  </evocon-v-tooltip-wrap>
</template>

<script>
import { mapActions } from 'pinia';
import { mdiShareVariant, mdiContentCopy } from '@mdi/js';

import copyToClipboard from '@/helpers/copyToClipboard';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import urlShortenerApi from '@/api/urlShortenerApi';
import useGenericNotificationStore from '@/stores/genericNotification';

const icons = { mdiShareVariant, mdiContentCopy };

export default {
  name: 'CopyToClipboardButton',
  components: {
    EvoconVTooltipWrap,
    EvoconVButton,
  },
  props: {
    shorten: { type: Boolean },
    isText: { type: Boolean },
    content: { type: String, default: '' },
  },
  data() {
    return {
      ...icons,
    };
  },
  methods: {
    ...mapActions(useGenericNotificationStore, ['openNotification']),
    copyToClipboard,
    async getShortenedUrl(url) {
      try {
        const key = await urlShortenerApi.saveUrl(url);
        return `${import.meta.env.VITE_VUE_APP_BASE_URL}#/?s=${key}`;
      } catch {
        return url;
      }
    },
    async copyShareLink() {
      let url = this.content || window.location.href;
      if (this.shorten) url = await this.getShortenedUrl(url);
      this.copyToClipboard(url);
      this.openNotification({
        text: this.isText ? this.$t('Copied') : this.$t('Link copied'),
        type: 'success',
      });
    },
  },
};
</script>
