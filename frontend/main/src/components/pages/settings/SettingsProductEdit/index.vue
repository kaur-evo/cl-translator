<template>
  <removed-entity-view v-if="isRemovedProduct" />
  <form-page-template
    v-else-if="!isFakeDuplicating"
    id="product-form-page"
    :primary-segment-title="cardTitle"
    :secondary-segment-title="$t('Where is this produced?')"
    :secondary-segment-subtitle="$t('Please add station-specific details')"
    :is-loading="isLoading"
  >
    <template #primary-segment>
      <station-difference-notification :stations-to-be-removed="stationsToBeRemoved" />
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSave"
      >
        <v-row>
          <v-col
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              ref="productName"
              v-model.trim="formData.name"
              :placeholder="$t('Name')"
              :rules="[nameRule]"
              required
              validate-on-blur
              max-length="200"
              autofocus
              :hint="$t('Product name')"
              :disabled="editForbidden"
              @input="onProductNameInput"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <selection-input
              :model-value="[formData.groupId]"
              :placeholder="$t('Product group')"
              :items="filteredGroups"
              :items-map="productGroupsMap"
              :disabled="editForbidden"
              :hint="$t('Product group')"
              is-single-select
              required
              @update:model-value="formData.groupId = $event[0]"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              ref="skuField"
              v-model.trim="formData.sku"
              :placeholder="product.skuGenerated ? product.sku : formData.name || $t('Product code')"
              validate-on-blur
              max-length="200"
              :hint="$t('Product code')"
              :disabled="editForbidden"
              :error="skuError"
              @input="onSkuInput"
            >
              <template #append-inner>
                <icon-with-tooltip
                  :icon="mdiInformationOutline"
                  :tooltip-text="$t('Learn more')"
                  :color="skuError ? 'red' : ''"
                  :icon-clicked-fn="onSkuInfoClick"
                />
              </template>
            </evocon-v-input>
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-combobox
              v-model.trim="formData.unitId"
              v-model:menu="primaryUnitMenuState"
              :hint="`${$t('Primary unit')} - ${$t('E.g. pcs, kg, litre')}`"
              :placeholder="$t('Primary unit')"
              :rules="[unitRule]"
              max-length="5"
              required
              :position-top="true"
              item-title="name"
              item-value="name"
              :items="primaryUnitSuggestions"
              :disabled="editForbidden"
              validate-on-blur
            >
              <template #item="{ internalItem }">
                <v-list-item @click="onPrimaryUnitSelected(internalItem.value)">
                  <list-item-contents
                    :primary-text="internalItem.title"
                    :secondary-text="$t('{count} products', { count: internalItem.raw.usageCount })"
                    :primary-highlight="formData.unitId"
                    :dense="true"
                  />
                </v-list-item>
              </template>
            </evocon-v-combobox>
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-combobox
              id="alternative-unit-field"
              v-model.trim="formData.alternativeUnitId"
              v-model:menu="alternativeUnitMenuState"
              :hint="`${$t('Alternative unit')} - ${$t('E.g. box, reel')} (${$t('Optional')})`"
              :placeholder="$t('Alternative unit')"
              :rules="[altUnitRule]"
              max-length="5"
              required
              :position-top="true"
              item-title="name"
              item-value="name"
              :items="alternativeUnitSuggestions"
              :disabled="editForbidden"
              validate-on-blur
            >
              <template #item="{ internalItem }">
                <v-list-item @click="onAlternativeUnitSelected(internalItem.value)">
                  <list-item-contents
                    :primary-text="internalItem.title"
                    :secondary-text="$t('{count} products', { count: internalItem.raw.usageCount })"
                    :primary-highlight="formData.alternativeUnitId"
                    :dense="true"
                  />
                </v-list-item>
              </template>
            </evocon-v-combobox>
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #secondary-segment>
      <v-row>
        <v-col
          cols="12"
          class="px-1"
        >
          <tiny-cards-list
            :items="routesFormData.filter((route) => !stationsToBeRemoved.includes(route.stationId))"
            use-slot
          >
            <template #card="props">
              <list-card
                :title="getStationName(props.item)"
                :icon="mdiMonitor"
                :subtitle-key-value-pairs="[{ key: $t('Target speed'), value: getRouteSubtitle(props.item) }]"
                :card-buttons="stationCardButtons"
                :button-params="props"
              />
            </template>
          </tiny-cards-list>
        </v-col>
        <v-col
          cols="12"
          class="px-1 mt-2"
        >
          <evocon-v-button
            :text="$t('station')"
            :icon="mdiPlus"
            :disabled="!hasAvailableStations"
            type="primary-light"
            @click="openRouteDialog()"
          />
        </v-col>
      </v-row>
    </template>
    <template #actions>
      <delete-button
        v-if="isEdit && !editForbidden"
        @click="onDelete"
      />
      <v-tooltip
        v-if="isEdit && !editForbidden"
        location="top"
      >
        <template #activator="{ props }">
          <evocon-v-button
            id="copy-btn"
            :icon="mdiContentDuplicate"
            v-bind="props"
            @click="onCopyClick()"
          />
        </template>
        <span>{{ $t('Duplicate') }}</span>
      </v-tooltip>
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="onCancel"
      />
      <evocon-v-button
        :text="$t('Save')"
        color="primary"
        :loading="isLoading"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiPlus, mdiMonitor, mdiContentDuplicate, mdiDelete, mdiInformationOutline, mdiPencil,
} from '@mdi/js';
import { defineAsyncComponent } from 'vue';

