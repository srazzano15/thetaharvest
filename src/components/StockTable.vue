<template>
  <v-card>
    <v-toolbar class="text-h5 elevation-0">
      <v-toolbar-title class="text-h5">Stocks</v-toolbar-title>
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
      :items="userProfile.userStocks"
      :search="stockSearch"
    >

      <template v-slot:[`item.maxAdjustment`]="{ item }">
        {{ getMaxAdjustment(item.ticker).toFixed(2) }}
      </template>

      <template v-slot:[`item.adjustedCostBasis`]="{ item }">
        {{ getAdjustedCB(item.ticker, item.costBasis, item.quantity).toFixed(2) }}
      </template>

    </v-data-table>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'StockTable',
  data () {
    return {
      stockSearch: '',
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
        }
      ]
    }
  },
  computed: {
    ...mapState(['userProfile']),
    ...mapGetters(['userTrades'])
  },
  methods: {
    getMaxAdjustment (t) {
      if (!this.userTrades) return 0
      let total = 0
      this.userTrades.forEach(trade => {
        if (trade.ticker === t && trade.profit) {
          total += parseFloat(trade.profit)
        }
      })
      return total
    },
    getAdjustedCB (t, v, q) {
      if (!this.userTrades) return 0
      let total = 0
      this.userTrades.forEach(trade => {
        if (trade.ticker === t && trade.profit) {
          total += parseFloat(trade.profit)
        }
      })
      return ((v * q) - total) / q
    }
  }
}
</script>

<style></style>
