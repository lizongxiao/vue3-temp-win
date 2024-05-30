import 'tailwindcss/tailwind.css';
import { createApp } from 'vue';
import App from './App.vue';

(async () => {
  const app = createApp(App);
  app.mount('#app', true);
})();
