<template>
  <div
    ref="evoconInputChip"
    v-click-outside="onBlur"
    class="evocon-input-chip"
    :class="{
      'evocon-input-chip--empty': !modelValue,
      'evocon-input-chip--error': error,
      'evocon-input-chip--border': inputWithBottomBorder && !modelValue,
      'evocon-input-chip--plain': isPlainInputChip,
      'evocon-input-chip--dynamic': isDynamicChip,
      'evocon-input-chip--is-open': isDynamicChip && isInputOpened,
      'evocon-input-chip--disabled': disabled,
      'evocon-input-chip--warning': warning,
    }"
  >
    <slot name="prepend" />
    <evocon-v-button
      v-if="prependInnerIcon && isDynamicChip"
      size="extra-small"
      :icon="prependInnerIcon"
      :class="{ 'disable-events': isInputOpened }"
      @click.stop="onPrependInnerClick"
    />
    <v-icon
      v-else-if="prependInnerIcon"
      size="16"
      color="secondary-text"
      class="mr-1"
    >
      {{ prependInnerIcon }}
    </v-icon>
    <input
      ref="chipInput"
      v-maska="inputMask"
      class="chip-input"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:model-value', $event.target.value)"
      @focus="emit('focus')"
    >
    <span>{{ suffix }}</span>
    <evocon-v-button
      v-if="appendInnerIcon && isDynamicChip && modelValue"
      size="extra-small"
      :icon="appendInnerIcon"
      @click.stop="onAppendInnerClick"
    />
    <v-icon
      v-else-if="appendInnerIcon && !isDynamicChip && !!modelValue"
      size="16"
      color="secondary-text"
      class="ml-1"
      @click.stop="onAppendInnerClick"
    >
      {{ appendInnerIcon }}
    </v-icon>
  </div>
</template>
<script setup name="EvoconInputChip">
import {
  onMounted, nextTick, ref, computed, watch,
} from 'vue';
import { vMaska } from 'maska/vue';

import { getTextWidth } from '@/helpers/d3Helpers';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  suffix: {
    type: String,
    default: null,
  },
  prependInnerIcon: {
    type: String,
    default: null,
  },
  appendInnerIcon: {
    type: String,
    default: null,
  },
  isDynamicChip: Boolean,
  inputWithBottomBorder: {
    type: Boolean,
    default: null,
  },
  placeholder: {
    type: String,
    default: null,
  },
  inputMask: {
    type: String,
    default: null,
  },
  isPlainInputChip: Boolean,
  grow: Boolean,
  error: Boolean,
  warning: Boolean,
  disabled: Boolean,
});

const clickedOpen = ref(false);
const chipInput = ref();
const evoconInputChip = ref();

const emit = defineEmits(['update:model-value', 'click:append-inner', 'update:input-chip-opened', 'blur', 'focus']);

const isInputOpened = computed(() => clickedOpen.value || !!props.modelValue);

const setWidth = async () => {
  await nextTick();
  if (props.grow) {
    const fontSize = 14;
    const width = getTextWidth(props.modelValue, fontSize, 'Open Sans, sans-serif') + 4;
    chipInput.value.style = `width: ${width}px;`;
  }
};

onMounted(() => {
  setWidth();
});

watch(isInputOpened, (newVal) => {
  if (newVal) {
    const timeout = 500;
    setTimeout(() => {
      emit('update:input-chip-opened');
    }, timeout);
  } else emit('update:input-chip-opened');
});

watch(() => props.modelValue, () => {
  setWidth();
});

const onPrependInnerClick = () => {
  clickedOpen.value = true;
  chipInput.value.focus();
};

const onBlur = () => {
  clickedOpen.value = false;
  emit('blur');
};

const onAppendInnerClick = () => {
  emit('click:append-inner');
  chipInput.value.focus();
};

defineExpose({ chipInput });

</script>
<style lang="scss" scoped>
.evocon-input-chip {
  display: flex;
  align-items: center;
  height: 32px;
  width: fit-content;
  font-size: 14px;
  border-radius: 16px;
  padding: 4px 12px;
  background: var(--color-12-primary);
  border: 1px solid rgb(var(--v-theme-primary));
  caret-color: rgb(var(--v-theme-primary));

  &:hover, &:focus {
    background: var(--color-28-primary);
  }

  .chip-input {
    height: 20px;
    min-width: 16px;
    color: rgb(var(--v-theme-primary-dark));
    width: 100%;
    &:focus {
      margin-bottom: -1px;
      border-bottom: 1px solid rgb(var(--v-theme-primary));
    }
  }

  &--empty {
    background-color: rgb(var(--v-theme-quaternary-dark));
    border: 1px solid rgb(var(--v-theme-quaternary-dark));

    &:hover, &:focus {
     background-color: rgb(var(--v-theme-quaternary-dark-2));
    }
  }

  &--error {
    background-color: var(--color-12-error);
    border: 1px solid rgb(var(--v-theme-error));

    &:hover, &:focus {
      background-color: var(--color-28-error);
      border: 1px solid rgb(var(--v-theme-error));
    }

    .chip-input {
      &:focus {
        border-bottom: 1px solid rgb(var(--v-theme-secondary-dark));
      }
    }
  }

  &--warning {
    border-color: rgba(var(--v-theme-secondary)) !important;
    background: rgba(var(--v-theme-secondary), .12) !important;

    &:hover, &:focus {
      background: rgba(var(--v-theme-secondary), .28) !important;
      border: 1px solid rgb(var(--v-theme-secondary));
    }

    .chip-input {
      &:focus {
        border-bottom: 1px solid rgba(var(--v-theme-secondary-dark));
      }
    }
  }

  &--border {
    .chip-input {
      border-bottom: 1px solid rgb(var(--v-theme-secondary-dark));
    }
  }

  &--plain {
    background-color: rgb(var(--v-theme-quaternary-dark));
    border: 1px solid rgb(var(--v-theme-quaternary-dark));
    width: 100%;

    &:hover {
      background-color: rgb(var(--v-theme-quaternary-dark));
    }

    .chip-input {
      &:focus {
        border-bottom: none;
      }
    }
  }

  &--dynamic {
    width: 32px;
    padding-left: 1px;
    padding-right: 1px;
    transition: all 0.5s ease;
    background-color: rgb(var(--v-theme-quaternary-dark));
    border: 1px solid rgb(var(--v-theme-quaternary-dark));
    &:hover {
      background-color: rgb(var(--v-theme-quaternary-dark));
    }

    .chip-input {
      min-width: 0px;
      &:focus {
        border-bottom: none;
      }
    }
  }

  &--is-open {
    width: 200px;
  }

  &--disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}
.disable-events {
  pointer-events: none;
}
</style>
