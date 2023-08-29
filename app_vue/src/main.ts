import './assets/base.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import OpenLayersMap from "vue3-openlayers";
import "vue3-openlayers/styles.css"; // vue3-openlayers version < 1.0.0-*

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(OpenLayersMap);

app.mount('#app')
