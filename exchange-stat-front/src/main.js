import './polyfills.ts';
import Vue from 'vue';
Vue.config.productionTip = false
import VueGoodTablePlugin from 'vue-good-table';
import M from '../node_modules/materialize-css/dist/js/materialize.min.js';
import '../node_modules/materialize-css/dist/css/materialize.min.css';
// import the styles 
import 'vue-good-table/dist/vue-good-table.css'
import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css';
import NotFound from './components/NotFound';
import routes from './routes';

M.AutoInit();
Vue.use(VueGoodTablePlugin);
const app = new Vue({
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    ViewComponent () {
      return routes[this.currentRoute] || NotFound;
    }
  },
  render (h) { return h(this.ViewComponent); },
}).$mount('#app');

window.addEventListener('popstate', () => {
  app.currentRoute = window.location.pathname;
});
