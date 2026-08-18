<template>
  <v-list class="overflow-container">
    <v-list-item
      v-for="(lang, i) in userLanguages"
      :key="i"
      :value="lang"
      :active="lang === language"
      color="primary"
      class="list-item--flex"
      @click="selectLanguage(lang)"
    >
      <evocon-flag-icon
        :flag-country-code="lang"
        class="mt-1 mr-4"
        squared
        rounded
      />
      <v-list-item-title>{{ languageMap[lang]?.name || '' }}</v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script>
import { mapState, mapActions } from 'pinia';

import EvoconFlagIcon from '@/components/atoms/EvoconFlagIcon/index.vue';
import { languageMap } from '@/constants/languages';
import {
  useProfileStore, useScrapReasonStore, useCommentStore,
  usePerfCommentStore, usePositionStore,
} from '@/stores/index';

export default {
  name: 'LanguageSelect',
  components: { EvoconFlagIcon },
  data() {
    return {
      languageMap,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['currentUser', 'language']),
    userLanguages() {
      return this.currentUser.lineviewLanguages;
    },
  },
  methods: {
    ...mapActions(useProfileStore, ['changeLanguage']),
    ...mapActions(useCommentStore, ['fetchComments', 'fetchCommentGroups']),
    ...mapActions(usePerfCommentStore, ['fetchPerfComments', 'fetchPerfCommentGroups']),
    ...mapActions(useScrapReasonStore, ['fetchScrapReasons', 'fetchScrapReasonGroups']),
    ...mapActions(usePositionStore, ['fetchPositions']),
    selectLanguage(lang) {
      localStorage.setItem(`lineviewLanguage${this.currentUser.uuid}`, lang);
      this.changeLanguage({ lang });
      this.fetchComments({ lang });
      this.fetchCommentGroups({ lang });
      this.fetchPerfComments({ lang });
      this.fetchPerfCommentGroups({ lang });
      this.fetchScrapReasons({ lang });
      this.fetchScrapReasonGroups({ lang });
      this.fetchPositions({ lang });
    },
  },
};
</script>
<style lang="scss" scoped>
.overflow-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>
