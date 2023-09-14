<script setup>
  import { reactive, onMounted, ref } from 'vue'

  defineEmits(['update:modelValue']); // for v-model

  const props = defineProps({
    label: {
      type: String,
      required: true
    },
    addressOptions: {
      type: Array,
      required: true
    },
    modelValue: { // for v-model
      type: String,
      default: ''
    }
  });

  const state = reactive({
    dialog: false,
    valid: false
  });

  const provinceList = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];


  function openModal() {
    state.dialog = true;
  }


</script>

<template>
  <div class="point-address-field">
    <v-select
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
        >
        </v-list-item>
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
            <v-form v-model="valid">
              <v-text-field label="Name of address" required variant="underlined"></v-text-field>
              <v-text-field label="Street address" required variant="underlined"></v-text-field>
              <v-text-field label="Apt, suite, or unit" variant="underlined"></v-text-field>
              <v-text-field label="City" required variant="underlined"></v-text-field>
              <div class="dialog-content__flex">
                <v-select class="dialog-content__province"
                  label="Province"
                  required
                  variant="underlined"
                  :items="provinceList"
                ></v-select>
                <v-text-field class="dialog-content__postal-code" label="Postal code" variant="underlined"></v-text-field>
              </div>
            </v-form>

          </section>

          <div class="dialog-content__actions">
            <v-btn class="mr-4" color="#2196F3" @click="state.dialog = false">Add</v-btn>
            <v-btn variant="outlined" @click="state.dialog = false">Cancel</v-btn>
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

    &__flex {
      display: flex;
      align-items: center;
      flex-direction: column;

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

    &__actions {
      margin: 20px 0;
    }
  }
</style>


<!-- sample:
<PointAddressField
  v-model="state.testVal"
  :addressOptions="[state.startPointAddress]"
  label="Start point">
</PointAddressField> -->