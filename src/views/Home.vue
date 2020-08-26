<template>
  <v-row align="center" justify="center">
    <v-col cols="12" class="text-center">
      <h1>Welcome to Theta Harvest</h1>
    </v-col>
    <v-col cols="12" class="text-center">
      <h3>Built to give you all of your option selling data in one place!</h3>
    </v-col>
    <v-col cols="6" md="4" lg="2" class="text-end">
      <v-btn color="green lighten--1" :to="'login'" class="w-100">Login</v-btn>
    </v-col>
    <v-col cols="6" md="4" lg="2">
      <v-btn color="blue-grey lighten-3" :to="'register'" class="w-100">Register</v-btn>
    </v-col>
  </v-row>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  components: {
  }
}
</script>

<style lang="css" scoped>
  .w-100 {
    width: 100% !important
  }
</style>
