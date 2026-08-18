<template>
  <div class="input-wrapper" :class="wrapperClass">
    <div
      class="text-input"
      :class="{
        'text-input--error': !valid,
        'text-input--compact': isMobileView,
      }"
    >
      <slot name="prepend" />
      <div
        id="text-container"
        ref="textContainer"
        class="text-container d-flex flex-grow-1 flex-shrink-0"
        :class="{ 'text-container--scrollable': textContainerHasScroll }"
        :style="{ height: `${innerHeight}px` }"
        @click="onContainerClick"
      >
        <div ref="tip-tap-editor" class="tip-tap-editor" />
      </div>
      <div class="append-slot">
        <slot name="append" />
      </div>
      <div v-if="hasTextStyling" class="d-flex px-2 py-1">
        <evocon-v-button
          v-for="button in editorButtons"
          :key="button.id"
          :icon="button.icon"
          :icon-color="editor?.isActive(button.id) ? 'primary' : ''"
          size="extra-small"
          :disabled="button.isDisabled ? button.isDisabled() : false"
          @click="button.action"
        />
      </div>
    </div>
    <span class="hint-text" :class="{ 'hint-text--error': !valid }">
      {{ hint }}
    </span>
  </div>
</template>

<script>
import { Editor } from '@tiptap/vue-3';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { BulletList, ListItem } from '@tiptap/extension-list';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import HardBreak from '@tiptap/extension-hard-break';
import {
  mdiFormatBold, mdiFormatItalic, mdiFormatListBulleted, mdiFormatUnderline, mdiPencil, mdiDelete, mdiCloseCircle, mdiCheckCircle,
} from '@mdi/js';
import { VInput } from 'vuetify/components';
import { mapState } from 'pinia';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useDeviceStore from '@/stores/device';

const icons = {
  mdiPencil, mdiDelete, mdiCloseCircle, mdiCheckCircle,
};

export const EnterHandler = (allowNewLine) => Extension.create({
  name: 'enterHandler',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleKeyDown: (view, event) => event.key === 'Enter' && !allowNewLine,
        },
      }),
    ];
  },
});

export default {
  name: 'EvoconTextEditor',
  components: { EvoconVButton },
  extends: VInput,
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    allowedVariables: {
      type: Array,
      default: () => [],
    },
    hasTextStyling: {
      type: Boolean,
    },
    allowNewLine: {
      type: Boolean,
    },
    height: {
      type: Number,
      default: null,
    },
    wrapperClass: {
      type: String,
      default: '',
    },
    hasHighlight: {
      type: Boolean,
    },
  },
  emits: ['update:model-value'],
  data() {
    return {
      ...icons,
      valid: true,
      editor: null,
      textContainerHasScroll: false,
      editorButtons: [
        {
          id: 'bold',
          icon: mdiFormatBold,
          action: () => {
            this.editor.chain().focus().toggleBold().run();
          },
        },
        {
          id: 'italic',
          icon: mdiFormatItalic,
          action: () => {
            this.editor.chain().focus().toggleItalic().run();
          },
        },
        {
          id: 'underline',
          icon: mdiFormatUnderline,
          action: () => {
            this.editor.chain().focus().toggleUnderline().run();
          },
        },
        {
          id: 'bulletList',
          icon: mdiFormatListBulleted,
          action: () => {
            this.editor.chain().focus().toggleBulletList().run();
          },
        },
      ],
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    innerHeight() {
      /* eslint-disable no-magic-numbers */
      if (this.height) return this.height;
      if (this.isMobileView) return 40;
      return 56;
    },
    /* eslint-enable no-magic-numbers */
  },
  watch: {
    modelValue() {
      const { from, to } = this.editor.state.selection;
      this.editor.commands.setContent(this.getContent());
      this.editor.commands.setTextSelection({ from, to });
    },
    allowNewLine() {
      this.editor.destroy();
      this.createEditor();
    },
  },
  mounted() {
    this.createEditor();
    this.valid = true;
  },
  beforeUnmount() {
    this.editor.destroy();
  },
  methods: {
    createEditor() {
      const defaultExtensions = [Document, Paragraph, Text, EnterHandler(this.allowNewLine)];
      const configuredBulletList = BulletList.configure({
        HTMLAttributes: {
          class: 'editor-bullet-list',
        },
      });
      const stylingExtensions = [
        HardBreak, Bold, Italic, Underline, configuredBulletList, ListItem, TextStyleKit,
      ];
      const extensions = [...defaultExtensions];
      if (this.hasTextStyling) {
        extensions.push(...stylingExtensions);
      }
      if (this.hasHighlight) {
        extensions.push(Highlight.configure({
          HTMLAttributes: {
            class: 'text-editor-variable',
          },
        }));
      }
      this.editor = new Editor({

        element: this.$refs['tip-tap-editor'],
        extensions,
        content: this.getContent(),
        editable: true,
        injectCSS: false,
        editorProps: {
          attributes: {
            class: 'text-editor',
            style: 'outline: none; width: 100%; height: 100%;',
          },
        },
        parseOptions: {
          preserveWhitespace: 'full',
        },
        onUpdate: () => {
          this.onInput();
          this.setIfHasScroll();
        },
        onCreate: () => {
          this.setIfHasScroll();
        },
      });
    },
    getContent() {
      // eslint-disable-next-line sonarjs/slow-regex
      const result = this.modelValue.replace(/{(.*?)}/g, (match) => {
        if (this.allowedVariables.includes(match)) {
          return `<mark>${match}</mark>`;
        }
        return match;
      });
      return result;
    },
    onInput() {
      const result = this.editor.getHTML();
      const regex = /<mark class="text-editor-variable">.*?<\/mark>/g;
      const cleanOutput = result.replaceAll(regex, (match) => {
        const variable = match.replace(/<mark class="text-editor-variable">/gm, '').replace('</mark>', '');
        return variable;
      });
      if (this.hasTextStyling) {
        this.$emit('update:model-value', cleanOutput);
      } else {
        this.$emit('update:model-value', cleanOutput.replace(/<p>/g, '').replace('</p>', ''));
      }
    },
    setIfHasScroll() {
      const container = this.$refs.textContainer;
      this.textContainerHasScroll = container.scrollHeight > container.clientHeight;
    },
  },
};
</script>

<style lang="less" scoped>
.input-wrapper {
  position: relative;
}

.text-input {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-input-background));
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid rgb(var(--v-theme-tertiary-dark));
  outline: none;
  transition: all 0.2s ease-in-out;
  line-height: 32px;

  &--error {
    border-bottom: 1px solid rgb(var(--v-theme-error));
  }

  &:hover {
    background: rgb(var(--v-theme-quaternary-dark));
  }

  &:focus {
    border-bottom: 2px solid rgb(var(--v-theme-primary));
  }
}

.hint-text {
  font-size: 12px;
  color: rgb(var(--v-theme-secondary-dark));
  margin-left: 12px;

  &--error {
    color: rgb(var(--v-theme-error));
  }
}

.text-container {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 40px 12px 16px;
}

.append-slot {
  position: absolute;
  top: 10px;
  left: calc(100% - 48px);
}

.text-input--compact {
  .text-container {
    padding: 4px 40px 4px 16px;
  }

  .append-slot {
    top: 4px;
  }
}

.tip-tap-editor {
  width: 100%;
  height: 100%;
}

:deep(.editor-bullet-list) {
  padding: 0px 16px;
}

</style>
