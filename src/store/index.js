import Vue from 'vue'
import Vuex from 'vuex'
import * as fb from '../firebase/firebase'
import router from '../router/index'
import moment from 'moment'
import _ from 'lodash'

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
  actions: {
    async login ({ dispatch, commit }, form) {
      // init user auth session in FB
      const { user } = await fb.auth.signInWithEmailAndPassword(form.email, form.password).catch(e => {
        commit('setError', e.message)
      })
      if (Object.keys(user).length > -1) {
        // fetch user profile and set in state
        dispatch('fetchUserProfile', user)
      }
    },
    async fetchUserProfile ({ commit }, user) {
      // fetch user profile
      const userProfile = await fb.usersCollection.doc(user.uid).get()

      // set user profile in state
      commit('setUserProfile', userProfile.data())

      if (router.currentRoute.name === 'Home' || router.currentRoute.name === 'login' || router.currentRoute.name === 'register') {
        // change route to dashboard
        router.push({ name: 'dashboard' })
      }
      commit('finishedLoading')
    },
    async register ({ dispatch, commit }, form) {
      // sign user up in FB
      const { user } = await fb.auth.createUserWithEmailAndPassword(form.email, form.password).catch(e => {
        commit('setError', e.message)
      })

      if (user && Object.keys(user).length > -1) {
        // create user profile object in usersCollections
        await fb.usersCollection.doc(user.uid).set({
          name: form.name,
          email: form.email,
          monthlyGoal: 0,
          annualGoal: 0,
          userStocks: []
        }).catch(e => e)

        // fetch user profile and set in state
        dispatch('fetchUserProfile', user)
      }
    },
    async logout ({ commit }) {
      await fb.auth.signOut()

      // clear userProfile and redirect to /login
      commit('setUserProfile', {})
      commit('setTrades', [])
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
        entryPrice: trade.entryPrice,
        legs: trade.legs,
        notes: trade.notes,
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
    async editTrade ({ state, commit }, trade) {
      await fb.tradesCollection.doc(trade.id).update({
        quantity: trade.quantity,
        entryPrice: trade.entryPrice,
        legs: trade.legs,
        notes: trade.notes
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
      let profit = t.type.includes('Long') ? Math.round(t.quantity * (trade.closePrice - t.entryPrice) * 100) - trade.commissions : Math.round(t.quantity * (t.entryPrice - trade.closePrice) * 100) - trade.commissions

      if (t.type === 'Covered Call' && trade.costBasis) {
        const prof = ((t.legs[0].strike - trade.costBasis) * 100) * t.quantity
        profit += prof
      }

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
    },
    async addStock ({ dispatch, commit }, stocks) {
      const user = fb.auth.currentUser
      await fb.usersCollection.doc(user.uid).update({
        userStocks: stocks
      })
      commit('finishedLoading')
      dispatch('fetchUserProfile', user)
    }
  },
  getters: {
    drawer: state => state.drawer,
    monthlyTotal: (state, getters) => {
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
    annualTotal: (state, getters) => {
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
    profit: (state, getters) => {
      let p = 0
      if (getters.userTrades && getters.userTrades.length) {
        getters.userTrades.forEach(trade => {
          if (trade.profit) {
            p += trade.profit
          }
        })
      }
      return p
    },
    winTotal: (state, getters) => {
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
    lossTotal: (state, getters) => {
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
    ratioPercentage: (state, getters) => {
      let r = '0%'
      const w = getters.winTotal
      const l = getters.lossTotal
      if (w > 0 && l === 0) {
        r = '100%'
      } else if (w > 0 && l > 0) {
        r = w / (w + l) * 100
        r = `${r.toFixed(2)}%`
      }
      return r
    },
    trendingTickers: (state) => {
      // only trades from the last 1 week
      const today = moment(new Date())

      const recentTrades = state.trades.filter(trade => {
        return today.diff(moment(trade.entryDate), 'days') < 7
      })
      // create an object
      const tickers = {}
      const trending = []
      // run a loop over all trades
      recentTrades.forEach(trade => {
        // check if the ticker is a key in the object
        if (Object.keys(tickers).includes(trade.ticker)) {
          // if the key exists, push a value to the array object key array
          tickers[trade.ticker].push(trade.userId)
        } else {
          // if not, create a new key in the object with an array as the value
          tickers[trade.ticker] = [trade.userId]
        }
      })
      // once the above process is complete, we will iterate over each object key
      for (const ticker in tickers) {
        // then we will flatten each array to unique values
        const arr = _.uniq(tickers[ticker])
        if (arr.length > 1) {
          // if the key => value array has more than 1 unique value, put that in an array
          trending.push(ticker)
        }
      }
      // return the array
      // return _.join(trending, ' ')
      return trending
    },
    trendingSentiment: (state) => {
      // only trades from the last 1 week
      const today = moment(new Date())

      const recentTrades = state.trades.filter(trade => {
        return today.diff(moment(trade.entryDate), 'days') < 7
      })
      let counted = 0
      let bt = 0
      const bullish = [
        'Put Credit Spread',
        'Cash Secured Put',
        'Jade Lizard',
        'Long Naked Call'
      ]
      const bearish = [
        'Call Credit Spread',
        'Covered Call',
        'Long Naked Put'
      ]

      recentTrades.forEach(trade => {
        if (bullish.includes(trade.type)) {
          counted++
          bt++
        } else if (bearish.includes(trade.type)) {
          counted++
        }
      })
      return Math.round((bt / counted) * 100)
    }
  }
})

export default store