import useProductStore from '@/stores/product';
import useStationStore from '@/stores/station';
import useProfileStore from '@/stores/profile';
import useFactoryStore from '@/stores/factory';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericDialogStore from '@/stores/genericDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import ListCard from '@/components/molecules/ListCard/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import TinyCardsList from '@/components/molecules/TinyCardsList/index.vue';
import routesApi from '@/api/routesApi';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import StationDifferenceNotification from '@/components/organisms/settings/StationDifferenceNotification/index.vue';
import { eventBus } from '@/eventBus';
import EvoconVCombobox from '@/components/atoms/EvoconVCombobox/index.vue';
import productApi from '@/api/productApi';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';

const vectorIcons = {
  mdiPlus, mdiMonitor, mdiContentDuplicate, mdiInformationOutline,
};
export default {
  name: 'SettingsProductEdit',
  components: {
    FormPageTemplate,
    TinyCardsList,
    EvoconVInput,
    EvoconVButton,
    DeleteButton,
    SelectionInput,
    ListCard,
    StationDifferenceNotification,
    IconWithTooltip,
    EvoconVCombobox,
    ListItemContents,
    RemovedEntityView,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const { itemGroupId } = to.query;
      if (itemGroupId && !to.params.id) {
        // default to group we entered from
        // eslint-disable-next-line no-param-reassign
        vm.formData.groupId = Number(itemGroupId);
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedRoutes) {
      this.promptSavingRouteChanges(to.fullPath);
    } else {
      next();
    }
  },
  data() {
    return {
      ...vectorIcons,
      valid: true,
      formData: {
        id: undefined,
        name: '',
        groupId: null,
        unitId: null,
        sku: '',
        alternativeUnitId: null,
      },
      routesFormData: [],
      hasUnsavedRoutes: false,
      isDuplicate: false,
      isFakeDuplicating: false,
      skuError: false,
      primaryUnitSuggestions: [],
      primaryUnitMenuState: false,
      alternativeUnitSuggestions: [],
      alternativeUnitMenuState: false,
    };
  },
  computed: {
    ...mapState(useProductStore, ['isLoading', 'productGroups', 'productGroupsWithAdminPermissions', 'productsMap', 'productGroupsMap']),
    ...mapState(useStationStore, ['stationsMap', 'getStationDifference', 'stationsWithAdminPermissions']),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    ...mapState(useFactoryStore, ['factoriesWithWriteAccess']),
    productId() {
      return this.$route.params.id ? String(this.$route.params.id) : '';
    },
    product() {
      return this.productsMap[this.productId] ? this.productsMap[this.productId] : { name: '' };
    },
    cardTitle() {
      if (this.productId) return this.product.name;
      if (this.isDuplicate) return this.formData.name;
      return `${this.$t('New')}: ${this.$t('Product')}`;
    },
    isEdit() {
      return !!this.productId;
    },
    nameRule() {
      return !!this.formData.name || this.$t('Product name');
    },
    unitRule() {
      return !!this.formData.unitId || `${this.$t('Primary unit')} - ${this.$t('E.g. pcs, kg, litre')}`;
    },
    altUnitRule() {
      return !this.formData.alternativeUnitId
        || this.formData.alternativeUnitId?.toLowerCase?.() !== this.formData.unitId?.toLowerCase?.()
        || `${this.$t('Alternative unit')} - ${this.$t('E.g. box, reel')} (${this.$t('Optional')})`;
    },
    canEditGlobalGroup() {
      return this.highestRoleAllows('editGlobalGroup');
    },
    isGlobalGroupSelected() {
      return this.formData.groupId && this.productGroupsMap[this.formData.groupId]?.local === false;
    },
    editForbidden() {
      return this.isEdit && this.isGlobalGroupSelected && !this.canEditGlobalGroup;
    },
    filteredGroups() {
      if (this.canEditGlobalGroup) return this.productGroupsWithAdminPermissions; // can see and select all groups
      // can only see and select local groups or the group of the product being edited
      return this.productGroupsWithAdminPermissions.filter((g) => g.local || (this.isEdit && g.id === this.formData.groupId));
    },
    stationsToBeRemoved() {
      if (!this.isEdit || !this.product.groupId) return [];
      return this.getStationDifference(this.productGroupsMap[this.product.groupId], this.productGroupsMap[this.formData.groupId], this.product.stationIds);
    },
    stationCardButtons() {
      return [
        {
          icon: mdiPencil,
          text: this.$t('Edit'),
          tooltip: this.$t('Edit'),
          action: (props) => this.openRouteDialog(props),
        },
        {
          icon: mdiContentDuplicate,
          text: this.$t('Duplicate'),
          tooltip: this.$t('Duplicate'),
          action: (props) => this.onRouteDuplicate(props),
        },
        {
          icon: mdiDelete,
          text: this.$t('Delete'),
          tooltip: this.$t('Delete'),
          action: (props) => this.onRouteDelete(props),
        },
      ];
    },
    filteredStations() {
      const selectedGroup = this.productGroupsMap[this.formData.groupId];
      if (!selectedGroup || !selectedGroup.local) return this.stationsWithAdminPermissions;
      return this.stationsWithAdminPermissions.filter((station) => selectedGroup.factoryIds.includes(station.factoryId));
    },
    hasAvailableStations() {
      return !!this.filteredStations.find((station) => !this.routesFormData.find((route) => route.stationId === station.id));
    },
    primaryUnit() {
      return this.formData.unitId;
    },
    alternativeUnit() {
      return this.formData.alternativeUnitId;
    },
    isRemovedProduct() {
      const productExists = this.productsMap[this.productId] && !this.productsMap[this.productId].deleted;
      return !this.isLoading && this.isEdit && !productExists;
    },
  },
  watch: {
    productId(newVal, oldVal) {
      if (newVal !== oldVal) this.setProductEditView(this.productId);
    },
    async primaryUnit(primaryUnitValue) {
      this.setPrimaryUnitSuggestions(primaryUnitValue);
    },
    async alternativeUnit(alternativeUnitValue) {
      this.setAlternativeUnitSuggestions(alternativeUnitValue);
    },
  },
  async mounted() {
    if (!this.productGroups.length) await this.fetchProductGroups();
    this.setProductEditView(this.productId);
  },
  methods: {
    ...mapActions(useProductStore, ['saveProduct', 'deleteProduct', 'fetchProductGroups', 'getProduct']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    async setProductEditView(productId) {
      if (this.isDuplicate) return;
      if (productId) {
        const product = await this.getProduct(productId);
        this.setFormData(product);
      } else if (this.$route.params.groupId) {
        this.formData.groupId = this.$route.params.groupId;
        this.formData.alternativeUnitId = '';
        this.formData.unitId = '';
      } else {
        this.formData.alternativeUnitId = '';
        this.formData.unitId = '';
      }
    },
    async setFormData(product) {
      this.routesFormData = await routesApi.getRoutes({ productId: this.productId, factoryId: this.factoriesWithWriteAccess.map((f) => f.id) });
      this.formData = { ...product };
      if (product?.skuGenerated) this.formData.sku = null;
      if (this.$route.query?.routeStationId) {
        const route = this.routesFormData.find((r) => r.stationId === Number(this.$route.query.routeStationId));
        if (route) {
          await this.$nextTick();
          this.openRouteDialog({ item: route });
        }
      }
    },
    async onSave() {
      await this.$refs.form.validate();
      if (!this.valid) return;
      await this.removeOutdatedProductRoutes();
      if (this.routesFormData.length === 0) {
        this.openConfirmDialog({
          title: this.$t('Confirmation'),
          text: this.$t('You are about to save the product without any station connections. Are you sure?'),
          action: () => { // save without routes
            this.saveProductWithRoutes();
          },
          closeAction: async () => { // open route dialog
            this.openRouteDialog();
          },
          confirmText: this.$t('Save'),
          cancelText: this.$t('station'),
          color: 'primary',
          secondaryButtonType: 'primary',
          secondaryColor: 'quaternary-dark',
          secondaryIcon: mdiPlus,
        });
      } else {
        this.saveProductWithRoutes();
      }
    },
    async saveProductWithRoutes(navigateToOverview = true) {
      const productResult = await this.saveProduct(this.formData);
      if (productResult?.name === 'AxiosError' && productResult.response?.data?.type === 'duplicate') {
        this.skuError = true;
        this.notifyError(this.$t('Product with the same code already exists'));
      } else {
        if (!this.isEdit && productResult && productResult.id) {
          await this.saveProductRoutes(productResult);
          this.hasUnsavedRoutes = false;
        }
        eventBus.$emit('product-save-complete', productResult, this.isEdit);
        if (navigateToOverview) this.goBackToOverview();
      }
    },
    onCancel() {
      this.goBackToOverview();
    },
    onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.formData.name }),
        action: async () => {
          await this.deleteProduct(this.formData);
          this.goBackToOverview();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    goBackToOverview() {
      this.$router.push({
        name: 'productOverview',
        query: this.$route.query ? { ...this.$route.query } : {},
      });
    },
    onRouteDelete({ item, index }) {
      if (this.isEdit) {
        this.openConfirmDialog({
          title: this.$t('Confirmation'),
          text: this.$t('Are you sure you want to delete the connection to this station ({stationName})?', { stationName: this.getStationName(item) }),
          action: () => this.onConfirmDeleteRoute(item, index),
          confirmText: this.$t('Delete'),
          cancelText: this.$t('Cancel'),
        });
      } else {
        this.routesFormData.splice(index, 1);
      }
    },
    async onConfirmDeleteRoute(item, index) {
      try {
        await routesApi.deleteRoute(item.id);
        this.notifySuccess(this.$t('Deleted'));
        this.routesFormData.splice(index, 1);
      } catch (err) {
        this.notifyError(err.response.data.message || this.$t('We are sorry! There is a problem with your request'));
      }
    },
    getStationName(item) {
      return this.stationsMap[item.stationId]?.name;
    },
    getRouteSubtitle(route) {
      const unitIdx = route.runTimeType === 'SECOND_PER_UNIT' ? 1 : 0;
      const parts = this.$t(route.runTimeType.replace('UNIT', '{unit}')).split('/');
      parts[unitIdx] = this.formData.unitId;
      let res = `${formatNumber(route.runTime, { decimalPlaces: null })} ${parts.join('/')}`;
      if (this.formData.alternativeUnitId && route.unitConversion) {
        const alternativeUnitParts = [...parts];
        alternativeUnitParts[unitIdx] = this.formData.alternativeUnitId;
        res += ` (${this.getAlternativeConversionValue(route)} ${alternativeUnitParts.join('/')})`;
      }
      return res;
    },
    async saveProductRoutes(product) {
      const promises = this.routesFormData.map((route) => {
        const routeCopy = { ...route, productId: product.id, id: null };
        return this.saveRoute(routeCopy);
      });
      await Promise.all(promises);
    },
    removeOutdatedProductRoutes() {
      this.routesFormData.forEach((route) => {
        if (this.stationsToBeRemoved.includes(route.stationId)) {
          routesApi.deleteRoute(route.id);
        }
      });
    },
    async openRouteDialog(route) {
      await this.$refs.form.validate();
      if (!this.valid || !this.formData.groupId) return;

      const dialogConfig = {
        component: defineAsyncComponent(() => import('../../../organisms/settings/SettingsRouteEditForm/index.vue')),

        data: {
          action: (item) => this.updateRoute(item, (route && route.index)),
          onDelete: (item) => this.onRouteDelete({ item, index: route.index }),
          isEdit: this.isEdit,
          route,
          filteredStations: this.filteredStations,
          disabledStations: this.routesFormData.map((el) => el.stationId),
          unit: this.formData.unitId,
          alternativeUnit: this.formData.alternativeUnitId || null,
          group: this.productGroupsMap[this.formData.groupId],
        },
        width: 1000,
      };
      this.openDialog(dialogConfig);
    },
    async updateRoute(item, index) {
      if (this.isEdit) {
        try {
          const newRoute = await this.saveRoute({ ...item, productId: this.formData.id });
          this.notifySuccess(this.$t('The changes will take effect after the next changeover'));
          this.updateRouteInList(newRoute, index);
        } catch (err) {
          this.notifyError(err.response.data.message);
        }
      } else {
        this.updateRouteInList(item, index);
        this.hasUnsavedRoutes = true;
      }
    },
    updateRouteInList(item, index) {
      if (!index && index !== 0) this.routesFormData.push(item);
      else this.routesFormData[index] = item;
    },
    promptSavingRouteChanges(navigateToPath) {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('You are about to exit without saving changes. Do you want to save changes?'),
        action: async () => {
          await this.onSave(false);
          this.$router.push({ path: navigateToPath });
        },
        closeAction: () => {
          this.hasUnsavedRoutes = false;
          this.$router.push({ path: navigateToPath });
        },
        confirmText: this.$t('Save'),
        cancelText: this.$t('Don\'t save'),
        color: 'primary',
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    getAlternativeConversionValue(route) {
      if ((route.unitConversionType === 'ALT_TO_PRIMARY' && route.runTimeType === 'SECOND_PER_UNIT') || (route.unitConversionType === 'PRIMARY_TO_ALT' && route.runTimeType !== 'SECOND_PER_UNIT')) {
        return formatNumber(route.runTime / route.unitConversion, { decimalPlaces: null });
      }
      return formatNumber(route.runTime * route.unitConversion, { decimalPlaces: null });
    },
    onCopyClick() {
      this.$router.push({ name: 'productEdit', params: { ...this.$route.params, id: null }, query: { ...this.$route.query } });
      this.isDuplicate = true;
      this.isFakeDuplicating = true;

      this.formData.id = undefined;
      this.formData.name = `${this.$t('Copy of')} ${this.formData.name}`.substring(0, 200);
      this.formData.sku = null;
      if (!this.canEditGlobalGroup && this.isGlobalGroupSelected) {
        this.formData.groupId = null;
      }

      setTimeout(() => {
        this.isFakeDuplicating = false;
      }, 200);
    },
    async saveRoute(route) {
      let savedRoute;
      if (route.id) {
        savedRoute = await routesApi.putRoute(route);
      } else {
        savedRoute = await routesApi.postRoute(route);
      }
      return savedRoute;
    },
    onRouteDuplicate({ item }) {
      this.openRouteDialog({ item: { ...item, id: null, stationId: null } });
    },
    onSkuInput() {
      this.skuError = false;
    },
    onProductNameInput() {
      this.skuError = false;
    },
    onSkuInfoClick() {
      window.open(' https://support.evocon.com/Adding-and-managing-products-28671dfc634a4e5caa68cf96ece476fd#576a14e0d8e24e468e6e2ba335e8f3f1 ', '_blank');
    },
    async setPrimaryUnitSuggestions(searchTerm) {
      this.primaryUnitSuggestions = await this.fetchPrimaryUnitIds(searchTerm);
    },
    async setAlternativeUnitSuggestions(searchTerm) {
      this.alternativeUnitSuggestions = await this.fetchAlternativeUnitIds(searchTerm);
    },
    fetchPrimaryUnitIds(term) {
      return productApi.getUnitIds({ term, limit: 5, isAlternative: false });
    },
    fetchAlternativeUnitIds(term) {
      return productApi.getUnitIds({ term, limit: 5, isAlternative: true });
    },
    async onPrimaryUnitSelected(unit) {
      this.formData.unitId = unit;
      await this.$nextTick();
      this.primaryUnitMenuState = false;
    },
    async onAlternativeUnitSelected(unit) {
      this.formData.alternativeUnitId = unit;
      await this.$nextTick();
      this.alternativeUnitMenuState = false;
    },
  },
};
</script>
