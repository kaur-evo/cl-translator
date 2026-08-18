<template>
  <div class="px-4">
    <v-form
      ref="form"
      v-model="valid"
    >
      <v-row>
        <v-col
          class="pl-0 pr-1"
          cols="12"
          md="9"
        >
          <evocon-number-input
            v-model="hourRate"
            class="mx-2"
            :hint="hintText"
            required
          />
        </v-col>
        <v-col
          class="pl-1 pr-0"
          cols="12"
          md="3"
        >
          <selection-input
            :model-value="[currencyVal]"
            :items="currencyValues"
            item-text="symbol"
            item-value="name"
            is-single-select
            hide-search
            @update:model-value="currencyVal = $event[0]"
          />
        </v-col>
      </v-row>
    </v-form>
    <v-card-actions class="px-0 justify-end">
      <evocon-v-button
        variant="text"
        :text="$t('Cancel')"
        @click="closeDialog"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Save')"
        @click="onSaveClick"
      />
    </v-card-actions>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useGenericDialogStore } from '@/stores/index';
import { REDUCE_BY_NUMBER } from '@/constants/improvementsDataTrackingTypes';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';

export default {
  name: 'ImprovementMonetaryValueEdit',
  components: {
    EvoconNumberInput,
    EvoconVButton,
    SelectionInput,
  },
  data() {
    return {
      valid: true,
      hourRate: 0,
      currencyVal: '',
      hintText: '',
      currencyValues: [
        { name: 'eur', symbol: '€' },
        { name: 'usd', symbol: '$' },
        { name: 'gbp', symbol: '£' },
      ],
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    currency() {
      return this.dialogData.project.currency;
    },
    ratePerHour() {
      return this.dialogData.project.ratePerHour;
    },
    targetType() {
      return this.dialogData.project.targetType;
    },
  },
  mounted() {
    this.hourRate = this.ratePerHour;
    this.currencyVal = this.currency || 'eur';
    if (this.targetType === REDUCE_BY_NUMBER) {
      this.hintText = this.$t('Estimated value of one stop');
    } else {
      this.hintText = this.$t('Estimated value of one hour');
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    onSaveClick() {
      this.$refs.form.validate();
      if (!this.valid) return;
      const formData = { ratePerHour: parseFloat(this.hourRate), currency: this.currencyVal };
      this.closeDialog();
      this.dialogData.saveCB({ formData });
    },
  },
};
</script>
