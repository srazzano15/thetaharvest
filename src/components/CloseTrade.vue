<template>
  <v-row justify="center">
    <v-dialog :value="showCloseTradeForm" persistent max-width="800px">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
            <v-toolbar-title>Close Trade</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="4">
                <v-text-field color="green" label="Close Price *" v-model="closePrice" required></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field color="green" label="Close Date *" v-model="closeDate" readonly=""></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field color="green" label="Total Commissions Paid" v-model="commissions"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <small>* indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeTradeForm">Cancel</v-btn>
          <v-btn color="green darken-1 ml-5" @click="closeTrade">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
export default {
  name: 'CloseTrade',
  props: ['showCloseTradeForm', 'index'],
  data () {
    return {
      closePrice: '',
      cal: false,
      closeDate: moment(new Date()).format('YYYY-MM-DD'),
      commissions: ''
    }
  },
  computed: {
    ...mapState(['userProfile', 'trades'])
  },
  methods: {
    closeTradeForm () {
      this.closePrice = ''
      this.$parent.$emit('close-form')
    },
    closeTrade () {
      this.$store.dispatch('closeTrade', {
        closePrice: this.closePrice,
        closeDate: this.closeDate,
        commissions: this.commissions,
        index: this.index
      })
      // reset the form after a few "loading seconds"
      setTimeout(() => {
        this.closeTradeForm()
      }, 3000)
    }
  }
}
</script>
