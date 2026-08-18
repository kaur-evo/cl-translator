<template>
  <v-col class="pa-6 pt-0">
    <div class="d-flex justify-center align-center action-description">
      <div class="text-center">
        <div class="text-headline-small font-weight-medium">
          {{ $t('Team') }}
        </div>
        <div
          class="text-body-medium font-weight-regular"
          :class="valid ? 'text-medium-emphasis' : 'text-error'"
        >
          {{ $t('At least one person needs to be selected') }}
        </div>
      </div>
    </div>
    <v-row>
      <v-col cols="12">
        <evocon-v-input
          v-model="search"
          :placeholder="$t('Search')"
          :prepend-inner-icon="mdiMagnify"
          :loading="loading"
        >
          <template #append-inner>
            <span class="text-body-large white-space-nowrap">
              {{ getSelectedUsers() }}
            </span>
          </template>
        </evocon-v-input>
      </v-col>
      <v-col
        class="pb-3"
        cols="12"
      >
        <div class="people-selection">
          <v-list class="pt-0">
            <v-list-item
              v-for="person in filteredPersons"
              :key="`person-${person.username}`"
              :model-value="person.username"
              class="list-item--flex"
              @click="toggleSelected(person)"
            >
              <v-list-item-action class="mr-3">
                <v-checkbox
                  :model-value="isUserSelected(person)"
                  color="primary"
                  :error="!valid"
                  hide-details
                />
              </v-list-item-action>
              <v-list-item-title>{{ person.fullName }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-col>
    </v-row>
    <v-card-actions class="pa-0 justify-end">
      <evocon-v-button
        variant="text"
        :text="$t('Cancel')"
        @click="closeDialog"
      />
      <evocon-v-button
        color="bg-primary"
        :text="$t('Save')"
        :loading="loading"
        :disabled="!valid"
        @click="onSaveClick"
      />
    </v-card-actions>
  </v-col>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiMagnify } from '@mdi/js';

import {
  useProfileStore,
  useUserStore,
  useGenericDialogStore,
} from '@/stores/index';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = { mdiMagnify };

export default {
  name: 'ImprovementPeopleInvolvedDialog',
  components: { EvoconVInput, EvoconVButton },
  data() {
    return {
      ...vectorIcons,
      valid: true,
      search: '',
      selectedUsers: [],
    };
  },
  computed: {
    ...mapState(useProfileStore, ['currentUser']),
    ...mapState(useUserStore, ['users']),
    ...mapState(useGenericDialogStore, ['dialogData', 'onPrimaryAction']),
    filteredPersons() {
      const matchesSearch = (val) => String(val).toLowerCase().includes(String(this.search).toLowerCase());
      const isSelected = (val) => this.selectedUsers.some((user) => user.userId === val);
      const { selected, notSelected } = this.allUsers.reduce((accumulator, person) => {
        if (matchesSearch(person.fullName) && isSelected(person.username)) accumulator.selected.push(person);
        else if (matchesSearch(person.fullName) && !isSelected(person.username)) accumulator.notSelected.push(person);
        return accumulator;
      }, { selected: [], notSelected: [] });
      return [...selected, ...notSelected];
    },
    loading() {
      return this.dialogData.loading;
    },
    allUsers() {
      return [...this.users, this.currentUser];
    },
  },
  async mounted() {
    try {
      await this.fetchUsers();
      this.selectedUsers = [...this.dialogData.selectedUsers];
    } catch {
      // pass for tests
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useUserStore, ['fetchUsers']),
    toggleSelected(val) {
      const index = this.selectedUsers.findIndex((user) => user.userId === val.username);
      if (index > -1) {
        this.selectedUsers.splice(index, 1);
      } else {
        this.selectedUsers.push({ fullName: val.fullName, userId: val.username });
      }
      this.valid = this.selectedUsers.length > 0;
    },
    getSelectedUsers() {
      if (this.selectedUsers.length === 1) {
        return this.allUsers.find((user) => user.username === this.selectedUsers[0].userId).fullName;
      }
      return `${this.selectedUsers.length} ${this.$t('selected')}`;
    },
    onSaveClick() {
      this.onPrimaryAction(this.selectedUsers);
      this.closeDialog();
    },
    isUserSelected(person) {
      return this.selectedUsers.some((user) => user.userId === person.username);
    },
  },
};
</script>
<style lang="less" scoped>
.action-description {
  height: 96px;
}
.people-selection {
  overflow: auto;
  height: 350px;
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.12);
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(var(--v-theme-tertiary-dark));
    border-radius: 16px;
  }
}
</style>
