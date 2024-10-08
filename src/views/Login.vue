<template>
  <v-row align="center" justify="center" v-cloak>
    <v-col cols="12" sm="8" md="4">
      <password-reset v-if="showPasswordReset"></password-reset>
      <v-card v-else-if="showForm" class="elevation-6">
        <v-toolbar color="green lighten-1" flat>
          <v-toolbar-title>Login form</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" autocomplete="on" @submit.prevent>
            <v-text-field
              label="Email"
              name="email"
              prepend-icon="mdi-at"
              type="text"
              v-model.trim="field.email"
              color="green darken-1"
              :rules="[rules.required, rules.hasAtSymbol, rules.emailSecurity]"
              validate-on-blur
              autocomplete
            ></v-text-field>

            <v-text-field
              id="password"
              label="Password"
              name="password"
              prepend-icon="mdi-lock"
              v-model.trim="field.password"
              type="password"
              color="green darken-1"
              :rules="[rules.required, rules.min, rules.passwordSecurity]"
              validate-on-blur
              autocomplete
              @keydown.enter="login"
            ></v-text-field>
            <v-alert v-if="error" dense outlined type="error">{{ error }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <a class="text-caption pl-4" @click="showPasswordReset = !showPasswordReset">Forgot Password</a>
          <v-spacer></v-spacer>
          <v-btn :to="'register'" color="grey lighten-1">Register</v-btn>
          <v-btn @click="login" color="green lighten-1" class="ml-4">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import PasswordReset from '@/components/PasswordReset'
import { mapState } from 'vuex'
export default {
  components: {
    'password-reset': PasswordReset
  },
  data () {
    return {
      field: {
        email: '',
        password: ''
      },
      showPasswordReset: false,
      valid: true,
      rules: {
        required: v => !!v || 'This field is required',
        hasAtSymbol: v => v.indexOf('@') > -1 || 'This is not a valid email address',
        emailSecurity: v => v.match(/[^a-zA-Z0-9@._-]/g) === null || 'This is not a valid email address',
        passwordSecurity: v => v.match(/[^a-zA-Z0-9]/g) === null || 'Password must only include alpha-numeric characters A-z & 0-9',
        min: v => v.length >= 8 || 'Password must be at least 8 characters long'
      },
      showForm: false
    }
  },
  created () {
    this.showForm = Object.keys(this.userProfile).includes('name') ? this.showForm : !this.showForm
  },
  computed: {
    ...mapState(['userProfile', 'error', 'loading'])
  },
  methods: {
    login () {
      if (this.valid) {
        this.$store.dispatch('login', {
          email: this.field.email,
          password: this.field.password
        })
      }
    }
  }
}
</script>

<style scoped>
[v-cloak] {
  display: none
}
</style>
