<template>
  <v-row justify="center">
    <v-dialog v-model="showTradeForm" persistent max-width="800px">
      <v-card>
        <v-form @sumbit.prevent>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
            <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="9">
                <v-text-field color="green" label="Ticker *" :readonly="index > -1" v-model.trim="fields.ticker" required></v-text-field>
              </v-col>
              <v-col cols="2" class="text-right">
                <v-switch color="green" label="Wheel" :readonly="index > -1" v-model="wheel"></v-switch>
              </v-col>
              <v-col cols="1">
                <tool-tip :text="'The Wheel feature is designed to take steps out of setting up your wheel trade. This feature will create a new Cost Basis entry for the symbol you are going to wheel and track your cost basis with each trade without having to update the entry.'"></tool-tip>
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="cal2"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      color="green"
                      label="Entry Date *"
                      v-model="fields.entryDate"
                      required
                      append-icon="mdi-calendar-plus"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker color="green" :disabled="index > -1" v-model="fields.entryDate" @input="cal2 = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="cal1"
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
                      v-model="fields.expirationDate"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      required
                      append-icon="mdi-calendar-clock"
                    ></v-text-field>
                  </template>
                  <v-date-picker color="green" :disabled="index > -1" v-model="fields.expirationDate" @input="cal1 = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12">
                <v-text-field color="green" label="Quantity *" v-model.number="fields.quantity" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field color="green" v-model.number="fields.entryPrice" label="Price Filled *" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  label="Trade Type*"
                  :readonly="index > -1"
                  required
                  :items="wheel ? wheelTypes : types"
                  @input="$emit('type-changed')"
                  v-model="fields.type"
                  color="green"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <div v-if="helpText" class="help-text">{{ helpText }}</div>
              </v-col>
              <!-- makes fields available to users depending on the strategy -->
              <v-col cols="12" v-if="fields.type">
                <v-row v-for="(row, i) in fields.legs" :key="i">
                  <v-col cols="4">
                    <v-text-field readonly color="green" label="Action" v-model="row.action"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field readonly color="green" v-model="row.type" label="Type"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field color="green" v-model.number="row.strike" label="Strike *" required></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  auto-grow
                  rows="2"
                  color="green"
                  v-model="fields.notes"
                  label="Notes"
                  placeholder="Optional"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-alert v-if="showSuccess && index > -1" dense outlined type="success">Trade successfully updated!</v-alert>
                <v-alert v-else-if="showSuccess && index === -1" dense outlined type="success">New trade created successfully!</v-alert>
              </v-col>
              <!-- set 1 -->
            </v-row>
          </v-container>
          <small>* indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeTradeForm">Close</v-btn>
            <v-btn color="green darken-1 ml-5" @click="index > -1 ? updateTrade() : createTrade()">Submit</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import _ from 'lodash'
