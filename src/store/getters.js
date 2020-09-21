import _ from 'lodash'
import moment from 'moment'
import * as fb from '../firebase/firebase'

export default {
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
    const v =
      (getters.monthlyTotal / parseInt(state.userProfile.monthlyGoal)) * 100
    if (isNaN(v)) {
      return 0
    } else {
      return v.toFixed(2)
    }
  },
  annualPercent: (state, getters) => {
    const v =
      (getters.annualTotal / parseInt(state.userProfile.annualGoal)) * 100
    if (isNaN(v)) {
      return 0
    } else {
      return v.toFixed(2)
    }
  },
  userTrades: state => {
    const userId = fb.auth.currentUser.uid
    return state.trades.filter(trade => {
      return trade.userId === userId && trade.type !== 'Stock'
    })
  },
  userStocks: state => {
    const userId = fb.auth.currentUser.uid
    return state.trades.filter(trade => {
      return trade.userId === userId && trade.type === 'Stock'
    })
  },
  profit: (state) => {
    let p = 0
    const userId = fb.auth.currentUser.uid
    const userTrades = state.trades.filter(trade => {
      return trade.userId === userId && trade.closed
    })
    if (userTrades && userTrades.length) {
      userTrades.forEach(trade => {
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
      r = (w / (w + l)) * 100
      r = `${r.toFixed(2)}%`
    }
    return r
  },
  trendingTickers: state => {
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
  trendingSentiment: state => {
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
    const bearish = ['Call Credit Spread', 'Covered Call', 'Long Naked Put']

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
