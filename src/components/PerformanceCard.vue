<template>
  <v-card flat>
    <v-card-text>
      <v-row>
        <v-col cols="4" md="2">
          <v-card
            color="blue-grey lighten-4"
            class="grey--text text--darken-1 text-center px-2 py-6 text-body-2 text-md-h6"
          >
            # of Trades
            <div v-if="loading" class="grey--text text--darken-3 text-button text-md-h4 font-weight-thin pt-4">
              --
            </div>
            <div v-else class="grey--text text--darken-3 text-h5 text-md-h4 pt-4">
              {{ calcUserTrades.length }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="8" md="4">
          <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-body-2 text-md-h6">Profit/Loss:
            <div v-if="loading" class="grey--text text--darken-3 text-button text-md-h4 font-weight-thin pt-4">
              Loading...
            </div>
            <div v-else class="text-h5 text-md-h4 text-lg-h4 pt-4" :class="{ 'green--text': calcProfit > 0, 'red--text': calcProfit < 0 }">
              {{ 0 > calcProfit ? `- $${(calcProfit * -1).toFixed(2)}` :  `+ $${calcProfit.toFixed(2)}`}}
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-body-2 text-md-h6">Win Ratio
            <div v-if="loading" class="grey--text text--darken-3 text-button text-md-h4 font-weight-thin pt-4">
              Loading...
            </div>
            <div v-else class="grey--text text--darken-3 text-h5 text-md-h4 pt-4">
              {{ `${calcWinTotal} / ${calcLossTotal}` }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-body-2 text-md-h6">Win Percentage
            <div v-if="loading" class="grey--text text--darken-3 text-button text-md-h4 font-weight-thin pt-4">
              Loading...
            </div>
            <div v-else class="grey--text text--darken-3 text-h5 text-md-h4 pt-4">
              {{ getWinLossRatioFromTimeFrame (calcWinTotal, calcLossTotal) }}
            </div>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" md="3">
          <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-body-2 text-md-h6">Max Profit
            <div v-if="loading" class="grey--text text--darken-3 text-button text-md-h4 font-weight-thin pt-4">
              Loading...
            </div>
            <div v-else class="grey--text text--darken-3 text-h5 text-md-h4 pt-4">
              {{ `$${calcMaxProfit.toFixed(2)}` }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-body-2 text-md-h6">Realized Gain
            <div v-if="loading" class="grey--text text--darken-3 text-button text-md-h4 font-weight-thin pt-4">
              Loading...
            </div>
            <div v-else class="grey--text text--darken-3 text-h5 text-md-h4 pt-4">
              {{ `${calcProfit ? ((calcProfit / (calcDeployedCap || 100)) * 100).toFixed(2) : 0}%` }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-body-2 text-md-h6">Total Cap Deployed
            <div v-if="loading" class="grey--text text--darken-3 text-button text-md-h4 font-weight-thin pt-4">
              Loading...
            </div>
            <div v-else class="grey--text text--darken-3 text-h5 text-md-h4 pt-4">
              {{ `$${calcDeployedCap}` }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-body-2 text-md-h6">Avg Duration
            <div v-if="loading" class="grey--text text--darken-3 text-button text-md-h4 font-weight-thin pt-4">
              Loading...
            </div>
            <div v-else class="grey--text text--darken-3 text-h5 text-md-h4 pt-4">
              {{ `${calcAvgDuration} Days` }}
            </div>
          </v-card>
        </v-col>
        <!-- <v-col cols="12">
          <v-card color="blue-grey lighten-4" class="text-center px-2 py-6 text-h5 grey--text text--darken-1">Progress To Monthly Goal
            <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
              Loading...
            </div>
            <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
              {{ `$${calcProfit.toFixed(2)} / $${userProfile.monthlyGoal} (${monthlyPercent}%)`}}
            </div>
          </v-card>
        </v-col> -->
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
export default {
  name: 'PerformanceCard',
  props: ['timeFrame'],
  computed: {
    ...mapState(['userProfile', 'loading']),
    ...mapGetters(['userTrades', 'userStocks', 'profit', 'winTotal', 'lossTotal', 'monthlyTotal', 'annualTotal', 'ratioPercentage', 'annualPercent', 'monthlyPercent']),
    calcProfit () {
      switch (this.timeFrame) {
        case 'month':
          return this.getProfitFromTimeFrame('month') + this.getStockProfitFromTimeframe('month')
        case 'year':
          return this.getProfitFromTimeFrame('year') + this.getStockProfitFromTimeframe('year')
        default:
          return this.profit
      }
    },
    calcWinTotal () {
      switch (this.timeFrame) {
        case 'month':
          return this.getWinTotalFromTimeFrame('month')
        case 'year':
          return this.getWinTotalFromTimeFrame('year')
        default:
          return this.winTotal
      }
    },
    calcLossTotal () {
      switch (this.timeFrame) {
        case 'month':
          return this.getLossTotalFromTimeFrame('month')
        case 'year':
          return this.getLossTotalFromTimeFrame('year')
        default:
          return this.lossTotal
      }
    },
    calcUserTrades () {
      switch (this.timeFrame) {
        case 'month':
          return this.filterUserTrades('month')
        case 'year':
          return this.filterUserTrades('year')
        default:
          return this.userTrades
      }
    },
    calcDeployedCap () {
      switch (this.timeFrame) {
        case 'month':
          return this.getDeployedCapital('month')
        case 'year':
          return this.getDeployedCapital('year')
        default:
          return this.getDeployedCapital()
      }
    },
    calcMaxProfit () {
      switch (this.timeFrame) {
        case 'month':
          return this.getMaxProfit('month')
        case 'year':
          return this.getMaxProfit('year')
        default:
          return this.getMaxProfit()
      }
    },
    calcAvgDuration () {
      switch (this.timeFrame) {
        case 'month':
          return this.getAvgDuration('month')
        case 'year':
          return this.getAvgDuration('year')
        default:
          return this.getAvgDuration()
      }
    },
    calcGoal () {
      switch (this.timeFrame) {
        case 'month':
          return this.getAvgDuration('month')
        case 'year':
          return this.getAvgDuration('year')
        default:
          return this.getAvgDuration()
      }
    }
  },
  methods: {
    formatProfit (val) {
      if (!val) {
        return ''
      } else {
        return val > 0 ? `$${val.toFixed(2)}` : `-$${val.toFixed(2) * -1}`
      }
    },
    filterUserTrades (time) {
      let t = []
      if (this.userTrades && this.userTrades.length) {
        const today = moment(new Date())
        t = this.userTrades.filter(trade => {
          if (trade.closed) {
            return moment(trade.closeDate).isSame(today, time)
          } else {
            return moment(trade.entryDate).isSame(today, time)
          }
        })
      }
      return t
    },
    getProfitFromTimeFrame (time) {
      let p = 0
      const t = time ? this.filterUserTrades(time) : this.userTrades
      t.forEach(trade => {
        if (trade.profit) {
          p += trade.profit
        }
      })
      return p
    },
    getStockProfitFromTimeframe (time) {
      let s = []
      let p = 0
      if (this.userStocks && this.userStocks.length) {
        const today = moment(new Date())
        s = this.userStocks.filter(trade => {
          if (trade.closed) {
            return moment(trade.closeDate).isSame(today, time)
          } else {
            return moment(trade.created).isSame(today, time)
          }
        })
      }
      s.forEach(trade => {
        if (trade.profit) {
          p += trade.profit
        }
      })
      return p
    },
    getWinTotalFromTimeFrame (time) {
      let w = 0
      const t = this.filterUserTrades(time)
      t.forEach(trade => {
        if (trade.profit && trade.profit > 0) {
          w++
        }
      })
      return w
    },
    getLossTotalFromTimeFrame (time) {
      let l = 0
      const t = this.filterUserTrades(time)
      t.forEach(trade => {
        if (trade.profit && trade.profit <= 0) {
          l++
        }
      })
      return l
    },
    getWinLossRatioFromTimeFrame (win, loss) {
      let r = '0%'
      const w = win
      const l = loss
      if (w > 0 && l === 0) {
        r = '100%'
      } else if (w > 0 && l > 0) {
        r = w / (w + l) * 100
        r = `${r.toFixed(2)}%`
      }
      return r
    },
    getDeployedCapital (time) {
      let sum = 0
      const t = time ? this.filterUserTrades(time) : this.userTrades
      const uniqueTypes = [
        'Put Debit Spread',
        'Call Debit Spread',
        'Covered Call',
        'Long Straddle',
        'Long Strangle',
        'Long Naked Call',
        'Long Naked Put'
      ]
      t.forEach(trade => {
        const q = trade.quantity
        if (!uniqueTypes.includes(trade.type)) {
          let s = 0
          for (const leg of trade.legs) {
            if (leg.action === 'Sell') {
              s += parseFloat(leg.strike)
            }
          }
          sum += this.calcTotal(s, q)
        } else if (trade.type.includes('Long') || trade.type.includes('Debit')) {
          sum += this.calcTotal(trade.entryPrice, q)
        }
      })

      return sum
    },
    getPercentOfMaxProfit (time) {
    },
    getMaxProfit (time) {
      let sum = 0
      const t = time ? this.filterUserTrades(time) : this.userTrades
      t.forEach(trade => {
        if (!trade.type.includes('Long') && !trade.profit) {
          sum += this.calcTotal(trade.entryPrice, trade.quantity)
        } else if (!trade.type.includes('Long') && trade.profit) {
          sum += trade.profit
        }
      })

      return sum
    },
    getAvgDuration (time) {
      let sum = 0
      const t = time ? this.filterUserTrades(time) : this.userTrades
      t.forEach(trade => {
        if (trade.closed) {
          const o = moment(trade.entryDate)
          const c = moment(trade.closeDate)
          const d = c.diff(o, 'days')
          sum += d
        }
      })
      if (t.length) {
        return (sum / t.length).toFixed(1)
      } else {
        return 0
      }
    },
    calcTotal (value, quantity) {
      return (value * 100) * quantity
    }
  }
}
</script>
