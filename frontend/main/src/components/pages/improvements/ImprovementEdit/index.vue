<template>
  <div
    v-if="$route.name === 'improvementEdit' || $route.name === 'newImprovementProject'"
    class="py-10 fill-height bg-quaternary-dark"
  >
    <v-container class="fill-height d-flex flex-wrap justify-center align-center">
      <v-card class="improvement-card-container pa-6 pt-0">
        <div
          class="improvement-information d-flex flex-column justify-center align-center"
        >
          <div class="text-headline-small font-weight-medium">
            {{ $t("Improvement") }}
          </div>
          <div class="text-body-medium text-medium-emphasis font-weight-regular">
            {{ $t("Define basic information about the improvement") }}
          </div>
        </div>
        <v-row>
          <v-col
            v-if="hasMultipleFactories"
            class="pr-4 pb-2"
          >
            <selection-input
              :model-value="[formData.factoryId]"
              :items="factories"
              :items-map="factoriesMap"
              :placeholder="$t('Factory')"
              :hint="$t('Factory')"
              :rules="[factoryRule]"
              is-single-select
              required
              @update:model-value="onFactoryChange($event[0])"
            />
          </v-col>
          <v-col class="pb-2">
            <selection-input
              v-model="formData.stationIds"
              :items="computedStations"
              :items-map="stationsMap"
              :placeholder="$t('Stations')"
              :hint="$t('Stations')"
              :disabled="hasMultipleFactories && !formData.factoryId"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <evocon-v-input
              v-model="formData.name"
              :hint="$t('Improvement name')"
              :placeholder="$t('Improvement name')"
              :rules="[
                (v) => !!v || $t('Improvement name'),
                (v) => !v || !!v && v.length <= 50 || $t('Improvement name'),
              ]"
              max-length="50"
              required
            />
          </v-col>
          <v-col
            id="start-date-picker"
            class="pr-2 py-2"
            cols="12"
            md="6"
          >
            <evocon-date-input
              v-model="formData.startDate"
              :max="formData.endDate"
              :format-fn="formatDate"
              :rules="[startRule]"
              :hint="$t('Start')"
              required
              clearable
            />
          </v-col>
          <v-col
            id="end-date-picker"
            class="pl-2 py-2"
            cols="12"
            md="6"
          >
            <evocon-date-input
              v-model="formData.endDate"
              :min="formData.startDate"
              :format-fn="formatDate"
              :rules="[endRule]"
              :hint="$t('End')"
              required
              clearable
            />
          </v-col>
          <v-col
            class="py-2"
            cols="12"
          >
            <evocon-v-textarea
              v-model="formData.description"
              :hint="$t('Describe the problem in more detail')"
              :placeholder="$t('Problem statement')"
              :rules="[(v) => !v || !!v && v.length <= 200 || $t('Describe the problem in more detail')]"
              :auto-grow="false"
              max-length="200"
              rows="3"
              no-resize
            />
          </v-col>
        </v-row>
        <v-row class="py-2">
          <evocon-v-input
            :model-value="getPeopleInvolved"
            :hint="$t('At least one person needs to be selected')"
            :placeholder="$t('Team')"
            :prepend-inner-icon="mdiAccount"
            :append-inner-icon="mdiPencil"
            readonly
            @click="openPeopleDialog"
          />
        </v-row>
        <v-card-actions class="pa-0 justify-end">
          <evocon-v-button
            :text="$t('Cancel')"
            :disabled="loading"
            variant="text"
            @click="onGoBack"
          />
          <evocon-v-button
            class="bg-primary"
            :text="$t('Save')"
            :loading="loading"
            :disabled="saveButtonDisabled"
            @click="onCreateImprovement"
          />
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
  <router-view v-else />
</template>
<script>
import { mdiAccount, mdiPencil } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { defineAsyncComponent } from 'vue';

import {
  useProfileStore,
  useFactoryStore,
  useStationStore,
  useImprovementsProjectStore,
  useGenericDialogStore,
  useGenericNotificationStore,
} from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import { NO_TRACKING_DATA, STOP_REASON } from '@/constants/improvementsEventTypes';
import improvementsProjectApi from '@/api/improvementsProjectApi';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconDateInput from '@/components/molecules/EvoconDateInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';


const vectorIcons = { mdiAccount, mdiPencil };

