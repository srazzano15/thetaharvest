import Vue from 'vue'
import Vuex from 'vuex'
import * as fb from '../firebase/firebase'
import getters from './getters'
import actions from './actions'

Vue.use(Vuex)

// get this is real time
fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
  const t = []
  snapshot.forEach(doc => {
    const trade = doc.data()
    trade.id = doc.id
    t.push(trade)
  })
  store.commit('setTrades', t)
})

const store = new Vuex.Store({
  state: {
    drawer: false,
    userProfile: {},
    trades: [],
    loading: true,
    error: ''
  },
  mutations: {
    navDrawerToggle: state => (state.drawer = !state.drawer),
    setUserProfile: (state, val) => (state.userProfile = val),
    setTrades: (state, val) => (state.trades = val),
    finishedLoading: state => (state.loading = !state.loading),
    setError: (state, val) => (state.error = val)
  },
  actions,
  getters
})

export default store
