import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '@mdi/font/css/materialdesignicons.css'

import Markdown from 'vue3-markdown-it';

const vuetify = createVuetify({
    components,
    directives,
})

createApp(App).use(vuetify).use(Markdown).mount('#app');