export default {
  name: 'ImprovementEdit',
  components: {
    EvoconVInput,
    EvoconVTextarea,
    EvoconVButton,
    EvoconDateInput,
    SelectionInput,
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      if (to.params.id) {
        const project = await improvementsProjectApi.getProject(to.params.id);
        // eslint-disable-next-line no-param-reassign
        vm.formData = { ...project };
      }
    });
  },
  data() {
    return {
      ...vectorIcons,
      loading: false,
      formData: {
        name: '',
        startDate: new Date().toISOString().substr(0, 10),
        endDate: null,
        description: '',
        eventType: NO_TRACKING_DATA,
        targetType: null,
        commentIds: [],
        stationIds: [],
        factoryId: null,
        users: [],
        productIds: [],
        positionIds: [],
        productsAllSelected: false,
      },
    };
  },
  computed: {
    ...mapState(useProfileStore, ['currentUser']),
    ...mapState(useFactoryStore, ['factories', 'factoriesMap', 'hasMultipleFactories']),
    ...mapState(useStationStore, ['stations', 'stationsMap']),
    ...mapState(useImprovementsProjectStore, ['projects']),
    getPeopleInvolved() {
      if (this.formData.users) {
        if (this.formData.users.length === 1) {
          return this.formData.users[0].fullName;
        }
        return `${this.formData.users.length} ${this.$t('selected')}`;
      }
      return null;
    },
    saveButtonDisabled() {
      const factoryValidated = this.hasMultipleFactories ? !this.formData.factoryId : false;
      return !this.formData.name || !this.formData.startDate || !this.formData.endDate || factoryValidated;
    },
    computedStations() {
      if (this.hasMultipleFactories && !this.formData.factoryId) return this.stations;
      const stationFactoryIsSelected = (factoryId) => !this.hasMultipleFactories || this.formData.factoryId === factoryId;
      return this.stations.filter((station) => stationFactoryIsSelected(station.factoryId));
    },
    factoryRule() {
      return !!this.formData.factoryId || this.$t('Factory');
    },
    startRule() {
      return !!this.formData.startDate || this.$t('Start');
    },
    endRule() {
      return (!!this.formData.endDate && this.formData.endDate > this.formData.startDate) || this.$t('End');
    },
  },
  mounted() {
    if (!this.formData.users.length) {
      this.formData.users = [{ userId: this.currentUser.username, fullName: this.currentUser.fullName }];
    }
    if (!this.hasMultipleFactories) {
      this.formData.factoryId = this.factories[0]?.id || 0;
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useImprovementsProjectStore, ['fetchProjects', 'fetchProject']),
    ...mapActions(useGenericNotificationStore, ['openNotification']),
    onGoBack() {
      if (this.$route.name === 'newImprovementProject') this.$router.push({ path: this.$route.matched[this.$route.matched.length - 2].path });
      else this.$router.go(-1);
    },
    async onCreateImprovement() {
      this.loading = true;
      if (this.formData.targetType) {
        this.formData.eventType = STOP_REASON;
      }
      if (this.formData.comments) {
        this.formData.commentIds = Object.values(this.formData.comments).flat();
      }
      let response;
      if (this.formData.id) {
        response = await improvementsProjectApi.saveProject(this.formData);
        await this.$router.push({ name: 'improvementProject', params: { id: this.formData.id } });
        await this.fetchProject({ projectId: this.formData.id });
      } else {
        response = await improvementsProjectApi.createProject(this.formData);
        await this.fetchProjects();
        await this.$router.push({ name: 'improvementProject', params: { id: this.projects[0].id } });
        await this.fetchProject({ projectId: this.projects[0].id });
      }
      this.openNotification({
        text: response.message || this.$t('{value} saved', { value: this.formData.name }),
        type: response.message ? 'error' : 'success',
      });
      this.loading = false;
    },
    formatDate(val) {
      if (!val) return '';
      return formatDate(val, 'long');
    },
    openPeopleDialog() {
      this.openDialog({
        component: defineAsyncComponent(() => import('../../../organisms/improvements/ImprovementPeopleInvolvedDialog/index.vue')),
        allowFullscreen: false,
        data: {
          selectedUsers: this.formData.users,
          loading: this.loading,
        },
        width: 606,
        onPrimaryAction: (val) => {
          this.formData.users = val;
        },
      });
    },
    onFactoryChange(value) {
      this.formData.factoryId = value;
      this.formData.stationIds = [];
      this.formData.commentIds = [];
      this.formData.productIds = [];
      this.formData.positionIds = [];
      this.formData.eventType = NO_TRACKING_DATA;
      this.formData.targetType = null;
    },
  },
};
</script>
<style lang="less" scoped>
.improvement-card-container {
  width: 732px;
  .improvement-information {
    height: 96px;
  }
}
</style>
