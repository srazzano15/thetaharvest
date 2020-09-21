<template>
  <v-row justify="center">
    <v-dialog :value="showSellStockForm" persistent max-width="800px">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
            <v-toolbar-title>Sell Stocks</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="4">
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
                      v-on="on"
                      required
                      append-icon="mdi-calendar-clock"
                    ></v-text-field>
                  </template>
                  <v-date-picker color="green" v-model="closeDate" @input="cal = false"></v-date-picker>
                </v-menu>
              </v-col>
<!--               <v-col cols="3">
                <v-text-field color="green" label="Stock Ticker" :value="trades[index].ticker" :disabled="true"></v-text-field>
              </v-col> -->
              <v-col cols="4">
                <v-text-field color="green" label="Stock Price *" v-model.number="closePrice" required hint="The stock price that you closed your position at" persistent-hint></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field color="green" label="Commissions Paid" v-model.number="commissions" hint="Trade commission" persistent-hint></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <small>* indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeSellStockForm">Cancel</v-btn>
          <v-btn color="green darken-1 ml-5" @click="sellStock">Submit</v-btn>
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
  name: 'SellStockForm',
  props: ['showSellStockForm', 'index'],
  data () {
    return {
      closePrice: '',
      cal: false,
      closeDate: moment(new Date()).format('YYYY-MM-DD'),
      commissions: 0,
      costBasis: null
    }
  },
  mounted () {
  },
  computed: {
    ...mapState(['userProfile', 'trades']),
    ...mapGetters(['userTrades', 'userStocks'])
  },
  methods: {
    closeSellStockForm () {
      this.closePrice = ''
      this.commissions = ''
      this.$parent.$emit('close-sell-stock-form')
    },
    sellStock () {
      const c = this.commissions * 2
      this.costBasis = this.getCostBasis()
      const d = moment(this.closeDate).isBefore(new Date(), 'day') ? moment(this.closeDate).format() : moment(new Date()).format()
      this.$store.dispatch('sellStock', {
        closePrice: this.closePrice,
        closeDate: d,
        commissions: c,
        id: this.trades[this.index].id,
        costBasis: this.costBasis
      })
      console.log(this.costBasis)
      // reset the form after a few "loading seconds"
      setTimeout(() => {
        this.closeSellStockForm()
      }, 1500)
    },
    getCostBasis () {
      if (!this.userStocks) return 0
      const x = this.trades[this.index]
      const t = x.ticker.toUpperCase()
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
      return ((x.costBasis * x.quantity) - total) / x.quantity
    }
  }
}
</script>
