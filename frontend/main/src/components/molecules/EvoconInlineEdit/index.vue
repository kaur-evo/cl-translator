<template>
  <content-editable
    v-bind="$attrs"
    ref="contentEditable"
    class="inline-edit"
    :class="{ 'inline-edit-error': error }"
  />
</template>
<script>
import ContentEditable from '@/components/atoms/ContentEditable/index.vue';

export default {
  name: 'EvoconInlineEdit',
  components: { ContentEditable },
  props: { error: Boolean },
};
</script>
<style lang="scss" scoped>
.inline-edit {
   border-bottom: solid 1px transparent;
  &[contenteditable="true"]{
     outline: 0px solid transparent;
     border: 0;
     display: inline-block;
     border-bottom: solid 1px black;
     min-width: 150px;
  }
  &.inline-edit-error {
    &[contenteditable="true"]{
      border-bottom: solid 2px red;
    }
    &[contentEditable="true"]:empty:before {
      content: attr(placeholder);
      color: rgba(255, 0, 0, 0.6) !important;
    }
  }
}
</style>
