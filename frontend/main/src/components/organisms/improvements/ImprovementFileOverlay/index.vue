<template>
  <div>
    <evocon-v-button
      v-if="getType(fileData) === 'image' && !isDialogOpen"
      :icon="mdiEye"
      color="white"
      @click="openImgPreview()"
    />
    <evocon-v-button
      v-else-if="!isDialogOpen"
      :icon="mdiDownload"
      color="white"
      @click="downloadFile()"
    />
    <evocon-v-button
      v-if="canEdit && !isDialogOpen"
      :icon="mdiPencil"
      color="white"
      @click="$emit('open-edit', fileData)"
    />
    <evocon-v-button
      v-if="canEdit"
      :icon="mdiDelete"
      color="white"
      @click="$emit('delete-file', fileData)"
    />
  </div>
</template>
<script>
import {
  mdiEye,
  mdiPencil,
  mdiDelete,
  mdiDownload,
} from '@mdi/js';

import downloadFile from '@/helpers/file/downloadFile';
import improvementsFileApi from '@/api/improvementsFileApi';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = {
  mdiEye,
  mdiPencil,
  mdiDelete,
  mdiDownload,
};

export default {
  name: 'ImprovementFileOverlay',
  components: { EvoconVButton },
  props: {
    fileData: {
      type: Object,
      default: () => {},
    },
    canEdit: {
      type: Boolean,
    },
    isDialogOpen: {
      type: Boolean,
    },
    projectId: {
      type: Number,
      default: 0,
    },
  },
  emits: ['open-preview', 'open-edit', 'delete-file'],
  data() {
    return {
      ...vectorIcons,
    };
  },
  methods: {
    getType(file) {
      const fileType = file.contentType || file.type;
      if (!fileType) return '';
      return fileType.substring(0, fileType.indexOf('/'));
    },
    getFullUrl(url) {
      return `${import.meta.env.VITE_VUE_APP_BASE_API_URL.slice(0, -1)}${url}`;
    },
    openImgPreview() {
      const imgUrl = this.getFullUrl(this.fileData.path);
      this.$emit('open-preview', { imgUrl, imgTitle: this.fileData.title });
    },
    async downloadFile() {
      const fileBody = { filename: decodeURI(this.fileData.fileName), timestamp: this.fileData.timestamp };
      const data = await improvementsFileApi.getFile(this.projectId, fileBody);
      downloadFile(data, this.fileData.fileName);
    },
  },
};
</script>
