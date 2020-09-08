<template>
  <v-navigation-drawer :value="drawerState" app right temporary @input.self="dispatchClose">
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="title">
          {{ userName }}
        </v-list-item-title>
        <v-list-item-subtitle>
          P/L: <span :class="{ 'green--text': profit > 0, 'red--text': profit < 0 }">{{ profit > 0 ? `+ $${profit.toFixed(2)}` :  `- $${profit.toFixed(2)}`}}</span>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense nav>
      <v-list-item v-for="item in items" :key="item.title" link :to="item.link">
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        :href="'mailto:admin@thetaharvest.com'"
        target="_blank"
      >
        <v-list-item-icon>
          <v-icon>mdi-email</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Contact</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        :href="'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=FCQEC7QZTZN78&currency_code=USD&source=url'"
        target="_blank"
      >
        <v-list-item-icon>
          <v-icon>mdi-gift-outline</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Donate</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="logout">
        <v-list-item-icon>
          <v-icon>mdi-power-off</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: ['userName', 'profit'],
  data () {
    return {
      items: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', link: 'dashboard' },
        { title: 'Reports', icon: 'mdi-chart-bar', link: 'reports' },
        { title: 'Settings', icon: 'mdi-cog', link: 'settings' }
      ],
      right: null
    }
  },
  computed: {
    drawerState () {
      return this.$store.state.drawer
    }
  },
  methods: {
    dispatchClose () {
      this.$store.state.drawer = null
    },
    logout () {
      this.$store.dispatch('logout')
    }
  }
}
</script>

<style></style>
