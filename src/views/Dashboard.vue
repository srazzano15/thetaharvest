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
        <v-tabs grow color="green">
          <v-tab>Monthly</v-tab>
          <v-tab>Annual</v-tab>
          <v-tab>All Time</v-tab>
        <v-tab-item>
          <!-- <v-card flat>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="2">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6"># of Trades
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ userTrades.length }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Profit/Loss:
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="text-h4 text-lg-h4 pt-4" :class="{ 'green--text': profit > 0, 'red--text': profit < 0 }">
                    {{ 0 > profit ? `- $${profit.toFixed(2)}` :  `+ $${profit.toFixed(2)}`}}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Win   Ratio
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `${winTotal} / ${lossTotal}` }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Win Percentage
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ ratioPercentage  }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-card color="blue-grey lighten-4" class="text-center px-2 py-6 text-h5 grey--text text--darken-1">Progress To Monthly Goal
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `$${monthlyTotal.toFixed(2)} / $${userProfile.monthlyGoal} (${monthlyPercent}%)`}}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h5">Progress to Annual Goal
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `$${annualTotal.toFixed(2)} / $${userProfile.annualGoal} (${annualPercent}%)`}}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          </v-card> -->
          <performance-card :timeFrame="`month`"></performance-card>
        </v-tab-item>
        <v-tab-item>
          <performance-card :timeFrame="`year`"></performance-card>
          <!-- <v-card flat>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="2">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6"># of Trades
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ userTrades.length }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Profit/Loss:
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="text-h4 text-lg-h4 pt-4" :class="{ 'green--text': profit > 0, 'red--text': profit < 0 }">
                    {{ 0 > profit ? `- $${profit.toFixed(2)}` :  `+ $${profit.toFixed(2)}`}}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Win   Ratio
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `${winTotal} / ${lossTotal}` }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Win Percentage
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ ratioPercentage  }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-card color="blue-grey lighten-4" class="text-center px-2 py-6 text-h5 grey--text text--darken-1">Progress To Monthly Goal
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `$${monthlyTotal.toFixed(2)} / $${userProfile.monthlyGoal} (${monthlyPercent}%)`}}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h5">Progress to Annual Goal
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `$${annualTotal.toFixed(2)} / $${userProfile.annualGoal} (${annualPercent}%)`}}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          </v-card> -->
        </v-tab-item>
        <v-tab-item>
          <performance-card :timeFrame="`allTime`"></performance-card>
          <!-- <v-card flat>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="2">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6"># of Trades
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ userTrades.length }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Profit/Loss:
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="text-h4 text-lg-h4 pt-4" :class="{ 'green--text': profit > 0, 'red--text': profit < 0 }">
                    {{ 0 > profit ? `- $${profit.toFixed(2)}` :  `+ $${profit.toFixed(2)}`}}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Win   Ratio
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `${winTotal} / ${lossTotal}` }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h6">Win Percentage
                  <div v-if="loading" class="grey--text text--darken-3 text-h2 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ ratioPercentage  }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-card color="blue-grey lighten-4" class="text-center px-2 py-6 text-h5 grey--text text--darken-1">Progress To Monthly Goal
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `$${monthlyTotal.toFixed(2)} / $${userProfile.monthlyGoal} (${monthlyPercent}%)`}}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="blue-grey lighten-4" class="grey--text text--darken-1 text-center px-2 py-6 text-h5">Progress to Annual Goal
                  <div v-if="loading" class="grey--text text--darken-3 text-h3 font-weight-thin pt-4">
                    Loading...
                  </div>
                  <div v-else class="grey--text text--darken-3 text-h3 text-lg-h4 pt-4">
                    {{ `$${annualTotal.toFixed(2)} / $${userProfile.annualGoal} (${annualPercent}%)`}}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          </v-card> -->
        </v-tab-item>
        </v-tabs>
        <v-divider></v-divider>
        <v-card-actions>
          <v-col cols="6">
            <v-btn color="green" @click="showTradeForm = true">Add Trade</v-btn>
          </v-col>
          <v-col cols="6" class="text-right">
            <v-btn color="grey" class="mr-md-3" @click="showStockForm = true">Add Stock</v-btn>
            <tool-tip
              :text="'For stocks that you\'re currently selling Covered Calls against, add stocks to your portfolio to track cost basis from your collected premium from trades.'"
            ></tool-tip>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-tabs background-color="blue-grey lighten-2" dark color="grey darken-3" grow>
          <v-tab>Trades</v-tab>
          <v-tab>Cost Basis</v-tab>
          <v-tab-item>
            <v-card>
              <v-toolbar class="text-h5 elevation-0">
                <v-toolbar-title class="text-h5">Current Capital Deployed: ${{ getDeployedCapital() }}</v-toolbar-title>
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
                :single-expand="singleExpand"
                :expanded.sync="expanded"
                show-expand
                item-class="table__text"
              >
                <template v-slot:[`item.entryDate`]="{ item }">
                  {{ formatTime(item.entryDate) }}
                </template>

                <template v-slot:[`item.legs`]="{ item }">
                  <v-chip
                    label
                    x-small
                    v-for="(leg, i) in item.legs"
                    :key="i"
                    class="mr-1 pa-1"
                  >{{ leg.strike }}</v-chip>
                </template>

                <template v-slot:[`item.closeDate`]="{ item }">
                  {{ item.closed ? formatTime(item.closeDate) : '' }}
                </template>

                <template v-slot:[`item.profit`]="{ item }">
                  <v-chip
                    label
                    x-small
                    :color="getColor(item.profit)"
                  >{{ item.profit ? formatProfit(item.profit) : ''}}</v-chip>
                </template>

                <!-- <template v-slot:[`item.actions`]="{ item }">
                  <v-btn
                    class="mr-1"
                    v-if="!item.closed"
                    color="green lighten-2"
                    x-small
                    depressed
                    @click="closeTrade(item)"
                  >
                    Close
                  </v-btn>

                  <v-btn
                    class="mr-1"
                    color="grey lighten-1"
                    x-small
                    v-if="!item.closed"
                    depressed
                    @click="editTrade(item)"
                  >
                    Edit
                  </v-btn>

                  <v-btn
                    x-small
                    depressed
                    color="red lighten-1"
                    @click="deleteTrade(item)"
                  >
                    Delete
                  </v-btn>
                </template> -->

                <template v-slot:[`expanded-item`]="{ headers, item }">
                  <td :colspan="headers.length">
                    <v-container>
                      <v-row>
                        <v-col cols="3" class="text--disabled pa-1">
                          <span>{{ formatTime(item.created) }}</span>
                        </v-col>
                        <v-col cols="9" class="text-right pa-1">
                          <v-btn
                            class="mr-1"
                            v-if="!item.closed"
                            color="green lighten-2"
                            x-small
                            depressed
                            @click="closeTrade(item)"
                          >
                            Close
                          </v-btn>

                          <v-btn
                            class="mr-1"
                            color="grey lighten-1"
                            x-small
                            v-if="!item.closed"
                            depressed
                            @click="editTrade(item)"
                          >
                            Edit
                          </v-btn>

                          <v-btn
                            x-small
                            depressed
                            color="red lighten-1"
                            @click="deleteTrade(item)"
                          >
                            Delete
                          </v-btn>
                        </v-col>
                        <v-col cols="12" class="pa-1">
                          <h2>{{ item.ticker }}</h2>
                        </v-col>
                        <v-col cols="12" class="pa-1">
                          <h4 class="font-weight-light text-uppercase">{{ item.type }}</h4>
                        </v-col>
                        <v-col cols="6" class="pa-1">
                          <v-chip
                            label
                            small
                            v-for="(leg, i) in item.legs"
                            :key="i"
                            class="mr-1 pa-1"
                          >{{ `${leg.action} ${leg.strike} ${leg.type}` }}</v-chip>
                        </v-col>
                        <v-col cols="6" class="pa-1 text-right">
                              <span v-if="item.closed" class="text--secondary">Profit / Loss:
                                <v-chip
                                  label
                                  class="ml-2"
                                  :color="getColor(item.profit)"
                                >{{ item.profit ? formatProfit(item.profit) : '-'}}</v-chip>
                              </span>
                            </v-col>
                        <v-col cols="12" class="pa-1"><v-divider></v-divider></v-col>
                        <!-- horizontal divider -->
                        <v-col cols="6" class="pa-1">
                          <v-row>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Opened: <strong class="pl-2 text--primary">{{ formatTime(item.entryDate) }}</strong></span>
                            </v-col>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Expiration Date: <strong class="pl-2 text--primary">{{ `${item.expirationDate} ${displayDte(item.expirationDate, item.closed)}` }}</strong></span>
                            </v-col>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Price Filled: <strong class="pl-2 text--primary">{{ item.entryPrice }}</strong></span>
                            </v-col>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Quantity: <strong class="pl-2 text--primary">{{ item.quantity }}</strong></span>
                            </v-col>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Closed: <strong class="pl-2 text--primary">{{ formatTime(item.closeDate) || '-'}}</strong></span>
                            </v-col>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Price Closed: <strong class="pl-2 text--primary">{{ item.closePrice >= 0 ? item.closePrice : '-'}}</strong></span>
                            </v-col>
                          </v-row>
                        </v-col>
                        <!-- left half -->
                        <v-divider class="d-none d-md-block" vertical></v-divider>
                        <v-col cols="12" md="5" class="pa-1 ml-md-7">
                          <v-row>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Max Profit: <strong class="pl-2 text--primary">{{ longOptions.includes(item.type) || item.type === 'Covered Call' ? '-' : `$${(Math.round(item.entryPrice * 100) * item.quantity)}` }}</strong></span>
                            </v-col>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Deployed Capital: <strong class="pl-2 text--primary">{{ longOptions.includes(item.type) || item.type === 'Covered Call' ? '-' : `$${deployedCapital(item.legs, item.quantity)}` }}</strong></span>
                            </v-col>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Max RoC: <strong class="pl-2 text--primary">{{ longOptions.includes(item.type) || item.type === 'Covered Call' ? '-' : `${calculateRetOnDeployedCap(item.entryPrice, item.quantity, item.legs)}%` }}</strong></span>
                            </v-col>
                            <v-col cols="12" md="6">
                              <span class="text--secondary">Annualized Return: <strong class="pl-2 text--primary">{{ longOptions.includes(item.type) || item.type === 'Covered Call' ? '-' : `$${calcAnnualizedReturn(item.entryDate, item.expirationDate, item.entryPrice, item.quantity)}` }}</strong></span>
                            </v-col>
                            <v-col cols="12">
                              <span class="text--secondary">Annualized Return on Deployed Capital: <strong class="pl-2 text--primary">{{ longOptions.includes(item.type) || item.type === 'Covered Call' ? '-' : `${(calcAnnualizedReturn(item.entryDate, item.expirationDate, item.entryPrice, item.quantity) / deployedCapital(item.legs, item.quantity) * 100).toFixed(2)}%` }}</strong></span>
                            </v-col>
                          </v-row>
                        </v-col>
                        <!-- right half -->
                        <v-col cols="12" class="pa-1"><v-divider></v-divider></v-col>
                        <v-col cols="12">
                          <span class="text--secondary">Notes: <strong class="pl-2 text--primary">{{ item.notes }}</strong></span>
                        </v-col>
                      </v-row>
                    </v-container>
                  </td>
                </template>
              </v-data-table>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <stock-table :trades="trades"></stock-table>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-col>
    <!-- trades table -->
    <trade-form
      :showTradeForm="showTradeForm"
      :index="editedIndex"
      :item="editedItem"
    ></trade-form>
    <close-trade-form
      :showCloseTradeForm="showCloseTradeForm"
      :index="editedIndex"
    ></close-trade-form>
    <goals-form
      :showGoalsForm="showGoalsForm"
    ></goals-form>
    <stock-form
      :showStockForm="showStockForm"
      :index="editedIndex"
    ></stock-form>
    <sell-stock-form
      :showSellStockForm="showSellStockForm"
      :index="editedIndex"
    ></sell-stock-form>
  </v-row>
