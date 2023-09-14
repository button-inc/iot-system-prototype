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

  function openModal() {
    console.log('modal opened')
  }


</script>

<template>
  <div class="point-address-field">
    <v-select
      :label="label"
      variant="underlined"
      clearable
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
  </div>
</template>

<style lang="scss" scoped>
  .point-address-field {
    margin-bottom: 22px;
  }
</style>


<!-- sample:
<PointAddressField
  v-model="state.testVal"
  :addressOptions="[state.startPointAddress]"
  label="Start point">
</PointAddressField> -->