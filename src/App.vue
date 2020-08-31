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
    >
      <v-col cols="12" class="text-center font-weight-medium">
        v0.3.0 - Theta Harvest {{ new Date().getFullYear() }}
      </v-col>
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
