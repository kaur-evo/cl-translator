<template>
  <v-row>
    <v-col
      cols="12"
      class="px-1"
    >
      <v-progress-linear
        v-if="loading"
        indeterminate
        class="mt-n1"
      />
      <tiny-cards-list
        :items="userRoles"
        title-text-key="roleText"
        :card-buttons="rolesCardButtons"
      />
    </v-col>
    <v-col
      cols="12"
      class="px-1 mt-2"
    >
      <evocon-v-button
        v-if="!isAddRoleBtnHidden"
        :text="$t('Role')"
        type="primary-light"
        :icon="mdiPlus"
        class="mb-4"
        @click="onAdd"
      />
    </v-col>
  </v-row>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiDelete, mdiPencil, mdiPlus } from '@mdi/js';
import uniq from 'lodash/uniq';
import { defineAsyncComponent } from 'vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useFactoryStore from '@/stores/factory';
import { DAYS } from '@/constants/shiftViewTimeRestrictionTypes';
import userRoles, { COMPANY_ADMIN, LINEVIEW_USER, getRoleTranslation } from '@/constants/userRoles';
import TinyCardsList from '@/components/molecules/TinyCardsList/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = { mdiPlus };
export default {
  name: 'SettingsUserRightsSection',
  components: {
    TinyCardsList,
    EvoconVButton,
  },
  props: {
    roles: {
      type: Object,
      default: () => {},
    },
    allowedStations: {
      type: Object,
      default: () => {},
    },
    lineviewTimeRestrictionValue: {
      type: Number,
      default: 0,
    },
    lineviewTimeRestrictionType: {
      type: String,
      default: DAYS,
    },
  },
  emits: ['update:roles', 'update:allowed-stations', 'update:lineview-time-restriction-value', 'update:lineview-time-restriction-type', 'update:visible-lineview-days'],
  data() {
    return {
      ...vectorIcons,
      loading: false,
    };
  },
  computed: {
    ...mapState(useFactoryStore, ['factories']),
    userRoles() {
      return uniq(Object.values(this.roles)).map((role) => ({
        role,
        roleText: getRoleTranslation(role),
        factoryIds: Object.keys(this.roles).reduce((res, key) => {
          if (this.roles[key] === role) res.push(Number(key));
          return res;
        }, []),
      }));
    },
    isAddRoleBtnHidden() {
      const roles = Object.values(this.roles);
      const oneAllowedRoleExists = roles.some((role) => [COMPANY_ADMIN, LINEVIEW_USER].includes(role));
      const factoryCount = this?.factories?.length || 1;
      const allFactoriesUsed = factoryCount === roles.length;
      const maxRolesUsed = uniq(roles).length > 1;
      return oneAllowedRoleExists || allFactoriesUsed || maxRolesUsed;
    },
    rolesCardButtons() {
      return [
        {
          icon: mdiPencil,
          text: this.$t('Edit'),
          tooltip: this.$t('Edit'),
          action: (props) => this.onEdit(props),
        },
        {
          icon: mdiDelete,
          text: this.$t('Delete'),
          tooltip: this.$t('Delete'),
          action: (props) => this.onDelete(props),
        },
      ];
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    onAdd() {
      this.openUserRightsDialog();
    },
    onEdit({ item }) {
      this.openUserRightsDialog({ selectedRole: item });
    },
    onDelete({ item }) {
      const rolesClone = { ...this.roles };
      item.factoryIds.forEach((id) => {
        delete rolesClone[id];
      });
      this.$emit('update:roles', rolesClone);
      if (item.role === userRoles.OFFICE_USER || item.role === userRoles.LINEVIEW_USER) {
        this.$emit('update:visible-lineview-days', 0);
        this.$emit('update:allowed-stations', {});
      }
    },
    openUserRightsDialog({ selectedRole } = { selectedRole: null }) {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../SettingsUserRightsEditForm/index.vue')),
        allowFullscreen: true,
        width: 715,
        data: {
          action: ({
            allowedStations, roles, lineviewTimeRestrictionValue, lineviewTimeRestrictionType,
          }) => {
            this.onUserRightsChange({
              allowedStations, roles, lineviewTimeRestrictionValue, lineviewTimeRestrictionType,
            });
          },
          roles: this.roles,
          allowedStations: this.allowedStations,
          lineviewTimeRestrictionValue: this.lineviewTimeRestrictionValue,
          lineviewTimeRestrictionType: this.lineviewTimeRestrictionType,
          selectedRole,
        },
      };
      this.openDialog(dialogConfig);
    },
    onUserRightsChange({
      allowedStations, roles, lineviewTimeRestrictionValue, lineviewTimeRestrictionType,
    }) {
      this.$emit('update:allowed-stations', allowedStations);
      this.$emit('update:roles', roles);
      this.$emit('update:lineview-time-restriction-value', Number(lineviewTimeRestrictionValue));
      this.$emit('update:lineview-time-restriction-type', lineviewTimeRestrictionType);
    },
  },
};
</script>
