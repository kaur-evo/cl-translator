<template>
  <v-card class="fill-height">
    <v-card-title class="d-flex justify-center">
      {{ $t("Select profile picture") }}
    </v-card-title>
    <v-item-group
      v-model="selected"
      mandatory
      selected-class="selected"
      class="d-flex flex-wrap pa-4 justify-center item-group mx-auto"
    >
      <v-item
        v-for="avatar in avatars"
        v-slot="item"
        :key="`avatar${avatar}`"
        :value="avatar"
      >
        <profile-picture
          :img="avatar"
          class-names="ma-2"
          :class="{ selected: item?.isSelected }"
          clickable
          @on-click="item?.toggle"
        />
      </v-item>
    </v-item-group>
    <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs }">
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="onCancel"
      />
      <evocon-v-button
        :text="$t('Save')"
        color="primary"
        @click="onSave"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';

import useGenericDialogStore from '@/stores/genericDialog';
import useDeviceStore from '@/stores/device';
import ProfilePicture from '@/components/atoms/ProfilePicture/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

export default {
  name: 'ProfilePictureDialog',
  components: {
    ProfilePicture,
    EvoconVButton,
  },
  data() {
    return {
      avatars: [
        'profile-img-1',
        'profile-img-2',
        'profile-img-3',
        'profile-img-4',
        'profile-img-5',
        'profile-img-6',
        'profile-img-7',
      ],
      selected: 'profile-img-1',
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs']),
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    onSave() {
      if (this.dialogData.action) this.dialogData.action(this.selected);
      this.closeDialog();
    },
    onCancel() {
      this.closeDialog();
    },
  },
};
</script>

<style scoped>
.item-group {
  max-width: 716px;
}
</style>
