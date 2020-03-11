import Vue from 'vue';
import App from './App.vue';

import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

import VeeValidate from 'vee-validate';
import Multiselect from 'vue-multiselect';
import collect from 'collect.js';
import TextHighlight from 'vue-text-highlight';
import * as vClickOutside from 'v-click-outside-x';
import VueCurrencyInput from 'vue-currency-input';

import VueSlideoutPanel from 'vue2-slideout-panel';

Vue.use(VueSlideoutPanel);

const pluginOptions = {
  /* see config reference */
  globalOptions: { currency: 'USD' },
};
Vue.use(VueCurrencyInput, pluginOptions);
window.collect = collect;

// register globally
Vue.component('multiselect', Multiselect);
Vue.use(VeeValidate, {
  events: '',
});
Vue.component('text-highlight', TextHighlight);
Vue.use(vClickOutside);

Vue.use(Buefy);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
