<template>
  <v-row align="center" justify="center">
    <!-- TODO: ticker search -->
    <!-- TODO: trending tickers -->
    <!-- TODO: advanced account metrics -->
    <v-col cols="12">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-2">
          <v-toolbar-title>Performance at a Glance</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h5"># of Trades
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h2 pt-4">
                    {{ userTrades.length }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h5">Profit/Loss:
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="text-h2 pt-4" :class="{ 'green--text': profit > 0, 'red--text': profit < 0 }">
                    {{ 0 > profit ? `- $${profit.toFixed(2)}` :  `+ $${profit.toFixed(2)}`}}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h5">Win   Ratio
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h2 pt-4">
                    {{ `${winTotal} / ${lossTotal}` }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h5">Win Percentage
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h2 pt-4">
                    {{ ratioPercentage  }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-card color="blue-grey lighten-4" class="text-center px-2 py-6 text-h5 grey--text text--darken-1">Progress To Monthly Goal
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 pt-4">
                    {{ `$${monthlyTotal.toFixed(2)} / $${userProfile.monthlyGoal} (${monthlyPercent}%)`}}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h5">Progress to Annual Goal
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 pt-4">
                    {{ `$${annualTotal.toFixed(2)} / $${userProfile.annualGoal} (${annualPercent}%)`}}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-col cols="6">
            <v-btn color="green" @click="showTradeForm = true">Add Trade</v-btn>
          </v-col>
          <v-col cols="6" class="text-end">
            <v-btn color="grey" @click="showGoalsForm = true">Goals</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-col>
    <!-- Basic Account Metrics -->
    <!-- Add trade form modal -->
    <v-col cols="12">
      <v-card>
        <v-toolbar color="blue-grey lighten-2" class="text-h5 elevation-2">
          <v-toolbar-title color="">Trades</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="tradeSearch"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            color="black"
            hide-details
          ></v-text-field>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="userTrades"
          :search="tradeSearch"
          :sort-by="['entryDate']"
          :sort-desc="['true']"
        >
          <template v-slot:[`item.legs`]="{ item }">
            <v-chip
              label
              small
              v-for="(leg, i) in item.legs"
              :key="i"
              class="mr-1 pa-1"
            >{{ `${leg.action} ${leg.strike} ${leg.type}` }}</v-chip>
          </template>

          <template v-slot:[`item.profit`]="{ item }">
            <v-chip
              label
              :color="getColor(item.profit)"
            >{{ item.profit ? `$${item.profit}` : ''}}</v-chip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              class="mr-2"
              v-if="!item.closed"
              color="green lighten-2"
              x-small
              depressed
              @click="closeTrade(item)"
            >
              Close
            </v-btn>

            <!-- <v-btn
              class="mr-2"
              color="grey lighten-1"
              x-small
              depressed
              @click="editTrade(item)"
            >
              Edit
            </v-btn> -->

            <v-btn
              x-small
              depressed
              color="red lighten-1"
              @click="deleteTrade(item)"
            >
              Delete
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
    <!-- trades table -->
    <trade-form
      :showTradeForm="showTradeForm"
    ></trade-form>
    <close-trade-form
      :showCloseTradeForm="showCloseTradeForm"
      :index="editedIndex"
    ></close-trade-form>
    <goals-form
      :showGoalsForm="showGoalsForm"
    ></goals-form>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import TradeForm from '@/components/TradeForm'
import CloseTradeForm from '@/components/CloseTrade'
import GoalsForm from '@/components/GoalsForm'
import moment from 'moment'
export default {
  components: {
    'trade-form': TradeForm,
    'close-trade-form': CloseTradeForm,
    'goals-form': GoalsForm
  },
  data () {
    return {
      headers: [
        {
          text: 'Entry Date',
          value: 'entryDate',
          align: 'start'
        },
        {
          text: 'Exp Date',
          value: 'expirationDate'
        },
        {
          text: 'Ticker',
          value: 'ticker'
        },
        {
          text: 'Strike(s)',
          value: 'legs',
          width: '15%',
          align: 'middle'
        },
        {
          text: 'Type',
          value: 'type'
        },
        {
          text: 'Opened',
          value: 'entryPrice'
        },
        {
          text: 'Filled',
          value: 'closePrice'
        },
        {
          text: 'Close Date',
          value: 'closeDate'
        },
        {
          text: 'P/L',
          value: 'profit'
        },
        {
          text: '',
          value: 'actions',
          sortable: false,
          align: 'end'
        }
      ],
      editedIndex: -1,
      tradeSearch: '',
      showTradeForm: false,
      showCloseTradeForm: false,
      showGoalsForm: false,
      editedItem: {
        type: '',
        ticker: '',
        quantity: '',
        entryDate: '',
        expirationDate: '',
        entryPrice: '',
        legs: []
      }
    }
  },
  mounted () {
    const vm = this
    vm.$on('close-trade-form', () => {
      this.showTradeForm = false
    })
    vm.$on('close-form', () => {
      this.showCloseTradeForm = false
    })
    vm.$on('close-goal-form', () => {
      this.showGoalsForm = false
    })
  },
  computed: {
    ...mapState(['userProfile', 'trades', 'loading']),
    ...mapGetters(['monthlyTotal', 'annualTotal', 'monthlyPercent', 'annualPercent', 'userTrades', 'profit', 'winTotal', 'lossTotal', 'ratioPercentage'])
  },
  methods: {
    getColor (n) {
      if (!n) {
        return 'transparent'
      } else if (n > 0) {
        return 'green lighten-3'
      } else {
        return 'red lighten-3'
      }
    },
    closeTrade (item) {
      this.editedIndex = this.trades.indexOf(item)
      this.showCloseTradeForm = true
    },
    editTrade (item) {
      this.editedIndex = this.trades.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.showTradeForm = true
    },
    deleteTrade (item) {
      const c = confirm('Are you sure you want to delete this trade? This cannot be undone.')
      this.editedIndex = this.trades.indexOf(item)
      if (c) {
        this.$store.dispatch('deleteTrade', { index: this.editedIndex })
      }
    }
    /* totalProfit(array) {
      const
    } */
  },
  filters: {
    formatDate (val) {
      if (!val) return '-'

      const date = val.toDate()
      return moment(date).format('MM/DD/YYYY')
    }
  }
}
</script>

<style>

</style>
