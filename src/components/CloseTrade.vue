<template>
  <v-row justify="center">
    <v-dialog :value="showCloseTradeForm" persistent max-width="800px">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
            <v-toolbar-title>Close Trade</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
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
                      label="Expiration Date *"
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
              <v-col cols="4">
                <v-text-field color="green" label="Price Closed *" v-model.number="closePrice" :readonly="assigned || exercised" required></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field color="green" label="Commissions Paid" v-model.number="commissions" hint="Amount per contract" persistent-hint></v-text-field>
              </v-col>
              <v-col v-if="trades[index] && trades[index].type === 'Cash Secured Put'" cols="4">
                <v-switch @change="$emit('assigned')" color="green" label="Assigned?" v-model="assigned"></v-switch>
              </v-col>
              <v-col v-if="trades[index] && trades[index].type === 'Covered Call'" cols="4">
                <v-switch @change="$emit('assigned')" color="green" label="Exercised?" v-model="exercised"></v-switch>
              </v-col>
            </v-row>
          </v-container>
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
      commissions: 0,
      assigned: false,
      exercised: false,
      costBasis: null
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
    ...mapGetters(['userTrades'])
  },
  methods: {
    closeTradeForm () {
      this.closePrice = ''
      this.commissions = ''
      this.$parent.$emit('close-form')
    },
    closeTrade () {
      if (this.trades[this.index].type === 'Cash Secured Put' && this.assigned) {
        this.cspAssigned()
      } else if (this.trades[this.index].type === 'Covered Call' && this.exercised) {
        this.ccExercised()
        this.costBasis = this.getCostBasis()
      }
      const c = (this.trades[this.index].legs.length * this.trades[this.index].quantity * 2) * this.commissions
      this.$store.dispatch('closeTrade', {
        closePrice: this.closePrice,
        closeDate: this.closeDate,
        commissions: c,
        index: this.index,
        costBasis: this.costBasis
      })

      // reset the form after a few "loading seconds"
      setTimeout(() => {
        this.closeTradeForm()
      }, 1500)
    },
    cspAssigned () {
      const x = this.trades[this.index]
      const t = x.ticker.toUpperCase()
      const q = x.quantity * 100
      const cb = x.legs[0].strike
      const stock = {
        ticker: t,
        quantity: q,
        costBasis: cb
      }
      const userStocks = this.userProfile.userStocks
      const i = _.findIndex(userStocks, (o) => {
        return o.ticker === t
      })
      // if userStocks has stocks in it...
      if (i > -1) {
        userStocks[i] = stock
      } else {
        userStocks.push(stock)
      }
      this.$store.dispatch('addStock', userStocks)
    },
    ccExercised () {
      const x = this.trades[this.index]
      const t = x.ticker.toUpperCase()
      let userStocks = this.userProfile.userStocks
      const i = _.findIndex(userStocks, (o) => {
        return o.ticker === t
      })
      // if userStocks has stocks in it...
      if (i > -1) {
        userStocks = _.remove(userStocks, n => {
          return n.ticker !== t
        })
      }

      this.$store.dispatch('addStock', userStocks)
    },
    getCostBasis () {
      if (!this.userTrades) return 0
      const x = this.trades[this.index]
      const t = x.ticker.toUpperCase()
      let total = 0
      const i = _.findIndex(this.userProfile.userStocks, (o) => o.ticker === t)
      this.userTrades.forEach(trade => {
        if (trade.ticker === t && trade.profit) {
          total += parseFloat(trade.profit)
        }
      })
      return ((this.userProfile.userStocks[i].costBasis * this.userProfile.userStocks[i].quantity) - total) / this.userProfile.userStocks[i].quantity
    }
  }
}
</script>
