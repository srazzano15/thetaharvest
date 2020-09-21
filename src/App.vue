<template>
  <v-app>
    <v-app-bar
      app
      color="blue-grey darken-3"
      dark
    >
      <a :href="showNav ? '/dashboard' : '/'">
        <v-img src="./assets/favicon.ico.png" max-height="40px" max-width="40px"></v-img>
        <!-- <v-toolbar-title class="text-h4 pl-4">Theta Harvest</v-toolbar-title> -->
      </a>
      <v-spacer></v-spacer>
      <v-btn v-if="showNav" icon @click="showTrends = !showTrends"><v-icon>mdi-trending-up</v-icon></v-btn>
      <v-app-bar-nav-icon v-if="showNav" @click="openDrawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <nav-drawer v-if="showNav" :profit="profit" :userName="userProfile.name"></nav-drawer>
    <v-expand-transition>
      <trends-banner v-if="showNav && showTrends"></trends-banner>
    </v-expand-transition>
    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer
      color="grey"
      padless
    >
      <v-row
        justify="center"
        no-gutters
      >
        <v-btn
          v-if="showNav"
          text
          :href="'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=FCQEC7QZTZN78&currency_code=USD&source=url'"
          target="_blank"
          class="my-1"
        >Donate</v-btn>
        <v-btn
          v-if="showNav"
          text
          :href="'mailto:admin@thetaharvest.com'"
          target="_blank"
          class="my-1"
        >Contact</v-btn>
        <v-col cols="12" class="py-2 grey lighten-1 text-center">
          v0.5.0 - <strong>Theta Harvest {{ new Date().getFullYear() }}</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import NavDrawer from './components/NavDrawer'
import TrendsBanner from '@/components/TrendsBanner'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'App',

  components: {
    'nav-drawer': NavDrawer,
    'trends-banner': TrendsBanner
  },

  data: () => ({
    showTrends: false
  }),

  computed: {
    ...mapState(['userProfile']),
    ...mapGetters(['profit']),
    showNav () {
      return Object.keys(this.userProfile).length > 1
    }
  },

  methods: {
    openDrawer () {
      this.$store.state.drawer = true
    }
  }
}
</script>
