<template>
  <v-tooltip
    right
    max-width="300px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-icon
        color="green"
        dark
        small
        v-bind="attrs"
        v-on="on"
        class="d-none d-md-inline-flex"
      >mdi-help-circle</v-icon>
    </template>
    <span>{{ text }}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'Tooltip',
  props: ['text']
}
</script>
