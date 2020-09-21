<template>
  <v-row justify="center">
    <v-dialog :value="showCloseTradeForm" persistent max-width="800px">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
            <v-toolbar-title>Close Trade</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" ref="form" @submit.prevent>
            <v-container>
              <v-row>
                <v-col cols="4">
                  <!-- <v-text-field color="green" label="Close Date *" v-model="closeDate"></v-text-field> -->
                  <v-menu
                    v-model="cal"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        color="green"
                        label="Close Date *"
                        v-model="closeDate"
                        readonly
                        v-bind="attrs"
                        :rules="[rules.required, rules.noFutureCloses]"
                        v-on="on"
                        required
                        append-icon="mdi-calendar-clock"
                      ></v-text-field>
                    </template>
                    <v-date-picker color="green" v-model="closeDate" @input="cal = false"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    color="green"
                    label="Price Closed *"
                    v-model.number="closePrice"
                    :readonly="assigned || exercised"
                    required
                    :rules="[rules.required, rules.isNumber]"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    color="green"
                    label="Commissions Paid"
                    v-model.number="commissions"
                    hint="Amount per contract"
                    :placeholder="`${userProfile.fees}`"
                    persistent-hint
                    @keydown.enter="closeTrade"
                  ></v-text-field>
                </v-col>
                <v-col v-if="trades[index] && trades[index].type === 'Cash Secured Put'" cols="4">
                  <v-switch
                    @change="$emit('assigned')"
                    color="green" label="Assigned?"
                    v-model="assigned"
                    @keydown.enter="closeTrade"
                  ></v-switch>
                </v-col>
                <v-col v-if="trades[index] && trades[index].type === 'Covered Call'" cols="4">
                  <v-switch
                    @change="$emit('assigned')"
                    color="green"
                    label="Exercised?"
                    v-model="exercised"
                    @keydown.enter="closeTrade"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <v-alert v-if="error" type="error" dense outlined>{{ errorMsg }}</v-alert>
          <small>* indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeTradeForm">Cancel</v-btn>
          <v-btn color="green darken-1 ml-5" @click="closeTrade">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
