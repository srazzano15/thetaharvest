<template>
  <v-banner elevation="7" app color="white" icon="mdi-trending-up" icon-color="green">
    <h2 class="font-weight-medium">Harvester Trends</h2>
    <v-row class="pr-3">
      <v-col cols="12" md="6">
        <!-- <span class="text--secondary">Tickers: <strong class="pl-2 text--primary text-h5">{{ trendingTickers }}</strong></span> -->
        <span class="pt-1 text--secondary">Trending Tickers: </span>
        <v-btn
          class="text-h5 pa-1"
          text
          small
          target="_blank"
          :href="`https://finviz.com/quote.ashx?t=${ticker}`"
          v-for="(ticker, i) in trendingTickers"
          :key="i"
        >{{ `$${ticker}` }}</v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="12" md="3" class="text-md-right">
            <div class="pt-1 text--secondary">Trending Sentiment: </div>
          </v-col>
          <v-col cols="12" md="9">
            <v-progress-linear
              :value="trendingSentiment"
              background-color="red lighten-2"
              color="green lighten-2"
              height="30"
              rounded
            >
              <strong class="font-weight-medium">{{ trendingSentiment > 50 ? 'Bullish' : 'Bearish' }}</strong>
            </v-progress-linear>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-banner>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'TrendsBanner',
  computed: {
    ...mapGetters(['trendingTickers', 'trendingSentiment'])
  }
}
</script>

<style></style>
