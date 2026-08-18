<template>
  <div class="table-wrapper">
    <v-progress-linear v-if="loading" indeterminate />
    <v-data-table
      v-else
      ref="evocon-table"
      v-bind="$attrs"
      class="evocon-v-table"
      :headers="filteredHeaders"
      :items="items"
      :items-per-page="options?.itemsPerPage"
      :loading="loading"
      :height="tableHeight"
      fixed-header
      :footer-props="footerProps"
      :disable-pagination="disablePagination"
      hide-default-header
      :sort-by="options?.sortBy"
      :style="{ 'max-width': `${width}px`, 'min-width': `${width}px` }"
    >
      <template #loading>
        <div v-if="loading" class="mx-n4">
          <v-progress-linear indeterminate />
        </div>
      </template>
      <template #default="{ internalItems } = {}">
        <thead v-if="items.length">
          <tr id="header-row">
            <evocon-v-table-header-cell
              v-for="(header, colIndex) in filteredHeaders"
              :key="`table-header-c-${colIndex}`"
              :header="{ ...header, sortable: header.sortable ?? true }"
              :fixed="isFixedCol(header, colIndex)"
              :model-value="getHeaderDataKey(header)"
              :options="options"
              :tooltip-content="header.tooltip"
              :class="{
                'fixed-column': isFixedCol(header, colIndex),
                'last-fixed-column': isLastFixedCol(header, colIndex),
                'is-numeric': header.type === 'number',
              }"
              :style="header.style"
              @update:options="$emit('update:options', $event)"
            />
          </tr>
        </thead>
        <draggable
          v-if="internalItems?.length"
          :model-value="internalItems"
          tag="tbody"
          handle=".handle"
          item-key="textKey"
          :force-fallback="true"
          scroll-sensitivity="64"
          :group="{
            name: group,
            pull: false,
            put: false,
            revertClone: true,
          }"
          @change="onItemsOrderChange"
        >
          <template #item="{ element: item, index: rowIndex }">
            <tr
              v-if="!isHidden(item.raw)"
              :class="{
                'cursor-pointer': areRowsClickable,
                expanded: isRowExpanded(rowIndex),
              }"
              class="table-row"
              @click="onRowClick(item.raw, rowIndex)"
            >
              <td
                v-for="(col, colIndex) in filteredHeaders"
                :id="`table-cell-${rowIndex}-${colIndex}`"
                :key="`table-cell-${rowIndex}-${colIndex}`"
                :class="[
                  getAdditionalClass(item.raw, col),
                  colIndex === 0 && !getPrependIcon(col, item.raw, internalItems) ? 'pl-4' : 'pl-2',
                  {
                    'fixed-column': isFixedCol(col, colIndex),
                    'last-fixed-column': isLastFixedCol(col, colIndex),
                    'font-weight-medium': isBoldCol(col, colIndex),
                  }]"
                class="pr-4 table-cell text-body-medium"
                :style="col.style"
                @click="onColumnClicked(col, $event)"
              >
                <div class="inner-table-cell py-1">
                  <slot
                    v-if="getColSlot(col, isRowExpanded(rowIndex))"
                    v-bind="scope"
                    :name="getColSlot(col, isRowExpanded(rowIndex))"
                    :item="item.raw"
                    :col="col"
                    :row="row"
                  />
                  <template v-else-if="col.hasProgressBarOnLoad && areColsLoading">
                    <v-progress-linear
                      id="linear-progress-bar"
                      indeterminate
                    />
                  </template>
                  <div
                    v-else
                    :class="[{ 'd-flex align-center': hasCellAdornment(col, item.raw, internalItems) }, getAdditionalClass(item.raw, col)]"
                    :style="col.additionalStyle"
                    @click="onCellClick($event, item.raw, col, colIndex, rowIndex)"
                  >
                    <v-icon
                      v-if="getPrependIcon(col, item.raw, internalItems)"
                      :color="getPrependIconColor(col, item.raw)"
                      class="mr-2"
                      :class="col.prependIconClass"
                      :size="col.prependIconSize"
                    >
                      {{ getPrependIcon(col, item.raw, internalItems) }}
                    </v-icon>
                    <slot
                      v-if="col.isSlotColumn"
                      :name="col.slotName"
                      :item="item.raw"
                      :column="col"
                      :row-index="rowIndex"
                      :col-index="colIndex"
                    />
                    <span
                      v-else
                      class="d-block"
                      :class="{ 'text-truncate': shouldTruncateCell(col, item.raw, internalItems) }"
                    >
                      <div
                        class="d-flex align-center fill-height"
                        :class="{
                          'numeric-data-cell justify-end text-right text-no-wrap': col.type === 'number',
                        }"
                      >
                        <div
                          :id="`${getColumnId(rowIndex, colIndex, col)}-primary`"
                          :class="[
                            getAdditionalClass(item.raw, col),
                            {
                              'cursor-pointer hover-underline-animation font-weight-medium': isClickableCol(item.raw, col, colIndex),
                              'text-truncate': !col.noTruncation && col.type !== 'number',
                            }]"
                          @mouseenter="onCellMouseEnter($event, item.raw, col)"
                          @mouseleave="onCellMouseLeave"
                        >
                          {{ formatText(item.raw[col.textKey], col.formatFn, item.raw) }}
                          <v-icon
                            v-if="isPopUpCol(item.raw, col)"
                            size="small"
                            class="ml-1 my-n2 cursor-pointer"
                            @mouseenter="onCellMouseEnter($event, item.raw, col)"
                            @mouseleave="onCellMouseLeave"
                          >
                            {{ mdiOpenInNew }}
                          </v-icon>
                        </div>
                      </div>
                      <evocon-v-tooltip-wrap
                        :disabled="!col.secondaryTextTooltip"
                        :text="getColKeyVal(col, 'secondaryTextTooltip', item.raw[col.textKey])"
                      >
                        <template #activator="{ props }">
                          <div
                            v-if="col.secondaryTextKey"
                            v-bind="props"
                            class="d-flex align-center fill-height"
                            :class="{
                              'numeric-data-cell justify-end text-right text-no-wrap': col.type === 'number',
                            }"
                          >
                            <div
                              :id="`${getColumnId(rowIndex, colIndex, col)}-secondary`"
                              :class="[getColKeyVal(col, 'secondaryTextClass', item.raw[col.textKey]), {
                                'cursor-pointer': isClickableCol(item.raw, col, colIndex),
                                'text-truncate': !col.noTruncation && col.type !== 'number',
                              }]"
                              class="text-secondary-text"
                              @mouseenter="onCellMouseEnter($event, item.raw, col)"
                              @mouseleave="onCellMouseLeave"
                            >
                              {{ formatText(item.raw[col.secondaryTextKey], col.secondaryFormatFn, item.raw, item.raw) }}
                            </div>
                          </div>
                        </template>
                      </evocon-v-tooltip-wrap>
                    </span>

                    <evocon-v-button
                      v-if="col.hasDeleteRowOption"
                      :icon="mdiDelete"
                      @click="$emit('on-delete-row-click', item.raw)"
                    />
                    <evocon-v-button
                      v-else-if="isContentExpandColumn(item.raw, col, colIndex)"
                      :icon="isRowExpanded(rowIndex) ? mdiChevronUp : mdiChevronDown"
                      @click.stop="toggleRowExpand(rowIndex)"
                    />
                    <evocon-v-button
                      v-else-if="getColKeyVal(col, 'hasOpenLinkBtn', item.raw)"
                      :icon="col.appendIcon ?? mdiOpenInNew"
                      @click.stop="onLinkClick($event, item.raw, col)"
                    />
                    <icon-with-tooltip
                      v-else-if="(appendIcon(item.raw, col) || getColKeyVal(col, 'appendIconSrc', item.raw)) && col.appendIconTooltipText"
                      :size="col.appendIconSize"
                      :additional-classes="col.appendIconClass"
                      :icon="appendIcon(item.raw, col)"
                      :icon-src="getColKeyVal(col, 'appendIconSrc', item.raw)"
                      :icon-id="getColKeyVal(col, 'appendIconId', item.raw)"
                      color="icon-default"
                      :tooltip-text="col.appendIconTooltipText"
                      :icon-clicked-fn="col.appendIconClickFn ? () => col.appendIconClickFn(item.raw) : null"
                    />
                    <v-icon
                      v-else-if="appendIcon(item.raw, col)"
                      :class="col.appendIconClass"
                      :size="col.appendIconSize"
                    >
                      {{ appendIcon(item.raw, col) }}
                    </v-icon>
                  </div>
                </div>
              </td>
              <evocon-v-tooltip-wrap
                v-if="isTooltipVisible"
                :activator="tooltipAttachId"
                :model-value="isTooltipVisible"
                :text="tooltipContent"
              />
            </tr>
          </template>
        </draggable>
        <tbody v-else-if="!loading">
          <tr id="empty-view-row">
            <td :colspan="headers.length">
              <empty-view
                :header="emptyViewHeader"
                :description="emptyViewDescription"
                :img-url="emptyViewImg"
                :secondary-btn-icon="emptyViewBtnIcon"
                :secondary-btn="emptyViewBtn"
                :primary-btn="primaryEmptyViewBtn"
                :secondary-btn-color="emptyViewBtnColor"
                @secondary-btn-clicked="$emit('secondary-empty-view-btn-clicked')"
                @button-clicked="$emit('primary-empty-view-btn-clicked')"
              />
            </td>
          </tr>
        </tbody>
        <tfoot v-if="!loading && totals && Object.keys(totals).length">
          <tr id="totals-row">
            <td
              v-for="(header, colIndex) in filteredHeaders"
              :id="`total-cell-${colIndex}`"
              :key="`total-td-${colIndex}-${getHeaderDataKey(header)}`"
              :class="{
                'fixed-column': isFixedCol(header, colIndex),
                'last-fixed-column': isLastFixedCol(header, colIndex),
                'numeric-data-cell text-right text-no-wrap': header.type === 'number',
              }"
              :style="header.style"
              class="font-weight-bold footer-cell pl-2 pr-4"
              :width="header.width"
            >
              <div v-if="isFixedCol(header, colIndex)">
                {{ $t("Total") }}
              </div>
              <div v-else-if="header.hasTotal && totals[header.textKey] !== undefined">
                {{ formatText(totals[header.textKey], header.formatFn, totals) }}
              </div>
              <div
                v-if="header.hasTotal && totals[header.secondaryTextKey] !== undefined"
                class="text-secondary-text"
              >
                {{ formatText(totals[header.secondaryTextKey], header.secondaryFormatFn, totals) }}
              </div>
            </td>
          </tr>
        </tfoot>
      </template>

      <!-- eslint-disable vue/v-slot-style, vue/valid-v-slot -->
      <template
        v-if="$slots['footer-page-text']"
        v-slot:footer.page-text="data"
      >
        <slot
          name="footer-page-text"
          :data="data"
        />
      </template>
      <template v-if="hideDefaultFooter" #bottom />
    </v-data-table>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import {
  mdiArrowUp, mdiArrowDown, mdiOpenInNew, mdiDelete, mdiChevronDown, mdiChevronUp,
} from '@mdi/js';
import isFunction from 'lodash/isFunction';
import { nextTick } from 'vue';
import { mapState } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';

