<template>
  <form-dialog-template :primary-segment-title="`${dialogData.selectedRole ? $t('Edit') : $t('New')}: ${$t('Role')}`">
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSaveClick"
      >
        <v-row>
          <v-col
            cols="12"
            class="px-1 mb-2"
          >
            <selection-input
              :model-value="[formData.role]"
              :items="visibleUserRoles"
              :items-map="visibleUserRolesMap"
              :item-disabled="roleDisabledForSelection"
              :placeholder="$t('Select role')"
              :hint="$t('Role')"
              is-single-select
              hide-search
              @update:model-value="setRole($event[0])"
            />
          </v-col>
          <v-col
            v-if="formData.role && !isCompanyAdmin && orderedWriteAccessFactories.length > 1"
            id="factory-selection"
            cols="12"
            class="px-1"
          >
            <selection-input
              :model-value="formData.factoryIds"
              :hint="multiSelectFactoryEnabled ? $t('Factories') : $t('Factory')"
              :items="orderedWriteAccessFactories"
              :items-map="factoriesMap"
              :placeholder="multiSelectFactoryEnabled ? $t('Factories') : $t('Factory')"
              :is-single-select="!multiSelectFactoryEnabled"
              :item-disabled="factoryDisabledForSelection"
              required
              @update:model-value="setFactoryRoles"
            />
          </v-col>
        </v-row>
        <div
          v-if="stationPermissionsVisible"
          :style="{ 'max-height': permissionsMaxHeight }"
          class="overflow-y-auto px-1"
        >
          <v-list
            v-for="(factory, index) in selectedFactories"
            :key="`f-${index}`"
          >
            <v-list-item class="pl-0 font-weight-medium">
              {{ factory.name }}
            </v-list-item>
            <v-list-item
              v-for="(station, sindex) in factory.stations"
              :key="`s-${sindex}`"
              class="pa-0"
            >
              <v-row
                class="d-flex justify-space-between"
                :class="{ 'flex-column': isMobilePortrait, 'align-center': !isMobilePortrait }"
              >
                <v-col>
                  <evocon-v-checkbox
                    :model-value="isStationAllowed(station.id)"
                    :label="station.name"
                    class="my-0 pt-0 pl-2"
                    hide-details
                    @update:model-value="onStationSelect(station.id)"
                  />
                </v-col>
                <v-col
                  class="ml-4"
                  :class="{ 'ml-10': isMobilePortrait }"
                  cols="auto"
                >
                  <v-chip-group
                    :model-value="allowedStations[station.id]"
                    :mandatory="isStationAllowed(station.id)"
                    row
                    @update:model-value="onStationRightsChange(station.id, $event)"
                  >
                    <evocon-v-chip
                      :value="false"
                      :label="$t('Read-only')"
                      type="primary"
                    />
                    <evocon-v-chip
                      :value="true"
                      :label="$t('Read & Write')"
                      type="primary"
                    />
                  </v-chip-group>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </div>
        <v-row
          v-if="timeRestictionToggleVisible"
          class="px-1"
        >
          <v-col
            ref="timeRestrictionToggle"
            cols="12"
            class="py-4"
          >
            <multi-line-switch
              v-model="lineviewTimeRestrictionEnabled"
              :main-text="$t('Time restriction for changing data')"
              :help-text="$t('How long should the user be allowed to change data?')"
              :class="{ 'pb-1': lineviewTimeRestrictionEnabled }"
            >
              <template #enabled-input>
                <evocon-v-input-with-selector
                  v-model="lineviewTimeRestrictionValue"
                  :items="options"
                  :rules="[timeRestrictionRule]"
                  :selected-item="lineviewTimeRestrictionType"
                  type="number"
                  @selection="lineviewTimeRestrictionType = $event"
                />
              </template>
            </multi-line-switch>
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="onCancelClick()"
      />
      <evocon-v-button
        :text="$t('Apply')"
        type="primary-light"
        :disabled="isBtnDisabled"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { difference, cloneDeep } from 'lodash';

import useGenericDialogStore from '@/stores/genericDialog';
import useProfileStore from '@/stores/profile';
import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useDeviceStore from '@/stores/device';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import {
  COMPANY_ADMIN, FACTORY_ADMIN, LINEVIEW_USER, OFFICE_USER,
} from '@/constants/userRoles';
import { DAYS, SHIFTS } from '@/constants/shiftViewTimeRestrictionTypes';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVInputWithSelector from '@/components/atoms/EvoconVInputWithSelector/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

