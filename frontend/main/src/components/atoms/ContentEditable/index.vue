<template>
  <component
    :is="tag"
    ref="element"
    :contenteditable="editable"
    :placeholder="placeholder"
    :class="{ 'white-space-nowrap': !allowNewLine, 'content-editable': true, 'content-editable--dark': dark }"
    @input="update"
    @paste="onPaste"
    @keypress="onKeypress"
    @click="$emit('click', $event)"
    @blur="$emit('blur', $event)"
    @keydown="$emit('keydown', $event)"
  />
</template>

<script>
import replaceAll from '@/helpers/text/replaceAll';

export default {
  name: 'EvoconContentEditable',
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    editable: {
      type: Boolean,
      default: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
    allowHtml: {
      type: Boolean,
      default: false,
    },
    allowNewLine: {
      type: Boolean,
      default: false,
    },
    maxLength: {
      type: Number,
      default: 50,
    },
    placeholder: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
    },
  },
  emits: ['click', 'blur', 'keydown', 'update:model-value', 'submit'],
  watch: {
    modelValue(newVal) {
      if (newVal !== this.currentContent()) {
        this.updateContent(newVal ?? '');
      }
    },
  },
  mounted() {
    this.updateContent(this.modelValue ?? '');
  },
  methods: {
    currentContent() {
      return this.allowHtml
        ? this.$refs.element?.innerHTML
        : this.$refs.element?.innerText;
    },
    updateContent(newcontent) {
      if (this.allowHtml) {
        this.$refs.element.innerHTML = newcontent;
      } else {
        this.$refs.element.innerText = newcontent;
      }
    },
    update() {
      this.$emit('update:model-value', this.currentContent());
    },
    onPaste(event) {
      event.preventDefault();
      let text = (event.originalEvent || event).clipboardData.getData('text/plain');

      if (text.length + this.currentContent().length > this.maxLength) {
        const remainingCharacters = this.maxLength - this.currentContent().length;
        if (remainingCharacters < 1) {
          return;
        }
        text = text.substring(0, remainingCharacters);
      }
      if (!this.allowNewLine) {
        text = replaceAll(text, '\r\n', ' ');
        text = replaceAll(text, '\n', ' ');
        text = replaceAll(text, '\r', ' ');
      }
      window.document.execCommand('insertText', false, text);
    },
    onKeypress(event) {
      if (this.maxLength && this.currentContent().length >= this.maxLength) event.preventDefault();
      if (event.key === 'Enter' && !this.allowNewLine) {
        event.preventDefault();
        this.$emit('submit', this.currentContent());
      }
    },
  },

};
</script>
<style lang="scss" scoped>
  [contentEditable=true] {
    &:empty:before {
      content: attr(placeholder);
      color: rgb(var(--v-theme-secondary-dark)) !important;
    }

    &.content-editable--dark {
      color: white;

      &:empty:before {
        color: rgb(var(--v-theme-quaternary-dark-2)) !important;
      }
    }
  }
</style>
