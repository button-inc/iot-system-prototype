import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavbarStore = defineStore('navbar', () => {
  //state
  const isClosed = ref(false);

  function setIsClosed(value) {
    isClosed.value = value;
  }

  return {
    isClosed,
    setIsClosed
  };
})