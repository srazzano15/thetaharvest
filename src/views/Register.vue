<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-card class="elevation-6">
        <v-toolbar color="green lighten-1" flat>
          <v-toolbar-title>Register Account</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent>
            <v-text-field
              label="User Name"
              name="name"
              prepend-icon="mdi-account"
              type="text"
              v-model.trim="field.name"
              color="green darken-1"
              :rules="[rules.required, rules.nameSecurity]"
              validate-on-blur
            ></v-text-field>

            <v-text-field
              label="Email"
              name="email"
              prepend-icon="mdi-at"
              type="text"
              v-model.trim="field.email"
              color="green darken-1"
              :rules="[rules.required, rules.hasAtSymbol, rules.emailSecurity]"
              validate-on-blur
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
            ></v-text-field>

            <v-text-field
              id="confirm-password"
              label="Confirm Password"
              name="confirm-password"
              prepend-icon="mdi-lock-question"
              v-model.trim="field.confirm"
              type="password"
              color="green darken-1"
              :rules="[rules.required, rules.min, rules.passwordSecurity, rules.match]"
              validate-on-blur
              @keydown.enter="register"
            ></v-text-field>
          </v-form>
          <v-alert v-if="error" dense outlined type="error">{{ error }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <a class="text-caption pl-4" href="javascript:void(0)">Forgot Password</a>
          <v-spacer></v-spacer>
          <v-btn @click="register" color="green lighten-1">Register</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      field: {
        name: '',
        email: '',
        password: '',
        confirm: ''
      },
      valid: true,
      rules: {
        required: v => !!v || 'This field is required',
        hasAtSymbol: v => v.indexOf('@') > -1 || 'This is not a valid email address',
        emailSecurity: v => v.match(/[^a-zA-Z0-9@._-]/g) === null || 'This is not a valid email address',
        passwordSecurity: v => v.match(/[^a-zA-Z0-9]/g) === null || 'Password must only include alpha-numeric characters A-z & 0-9',
        nameSecurity: v => v.match(/[^a-zA-Z0-9@._!#$-]/g) === null || 'Name must only include alpha-numeric and any of these characters !@#$.-_',
        min: v => v.length >= 8 || 'Password must be at least 8 characters long',
        match: v => v === this.field.password || 'Passwords do not match'
      }
    }
  },
  computed: {
    ...mapState(['userProfile', 'error']),
    hasAuth () {
      return Object.keys(this.userProfile).length < 0
    }
  },
  methods: {
    register () {
      if (this.valid) {
        this.$store.dispatch('register', {
          name: this.field.name,
          email: this.field.email,
          password: this.field.password
        })
      }
    }
  }
}
</script>
