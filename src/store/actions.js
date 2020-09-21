import router from '../router/index'
import * as fb from '../firebase/firebase'
import _ from 'lodash'
export default {
  async login ({ dispatch, commit }, form) {
    // init user auth session in FB
    const { user } = await fb.auth
      .signInWithEmailAndPassword(form.email, form.password)
      .catch(e => {
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

    if (
      router.currentRoute.name === 'Home' ||
      router.currentRoute.name === 'login' ||
      router.currentRoute.name === 'register'
    ) {
      // change route to dashboard
      router.push({ name: 'dashboard' })
    }
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
  },
  async register ({ dispatch, commit }, form) {
    // sign user up in FB
    const { user } = await fb.auth
      .createUserWithEmailAndPassword(form.email, form.password)
      .catch(e => {
        commit('setError', e.message)
      })

    if (user && Object.keys(user).length > -1) {
      // create user profile object in usersCollections
      await fb.usersCollection
        .doc(user.uid)
        .set({
          name: form.name,
          email: form.email,
          monthlyGoal: 0,
          annualGoal: 0,
          fees: 0
        })
        .catch(e => e)

      // fetch user profile and set in state
      dispatch('fetchUserProfile', user)
    }
  },
  async logout ({ commit }) {
    await fb.auth.signOut()

    // clear userProfile and redirect to /login
    commit('setUserProfile', {})
    commit('setTrades', [])
    // router.push('/')
    window.location.href = '/'
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

      commit('setTrades', t)
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

      commit('setTrades', t)
    })
  },
  async closeTrade ({ state, commit }, trade) {
    const t = state.trades[trade.index]
    let profit = t.type.includes('Long') || t.type.includes('Debit')
      ? Math.round(t.quantity * (trade.closePrice - t.entryPrice) * 100) -
        trade.commissions
      : Math.round(t.quantity * (t.entryPrice - trade.closePrice) * 100) -
        trade.commissions

    if (t.type === 'Covered Call' && trade.exercised) {
      console.log('cost basis')
      const prof = ((t.legs[0].strike - trade.costBasis) * 100 * t.quantity)
      profit += (prof - profit)
    }

    await fb.tradesCollection.doc(t.id).update({
      closeDate: trade.closeDate,
      closePrice: trade.closePrice,
      commissions: trade.commissions,
      profit: profit,
      closed: true,
      exercised: trade.exercised
    })

    // retrieve trades for the user
    fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
      const t = []

      snapshot.forEach(doc => {
        const trade = doc.data()
        trade.id = doc.id

        t.push(trade)
      })

      commit('setTrades', t)
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

      commit('setTrades', t)
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
  async addStock ({ state, commit }, trade) {
    if (trade.id) {
      await fb.tradesCollection.doc(trade.id).update({
        ticker: trade.ticker,
        costBasis: trade.costBasis,
        quantity: trade.quantity,
        userId: fb.auth.currentUser.uid,
        userName: state.userProfile.name
      })
    } else {
      await fb.tradesCollection.add({
        created: trade.created,
        closed: false,
        type: 'Stock',
        ticker: trade.ticker,
        costBasis: trade.costBasis,
        entryDate: trade.created,
        quantity: trade.quantity,
        userId: fb.auth.currentUser.uid,
        userName: state.userProfile.name,
        exercised: false
      })
    }

    // retrieve trades for the user
    fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
      const t = []

      snapshot.forEach(doc => {
        const trade = doc.data()
        trade.id = doc.id

        t.push(trade)
      })

      commit('setTrades', t)
    })
  },
  async sellStock ({ state, commit }, trade) {
    // const t = state.trades[trade.index]
    const i = _.findIndex(state.trades, (o) => {
      return o.id === trade.id
    })
    const t = state.trades[i]
    const id = trade.id ? trade.id : t.id
    // bringing in stock price, ticker, and trade index, and cost basis to make my life easy
    // calculate profit by multiplying total cost of position and subtracting by total cost of sell price * quantity
    const profit = Math.round(((trade.closePrice * t.quantity) - (trade.costBasis * t.quantity)) * 100) / 100

    await fb.tradesCollection.doc(id).update({
      closeDate: trade.closeDate,
      closePrice: trade.closePrice,
      commissions: trade.commissions,
      profit: profit,
      closed: true,
      exercised: true
    })

    // retrieve trades for the user
    fb.tradesCollection.orderBy('created', 'desc').onSnapshot(snapshot => {
      const t = []

      snapshot.forEach(doc => {
        const trade = doc.data()
        trade.id = doc.id

        t.push(trade)
      })

      commit('setTrades', t)
    })
  },
  async updateProfile ({ dispatch }, user) {
    const userId = fb.auth.currentUser.uid
    // update user object
    await fb.usersCollection.doc(userId).update({
      name: user.name,
      fees: user.fees
    })

    dispatch('fetchUserProfile', { uid: userId })

    // update all of the user's trades
    const trades = await fb.tradesCollection.where('userId', '==', userId).get()
    trades.forEach(doc => {
      fb.tradesCollection.doc(doc.id).update({
        userName: user.name
      })
    })
  }
}
