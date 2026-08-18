<template>
  <v-card>
    <v-list-item class="py-2 flex-grow-1 list-card__content">
      <template #prepend>
        <span
          v-if="icon || flagIconCode || number"
          class="mr-4"
        >
          <evocon-flag-icon
            v-if="flagIconCode"
            :flag-country-code="flagIconCode"
            class="translation-card__flag-icon"
            add-border
          />
          <v-icon v-else-if="icon">
            {{ icon }}
          </v-icon>
          <ordering-number v-if="number" class="card-order-number" :number="number" />
        </span>
      </template>
      <v-list-item-title
        v-if="title"
        class="text-body-large font-weight-medium d-flex align-center"
      >
        <span class="card-title">
          {{ title }}
        </span>
        <slot name="title-append" />
      </v-list-item-title>
      <v-list-item-subtitle
        v-if="subtitleKeyValuePairs.length"
        class="mt-1 d-flex flex-wrap"
      >
        <list-item-subtitle-content
          v-for="(pair, i) in subtitleKeyValuePairs"
          :key="`subtitle-item-${i}`"
          :title="pair.key"
          :primary-value="pair.value"
          :primary-value-class="pair.valueClass"
          class="mr-4"
        />
      </v-list-item-subtitle>
      <template #append>
        <v-list-item-action v-if="isMobileView && cardButtons.length > 0">
          <menu-with-button-activator
            :items="cardButtons"
            :button-icon="mdiDotsVertical"
            primary-text-field="text"
            button-type="primary"
            button-icon-color="secondary-dark"
            list-width="auto"
            icon-key="icon"
            location="top"
            @item-clicked="$event.action(buttonParams)"
          />
        </v-list-item-action>
        <v-list-item-action v-else class="flex-row-reverse">
          <icon-with-tooltip
            v-for="(button, index) in cardButtons"
            :key="`card-button-${index}`"
            :icon="button.icon"
            :tooltip-text="button.tooltip"
            button-size="default"
            tooltip-location="bottom"
            :additional-classes="index === 0 ? '' : 'mr-2'"
            :icon-clicked-fn="() => button.action(buttonParams)"
          />
        </v-list-item-action>
        <v-list-item-action
          v-if="primaryActionText"
        >
          <evocon-v-button
            :text="primaryActionText"
            type="primary-light"
            class="ml-2"
            @click.stop="$emit('primary-action')"
          />
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-card>
</template>

<script>
import { mapState } from 'pinia';
import { mdiDotsVertical } from '@mdi/js';

import { useDeviceStore } from '@/stores/index';
import EvoconFlagIcon from '@/components/atoms/EvoconFlagIcon/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ListItemSubtitleContent from '@/components/atoms/ListItemSubtitleContent/index.vue';
import OrderingNumber from '@/components/atoms/OrderingNumber/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import MenuWithButtonActivator from '@/components/molecules/MenuWithButtonActivator/index.vue';

const icons = { mdiDotsVertical };

export default {
  name: 'ListCard',
  components: {
    EvoconFlagIcon,
    EvoconVButton,
    ListItemSubtitleContent,
    OrderingNumber,
    IconWithTooltip,
    MenuWithButtonActivator,
  },
  props: {
    icon: {
      type: String,
      default: '',
    },
    flagIconCode: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    subtitleKeyValuePairs: {
      type: Array,
      default: () => [],
    },
    primaryActionText: {
      type: String,
      default: '',
    },
    number: {
      type: Number,
      default: null,
    },
    cardButtons: {
      type: Array,
      default: () => [],
    },
    buttonParams: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['primary-action'],
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
  },
};
</script>

<style scoped lang="scss">
.list-card__content {
  min-height: 62px;
}

.card-title {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
