<template>
  <v-card>
    <v-toolbar class="text-h5 elevation-0">
      <v-toolbar-title class="text-h5">Stock Portfolio Value: ${{ getPortfolioValue }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="stockSearch"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        color="green"
        hide-details
      ></v-text-field>
    </v-toolbar>
    <v-divider></v-divider>
    <v-data-table
      :headers="headers"
      :items="items"
      :search="stockSearch"
    >
      <template v-slot:[`item.costBasis`]="{ item }">
        {{ item.costBasis.toFixed(2) }}
      </template>

      <template v-slot:[`item.maxAdjustment`]="{ item }">
        {{ getMaxAdjustment(item.ticker, item.quantity).toFixed(2) }}
      </template>

      <template v-slot:[`item.adjustedCostBasis`]="{ item }">
        {{ getAdjustedCB(item.ticker, item.costBasis, item.quantity).toFixed(2) }}
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          class="mr-1"
          v-if="!item.closed"
          color="green lighten-2"
          x-small
          depressed
          @click="sellStock(item)"
        >
          Sell
        </v-btn>

        <v-btn
          class="mr-1"
          color="grey lighten-1"
          x-small
          v-if="!item.closed"
          depressed
          @click="editEntry(item)"
        >
          Add
        </v-btn>

        <v-btn
          x-small
          depressed
          color="red lighten-1"
          @click="deleteEntry(item)"
        >
          Delete
        </v-btn>
      </template>

    </v-data-table>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'StockTable',
  props: ['trades'],
  data () {
    return {
      stockSearch: '',
      editedIndex: -1,
      headers: [
        {
          text: 'Ticker',
          value: 'ticker',
          align: 'start'
        },
        {
          text: '# of Shares',
          value: 'quantity'
        },
        {
          text: 'Cost Basis',
          value: 'costBasis'
        },
        {
          text: 'Cost Basis Adjustment',
          value: 'maxAdjustment'
        },
        {
          text: 'Adjusted Cost Basis',
          value: 'adjustedCostBasis'
        },
        {
          text: 'Actions',
          value: 'actions'
        }
      ]
    }
  },
  computed: {
    ...mapState(['userProfile']),
    ...mapGetters(['userTrades', 'userStocks']),
    getPortfolioValue () {
      if (!this.userStocks) return 0
      let total = 0
      _.forEach(this.userStocks, stock => {
        if (stock.closed === false) total += (stock.costBasis * stock.quantity)
      })
      return total
    },
    items () {
      return this.userStocks.filter(stock => !stock.closed)
    }
  },
  methods: {
    getMaxAdjustment (t, q) {
      if (!this.userTrades) return 0
      let total = 0
      let trades = _.filter(this.userTrades, ['ticker', t])
      const stocks = _.filter(this.userStocks, ['ticker', t])
      trades = trades.concat(stocks)
      trades = _.sortBy(trades, 'closeDate')
      const rt = _.reverse(trades)
      for (const trade of rt) {
        if (trade.exercised) break
        else if (trade.closed && trade.profit) total += parseFloat(trade.profit)
      }
      return total / q
    },
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
    },
    deleteEntry (item) {
      const c = confirm('Are you sure you want to delete this entry? This cannot be undone.')
      this.editedIndex = this.trades.indexOf(item)
      if (c) {
        this.$store.dispatch('deleteTrade', { index: this.editedIndex })
        this.editedIndex = -1
      }
    },
    editEntry (item) {
      this.$root.$emit('add-stock', item)
    },
    sellStock (item) {
      this.$root.$emit('sell-stock', item)
    }
  }
}
</script>

<style></style>
