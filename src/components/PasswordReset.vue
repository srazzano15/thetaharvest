<template>
  <v-card class="elevation-6">
    <v-toolbar color="green lighten-1" dark flat>
      <v-toolbar-title>Password Reset</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-card-text>
      <v-form v-model="valid" @submit.prevent>
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
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <a class="text-caption pl-4" @click="$emit('back-to-login')">Back to Login</a>
      <v-spacer></v-spacer>
      <v-btn @click="login" color="green lighten-1" class="white--text">Reset</v-btn>
    </v-card-actions>
    <v-alert v-if="showSuccess" type="success">Success! Check your email for a password reset link.</v-alert>
    <v-alert v-if="errorMsg !== ''" type="error">Password Reset Successfully</v-alert>
  </v-card>
</template>

<script>
import { auth } from '../firebase/firebase'
export default {
  data () {
    return {
      field: {
        email: '',
        password: '',
        confirm: ''
      },
      showPasswordReset: false,
      valid: true,
      rules: {
        required: v => !!v || 'This field is required',
        hasAtSymbol: v => v.indexOf('@') > -1 || 'This is not a valid email address',
        emailSecurity: v => v.match(/[^a-zA-Z0-9@._-]/g) === null || 'This is not a valid email address',
        passwordSecurity: v => v.match(/[^a-zA-Z0-9]/g) === null || 'Password must only include alpha-numeric characters A-z & 0-9',
        min: v => v.length >= 8 || 'Password must be at least 8 characters long',
        match: v => v === this.field.password || 'Passwords do not match'
      },
      errorMsg: '',
      showSuccess: false
    }
  },
  methods: {
    async resetPassword () {
      if (this.valid) {
        this.errorMsg = ''
        try {
          await auth.sendPasswordResetEmail(this.email)
          this.showSuccess = true
        } catch (err) {
          this.errorMsg = err.message
        }
      }
    }
  }
}
</script>
