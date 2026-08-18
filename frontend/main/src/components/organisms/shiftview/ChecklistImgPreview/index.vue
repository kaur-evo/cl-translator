<template>
  <v-dialog
    :model-value="!!props.file"
    :fullscreen="showFullscreenDialogs"
    max-width="1100px"
    height="90%"
    @update:model-value="onModelValueUpdate"
  >
    <v-card>
      <v-card-text class="px-4 pt-4 pb-0 dialog-content d-flex align-center justify-center">
        <v-progress-linear v-if="loading" />
        <img
          ref="imgPreview"
          alt="cl-image"
          class="image"
          :class="{ 'd-none': loading }"
        >
      </v-card-text>
      <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs }">
        <delete-button
          v-if="props.deletable"
          @click="$emit('delete')"
        />
        <v-spacer />
        <evocon-v-button
          :text="$t('Close')"
          type="secondary"
          @click="$emit('close')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup name="ChecklistImgPreview">
import {
  onMounted, ref, watch, computed, nextTick,
} from 'vue';

import { useDeviceStore } from '@/stores/index';
import checklistApi from '@/api/checklistApi';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';

const deviceStore = useDeviceStore();

const showFullscreenDialogs = computed(() => deviceStore.showFullscreenDialogs);

const emit = defineEmits(['close', 'delete']);

const props = defineProps({
  file: {
    type: Object,
    default: () => {},
  },
  deletable: {
    type: Boolean,
    default: false,
  },
});

const loading = ref(false);

const imgPreview = ref(null);

const loadImg = async () => {
  loading.value = true;
  try {
    if (props.file.url) {
      await nextTick();
      imgPreview.value.src = props.file.url;
    } else {
      const file = await checklistApi.getChecklistFile(props.file);
      const url = URL.createObjectURL(file);
      imgPreview.value.src = url;
    }
  } catch {
    // Handle error (e.g., show a message to the user)
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (!props.file) return;
  loadImg();
});

const onModelValueUpdate = (value) => {
  if (!value) emit('close');
};

watch(() => props.file, (newFile) => {
  if (newFile) {
    loadImg();
  }
});
</script>

<style scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 0.9px - 60px);
}

.image {
  display: block;
  max-width: calc(100% - 32px);
  max-height: calc(100% - 96px);
  width: auto;
  height: auto;
}
</style>
