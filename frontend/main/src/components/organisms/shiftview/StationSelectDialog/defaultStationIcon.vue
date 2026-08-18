<template>
  <v-icon
    v-if="highestUserRole !== userRoles.LINEVIEW_USER"
    size="24"
    :color="props.id === currentUser.defaultStationId ? 'secondary' : undefined"
    @click.stop="selectDefaultStation"
  >
    {{ props.id === currentUser.defaultStationId ? mdiStar : mdiStarOutline }}
  </v-icon>
</template>

<script setup name="DefaultStationIcon">
import { storeToRefs } from 'pinia';
import { mdiStar, mdiStarOutline } from '@mdi/js';

import { useProfileStore } from '@/stores/index';
import userRoles from '@/constants/userRoles';

const profileStore = useProfileStore();
const { highestUserRole, currentUser } = storeToRefs(profileStore);

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const selectDefaultStation = () => {
  profileStore.saveCurrentUser({ ...currentUser.value, defaultStationId: props.id });
};
</script>
