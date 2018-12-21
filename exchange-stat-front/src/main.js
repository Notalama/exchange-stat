import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import VueGoodTablePlugin from 'vue-good-table';

// import the styles 
import 'vue-good-table/dist/vue-good-table.css'
import '../node_modules/materialize-css/dist/css/materialize.min.css';
import '../node_modules/materialize-css/dist/js/materialize.min.js';
import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css';
Vue.use(VueGoodTablePlugin);
new Vue({
  render: h => h(App),
}).$mount('#app')