import _ from 'lodash'
export default {
  name: 'CloseTrade',
  props: ['showCloseTradeForm', 'index'],
  data () {
    return {
      closePrice: '',
      cal: false,
      closeDate: moment(new Date()).format('YYYY-MM-DD'),
      commissions: '',
      assigned: false,
      exercised: false,
      costBasis: 0,
      valid: true,
      error: false,
      errorMsg: null,
      rules: {
        required: v => !!v || 'This field is required',
        noFutureCloses: v => moment(v).isSameOrBefore(moment(new Date()), 'day') || 'You cannot set a close date at a future date',
        isNumber: v => /[^0-9]/.test(v) || 'This must be a number'
      }
    }
  },
  mounted () {
    this.$on('assigned', () => {
      if (this.closePrice === '') {
        this.closePrice = 0
      } else {
        this.closePrice = ''
      }
    })
  },
  computed: {
    ...mapState(['userProfile', 'trades']),
    ...mapGetters(['userTrades', 'userStocks'])
  },
  methods: {
    closeTradeForm () {
      this.closePrice = ''
      this.commissions = ''
      this.assigned = false
      this.exercised = false
      this.error = false
      this.errorMsg = null
      this.$parent.$emit('close-form')
    },
    async closeTrade () {
      this.$refs.form.validate()
      if (this.valid) {
        let c = (this.trades[this.index].legs.length * this.trades[this.index].quantity * 2)
        c = this.commissions !== '' ? c * this.commissions : c * this.userProfile.fees
        const d = moment(this.closeDate).isBefore(new Date(), 'day') ? moment(this.closeDate).format() : moment(new Date()).format()

        if (this.trades[this.index].type === 'Cash Secured Put' && this.assigned) {
          await this.cspAssigned()
        } else if (this.trades[this.index].type === 'Covered Call' && this.exercised) {
          await this.ccExercised()
        }

        if (!this.error) {
          this.$store.dispatch('closeTrade', {
            closePrice: this.closePrice,
            closeDate: d,
            commissions: c,
            index: this.index,
            costBasis: this.costBasis,
            exercised: this.exercised
          })
          // reset the form after a few "loading seconds"
          setTimeout(() => {
            this.closeTradeForm()
          }, 1500)
        }
      }
    },
    cspAssigned () {
      // if assigned...
      // get the index of the trade
      const x = this.trades[this.index]
      // get the ticker
      const t = x.ticker.toUpperCase()
      // determine quantity by multiplying contracts * 100
      const q = x.quantity * 100
      // the cost basis is the strike
      const cb = x.legs[0].strike
      // get the unsold user stocks
      const userStocks = this.userStocks
      // find the index based on the stock ticker
      const i = _.findIndex(userStocks, (o) => {
        return o.ticker === t && !o.closed
      })
      // if an index is found...
      if (i > -1) {
        // get the sum of the stock entry and assignment quantities
        const quantity = userStocks[i].quantity + q
        // add the stock values together to get total position value and divide by quantity of newly combined positions
        const costBasis = ((cb * q) + (userStocks[i].quantity * userStocks[i].costBasis)) / quantity

        this.$store.dispatch('addStock', {
          ticker: this.trades[this.index].ticker,
          quantity: quantity,
          costBasis: costBasis,
          id: userStocks[i].id
        })
      } else {
        this.$store.dispatch('addStock', {
          ticker: t,
          created: moment(new Date()).format(),
          quantity: q,
          costBasis: cb
        })
      }
    },
    ccExercised () {
      this.error = false
      this.errorMsg = ''
      const x = this.trades[this.index]

      // get the ticker from the current trade
      const ticker = x.ticker

      // check if that ticker is a cost basis entry by filtering by ticker and not closed
      const i = _.findIndex(this.userStocks, (o) => {
        return o.ticker === ticker && !o.closed
      })

      // if an entry does exist...
      if (i < 0) {
        this.error = true
        this.errorMsg = 'You do not own this stock, please add this stock to your portfolio to close this trade. '
      } else if (i > -1) {
        // we need to get the adjusted cost basis based on all profit gained since last stock sell or exercised trade
        const stockEntry = this.userStocks[i]
        const cb = stockEntry.costBasis
        const quant = stockEntry.quantity
        const adjustedCb = this.getAdjustedCB(ticker, cb, quant)

        // we then need to take the profit from the sell
        const profit = x.entryPrice * x.quantity * 100
        // get the new adjusted cost basis
        const newAdjustedCb = ((adjustedCb * quant) - profit) / quant

        // once we have the above, we should have everything we need
        const d = moment(this.closeDate).isBefore(new Date(), 'day') ? moment(this.closeDate).format() : moment(new Date()).format()
        this.costBasis = newAdjustedCb
        this.$store.dispatch('sellStock', {
          closePrice: x.legs[0].strike,
          closeDate: d,
          commissions: 0,
          id: stockEntry.id,
          costBasis: x.legs[0].strike
        })
      }
    },
    /* ccExercised () {
      // get the index of the trade
      const x = this.trades[this.index]
      // get the ticker
      const ticker = x.ticker.toUpperCase()
      // get quantity
      const quantity = x.quantity
      // strike
      const strike = x.legs[0].strike
      // get the total trade value to add to the total stock CB for sale
      const totalTrade = (strike * (quantity * 100)) - (this.closePrice * (quantity * 100))
      // find the index based on the stock ticker
      const i = _.findIndex(this.userStocks, (o) => {
        return o.ticker === t && !o.closed
      })
      this.getAdjustedCB(ticker, )
      if (i > -1) {
        userStocks = _.remove(userStocks, n => {
          return n.ticker !== t
        })
      }

      this.$store.dispatch('addStock', userStocks)
    }, */
    getAdjustedCB (t, v, q) {
      if (!this.userTrades) return 0
      let total = 0
      let trades = _.filter(this.userTrades, ['ticker', t])
      const stocks = _.filter(this.userStocks, ['ticker', t])
      trades = trades.concat(stocks)
      trades = _.sortBy(trades, 'closeDate')
      const rt = _.reverse(trades)
      for (const trade of rt) {
        if (trade.exercised === true) break
        else if (trade.closed && trade.profit) total += parseFloat(trade.profit)
      }
      return ((v * q) - total) / q
    }
  }
}
</script>
