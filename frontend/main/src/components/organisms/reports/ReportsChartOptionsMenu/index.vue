<template>
  <v-menu
    v-if="menuItems.size > 1"
    v-model="menuState"
    :disabled="disabled"
    location="bottom left"
  >
    <template #activator="{ props }">
      <span
        class="d-flex"
        v-bind="props"
      >
        <evocon-v-chip
          :label="buttonLabel"
          type="primary"
          :img-src="imgSrc"
          :active="!!inputValue"
          :icon="selectedMenuItem.icon"
          :disabled="disabled"
          class="ma-1"
          @click:close.stop="onChipClose"
        >
          <template #append>
            <v-icon size="18" class="ml-1 selection-chip-icon">
              {{ menuIcon }}
            </v-icon>
          </template>
        </evocon-v-chip>
      </span>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="[value, menuItem] in Array.from(menuItems.entries())"
        :key="value"
        active-class="text-primary-dark bg-primary-tint"
        :active="isValueSelected(value)"
        @click="onClick(value)"
      >
        <list-item-contents
          :input-value="isValueSelected(value)"
          :primary-text="menuItem[menuTextKey]"
          :icon="menuItem.icon"
          :icon-color="isValueSelected(value) ? 'primary' : ''"
          dense
          is-single-select
          :checkbox="!menuItem.icon"
          color="primary"
        />
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script>
import { mdiMenuDown, mdiMenuUp } from '@mdi/js';
import { mapState } from 'pinia';

import { useReportsConfigStore } from '@/stores';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import isMenuEmptyValueSelected from '@/components/organisms/reports/ReportsChartOptionsMenu/isMenuEmptyValueSelected';

const vectorIcons = { mdiMenuDown, mdiMenuUp };

export default {
  name: 'ReportsChartOptionsMenu',
  components: { EvoconVChip, ListItemContents },
  props: {
    changeActionKey: {
      type: String,
      default: 'onYAxisChange',
    },
    valueKey: {
      type: String,
      default: 'yAxis',
    },
    menuTextKey: {
      type: String,
      default: 'label',
    },
    label: {
      type: String,
      required: true,
    },
    menuItems: {
      type: Map,
      default: () => new Map(),
    },
    imgSrc: {
      type: [Object, String],
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    arrayValueKeyIndex: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      menuState: false,
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useReportsConfigStore, ['configType']),
    reportsConfigStore() {
      return useReportsConfigStore();
    },
    menuIcon() {
      return this.menuState ? mdiMenuUp : mdiMenuDown;
    },
    selectedMenuItem() {
      return this.menuItems.get(this.inputValue) || {};
    },
    buttonLabel() {
      let prefix = `${this.label}`;
      if (this.label) prefix += ': ';
      return `${prefix}${this.selectedMenuItem[this.menuTextKey] || '-'}`;
    },
    inputValue() {
      if (this.arrayValueKeyIndex !== null) {
        return this.reportsConfigStore[this.valueKey][this.arrayValueKeyIndex];
      }
      return this.reportsConfigStore[this.valueKey];
    },
  },
  watch: {
    configType() {
      if (this.changeActionKey === 'onRightYAxisChange' && !Object.keys(this.selectedMenuItem).length) {
        this.reportsConfigStore[this.changeActionKey]();
      }
    },
  },
  methods: {
    onChipClose() {
      this.menuState = !this.menuState;
    },
    isValueSelected(value) {
      if (this.arrayValueKeyIndex !== null) {
        const indexValue = this.reportsConfigStore[this.valueKey][this.arrayValueKeyIndex];
        if (value === indexValue) return true;
        return isMenuEmptyValueSelected(value) && indexValue === undefined;
      }
      return value === this.inputValue;
    },
    onClick(value) {
      if (this.arrayValueKeyIndex === null) {
        this.reportsConfigStore[this.changeActionKey](value);
      } else {
        this.reportsConfigStore[this.changeActionKey]({ value, index: this.arrayValueKeyIndex });
      }
    },
  },
};
</script>
