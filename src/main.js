import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { auth } from './firebase/firebase'

Vue.config.productionTip = false

let app
auth.onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      render: h => h(App)
    }).$mount('#app')
  }

  const r = router.currentRoute.name
  if (user && (r !== 'login' && r !== 'register')) {
    store.dispatch('fetchUserProfile', user)
  }
})
