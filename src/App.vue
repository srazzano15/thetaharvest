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
      <v-app-bar-nav-icon v-if="showNav" @click="openDrawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <nav-drawer :profit="profit" :userName="userProfile.name"></nav-drawer>
    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer
      absolute
    >
      <v-col cols="12" class="text-center font-weight-medium">
        v0.0 - Made by Steve Razzano - {{ new Date().getFullYear() }}
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import NavDrawer from './components/NavDrawer'
import { mapState } from 'vuex'
export default {
  name: 'App',

  components: {
    'nav-drawer': NavDrawer
  },

  data: () => ({
    //
  }),

  computed: {
    ...mapState(['userProfile', 'profit']),
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