import Tooltip from '@/components/Tooltip'
export default {
  name: 'TradeForm',
  props: ['showTradeForm', 'index', 'item'],
  components: {
    'tool-tip': Tooltip
  },
  data () {
    return {
      cal1: false,
      cal2: false,
      valid: true,
      wheel: false,
      fields: {
        type: '',
        ticker: '',
        quantity: '',
        entryDate: '',
        expirationDate: '',
        entryPrice: '',
        notes: '',
        legs: [
          {
            action: '',
            type: '',
            strike: ''
          }
        ]
      },
      helpText: null,
      showSuccess: false,
      types: [
        'Put Credit Spread',
        'Call Credit Spread',
        'Cash Secured Put',
        'Covered Call',
        'Iron Butterfly',
        'Iron Condor',
        'Jade Lizard',
        'Short Straddle',
        'Short Strangle',
        'Long Straddle',
        'Long Strangle',
        'Long Naked Call',
        'Long Naked Put'
      ],
      wheelTypes: [
        'Cash Secured Put',
        'Covered Call'
      ]
    }
  },
  created () {
    this.$root.$on('edit-trade', () => {
      this.fields = { ...this.trades[this.index] }
    })
    if (this.fields.type) {
      this.fields.legs = []
      this.initializeLegs(this.fields.type)
    }
    this.$on('type-changed', () => {
      this.fields.legs = []
      this.initializeLegs(this.fields.type)
    })
  },
  computed: {
    ...mapState(['userProfile', 'trades']),
    formTitle () {
      return this.index !== -1 ? 'Edit Trade' : 'Submit New Trade'
    }
  },
  methods: {
    closeTradeForm () {
      this.fields.type = ''
      this.fields.ticker = ''
      this.fields.quantity = ''
      this.fields.entryDate = ''
      this.fields.expirationDate = ''
      this.fields.entryPrice = ''
      this.fields.notes = ''
      this.fields.legs = []
      this.helpText = ''
      this.wheel = false
      this.showSuccess = false
      this.$parent.$emit('close-trade-form')
    },
    createTrade () {
      const d = new Date()
      this.$store.dispatch('createTrade', {
        ticker: this.fields.ticker.toUpperCase(),
        created: moment(d).format('YYYY-MM-DD'),
        entryDate: this.fields.entryDate,
        expirationDate: this.fields.expirationDate,
        quantity: parseInt(this.fields.quantity),
        notes: this.fields.notes,
        type: this.fields.type,
        entryPrice: parseFloat(this.fields.entryPrice),
        legs: this.fields.legs
      })
      if (this.wheel && this.fields.type === 'Cash Secured Put') {
        const t = this.fields.ticker.toUpperCase()
        const q = this.fields.quantity * 100
        const stock = {
          ticker: t,
          quantity: q,
          costBasis: this.fields.legs[0].strike
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
      }
      setTimeout(() => {
        this.showSuccess = true
      }, 300)
      // reset the form after a few "loading seconds"
      setTimeout(() => {
        this.closeTradeForm()
      }, 1500)
    },
    updateTrade () {
      this.$store.dispatch('editTrade', {
        quantity: parseInt(this.fields.quantity),
        entryPrice: parseFloat(this.fields.entryPrice),
        notes: this.fields.notes,
        legs: this.fields.legs,
        id: this.trades[this.index].id
      })
      setTimeout(() => {
        this.showSuccess = true
      }, 300)
      // reset the form after a few "loading seconds"
      setTimeout(() => {
        this.closeTradeForm()
      }, 1500)
    },
    addLeg (a, t, s) {
      const o = {
        action: a,
        type: t,
        strike: !s ? '' : s
      }
      return this.fields.legs.push(o)
    },
    initializeLegs (type) {
      // catch this via an event and use it to populate the legs of a trade
      if (!type) return false

      switch (type) {
        case 'Put Credit Spread':
          this.addLeg('Sell', 'Put')
          this.addLeg('Buy', 'Put')
          this.helpText = 'A Put Credit Spread or "short put vertical spread" is a bullish, defined risk strategy made up of a long and short put at different strikes in the same expiration.'
          break
        case 'Call Credit Spread':
          this.addLeg('Sell', 'Call')
          this.addLeg('Buy', 'Call')
          this.helpText = 'A Call Credit Spread or "short call vertical spread" is a bearish, defined risk strategy made up of a long and short call at different strikes in the same expiration.'
          break
        case 'Covered Call':
          this.addLeg('Sell', 'Call')
          this.helpText = 'A Covered Call is a common strategy that is used to enhance a long stock position. The position limits the profit potential of a long stock position by selling a call option against the shares. This adds no risk to the position and reduces the cost basis of the shares over time.'
          break
        case 'Cash Secured Put':
          this.addLeg('Sell', 'Put')
          this.helpText = 'The Cash Secured Put is a bullish strategy that is executed by simply selling a put option. It is a common strategy that can be used to buy shares of stock at a lower price, while keeping the premium collected if the stock price does not decrease.'
          break
        case 'Iron Butterfly':
          this.addLeg('Buy', 'Put')
          this.addLeg('Sell', 'Put')
          this.addLeg('Buy', 'Call')
          this.addLeg('Sell', 'Call')
          this.helpText = 'An Iron Fly is essentially an Iron Condor with call and put credit spreads that share the same short strike. This creates a very neutral position that profits from the passage of time and any decreases in implied volatility. An Iron Fly is synthetically the same as a long butterfly spread using the same strikes.'
          break
        case 'Iron Condor':
          this.addLeg('Buy', 'Put')
          this.addLeg('Sell', 'Put')
          this.addLeg('Buy', 'Call')
          this.addLeg('Sell', 'Call')
          this.helpText = 'An Iron Condor is a directionally neutral, defined risk strategy that profits from a stock trading in a range through the expiration of the options. It benefits from the passage of time and any decreases in implied volatility.'
          break
        case 'Short Straddle':
          this.addLeg('Sell', 'Call')
          this.addLeg('Sell', 'Put')
          this.helpText = 'A Short Straddle is a position that is a neutral strategy that profits from the passage of time and any decreases in implied volatility. The short straddle is an undefined risk option strategy.'
          break
        case 'Short Strangle':
          this.addLeg('Sell', 'Call')
          this.addLeg('Sell', 'Put')
          this.helpText = 'A Short Strangle is a position that is a neutral strategy that profits when the stock stays between the short strikes as time passes, as well as any decreases in implied volatility. The short strangle is an undefined risk option strategy.'
          break
        case 'Long Straddle':
          this.addLeg('Buy', 'Call')
          this.addLeg('Buy', 'Put')
          this.helpText = 'A Long Straddle is a position that is a neutral strategy that profits from a sharp move in either direction or an increase in implied volatility by buying a long put and long call at the same strike and same expiration.'
          break
        case 'Long Strangle':
          this.addLeg('Buy', 'Call')
          this.addLeg('Buy', 'Put')
          this.helpText = 'A Long Strangle is a position that is a neutral strategy that profits from a sharp move in either direction or an increase in implied volatility by buying a long put and long call at strikes equal distance in either direction from the current underlying stock price with same expiration.'
          break
        case 'Long Naked Put':
          this.addLeg('Buy', 'Put')
          break
        case 'Long Naked Call':
          this.addLeg('Buy', 'Call')
          break
        case 'Jade Lizard':
          this.addLeg('Buy', 'Call')
          this.addLeg('Sell', 'Call')
          this.addLeg('Sell', 'Put')
          this.helpText = 'A Jade Lizard is a slightly bullish strategy that combines a short put and a short call spread. The strategy is created to have no upside risk, which is done by collecting a total credit greater than the width of the short call spread.'
          break
      }
    }
  }
}
</script>
