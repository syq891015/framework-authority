// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import cacheApp from './index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import i18n from '@/lang'
import '@/styles/icon-fa.scss'
import 'font-awesome/css/font-awesome.min.css'
import '@/icons'
import TableUtil from '@/utils/table'
import Popup from '@/utils/popup'
Vue.use(TableUtil)
Vue.use(Popup)

Vue.config.productionTip = false

Vue.use(ElementUI, {
  size: 'medium',
  i18n: (key, value) => i18n.t(key, value)
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  components: { cacheApp },
  template: '<cache-app/>'
})
