<template>
  <v-row justify="center">
    <v-dialog :value="showStockForm" persistent max-width="600px">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
            <v-toolbar-title>Add Stock</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field color="green" label="Ticker *" v-model="stock.ticker" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field color="green" label="Quantity *" v-model.number="stock.quantity" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field color="green" label="Cost Basis *" v-model.number="stock.costBasis" required></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <v-alert v-if="success" type="success" outlined>{{ successMessage }}</v-alert>
          <small>* indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeStockForm">Cancel</v-btn>
          <v-btn color="green darken-1 ml-5" @click="addStock">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
export default {
  name: 'StockForm',
  props: ['showStockForm', 'index'],
  data () {
    return {
      stock: {
        ticker: '',
        quantity: '',
        costBasis: ''
      },
      success: false,
      successMessage: ''
    }
  },
  computed: {
    ...mapState(['userProfile', 'trades'])
  },
  methods: {
    closeStockForm () {
      this.closePrice = ''
      this.stock = {
        ticker: '',
        quantity: '',
        costBasis: ''
      }
      this.success = false
      this.successMessage = ''
      this.$parent.$emit('close-stock-form')
    },
    addStock () {
      this.stock.ticker = this.stock.ticker.toUpperCase()
      const userStocks = this.userProfile.userStocks
      const i = _.findIndex(userStocks, (o) => {
        return o.ticker === this.stock.ticker
      })
      // if userStocks has stocks in it...
      if (i > -1) {
        userStocks[i] = this.stock
        this.successMessage = 'Cost Basis Updated'
      } else {
        userStocks.push(this.stock)
        this.successMessage = 'Stock Entry Created'
      }
      this.success = true
      this.$store.dispatch('addStock', userStocks)
      // reset the form after a few "loading seconds"
      setTimeout(() => {
        this.closeStockForm()
      }, 1500)
    }
  }
}
</script>
