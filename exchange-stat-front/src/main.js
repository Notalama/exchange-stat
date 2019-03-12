import Vue from 'vue';
Vue.config.productionTip = false
import VueGoodTablePlugin from 'vue-good-table';
import M from 'assets/styles/materialize.min.js';
import 'assets/styles/materialize.min.css';
// import the styles 
import 'vue-good-table/dist/vue-good-table.css'
import 'assets/styles/all.min.css';
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
