<template>
  <v-form autocomplete="on" @keyup.enter="login">
    <v-card-text>
      <v-text-field
        label="Username"
        v-model="username"
        name="username"
        append-icon="fas fa-user"
        :rules="[rules.required]"
        autocomplete="username"
        variant="outlined"
        autofocus
      />
      <v-text-field
        label="Password"
        type="password"
        v-model="password"
        name="password"
        append-icon="fas fa-lock"
        :rules="[rules.required]"
        autocomplete="current-password"
        variant="outlined"
      />
      <v-btn block color="primary" :disabled="!valid" @click="login">
        Login
      </v-btn>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" src="./LoginBasic.ts"></script>
