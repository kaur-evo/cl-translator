<template>
  <div
    v-if="getType(fileData) === 'image'"
    class="image-prev-container"
  >
    <improvement-file-overlay
      class="content-overlay flex-wrap"
      :file-data="fileData"
      :is-dialog-open="isDialogOpen"
      :can-edit="canEdit"
      :project-id="projectId"
      @open-preview="openPreview"
      @open-edit="openEdit"
      @delete-file="deleteFile"
    />
    <img
      ref="img-file-preview"
      class="image-prev"
      :src="fileData.url"
      alt="img-preview"
    >
  </div>
  <div
    v-else
    class="file-prev-container"
  >
    <improvement-file-overlay
      class="content-overlay"
      :file-data="fileData"
      :is-dialog-open="isDialogOpen"
      :can-edit="canEdit"
      :project-id="projectId"
      @open-edit="openEdit"
      @delete-file="deleteFile"
    />
    <div class="file-preview">
      <v-icon
        class="insert-file-icon"
        color="primary"
      >
        {{ mdiFile }}
      </v-icon>
      <span class="file-prev-name">
        {{ decodeURI(fileData.fileName || getNameFromUrl(fileData.path)) }}
      </span>
    </div>
  </div>
</template>
<script>
import { mdiFile } from '@mdi/js';

import ImprovementFileOverlay from '@/components/organisms/improvements/ImprovementFileOverlay/index.vue';
import improvementsFileApi from '@/api/improvementsFileApi';

const vectorIcons = { mdiFile };

export default {
  name: 'ImprovementSingleFile',
  components: {
    ImprovementFileOverlay,
  },
  props: {
    fileData: {
      type: Object,
      default: () => {},
    },
    isOverview: {
      type: Boolean,
    },
    isDialogOpen: {
      type: Boolean,
    },
    isEdit: {
      type: Boolean,
    },
    canEdit: {
      type: Boolean,
    },
    projectId: {
      type: Number,
      default: 0,
    },
  },
  emits: ['open-preview', 'open-edit', 'delete-file', 'delete-preview-file'],
  data() {
    return {
      ...vectorIcons,
      element: null,
    };
  },
  async mounted() {
    if (this.getType(this.fileData) === 'image') {
      this.element = this.$refs['img-file-preview'];
      if (!this.element.src && (this.isEdit || this.isOverview)) {
        this.element.src = await this.getImgUrl();
      }
    }
  },
  methods: {
    getType(file) {
      const fileType = file.contentType || file.type;
      if (!fileType) return '';
      return fileType.substring(0, fileType.indexOf('/'));
    },
    getNameFromUrl(fileUrl) {
      if (!fileUrl) return '';
      const modifiedUrl = fileUrl.split('/');
      return modifiedUrl[modifiedUrl.length - 1];
    },
    async openPreview(img) {
      const imgSrc = await this.getImgUrl();
      this.$emit('open-preview', { ...img, imgSrc });
    },
    openEdit(file) {
      this.$emit('open-edit', file);
    },
    deleteFile(file) {
      if (this.isDialogOpen) {
        this.$emit('delete-preview-file', file);
      } else {
        this.$emit('delete-file', file);
      }
    },
    async getImgUrl() {
      const fileBody = { filename: decodeURI(this.fileData.fileName), timestamp: this.fileData.timestamp };
      const file = await improvementsFileApi.getFile(this.projectId, fileBody);
      return URL.createObjectURL(file);
    },
  },
};
</script>
<style lang="less" scoped>
.content-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(var(--v-theme-secondary-dark));
  position: absolute;
  opacity: 0;
  height: 100%;
  width: 100%;
  border-radius: 4px;
  transition: all 0.4s ease-in-out 0s;
}
.image-prev-container {
  position: relative;
  max-width: max-content;
  max-height: 136px;

  .image-prev {
    max-height: 136px;
    max-width: 242px;
    border-radius: 4px;
  }
}

.file-prev-container {
  position: relative;
  height: 136px;
  width: 242px;

  .file-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgb(var(--v-theme-quaternary-dark));
    border: 1px solid;
    border-radius: 4px;
    height: 100%;
    padding: 8px;

    .file-prev-name {
      padding-left: 8px;
      word-break: break-all;
    }
  }
}

.image-prev-container:hover, .file-prev-container:hover {

  .content-overlay {
    opacity: 1;
  }

  .file-preview {
    .insert-file-icon {
      opacity: 0.2;
    }
  }
}
</style>
