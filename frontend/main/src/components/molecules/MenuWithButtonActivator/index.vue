<template>
  <v-menu
    :close-on-content-click="closeOnContentClick"
    :location="location"
    v-bind="$attrs"
    :max-width="maxWidth"
    :min-width="minWidth"
  >
    <template #activator="{ props }">
      <evocon-v-tooltip-wrap :text="btnTooltipText">
        <template #activator="{ props: tooltipProps }">
          <div v-bind="btnTooltipText ? tooltipProps : null">
            <evocon-v-button
              v-bind="{ ...$attrs, ...props }"
              id="menu-button"
              :icon="buttonIcon"
              :class="buttonClasses"
              :type="buttonType"
              :icon-color="$attrs.disabled ? '' : buttonIconColor ?? 'primary'"
            />
          </div>
        </template>
      </evocon-v-tooltip-wrap>
    </template>
    <v-list :width="listWidth">
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        density="compact"
        color="primary"
        :active="item[valueKey] === true || value === item[valueKey]"
        @click="$emit('item-clicked', item)"
      >
        <list-item-contents
          :primary-text="item[primaryTextField]"
          :secondary-text="item[secondaryTextField]"
          :tertiary-text="item[tertiaryTextField]"
          :icon="item[iconKey]"
          :checkbox="hasCheckbox"
          :is-single-select="isSingleSelect"
          :input-value="item[valueKey] === true || value === item[valueKey]"
          dense
        >
          <template #append>
            <slot name="item-append" :item="item" />
          </template>
        </list-item-contents>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';

export default {
  name: 'MenuWithButtonActivator',
  components: {
    ListItemContents,
    EvoconVButton,
    EvoconVTooltipWrap,
  },
  props: {
    value: {
      type: [String, Number, Boolean],
      default: '',
    },
    items: {
      type: Array,
      required: true,
    },
    buttonIcon: {
      type: String,
      required: true,
    },
    buttonIconColor: {
      type: String,
      default: null,
    },
    buttonClasses: {
      type: String,
      default: '',
    },
    primaryTextField: {
      type: String,
      default: 'name',
    },
    secondaryTextField: {
      type: String,
      default: '',
    },
    tertiaryTextField: {
      type: String,
      default: '',
    },
    hasCheckbox: {
      type: Boolean,
    },
    iconKey: {
      type: String,
      default: '',
    },
    valueKey: {
      type: String,
      default: '',
    },
    closeOnContentClick: {
      type: Boolean,
      default: true,
    },
    btnTooltipText: {
      type: String,
      default: null,
    },
    isSingleSelect: {
      type: Boolean,
    },
    buttonType: {
      type: String,
      default: 'primary-light',
    },
    listWidth: {
      type: String,
      default: '300px',
    },
    location: {
      type: String,
      default: 'bottom right',
    },
    minWidth: {
      type: String,
      default: null,
    },
    maxWidth: {
      type: String,
      default: null,
    },
  },
  emits: ['item-clicked'],
};
</script>
