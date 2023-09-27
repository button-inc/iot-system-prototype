<script setup>
import { reactive, ref } from 'vue';
import { getLatLng } from '@/utils/getLatLngFromAddressHelper';

const emit = defineEmits(['update:modelValue', 'update:addressOptions']); // for v-model

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  addressOptions: {
    type: Array,
    required: true
  },
  modelValue: {
    // for v-model
    type: String,
    default: ''
  }
});

const addressForm = ref(null);

const initialFormState = {
  valid: false,
  provinceList: ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
  name: '',
  streetAddress: '',
  unit: '',
  city: '',
  province: '',
  postalCode: '',
  isCheckingAddress: false,
  isAddressAdded: false,
  isErrorAddingAddress: false
};

const state = reactive({
  dialog: false,
  rulesTextField: [
    (value) => {
      if (value) return true;
      return 'You must enter a value.';
    },
    (value) => (/[!-/:-@[-`{-~]/.test(value) ? 'Must not contain special characters.' : true)
  ],
  rulesSelect: [
    (value) => {
      if (value) return true;

      return 'You must select a value.';
    }
  ],
  ...initialFormState
});

function openModal() {
  resetModal();
  state.dialog = true;
}

function closeModal() {
  state.dialog = false;
}

function resetModal() {
  Object.assign(state, initialFormState);
}

async function addAddress() {
  state.isErrorAddingAddress = false;
  const { valid } = await addressForm.value.validate();
  if (!valid) {
    return;
  }

  let addressString = '';

  addressString = `${state.unit}` + `${state.unit ? ' ' : ''}` + `${state.streetAddress} ${state.city} ${state.province}`;
  addressString.replace(',', '');

  state.isCheckingAddress = true;
  state.isAddressAdded = false;
  const latLng = await getLatLng(addressString);
  if (latLng && latLng.length) {
    state.isAddressAdded = true;
    emit('update:addressOptions', addressString);
    emit('update:modelValue', addressString);
    closeModal();
  } else {
    state.isErrorAddingAddress = true;
  }

  state.isCheckingAddress = false;
}
</script>

<template>
  <div class="point-address-field">
    <v-select
      :modelValue="props.modelValue"
      :label="label"
      variant="underlined"
      :items="props.addressOptions"
      @update:modelValue="$emit('update:modelValue', $event)"
    >
      <template v-slot:append-item>
        <v-divider class="mt-2"></v-divider>
        <v-list-item
          title="Add another"
          @click="openModal"
        ></v-list-item>
      </template>
    </v-select>

    <v-dialog
      v-model="state.dialog"
      width="600"
    >
      <v-card>
        <v-card-text class="dialog-content">
          <span class="dialog-content__title">Add new address</span>

          <section class="dialog-content__form">
            <v-form
              v-model="state.valid"
              ref="addressForm"
            >
              <!-- TODO: add name of address field when we save address data to BE -->
              <!-- <v-text-field v-model="state.name"
                label="Name of address" 
                :rules="state.rulesTextField" 
                required 
                variant="underlined">
              </v-text-field> -->

              <v-text-field
                v-model="state.streetAddress"
                label="Street address"
                :rules="state.rulesTextField"
                required
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="state.unit"
                label="Apt, suite, or unit"
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="state.city"
                label="City"
                :rules="state.rulesTextField"
                required
                variant="underlined"
              ></v-text-field>

              <div class="dialog-content__two-fields">
                <v-select
                  v-model="state.province"
                  class="dialog-content__province"
                  label="Province"
                  required
                  :rules="state.rulesSelect"
                  variant="underlined"
                  :items="state.provinceList"
                ></v-select>

                <!-- TODO: note this is not currently used until we use a different validation api -->
                <v-text-field
                  v-model="state.postalCode"
                  class="dialog-content__postal-code"
                  label="Postal code"
                  variant="underlined"
                ></v-text-field>
              </div>
            </v-form>
          </section>

          <div class="dialog-content__actions">
            <v-btn
              class="mr-4"
              color="#2196F3"
              :disabled="state.isCheckingAddress || state.isAddressAdded"
              @click="addAddress()"
            >
              {{ state.isAddressAdded ? 'Added!' : 'Add' }}
              <v-progress-circular
                v-if="state.isCheckingAddress"
                indeterminate
                :size="20"
                color="#8D8D8D"
              ></v-progress-circular>
            </v-btn>
            <v-btn
              variant="outlined"
              @click="closeModal"
            >
              Cancel
            </v-btn>
            <div
              class="dialog-content__error"
              v-if="state.isErrorAddingAddress"
            >
              There was an error adding the address, please double check the address and try again.
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.point-address-field {
  margin-bottom: 22px;
}

.dialog-content {
  &__two-fields {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 10px;

    @include smallScreens {
      flex-direction: row;
    }
  }

  &__province {
    @include smallScreens {
      margin-right: 24px;
    }
  }

  &__province,
  &__postal-code {
    width: 100%;
  }

  &__title {
    margin-bottom: 16px;
    @include fontHeading5;
  }

  &__form {
    margin-top: 16px;
  }

  &__actions {
    display: flex;
    align-items: center;
    margin: 20px 0;
  }

  &__error {
    margin-left: 16px;
    color: $red;
  }
}
</style>

<!-- sample:
<PointAddressField
  v-model="state.testVal"
  :addressOptions="[state.startPointAddress]"
  label="Start point">
</PointAddressField> -->
