<template>
  <v-dialog
    :model-value="modelValue"
    width="400"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-center">
        <evocon-v-button
          v-if="!isOperatorSelectionVisible"
          class="back-button"
          :icon="mdiArrowLeft"
          @click="isOperatorSelectionVisible = true"
        />
        <span>{{ $t('Access checklist') }}</span>
      </v-card-title>
      <v-card-text>
        <selection-input
          v-if="isOperatorSelectionVisible"
          :model-value="[selectedOperatorId]"
          :items="operatorsWithCode"
          :placeholder="$t('operator')"
          :hint="$t('operator')"
          is-single-select
          required
          @update:model-value="[selectedOperatorId] = $event"
        />
        <div v-else>
          <div class="d-flex align-center justify-center">
            <v-icon class="mr-2" :color="valid ? '' : 'error'">
              {{ mdiAccountHardHat }}
            </v-icon>
            <span>{{ operatorsMap[selectedOperatorId].name }}</span>
          </div>
          <div v-if="showUsualInput" class="usual-pin-input mx-auto">
            <evocon-v-input
              id="check-pin"
              v-model="passcode"
              type="password"
              autocomplete="one-time-code"
              :error="!valid"
              :hint="valid ? '' : $t('Try again or contact administrator')"
              class="mt-2"
            />
          </div>
          <otp-input
            v-else
            v-model="passcode"
            :digit-count="4"
            type="password"
            :invalid="!valid"
            :label="valid ? '' : $t('Try again or contact administrator')"
            width="216"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <evocon-v-button
          :text="$t('Cancel')"
          @click="closeDialog"
        />
        <evocon-v-button
          v-if="isOperatorSelectionVisible"
          color="primary"
          :text="$t('Next_noun')"
          @click="onNext"
        />
        <evocon-v-button
          v-else
          color="primary"
          :text="$t('Ok')"
          :loading="isValidationLoading"
          @click="onSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup name="ShiftviewChecklistAuthDialog">
import {
  ref, computed, watch, onMounted, onUnmounted,
} from 'vue';
import { mdiArrowLeft, mdiAccountHardHat } from '@mdi/js';

import useOperatorStore from '@/stores/operator';
import useConfigurationStore from '@/stores/configuration';
import useGenericDialogStore from '@/stores/genericDialog';
import operatorApi from '@/api/operatorApi';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import OtpInput from '@/components/atoms/OTPInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';

defineProps({
  modelValue: { type: Boolean },
});

const operatorStore = useOperatorStore();
const configurationStore = useConfigurationStore();

const selectedOperatorId = ref(null);
const isOperatorSelectionVisible = ref(true);
const valid = ref(true);
const passcode = ref('');
const isValidationLoading = ref(false);

const emit = defineEmits(['on-auth-success', 'update:model-value']);

const shiftviewStationOperators = computed(() => operatorStore.shiftviewStationOperators);
const operatorsWithCode = computed(() => shiftviewStationOperators.value.filter((operator) => operator.passcodeCreatedAt));
const operatorsMap = computed(() => operatorStore.operatorsMap);
const showUsualInput = computed(() => configurationStore.configuration.showUsualCheckPasscodeInput);
const genericDialogStore = useGenericDialogStore();
const closeDialog = () => genericDialogStore.closeDialog();
let keyListener = null;

watch(passcode, () => {
  valid.value = true;
});

function onNext() {
  if (selectedOperatorId.value) isOperatorSelectionVisible.value = false;
}

async function onSubmit() {
  isValidationLoading.value = true;
  try {
    await operatorApi.validatePasscode({
      operatorId: selectedOperatorId.value,
      passcode: passcode.value,
    });
    valid.value = true;
  } catch {
    valid.value = false;
  } finally {
    isValidationLoading.value = false;
  }
  if (valid.value) {
    emit('update:model-value', false);
    emit('on-auth-success', { operatorId: selectedOperatorId.value, passcode: passcode.value });
  }
}

onMounted(() => {
  keyListener = (event) => {
    if (event.key === 'Enter') {
      if (isOperatorSelectionVisible.value) {
        onNext();
      } else {
        onSubmit();
      }
    }
  };
  globalThis.addEventListener('keydown', keyListener);
});

onUnmounted(() => {
  globalThis.removeEventListener('keydown', keyListener);
  keyListener = null;
});

</script>
<style lang="scss" scoped>
.back-button {
  position: absolute;
  left: 8px;
}

.usual-pin-input {
  width: 216px;
}
</style>
