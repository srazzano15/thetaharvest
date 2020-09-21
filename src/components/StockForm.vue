<template>
  <v-row justify="center">
    <v-dialog :value="showStockForm" persistent max-width="600px">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
          <v-toolbar-title>Add Stock</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form" :lazy-validation="true" v-model="valid" @submit.prevent>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    color="green"
                    label="Ticker *"
                    v-model="stock.ticker"
                    required
                    :rules="tickerRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    color="green"
                    label="Quantity *"
                    v-model.number="stock.quantity"
                    required
                    :rules="numberRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    color="green"
                    label="Cost Basis *"
                    v-model.number="stock.costBasis"
                    required
                    :rules="numberRules"
                    @keydown.enter="addStock"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <v-alert v-if="success" type="success" dense outlined>{{ successMessage }}</v-alert>
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
import { mapState, mapGetters } from 'vuex'
// import _ from 'lodash'
import moment from 'moment'

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
      numberRules: [
        v => !!v || 'This field is required',
        v => v > 0 || 'This number must be greater than 0'
      ],
      tickerRules: [
        v => !!v || 'A stock symbol is required',
        v => v.match(/[^a-zA-Z0-9]/g) === null || 'Only alpha-numeric characters are allowed'
      ],
      valid: true,
      success: false,
      successMessage: ''
    }
  },
  created () {
    this.$root.$on('buy-stock', () => {
      this.stock.ticker = this.trades[this.index].ticker
    })
  },
  computed: {
    ...mapState(['userProfile', 'trades']),
    ...mapGetters(['userTrades', 'userStocks'])
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
      this.$refs.form.validate()

      if (this.valid) {
        this.stock.ticker = this.stock.ticker.toUpperCase()
        // if userStocks has stocks in it...
        if (this.index > -1) {
          const q = this.trades[this.index].quantity + parseInt(this.stock.quantity)
          const cb = ((parseFloat(this.stock.costBasis) * parseInt(this.stock.quantity)) + (this.trades[this.index].quantity * this.trades[this.index].costBasis)) / q
          this.$store.dispatch('addStock', {
            ticker: this.trades[this.index].ticker,
            quantity: q,
            costBasis: cb,
            id: this.trades[this.index].id
          })

          this.successMessage = 'Cost Basis Updated'
          this.success = true
        } else {
          const d = new Date()
          this.$store.dispatch('addStock', {
            ticker: this.stock.ticker.toUpperCase(),
            created: moment(d).format(),
            quantity: parseInt(this.stock.quantity),
            costBasis: parseFloat(this.stock.costBasis)
          })

          this.successMessage = 'Stock Entry Created'
          this.success = true
        }

        // reset the form after a few "loading seconds"
        setTimeout(() => {
          this.closeStockForm()
        }, 1500)
      }
    }
  }
}
</script>