import ResizeableGrid from './resizeableGrid';

import { useFilterbarStore } from '@/stores/index';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import EvoconVTableHeaderCell from '@/components/atoms/EvoconVTableHeaderCell/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { tablePageOptionsInclAll } from '@/constants/tableOptions';

const icons = {
  mdiArrowUp, mdiArrowDown, mdiOpenInNew, mdiDelete, mdiChevronDown, mdiChevronUp,
};

export default {
  name: 'EvoconVTable',
  components: {
    draggable, EmptyView, EvoconVTooltipWrap, EvoconVTableHeaderCell, IconWithTooltip, EvoconVButton,
  },
  props: {
    items: { type: Array, default: () => [] },
    loading: { type: Boolean },
    height: { type: [Number, String], default: 600 },
    width: { type: [Number, String], default: 600 },
    options: { type: Object, default: () => {} },
    headers: { type: Array, default: () => [] },
    totals: { type: Object, default: () => {} },
    areRowsClickable: { type: Boolean },
    rowClickMode: { type: String, default: null },
    disablePagination: { type: Boolean, default: true },
    footerOptions: { type: Object, default: null },
    areColsLoading: { type: Boolean },
    hiddenRowKeys: { type: Array, default: () => [] },
    emptyViewHeader: { type: String, default: '' },
    emptyViewDescription: { type: String, default: '' },
    emptyViewImg: { type: String, default: 'reports' },
    emptyViewBtnIcon: { type: String, default: '' },
    emptyViewBtn: { type: String, default: '' },
    primaryEmptyViewBtn: { type: String, default: '' },
    emptyViewBtnColor: { type: String, default: '' },
    resizeable: { type: Boolean, default: true },
    group: { type: String, default: '' },
    hideDefaultFooter: { type: Boolean },
  },
  emits: ['update:options', 'link-click', 'row-click', 'secondary-empty-view-btn-clicked', 'on-items-order-change', 'primary-empty-view-btn-clicked', 'on-delete-row-click'],
  data() {
    return {
      ...icons,
      isTooltipVisible: false,
      tooltipAttachId: '',
      tooltipContent: '',
      resizeableRef: null,
      mounted: false,
      expanded: new Set(),
      wrapper: null,
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['requestFilterState']),
    filteredHeaders() {
      return this.headers.filter((header) => !this.isHiddenCol(header));
    },
    tableHeight() {
      /* eslint-disable no-magic-numbers */
      if (this.height === 'auto') return this.height;
      const headerRowHeight = 30;
      const totalsRowHeight = this.totals && Object.keys(this.totals).length ? 40 : 0;
      const rowHeight = 48;
      const visibleItemsLength = this.items.length > 50 && this.options?.itemsPerPage > -1 ? this.options?.itemsPerPage : this.items.length;
      return Math.min(this.height, (visibleItemsLength * rowHeight) + headerRowHeight + totalsRowHeight);
      /* eslint-enable no-magic-numbers */
    },
    footerProps() {
      const defaults = {
        itemsPerPageOptions: tablePageOptionsInclAll,
        itemsPerPageText: this.$t('Rows per page'),
        itemsPerPageAllText: this.$t('All'),
        pageText: '{0}-{1}/{2}',
      };
      if (this.footerOptions) {
        return { ...defaults, ...this.footerOptions };
      }
      return defaults;
    },
  },
  watch: {
    async loading(newVal) {
      await nextTick();
      if (!newVal) this.initResize();
      this.addScrollHandler();
    },
    items() {
      this.updateColumnHandles();
    },
    filteredHeaders() {
      this.initResize();
    },
    requestFilterState() {
      if (this.expanded.size > 0) {
        this.expanded.clear();
        this.updateColumnHandles();
      }
    },
  },
  async mounted() {
    await nextTick();
    if (!this.loading) this.initResize();
    this.mounted = true;
    this.addScrollHandler();
  },
  beforeUnmount() {
    if (this.wrapper) {
      this.wrapper.removeEventListener('scroll', this.updateColumnHandles);
    }
  },
  methods: {
    addScrollHandler() {
      this.wrapper = this.$refs['evocon-table']?.$el?.firstElementChild;
      if (this.wrapper) {
        this.wrapper.addEventListener('scroll', this.updateColumnHandles);
      }
    },
    getColKeyVal(col, key, data1, data2) {
      if (isFunction(col[key])) {
        return col[key](data1, data2);
      }
      return col[key];
    },
    async updateColumnHandles() {
      await nextTick();
      if (this.resizeableRef) {
        const table = this.$refs['evocon-table']?.$el;
        if (table) {
          this.resizeableRef.updateColumnHandles(table);
        } else {
          window.setTimeout(() => {
            this.updateColumnHandles();
          }, 300);
        }
      }
    },
    initResize() {
      if (this.resizeable) {
        setTimeout(() => {
          const table = this.$refs['evocon-table']?.$el;
          if (!table) {
            this.initResize();
            return;
          }
          this.resizeableRef = new ResizeableGrid(table);
          this.resizeableRef.init();
        }, 1000);
      }
    },
    isHidden(row) {
      return this.hiddenRowKeys ? this.hiddenRowKeys.some((key) => row[key]) : false;
    },
    onItemsOrderChange(event) {
      const copy = cloneDeep(event);
      copy.moved.element = copy.moved.element.raw;
      this.$emit('on-items-order-change', copy);
    },
    onColumnClicked(col, event) {
      if (col.notClickable) {
        event.stopPropagation();
      }
    },
    getColumnId(rowIndex, colIndex, item) {
      return `table-data-r-${rowIndex}-c-${colIndex}-key-${this.getHeaderDataKey(item)}-uid-${this.$.uid}`;
    },
    getHeaderDataKey(h) {
      if ('valueKey' in h) return h.valueKey;
      return h.textKey;
    },
    formatText(value, formatFunc, item) {
      return formatFunc ? formatFunc(value, item) : value;
    },
    isElementOverflowing(elem) {
      return elem.scrollWidth > elem.offsetWidth;
    },
    getAdditionalClass(item, col) {
      return this.getColKeyVal(col, 'class', item);
    },
    isLinkCol(item, col, colIndex) {
      return !!this.getColKeyVal(col, 'isLink', item, colIndex);
    },
    isPopUpCol(item, col) {
      return !!this.getColKeyVal(col, 'isPopUp', item);
    },
    isFixedCol(col, colIndex) {
      return !!this.getColKeyVal(col, 'isFixed', colIndex);
    },
    isLastFixedCol(col, colIndex) {
      if (!this.isFixedCol(col, colIndex)) return false;
      const nextIndex = colIndex + 1;
      if (nextIndex >= this.filteredHeaders.length) return true;
      return !this.isFixedCol(this.filteredHeaders[nextIndex], nextIndex);
    },
    isBoldCol(col, colIndex) {
      return !!this.getColKeyVal(col, 'isBold', colIndex);
    },
    isHiddenCol(col) {
      return !!this.getColKeyVal(col, 'isHidden');
    },
    getColSlot(col, isRowExpanded) {
      if (!col.slot) return null;
      return this.getColKeyVal(col, 'slot', col, isRowExpanded);
    },
    isContentExpandColumn(item, col, colIndex) {
      return this.getColKeyVal(col, 'isContentExpandColumn', item, colIndex);
    },
    isClickableCol(item, col, colIndex) {
      return this.isLinkCol(item, col, colIndex)
        || this.isPopUpCol(item, col)
        || this.isContentExpandColumn(item, col, colIndex);
    },
    appendIcon(item, col) {
      return this.getColKeyVal(col, 'appendIcon', item);
    },
    showTooltip(col, value) {
      return this.getColKeyVal(col, 'showTooltip', value);
    },
    getPrependIcon(col, item, internalItems) {
      return this.getColKeyVal(col, 'prependIcon', item, internalItems) || '';
    },
    hasCellAdornment(col, item, internalItems) {
      return !!(
        this.getPrependIcon(col, item, internalItems)
        // appendIcon is always a static string in current column configs — no dynamic resolution needed.
        // appendIconSrc uses getColKeyVal because it can be a function (e.g. AI Insights icon per row).
        || col.appendIcon
        || col.hasOpenLinkBtn
        || this.getColKeyVal(col, 'appendIconSrc', item)
      );
    },
    // Excludes col.hasOpenLinkBtn: open-link buttons sit outside the text flow and don't cause overflow
    shouldTruncateCell(col, item, internalItems) {
      return !!(
        this.getPrependIcon(col, item, internalItems)
        || col.appendIcon
        || this.getColKeyVal(col, 'appendIconSrc', item)
      );
    },
    getPrependIconColor(col, item) {
      return this.getColKeyVal(col, 'prependIconColor', item) || 'secondary-dark';
    },
    onCellMouseEnter(ev, item, col) {
      if ((this.isElementOverflowing(ev.target) && col.type !== 'number') || this.showTooltip(col, item[col.textKey])) {
        this.isTooltipVisible = true;
        this.tooltipAttachId = `#${ev.srcElement.id}`;
        this.tooltipContent = this.formatText(item[col.tooltipTextKey || col.textKey], (col.formatTooltipFn || col.formatFn), item);
      } else {
        this.onCellMouseLeave();
      }
    },
    onCellMouseLeave() {
      this.isTooltipVisible = false;
      this.tooltipAttachId = '';
      this.tooltipContent = '';
    },
    onCellClick(event, item, col, colIndex, rowIndex) {
      if (this.loading) return;
      if (this.isLinkCol(item, col, colIndex) || this.isPopUpCol(item, col, colIndex)) {
        this.onLinkClick(event, item, col);
      }
      if (this.isContentExpandColumn(item, col, colIndex)) {
        this.toggleRowExpand(rowIndex);
      }
    },
    onLinkClick(event, item, col) {
      this.$emit('link-click', item, col);
      event.stopPropagation();
    },
    isRowExpanded(rowIndex) {
      return this.expanded.has(rowIndex);
    },
    toggleRowExpand(rowIndex) {
      if (this.isRowExpanded(rowIndex)) {
        this.expanded.delete(rowIndex);
      } else {
        this.expanded.add(rowIndex);
        this.isTooltipVisible = false;
      }
      this.updateColumnHandles();
    },

    onRowClick(item, rowIndex) {
      if (this.loading) return;
      if (!this.areRowsClickable) return;
      if (!this.rowClickMode) {
        this.$emit('row-click', { item, rowIndex });
      } else if (this.rowClickMode === 'contentExpand') {
        this.toggleRowExpand(rowIndex);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.table-row {
  max-height: 48px !important;
  &.expanded > td {
    height: 80px !important;
    min-height: 80px !important;
  }
  overflow: hidden;
}
.table-cell {
  max-width: 200px;
  min-width: 50px;
  align-content: start !important;
}
.inner-table-cell {
  min-height: 48px;
  align-content: center !important;
}
.numeric-data-cell {
  overflow: hidden;
  font-family: "Roboto Mono", monospace;
}

.footer-cell {
  position: sticky;
  bottom: 0;
  background: white;

  &.fixed-column {
    z-index: 3;
  }
}

.fixed-column {
  position: sticky;
  left: 0;
  z-index: 1;
  background: white;
  &.header-cell {
    z-index: 3 !important;
  }

  &.last-fixed-column {
    border-right: solid 1px rgb(var(--v-theme-quaternary-dark-2));
  }
}

tr#empty-view-row:hover {
  background-color: transparent !important;
}

tr:not(#totals-row, #header-row) {
  &:nth-child(even) {
    background: #f5f5f5;

    .fixed-column {
      background: #f5f5f5;
    }
  }

  &:hover {
    border-right: solid 1px rgb(var(--v-theme-quaternary-dark));
    background: rgb(var(--v-theme-quaternary-dark-2));

    .fixed-column {
      background: rgb(var(--v-theme-quaternary-dark-2));
    }
  }

  td {
    transition: none;
    height: 48px;
  }
}
#header-row {
  th {
    min-height: 30px !important;
    height: 30px !important;
  }
}
#totals-row {
  td {
    min-height: 40px !important;
    height: 40px !important;
  }
}

</style>
