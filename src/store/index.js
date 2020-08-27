import Vue from 'vue'
import Vuex from 'vuex'
import * as fb from '../firebase/firebase'
import router from '../router/index'
import moment from 'moment'
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    drawer: false,
    userProfile: {},
    trades: [],
    loading: true,
    loginError: false
  },
  mutations: {
    navDrawerToggle: state => (state.drawer = !state.drawer),
    setUserProfile: (state, val) => (state.userProfile = val),
    setTrades: (state, val) => (state.trades = val),
    finishedLoading: state => (state.loading = !state.loading),
    setLoginError: (state, val) => (state.loginError = val)
  },
  actions: {
    async login ({ dispatch, commit }, form) {
      // clear login error on attempted login
      commit('setLoginError', false)
      // init user auth session in FB
      try {
        const { user } = await fb.auth.signInWithEmailAndPassword(form.email, form.password)
        // fetch user profile and set in state
        dispatch('fetchUserProfile', user)
      } catch (err) {
        commit('setLoginError', true)
      }
    },
    async fetchUserProfile ({ commit }, user) {
      // fetch user profile
      const userProfile = await fb.usersCollection.doc(user.uid).get()

      // set user profile in state
      commit('setUserProfile', userProfile.data())

      fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
        const t = []
        snapshot.forEach(doc => {
          const trade = doc.data()
          trade.id = doc.id
          t.push(trade)
        })
        commit('setTrades', t)
      })
      commit('finishedLoading')
      if (router.currentRoute.name === 'Home' || router.currentRoute.name === 'login' || router.currentRoute.name === 'register') {
        // change route to dashboard
        router.push('dashboard')
      }
    },
    async register ({ dispatch }, form) {
      // sign user up in FB
      const { user } = await fb.auth.createUserWithEmailAndPassword(form.email, form.password)

      // create user profile object in usersCollections
      await fb.usersCollection.doc(user.uid).set({
        name: form.name,
        email: form.email,
        monthlyGoal: 0,
        annualGoal: 0
      })

      // fetch user profile and set in state
      dispatch('fetchUserProfile', user)
    },
    async logout ({ commit }) {
      await fb.auth.signOut()

      // clear userProfile and redirect to /login
      commit('setUserProfile', {})
      router.push('/')
    },
    async createTrade ({ state, commit }, trade) {
      await fb.tradesCollection.add({
        created: trade.created,
        closed: false,
        type: trade.type,
        ticker: trade.ticker,
        entryDate: trade.entryDate,
        expirationDate: trade.expirationDate,
        quantity: trade.quantity,
        strikeDisplay: trade.strikeDisplay,
        entryPrice: trade.entryPrice,
        legs: trade.legs,
        userId: fb.auth.currentUser.uid,
        userName: state.userProfile.name
      })
      // retrieve trades for the user
      fb.tradesCollection.orderBy('entryDate', 'desc').onSnapshot(snapshot => {
        const t = []

        snapshot.forEach(doc => {
          const trade = doc.data()
          trade.id = doc.id
          t.push(trade)
        })

        store.commit('setTrades', t)
      })
    },
    async closeTrade ({ state, commit }, trade) {
      const t = state.trades[trade.index]
      const profit = Math.round(t.quantity * (t.entryPrice - trade.closePrice) * 100) - trade.commissions
      await fb.tradesCollection.doc(t.id).update({
        closeDate: trade.closeDate,
        closePrice: trade.closePrice,
        commissions: trade.commissions,
        profit: profit,
        closed: true
      })

      // retrieve trades for the user
      fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
        const t = []

        snapshot.forEach(doc => {
          const trade = doc.data()
          trade.id = doc.id

          t.push(trade)
        })

        store.commit('setTrades', t)
      })
    },
    async deleteTrade ({ state, commit }, trade) {
      const t = state.trades[trade.index]
      await fb.tradesCollection.doc(t.id).delete()

      // retrieve trades for the user
      fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
        const t = []

        snapshot.forEach(doc => {
          const trade = doc.data()
          trade.id = doc.id

          t.push(trade)
        })

        store.commit('setTrades', t)
      })
    },
    async setGoals ({ dispatch, commit }, goals) {
      const user = fb.auth.currentUser
      await fb.usersCollection.doc(user.uid).update({
        annualGoal: goals.annual,
        monthlyGoal: goals.monthly
      })
      commit('finishedLoading')
      dispatch('fetchUserProfile', user)
    }
  },
  getters: {
    drawer: state => state.drawer,
    monthlyTotal: getters => {
      const today = new Date()
      let total = 0
      let array = []
      if (getters.userTrades) {
        array = getters.userTrades.filter(trade => {
          return trade.closed && moment(trade.closeDate).isSame(today, 'month')
        })
      }
      array.forEach(t => {
        total += t.profit
      })
      return total
    },
    annualTotal: getters => {
      const today = new Date()
      let total = 0
      let array = []
      if (getters.userTrades) {
        array = getters.userTrades.filter(trade => {
          return trade.closed && moment(trade.closeDate).isSame(today, 'year')
        })
      }
      array.forEach(t => {
        total += t.profit
      })
      return total
    },
    monthlyPercent: (state, getters) => {
      const v = getters.monthlyTotal / parseInt(state.userProfile.monthlyGoal) * 100
      if (isNaN(v)) {
        return 0
      } else {
        return v.toFixed(2)
      }
    },
    annualPercent: (state, getters) => {
      const v = getters.annualTotal / parseInt(state.userProfile.annualGoal) * 100
      if (isNaN(v)) {
        return 0
      } else {
        return v.toFixed(2)
      }
    },
    userTrades: (state) => {
      const userId = fb.auth.currentUser.uid
      return state.trades.filter(trade => {
        return trade.userId === userId
      })
    },
    profit: getters => {
      let p = 0
      if (getters.userTrades) {
        getters.userTrades.forEach(trade => {
          if (trade.profit) {
            p += trade.profit
          }
        })
      }
      return p
    },
    winTotal: getters => {
      let w = 0
      if (getters.userTrades) {
        getters.userTrades.forEach(trade => {
          if (trade.profit && trade.profit > 0) {
            w++
          }
        })
      }
      return w
    },
    lossTotal: getters => {
      let l = 0
      if (getters.userTrades) {
        getters.userTrades.forEach(trade => {
          if (trade.profit && trade.profit <= 0) {
            l++
          }
        })
      }
      return l
    },
    ratioPercentage: getters => {
      let r = '0%'
      const w = getters.winTotal
      const l = getters.lossTotal
      if (w > 0 && l === 0) {
        r = '100%'
      } else if (w > 0 && l > 0) {
        r = Math.round(w / (w + l))
        r = `${r}%`
      }
      return r
    }
  }
})

export default store