</template>

<script>
import moment from 'moment'
import { mapState, mapGetters } from 'vuex'
import TradeForm from '@/components/TradeForm'
import CloseTradeForm from '@/components/CloseTrade'
import GoalsForm from '@/components/GoalsForm'
import StockForm from '@/components/StockForm'
import PerformanceCard from '@/components/PerformanceCard'
import StockTable from '@/components/StockTable'
import SellStockForm from '@/components/SellStockForm'
import Tooltip from '@/components/Tooltip'

export default {
  components: {
    'trade-form': TradeForm,
    'close-trade-form': CloseTradeForm,
    'goals-form': GoalsForm,
    'performance-card': PerformanceCard,
    'stock-form': StockForm,
    'stock-table': StockTable,
    'tool-tip': Tooltip,
    'sell-stock-form': SellStockForm
  },
  data () {
    return {
      singleExpand: false,
      expanded: [],
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
          value: 'data-table-expand'
        }
        /* {
          text: '',
          value: 'actions',
          sortable: false,
          width: '20%',
          align: 'end'
        } */
      ],
      editedIndex: -1,
      tradeSearch: '',
      showTradeForm: false,
      showCloseTradeForm: false,
      showGoalsForm: false,
      showStockForm: false,
      showSellStockForm: false,
      editedItem: {
        type: '',
        ticker: '',
        quantity: '',
        entryDate: '',
        notes: '',
        expirationDate: '',
        entryPrice: '',
        legs: []
      },
      longOptions: [
        'Long Straddle',
        'Long Strangle',
        'Long Naked Call',
        'Long Naked Put'
      ],
      editedStock: {
        id: '',
        ticker: ''
      }
    }
  },
  mounted () {
    const vm = this
    vm.$on('close-trade-form', () => {
      this.showTradeForm = false
      this.editedIndex = -1
    })
    vm.$on('close-form', () => {
      this.showCloseTradeForm = false
      this.editedIndex = -1
    })
    vm.$on('close-goal-form', () => {
      this.showGoalsForm = false
    })

    vm.$on('close-stock-form', () => {
      this.showStockForm = false
      this.editedIndex = -1
    })
    vm.$on('close-sell-stock-form', () => {
      this.showSellStockForm = false
      this.editedIndex = -1
    })
    vm.$root.$on('add-stock', item => {
      this.buyStock(item)
    })
    vm.$root.$on('sell-stock', item => {
      this.sellStock(item)
    })
  },
  computed: {
    ...mapState(['userProfile', 'trades', 'loading']),
    ...mapGetters(['monthlyTotal', 'annualTotal', 'monthlyPercent', 'annualPercent', 'userTrades', 'profit', 'winTotal', 'lossTotal', 'ratioPercentage'])
  },
  methods: {
    formatTime (t) {
      return moment(t).format('YYYY-MM-DD')
    },
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
    sellStock (item) {
      this.editedIndex = this.trades.indexOf(item)
      this.showSellStockForm = true
    },
    async editTrade (item) {
      this.editedIndex = this.trades.indexOf(item)
      this.editedItem = await Object.assign({}, item)
      this.$root.$emit('edit-trade')
      this.showTradeForm = true
    },
    async buyStock (item) {
      this.editedIndex = this.trades.indexOf(item)
      this.editedStock = await Object.assign({}, item)
      this.$root.$emit('buy-stock')
      this.showStockForm = true
    },
    deleteTrade (item) {
      const c = confirm('Are you sure you want to delete this trade? This cannot be undone.')
      this.editedIndex = this.trades.indexOf(item)
      if (c) {
        this.$store.dispatch('deleteTrade', { index: this.editedIndex })
        this.editedIndex = -1
      }
    },
    formatProfit (val) {
      if (!val) {
        return ''
      } else {
        return val > 0 ? `$${val.toFixed(2)}` : `-$${(val * -1).toFixed(2)}`
      }
    },
    calcTotal (value, quantity) {
      return (value * 100) * quantity
    },
    calcDte (exp) {
      // get days to expiration
      const d = new Date()
      const x = moment(d)
      const y = moment(exp)
      return y.diff(x, 'days')
    },
    displayDte (exp, closed) {
      const dte = this.calcDte(exp)
      if (closed) return '(Closed)'
      else if (dte >= 0) return `(${dte} DTE)`
      else if (dte < 0) return '(Expired)'
    },
    deployedCapital (legs, quantity) {
      if (!legs) return false
      let sum = 0
      legs.forEach(leg => {
        sum += parseFloat(leg.strike)
      })
      return this.calcTotal(sum, quantity)
    },
    getDeployedCapital () {
      let sum = 0
      const uniqueTypes = [
        'Put Debit Spread',
        'Call Debit Spread',
        'Covered Call',
        'Long Straddle',
        'Long Strangle',
        'Long Naked Call',
        'Long Naked Put'
      ]
      this.userTrades.forEach(trade => {
        const q = trade.quantity
        if (!uniqueTypes.includes(trade.type)) {
          let s = 0
          for (const leg of trade.legs) {
            if (leg.action === 'Sell') {
              s += parseFloat(leg.strike)
            }
          }
          sum += this.calcTotal(s, q)
        } else if (trade.type.includes('Long') || trade.type.includes('Debit')) {
          sum += this.calcTotal(trade.entryPrice, q)
        }
      })

      return sum
    },
    calculateRetOnDeployedCap (price, quantity, legs) {
      const mP = this.calcTotal(price, quantity)
      const dC = this.deployedCapital(legs, quantity)
      const rODC = (mP / dC) * 100
      return rODC.toFixed(2)
    },
    calcAnnualizedReturn (entry, exp, price, quantity) {
      // get days to expiration
      const x = moment(entry)
      const y = moment(exp)
      const dte = y.diff(x, 'days')
      // get max profit
      const mP = this.calcTotal(price, quantity)
      // divide max profit by days to expiration
      const dailyReturn = mP / dte
      // multiply by 365
      return (dailyReturn * 365).toFixed(2)
    }
  }
}
</script>

<style scoped>
</style>
