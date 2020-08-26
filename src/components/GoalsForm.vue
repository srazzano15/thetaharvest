<template>
  <v-row justify="center">
    <v-dialog :value="showGoalsForm" persistent max-width="800px">
      <v-card>
        <v-toolbar color="green lighten-1" class="text-h5 elevation-0">
            <v-toolbar-title>Goals</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field color="green" label="Monthly Goal" v-model.number="monthlyGoal" ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field color="green" label="Annual Goal" v-model.number="annualGoal"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <small>* indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeGoalForm">Cancel</v-btn>
          <v-btn color="green darken-1 ml-5" @click="setGoals">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>

export default {
  name: 'GoalsForm',
  props: ['showGoalsForm'],
  data () {
    return {
      monthlyGoal: '',
      annualGoal: ''
    }
  },
  methods: {
    setGoals () {
      this.$store.dispatch('setGoals', {
        annual: this.annualGoal,
        monthly: this.monthlyGoal
      })

      this.monthlyGoal = ''
      this.annualGoal = ''

      setTimeout(() => {
        this.$parent.$emit('close-goal-form')
      }, 2000)
    },
    closeGoalForm () {
      this.$parent.$emit('close-goal-form')
    }
  }
}
</script>
