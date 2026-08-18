<!-- eslint-disable vue/no-v-html -->
<!-- eslint-disable vue/no-v-text-v-html-on-component -->
<template>
  <component
    :is="tag"
    @click="onClick"
    v-html="textWithAnchor()"
  />
</template>

<script setup>
import { reactive } from 'vue';
import DOMPurify from 'dompurify';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: 'span',
  },
});

const textWithAnchor = reactive(() => {
  const sanitizedText = DOMPurify.sanitize(props.text);
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return sanitizedText.replaceAll(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);
});

const onClick = (evt) => {
  if (evt.target.href) evt.stopPropagation();
};
</script>
