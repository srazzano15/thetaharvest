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
    profit: 0,
    winTotal: 0,
    lossTotal: 0,
    ratioPercentage: '',
    loading: true
  },
  mutations: {
    navDrawerToggle: state => (state.drawer = !state.drawer),
    setUserProfile: (state, val) => (state.userProfile = val),
    setTrades: (state, val) => (state.trades = val),
    calculateProfit: (state, val) => (state.profit = val),
    addWin: (state, val) => (state.winTotal = val),
    addLoss: (state, val) => (state.lossTotal = val),
    ratioPercentage: (state, val) => (state.ratioPercentage = val),
    finishedLoading: state => (state.loading = !state.loading)
  },
  actions: {
    async login ({ dispatch }, form) {
      // init user auth session in FB
      const { user } = await fb.auth.signInWithEmailAndPassword(form.email, form.password)

      // fetch user profile and set in state
      dispatch('fetchUserProfile', user)
    },
    async fetchUserProfile ({ state, commit }, user) {
      // fetch user profile
      const userProfile = await fb.usersCollection.doc(user.uid).get()

      // set user profile in state
      commit('setUserProfile', userProfile.data())

      fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
        const t = []
        let p = 0
        let w = 0
        let l = 0
        let r = '0%'
        snapshot.forEach(doc => {
          const trade = doc.data()
          trade.id = doc.id

          if (trade.userId === user.uid) {
            t.push(trade)
          }
          if (trade.userId === user.uid && trade.profit) {
            p += parseFloat(trade.profit)
            if (trade.profit > 0) {
              w++
            } else {
              l++
            }
          }
        })
        if (w > 0 && l === 0) {
          r = '100%'
        } else if (w > 0 && l > 0) {
          r = Math.round(w / (w + l))
          r = `${r}%`
        }
        store.commit('finishedLoading')
        store.commit('ratioPercentage', r)
        store.commit('addLoss', l)
        store.commit('addWin', w)
        store.commit('setTrades', t)
        store.commit('calculateProfit', p)
      })

      if (router.currentRoute.path === '/login' || router.currentRoute.path === '/' || router.currentRoute.path === '/register') {
        // change route to dashboard
        router.push('/dashboard')
      }
    },
    async register ({ dispatch }, form) {
      // sign user up in FB
      const { user } = await fb.auth.createUserWithEmailAndPassword(form.email, form.password)

      // create user profile object in usersCollections
      await fb.usersCollection.doc(user.uid).set({
        name: form.name,
        email: form.email
      })

      // fetch user profile and set in state
      dispatch('fetchUserProfile', user)
    },
    async logout ({ commit }) {
      await fb.auth.signOut()

      // clear userProfile and redirect to /login
      commit('setUserProfile', {})
      router.push('/login')
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
      fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
        const t = []
        let p = 0
        snapshot.forEach(doc => {
          const trade = doc.data()
          trade.id = doc.id

          t.push(trade)
          p += trade.profit
        })

        store.commit('setTrades', t)
        store.commit('calculateProfit', p)
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
    async setGoals ({ dispatch }, goals) {
      const userId = fb.auth.currentUser.uid
      await fb.usersCollection.doc(userId).update({
        annualGoal: goals.annual,
        monthlyGoal: goals.monthly
      })
      dispatch('fetchUserProfile', { uid: userId })
    }
  },
  getters: {
    drawer: state => state.drawer,
    monthlyTotal: state => {
      const today = new Date()
      let total = 0
      const array = state.trades.filter(trade => {
        return trade.closed && moment(trade.closeDate).isSame(today, 'month')
      })
      array.forEach(t => {
        total += t.profit
      })
      return total
    },
    annualTotal: state => {
      const today = new Date()
      let total = 0
      const array = state.trades.filter(trade => {
        return trade.closed && moment(trade.closeDate).isSame(today, 'year')
      })
      array.forEach(t => {
        total += t.profit
      })
      return total
    },
    monthlyPercent: (state, getters) => {
      const v = getters.monthlyTotal / parseInt(state.userProfile.monthlyGoal) * 100
      return v.toFixed(2)
    },
    annualPercent: (state, getters) => {
      const v = getters.annualTotal / parseInt(state.userProfile.annualGoal) * 100
      return v.toFixed(2)
    }
  }
})

export default store
