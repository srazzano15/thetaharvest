<template>
  <v-row justify="center">
    <v-dialog :value="showTradeForm" persistent max-width="800px">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
            <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field color="green" label="Ticker *" v-model="fields.ticker" required></v-text-field>
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
                  <v-date-picker color="green" v-model="fields.entryDate" @input="cal2 = false"></v-date-picker>
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
                  <v-date-picker color="green" v-model="fields.expirationDate" @input="cal1 = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12">
                <v-text-field color="green" label="Quantity*" v-model.number="fields.quantity" required></v-text-field>
              </v-col>
               <v-col cols="12">
                <v-text-field color="green" v-model.number="fields.entryPrice" label="Entry Price *" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  label="Trade Type*"
                  required
                  :items="types"
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
                    <v-text-field readonly color="green" label="Action *" v-model="row.action"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field readonly color="green" v-model="row.type" label="Type *"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field color="green" v-model.number="row.strike" label="Strike *"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <!-- set 1 -->
            </v-row>
          </v-container>
          <small>* indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeTradeForm">Close</v-btn>
          <v-btn color="green darken-1 ml-5" @click="createTrade">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
export default {
  name: 'TradeForm',
  props: ['showTradeForm', 'edit'],
  data () {
    return {
      cal1: false,
      cal2: false,
      fields: {
        type: '',
        ticker: '',
        quantity: '',
        entryDate: '',
        expirationDate: '',
        entryPrice: '',
        legs: [
          {
            action: '',
            type: '',
            strike: ''
          }
        ]
      },
      helpText: null,
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
      ]
    }
  },
  created () {
    if (this.fields.type) {
      this.initializeLegs(this.fields.type)
    }
    this.$on('type-changed', () => {
      this.initializeLegs(this.fields.type)
    })
  },
  computed: {
    legs () {
      const one = ['Long Naked Put', 'Long Naked Call', 'Cash Secured Put', 'Covered Call']
      const two = [
        'Put Credit Spread',
        'Call Credit Spread',
        'Put Debit Spread',
        'Call Debit Spread',
        'Short Straddle',
        'Long Straddle',
        'Short Strangle',
        'Long Strangle'
      ]

      if (one.includes(this.fields.type)) {
        this.setLegValue(this.fields.type)
        return 1
      } else if (two.includes(this.fields.type)) {
        return 2
      } else if (this.fields.type === 'Jade Lizard') {
        return 3
      } else if (this.fields.type === 'Iron Condor' || this.fields.type === 'Iron Butterfly') {
        return 4
      } else {
        return 0
      }
    },
    ...mapState(['userProfile']),
    formTitle () {
      return this.editedIndex === -1 ? 'Submit New Trade' : 'Edit Trade'
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
      this.fields.legOne = {
        leg: '',
        strike: ''
      }
      this.fields.legTwo = {
        leg: '',
        strike: ''
      }
      this.fields.legThree = {
        leg: '',
        strike: ''
      }
      this.fields.legFour = {
        leg: '',
        strike: ''
      }

      this.$parent.$emit('close-trade-form')
    },
    setLegValue (s) {
      // check if the string has put or call and set the value of that leg for single legs
      if (s.includes('Put')) {
        this.fields.legOne.leg = 'Put'
      } else if (s.includes('Call')) {
        this.fields.legOne.leg = 'Call'
      }
    },
    createTrade () {
      const d = new Date()
      const strikeDisplay = []
      this.fields.legs.forEach(leg => {
        const s = `${leg.action} ${leg.strike} ${leg.type}`
        strikeDisplay.push(s)
      })
      this.$store.dispatch('createTrade', {
        ticker: this.fields.ticker.toUpperCase(),
        created: moment(d).format('YYYY-MM-DD'),
        strikeDisplay: strikeDisplay.join(', '),
        entryDate: this.fields.entryDate,
        expirationDate: this.fields.expirationDate,
        quantity: parseInt(this.fields.quantity),
        type: this.fields.type,
        entryPrice: parseFloat(this.fields.entryPrice),
        legs: this.fields.legs
      })

      // reset the form after a few "loading seconds"
      setTimeout(() => {
        this.closeTradeForm()
      }, 3000)
    },
    addLeg (a, t) {
      const o = {
        action: a,
        type: t,
        strike: ''
      }
      // console.log(o)
      if (this.fields.legs[0].action === '') {
        return (this.fields.legs[0] = o)
      } else if (this.fields.legs[0].action.length > 0) {
        this.fields.legs = []
        return this.fields.legs.push(o)
      } else {
        return this.fields.legs.push(o)
      }
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
