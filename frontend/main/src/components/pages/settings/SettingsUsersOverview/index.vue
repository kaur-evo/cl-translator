<template>
  <settings-entities-overview
    entity-name="user"
    :overview-header="$t('Users')"
    :primary-btn-text="$t('User')"
    :filter-configuration="createFilterConfiguration(visibleUserRoles)"
    :items="tableUsers"
    :table-headers="tableHeaders"
    :loading="isLoading"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import useUserStore from '@/stores/user';
import useProfileStore from '@/stores/profile';
import useFactoryStore from '@/stores/factory';
import useSecurityProfileStore from '@/stores/securityProfile';
import useStationStore from '@/stores/station';
import useFeatureStore from '@/stores/feature';
import { SYS_ADMIN } from '@/constants/userRoles';
import { getPropertyList } from '@/helpers/object-helpers';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/usersFilterBarConf';
import { tableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/usersTableHeadersConf';

export default {
  name: 'SettingsUsersOverview',
  components: {
    SettingsEntitiesOverview,
  },
  computed: {
    ...mapState(useUserStore, ['users', 'isLoading']),
    ...mapState(useProfileStore, { visibleUserRoles: 'visibleUserRolesFormatted', highestRoleAllows: 'highestRoleAllows' }),
    ...mapState(useFactoryStore, ['factoriesMap']),
    ...mapState(useSecurityProfileStore, ['securityProfilesMap']),
    ...mapState(useStationStore, ['stationsMap', 'getOrderedStationNamesArray']),
    ...mapState(useFeatureStore, ['securitySettingsEnabled']),
    securitySettingsAllowed() {
      return this.securitySettingsEnabled && this.highestRoleAllows('securitySettings');
    },
    tableHeaders() {
      return tableHeadersConf(this.securitySettingsAllowed);
    },
    tableUsers() {
      return this.users.reduce((result, user) => {
        if (Object.keys(user.roles).length && !Object.values(user.roles).includes(SYS_ADMIN)) {
          const rolesArray = [...new Set(Object.values(user.roles))].map((role) => this.visibleUserRoles.find((r) => r.id === role)?.name);
          const stationIds = Object.keys(user.allowedStations).map((stationId) => Number(stationId));
          const userObj = {
            ...user,
            id: user.username,
            email: user.email || '-',
            securityProfile: this.securityProfilesMap[user.securityProfileId]?.name || '-',
            userRoles: rolesArray.sort((a, b) => a.localeCompare(b)).join(', '),
            defaultStation: this.stationsMap[user.defaultStationId]?.name || '-',
            factoryNamesArray: user.allowedFactories.indexOf(0) === 0 ? [] : this.getFactoryNamesList(user.allowedFactories).sort((a, b) => a.localeCompare(b)),
            stationNames: user.allowedStations[0] ? this.$t('All') : this.getOrderedStationNamesArray(stationIds, false).join(', '),
          };
          result.push(userObj);
        }
        return result;
      }, []);
    },
  },
  async mounted() {
    await this.fetchUsers();
    this.fetchVisibleRoles();
    if (this.securitySettingsAllowed) await this.fetchSecurityProfiles();
  },
  methods: {
    ...mapActions(useUserStore, ['fetchUsers']),
    ...mapActions(useProfileStore, ['fetchVisibleRoles']),
    ...mapActions(useSecurityProfileStore, ['fetchSecurityProfiles']),
    createFilterConfiguration,
    getFactoryNamesList(factoryIds) {
      return getPropertyList(this.factoriesMap, factoryIds, 'name');
    },
  },
};
</script>
