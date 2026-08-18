<template>
  <v-menu
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
          :active="true"
          :img-src="getIconAsset('iconXAxis.svg')"
          :disabled="disabled"
          class="ma-1"
          @click:close="onChipClose"
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
        v-for="(item, index) in groupByMenuItems"
        :key="index"
        :active="isGroupBySelected(item)"
        active-class="text-primary-dark bg-primary-tint"
        @click="onGroupByChange({ value: item.value, index: 0 })"
      >
        <list-item-contents
          :input-value="isGroupBySelected(item)"
          :primary-text="getItemText(item)"
          dense
          is-single-select
          checkbox
          color="primary"
        />
      </v-list-item>
      <v-list-item
        v-for="(item, index) in granularityMenuItems"
        v-show="isVisible(item)"
        :key="`granularity-${index}`"
        :active="isGranularitySelected(item)"
        active-class="text-primary-dark bg-primary-tint"
        @click="onGranularityChange(item.value)"
      >
        <list-item-contents
          :input-value="isGranularitySelected(item)"
          :primary-text="getItemText(item)"
          dense
          is-single-select
          checkbox
          color="primary"
        />
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script>
import { mapActions, mapState } from 'pinia';
import { mdiMenuDown, mdiMenuUp } from '@mdi/js';
import { isFunction } from 'lodash';

import { useReportsConfigStore, useProfileStore, useFilterbarStore } from '@/stores';
import { getGranularityMenu, getExtraGranularityItem } from '@/stores/reportsConfig/configurations/granularityMenuItems';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import { getIconAsset } from '@/helpers/file/getAsset';
import configType from '@/stores/reportsConfig/constants/configType';

const queryParamGroupByMap = {
  [queryParam.OPERATOR_ID]: 'singleOperator',
  [queryParam.CHECKLIST_DONE_BY_ENTITY_ID]: 'doneBy',
  [queryParam.FACTORY_ID]: 'factoryId',
};

const vectorIcons = { mdiMenuDown, mdiMenuUp };
export default {
  name: 'ReportsGranularitySelection',
  components: { EvoconVChip, ListItemContents },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      menuState: false,
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useReportsConfigStore, ['groupBy', 'granularity', 'disabledParams', 'groupByMenuItems', 'configType']),
    ...mapState(useProfileStore, ['language']),
    ...mapState(useFilterbarStore, ['requestFilterState', 'currentFilterItemsMap']),
    menuIcon() {
      return this.menuState ? mdiMenuUp : mdiMenuDown;
    },
    granularityMenuItems() {
      if (this.configType === configType.PRODUCTION_SPEED) {
        return [];
      }
      return [...getGranularityMenu(this.language), getExtraGranularityItem()];
    },
    buttonLabel() {
      const prefix = `${this.$t('X-axis')}: `;
      if (this.granularity !== granularityType.TOTAL) {
        const getGranularityText = () => this.getItemText(this.granularityMenuItems.find(this.isGranularitySelected));
        let granularityTranslation;
        if (this.granularity === granularityType.STARTTIME) {
          granularityTranslation = this.$t('Start time');
        } else if (this.granularity === granularityType.DUE_TIME) {
          granularityTranslation = this.$t('Due time');
        } else {
          granularityTranslation = getGranularityText();
        }

        return `${prefix} ${granularityTranslation}`;
      }
      return `${prefix}${this.getItemText(this.groupByMenuItems?.[this.groupBy?.[0]])}`;
    },
  },
  watch: {
    groupBy(newVal) {
      this.disabledParams.forEach((param) => {
        const groupByKey = queryParamGroupByMap[param];
        const groupByKeysList = Object.keys(this.groupByMenuItems);
        if (groupByKey && newVal.includes(groupByKey) && groupByKeysList.length) {
          this.onGroupByChange({ value: groupByKeysList[0], index: 0 });
        }
      });
    },
  },
  methods: {
    getIconAsset,
    ...mapActions(useReportsConfigStore, ['onGranularityChange', 'onGroupByChange']),
    getItemText(item) {
      if (isFunction(item.text)) {
        return item.text(item, {
          currentFilterItemsMap: this.currentFilterItemsMap,
          requestFilterState: this.requestFilterState,
        });
      }
      return item?.text;
    },
    isVisible(granularity) {
      return granularity.value !== granularityType.STARTTIME;
    },
    isGroupBySelected(item) {
      return this.granularity === granularityType.TOTAL && item.value === this.groupBy[0];
    },
    isGranularitySelected(item) {
      return item.value === this.granularity;
    },
    onChipClose() {
      this.menuState = !this.menuState;
    },
  },
};
</script>