export default {
  name: 'SettingsUserRightsEditForm',
  components: {
    FormDialogTemplate,
    EvoconVCheckbox,
    MultiLineSwitch,
    EvoconVChip,
    SelectionInput,
    EvoconVInputWithSelector,
    EvoconVButton,
  },
  data() {
    return {
      valid: true,
      lineviewTimeRestrictionValue: 0,
      lineviewTimeRestrictionType: DAYS,
      lineviewTimeRestrictionEnabled: false,
      permissionsMaxHeight: '400px',
      formData: {
        role: null,
        factoryIds: [],
      },
      allowedStations: {},
      roles: {},
    };
  },
  computed: {
    ...mapState(useProfileStore, { visibleUserRoles: 'visibleUserRolesFormatted', visibleUserRolesMap: 'visibleUserRolesMap' }),
    ...mapState(useFactoryStore, ['factoriesMap', 'orderedWriteAccessFactories', 'hasMultipleAdminFactories']),
    ...mapState(useStationStore, ['stationsWithAdminPermissions']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView', 'isMobilePortrait', 'screenWidth']),
    ...mapState(useGenericDialogStore, ['dialogData']),
    isCompanyAdmin() {
      return this.formData.role && this.formData.role === COMPANY_ADMIN;
    },
    isFactoryAdmin() {
      return this.formData.role && this.formData.role === FACTORY_ADMIN;
    },
    isLineViewUser() {
      return this.formData.role && this.formData.role === LINEVIEW_USER;
    },
    isOfficeUser() {
      return this.formData.role && this.formData.role === OFFICE_USER;
    },
    multiSelectFactoryEnabled() {
      return !this.isLineViewUser && this.hasMultipleAdminFactories;
    },
    stationPermissionsVisible() {
      const roleHasStationPermissions = this.isLineViewUser || this.isOfficeUser;
      const factorySelected = this.formData.factoryIds.length > 0;
      return roleHasStationPermissions && factorySelected;
    },
    selectedFactories() {
      if (this.hasMultipleAdminFactories) return this.orderedWriteAccessFactories.filter((factory) => this.formData.factoryIds.includes(factory.id));
      return { 0: { name: this.$t('Stations'), stations: this.stationsWithAdminPermissions } };
    },
    isBtnDisabled() {
      if (!this.formData.role) return true;
      const stationsRequired = this.isOfficeUser || this.isLineViewUser;
      return stationsRequired && !Object.values(this.allowedStations).length;
    },
    timeRestictionToggleVisible() {
      const roleHasToggle = this.isOfficeUser || this.isLineViewUser;
      const factorySelected = this.formData.factoryIds.length > 0;
      const hasWriteAccess = Object.values(this.allowedStations).some((value) => !!value);
      return roleHasToggle && factorySelected && hasWriteAccess;
    },
    hasAnotherRole() {
      const existingRolesSet = new Set(Object.values(this.dialogData.roles));
      const multipleRolesExisting = existingRolesSet.size > 1;
      const isSecondRoleAdding = !this.dialogData.selectedRole && existingRolesSet.size !== 0;
      return multipleRolesExisting || isSecondRoleAdding;
    },
    options() {
      return [{
        id: DAYS,
        name: this.$t('Days').toLowerCase(),
      }, {
        id: SHIFTS,
        name: this.$t('Shifts').toLowerCase(),
      }];
    },
  },
  watch: {
    timeRestictionToggleVisible(val) {
      if (!val && (this.isOfficeUser || this.isLineViewUser)) this.lineviewTimeRestrictionValue = 0;
    },
    screenWidth() {
      window.setTimeout(() => {
        this.getPermissionsMaxHeight();
      }, 300);
    },
  },
  mounted() {
    this.allowedStations = { ...this.dialogData.allowedStations };
    this.roles = { ...this.dialogData.roles };
    if (this.dialogData.selectedRole) this.formData = cloneDeep(this.dialogData.selectedRole);
    this.lineviewTimeRestrictionType = this.dialogData.lineviewTimeRestrictionType || DAYS;
    this.lineviewTimeRestrictionValue = this.dialogData.lineviewTimeRestrictionValue;
    this.lineviewTimeRestrictionEnabled = !!this.lineviewTimeRestrictionValue;
    window.setTimeout(() => {
      this.getPermissionsMaxHeight();
    }, 300);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    getPermissionsMaxHeight() {
      if (this.showFullscreenDialogs) {
        const dialogHeight = this.$vuetify.display.height;
        const headerHeight = 64;
        // eslint-disable-next-line no-magic-numbers
        const selections = this.isMobileView ? 132 : 164;
        const timeRestrictionToggleHeight = this.timeRestictionToggleVisible ? this.$refs.timeRestrictionToggle?.$el?.getBoundingClientRect()?.height : 0;
        const actionsHeight = 60;
        const paddings = 4;
        this.permissionsMaxHeight = `${dialogHeight - headerHeight - selections - timeRestrictionToggleHeight - actionsHeight - paddings}px`;
      } else this.permissionsMaxHeight = '400px';
    },
    timeRestrictionRule(v) {
      if (this.lineviewTimeRestrictionType === DAYS) return true;
      const maxTimeRestriction = 30;
      return v <= maxTimeRestriction || this.$t('Maximum value');
    },
    deleteRemovedRolesAndStations(oldArr, newArr) {
      const removedFactoryIds = difference(newArr, oldArr);
      if (this.isOfficeUser || this.isLineViewUser) {
        delete this.allowedStations[0];
      }
      removedFactoryIds.forEach((factoryId) => {
        if (factoryId === 0) {
          delete this.allowedStations[0];
        } else {
          this.factoriesMap[factoryId].stations.forEach((station) => {
            delete this.allowedStations[station.id];
          });
        }
        delete this.roles[factoryId];
      });
    },
    isStationAllowed(id) {
      return this.allowedStations && id in this.allowedStations;
    },
    factoryDisabledForSelection(factory) {
      const currentlySelected = this.formData.factoryIds.includes(factory.id);
      const otherSelectedFactories = Object.keys(this.roles).filter((fid) => !this.formData.factoryIds.includes(String(fid)));
      const selectedByAnotherRole = otherSelectedFactories.includes(String(factory.id));
      return !currentlySelected && selectedByAnotherRole;
    },
    roleDisabledForSelection(role) {
      const roleId = role.id;
      const currentlySelected = roleId === this.formData.role;
      const otherSelectedRoles = Object.values(this.roles).filter((r) => !this.formData.role || r !== this.formData.role);
      const singleAllowedRoles = [COMPANY_ADMIN, LINEVIEW_USER];
      const hasSingleAllowedRoleSelected = otherSelectedRoles.some((r) => singleAllowedRoles.includes(r));
      const disableSingleAllowed = otherSelectedRoles.length > 0 && singleAllowedRoles.includes(roleId);
      const roleInUse = otherSelectedRoles.includes(roleId);

      return !currentlySelected && (disableSingleAllowed || hasSingleAllowedRoleSelected || roleInUse);
    },
    onStationSelect(stationId) {
      if (!this.allowedStations) this.allowedStations = {};
      if (stationId in this.allowedStations) {
        delete this.allowedStations[stationId];
      } else {
        this.allowedStations[stationId] = this.isLineViewUser;
      }
    },
    onStationRightsChange(stationId, val) {
      this.allowedStations[stationId] = val;
    },
    setFactoryRoles(factoryIds) {
      const prevValue = [...this.formData.factoryIds];
      this.formData.factoryIds = factoryIds;

      factoryIds.forEach((id) => (this.roles[id] = this.formData.role));
      this.setDefaultStationRights(factoryIds, prevValue);
      this.deleteRemovedRolesAndStations(factoryIds, prevValue);
    },
    setRole(role) {
      this.formData.role = role;
      if (this.isCompanyAdmin) {
        this.setFactoryRoles([0]);
      } else if (!this.hasMultipleAdminFactories) {
        const factoryId = this.orderedWriteAccessFactories[0].id;
        this.setFactoryRoles([factoryId]);
      } else if (!this.hasAnotherRole) {
        this.roles = {};
        this.formData.factoryIds = [];
      }
    },
    setDefaultStationRights(factoryIds, prevVal) {
      if (this.isOfficeUser) { // default read only access to all stations
        if (!factoryIds && !prevVal) {
          this.stationsWithAdminPermissions.forEach((station) => this.allowedStations[station.id] = false);
        } else {
          const addedFactoryIds = difference(factoryIds, prevVal);
          addedFactoryIds.forEach((id) => {
            const stations = id === 0 ? this.stationsWithAdminPermissions : this.factoriesMap[id].stations;

            stations.forEach((station) => this.allowedStations[station.id] = false);
          });
        }
      } else if (this.isCompanyAdmin || (this.isFactoryAdmin && !this.hasAnotherRole)) {
        this.allowedStations = { 0: true };
        this.lineviewTimeRestrictionValue = 0;
      } else if (this.isLineViewUser) {
        this.allowedStations = {};
      }
    },
    async validate() {
      this.$refs.form.validate();
    },
    async onSaveClick() {
      await this.validate();
      if (this.valid) {
        const { roles, allowedStations } = this;
        if (!this.lineviewTimeRestrictionEnabled && this.lineviewTimeRestrictionValue > 0) this.lineviewTimeRestrictionValue = 0; // if time restriction is disabled, set default value
        this.dialogData.action({
          roles,
          allowedStations,
          lineviewTimeRestrictionValue: this.lineviewTimeRestrictionValue,
          lineviewTimeRestrictionType: this.lineviewTimeRestrictionType,
        });
        this.closeDialog();
      }
    },
    onCancelClick() {
      this.closeDialog();
    },
  },
};
</script>
