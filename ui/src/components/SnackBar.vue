<template>
  <v-snackbar
    v-model="showLocal"
    :timeout="timeout"
    :color="level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'primary'"
    variant="flat"
  >
    {{ message }}
    <template v-slot:actions>
      <v-btn variant="text" color="white" @click="closeSnackbar">CLOSE</v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts" src="./SnackBar.ts"></script>
