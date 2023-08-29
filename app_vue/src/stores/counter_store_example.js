// example of a pinia store -> https://pinia.vuejs.org/introduction.html

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

/*
can import into a component file separately like so:

<script setup>
  import { useCounterStore } from '@/stores/counter_example'

  const counter = useCounterStore()

  counter.count++
  // with autocompletion ✨
  counter.$patch({ count: counter.count + 1 })
  // or using an action instead
  counter.increment()
</script>

<template>
  <!-- Access the state directly from the store -->
  <div>Current Count: {{ counter.count }}</div>
</template>

*/
