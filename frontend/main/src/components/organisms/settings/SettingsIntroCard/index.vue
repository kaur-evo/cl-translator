<template>
  <v-card
    id="settings-intro-card"
    class="pt-4 px-6 settings-card"
    @click="onClick"
  >
    <v-row class="text-truncate flex-nowrap align-center">
      <span
        v-if="imgId"
        class="card-img"
        :class="imgId"
      />
      <span class="ml-2 text-headline-small font-weight-bold text-truncate">
        {{ cardTitle }}
      </span>
      <new-indicator
        v-if="newIndicatorShownUntil"
        :shown-until="newIndicatorShownUntil"
        :small="isSmallNewIndicator"
        :text="$t('New')"
        class="ml-1 mt-n4"
      />
      <v-icon class="next-icon">
        {{ mdiChevronRight }}
      </v-icon>
    </v-row>
    <span class="text-secondary-text text-body-medium font-weight-regular d-none d-md-inline-block pt-2">
      {{ introText }}.
    </span>
  </v-card>
</template>

<script>
import { mdiChevronRight } from '@mdi/js';

import NewIndicator from '@/components/atoms/NewIndicator/index.vue';

const vectorIcons = {
  mdiChevronRight,
};

export default {
  name: 'SettingsIntroCard',
  components: {
    NewIndicator,
  },
  props: {
    cardTitle: {
      type: String,
      default: '',
    },
    introText: {
      type: String,
      default: '',
    },
    imgId: {
      type: String,
      default: '',
    },
    routeTo: {
      type: String,
      default: '',
    },
    newIndicatorShownUntil: {
      type: String,
      default: null,
    },
    isSmallNewIndicator: Boolean,
  },
  data() {
    return {
      ...vectorIcons,
    };
  },
  methods: {
    onClick() {
      if (this.routeTo) {
        this.$router.push(`/settings/${this.routeTo}`);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.settings-card {
  transition: box-shadow 0.2s ease-in-out;
  background-color: #fff;
  height: 80px;

  .next-icon {
    color: transparent !important;
    transition: all 0.2s ease;
  }

  &:hover {
    .next-icon {
      color: rgb(var(--v-theme-secondary-dark)) !important;
    }

    .card-img {
      border: 1px solid transparent;

      &.users, &.operators, &.checklists, &.activitylogs {
        background-color: var(--color-12-primary);
      }
      &.alerts, &.scrapreasons, &.quality {
        background-color: rgba(var(--v-theme-lw-orange), 0.12)
      }
      &.comments, &.positions, &.tags {
        background-color: rgba(var(--v-theme-lw-red), 0.12)
      }
      &.speedlossreasons {
        background-color: rgba(var(--v-theme-lw-yellow-bg), 0.12)
      }
      &.products, &.devices, &.apikeys {
        background-color: rgba(0, 0, 0, 0.12);
      }
      &.stations, &.shifts {
        background-color: rgba(var(--v-theme-lw-blue), 0.12)
      }
      &.security {
        background-color: rgba(var(--v-theme-lw-purple), 0.12)
      }
    }
  }
}

@media only screen and (min-width: 861px) {
  .settings-card {
      height: 160px;
  }
}

$profile-img-size: 32px;
.card-img {
  min-height: calc(#{$profile-img-size} * 1.5);
  max-height: calc(#{$profile-img-size} * 1.5);
  min-width: calc(#{$profile-img-size} * 1.5);
  max-width: calc(#{$profile-img-size} * 1.5);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 50%;
  border: 1px rgba(239, 239, 239, 1) solid;

  &.profile-img-1 {
    background: url(@/assets/images/mr-evocon-1@3x.png) no-repeat;
    background-size: calc(#{$profile-img-size} * 1.5);
    background-position: center;
    border: 1px transparent solid;
  }
  &.profile-img-2 {
    background: url(@/assets/images/mr-evocon-2@3x.png) no-repeat;
    background-size: calc(#{$profile-img-size} * 1.5);
    background-position: center;
    border: 1px transparent solid;
  }
  &.profile-img-3 {
    background: url(@/assets/images/mr-evocon-3@3x.png) no-repeat;
    background-size: calc(#{$profile-img-size} * 1.5);
    background-position: center;
    border: 1px transparent solid;
  }
  &.profile-img-4 {
    background: url(@/assets/images/mr-evocon-4@3x.png) no-repeat;
    background-size: calc(#{$profile-img-size} * 1.5);
    background-position: center;
    border: 1px transparent solid;
  }
  &.profile-img-5 {
    background: url(@/assets/images/mr-evocon-5@3x.png) no-repeat;
    background-size: calc(#{$profile-img-size} * 1.5);
    background-position: center;
    border: 1px transparent solid;
  }
  &.profile-img-6 {
    background: url(@/assets/images/mr-evocon-6@3x.png) no-repeat;
    background-size: calc(#{$profile-img-size} * 1.5);
    background-position: center;
    border: 1px transparent solid;
  }
  &.profile-img-7 {
    background: url(@/assets/images/mr-evocon-7@3x.png) no-repeat;
    background-size: calc(#{$profile-img-size} * 1.5);
    background-position: center;
    border: 1px transparent solid;
  }
  &.support {
    background: url(@/assets/images/mr-evocon-support@3x.png) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.comments {
    background: url(@/assets/images/settings-icons/stopreasons.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.quality {
    background: url(@/assets/images/settings-icons/quality.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.users {
    background: url(@/assets/images/settings-icons/users.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.products {
    background: url(@/assets/images/settings-icons/products.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.stations {
    background: url(@/assets/images/settings-icons/stations.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.operators {
    background: url(@/assets/images/settings-icons/operators.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.shifts {
    background: url(@/assets/images/settings-icons/shifts.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.scrapreasons {
    background: url(@/assets/images/settings-icons/scrapreasons.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.speedlossreasons {
    background: url(@/assets/images/settings-icons/speedlossreasons.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.alerts {
    background: url(@/assets/images/settings-icons/alerts.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.positions {
    background: url(@/assets/images/settings-icons/machinelocations.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.tags {
    background: url(@/assets/images/settings-icons/tags.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.checklists {
    background: url(@/assets/images/settings-icons/checklists.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.devices {
    background: url(@/assets/images/settings-icons/devices.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.security {
    background: url(@/assets/images/settings-icons/security.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.apikeys {
    background: url(@/assets/images/settings-icons/apikeys.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
  &.activitylogs {
    background: url(@/assets/images/settings-icons/activitylogs.svg) no-repeat;
    background-size: $profile-img-size;
    background-position: center;
  }
}

</style>
