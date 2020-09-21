<template>
  <v-row>
    <v-col cols="12" md="8" class="offset-md-2">
      <v-card>
        <v-toolbar color="grey lighten-1" elevation="1">
          <v-toolbar-title class="text-h5">Settings</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form class="pa-2" @submit.prevent>
            <v-row>
              <v-col cols="12">
                <h2 class="mb-2">User Information</h2>
                <v-divider></v-divider>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  :value="userProfile.email"
                  label="Email Address"
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="fields.name"
                  label="Username"
                  color="green"
                  :placeholder="userProfile.name"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="fields.fees"
                  label="Broker Transaction Fee"
                  persistent-hint
                  color="green"
                  prepend-icon="mdi-currency-usd"
                  hint="Input the value of your broker's fee per contract. This will populate automatically when you close your trades."
                  :placeholder="`${userProfile.fees}`"
                ></v-text-field>
              </v-col>
              <!-- FOR A LATER RELEASE -->
              <!-- <v-col cols="12">
                <h2 class="mb-2">Toggle Form Fields</h2>
                <h5 class="mb-2">Add the following form fields to the Trade form for additional reporting options.</h5>
                <v-divider></v-divider>
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <v-switch
                  label="Trade Delta"
                  v-model="delta"
                ></v-switch>
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <v-switch
                  label="Probability of Profit"
                  v-model="pop"
                ></v-switch>
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <v-switch
                  label="Implied Volatility"
                  v-model="iv"
                ></v-switch>
              </v-col> -->
              <!-- <v-col cols="12" class="text-left">
                <h5 class="mb-2">Toggling this on activates the Margin Trading feature on the Trade form. Activating Margin Trading will reduce the P/L on the trade by 50%, while also reducing the Deployed Captial by 50%. In addition, it will add an additional fee field on the Close Trade form to include margin fees on the trade, should there be any.</h5>
                <v-divider></v-divider>
                <v-col cols="12">
                <v-switch
                  label="Margin Trader"
                  v-model="margin"
                ></v-switch>
              </v-col>
              </v-col> -->
            </v-row>
          </v-form>
          <v-alert v-if="success" type="success" dense outlined>Profile successfully updated.</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-row >
            <v-col cols="12" class="text-right">
              <v-btn @click="updateProfile" color="green mr-2">Update</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  data () {
    return {
      fields: {
        name: '',
        fees: '',
        pop: false,
        iv: false,
        margin: false
      },
      success: false
    }
  },
  computed: {
    ...mapState(['userProfile']),
    ...mapGetters(['userTrades'])
  },
  methods: {
    updateProfile () {
      this.$store.dispatch('updateProfile', {
        name: this.fields.name !== '' ? this.fields.name : this.userProfile.name,
        fees: this.fields.fees !== '' ? this.fields.fees : this.userProfile.fees
      })
      this.success = true

      setTimeout(() => {
        this.success = false
      }, 2000)
    }
  }
}
</script>

<style>

</style>
