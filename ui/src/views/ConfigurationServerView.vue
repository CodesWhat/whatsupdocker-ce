<template>
  <v-container fluid class="pa-4">
    <div class="mb-3">
      <configuration-item :item="serverConfiguration" />
    </div>
    <webhook-info :enabled="webhookEnabled" :base-url="webhookBaseUrl" />
    <div class="mb-3">
      <configuration-item :item="logConfiguration" />
    </div>
    <div class="mb-3">
      <configuration-item :item="storeConfiguration" />
    </div>
  </v-container>
</template>

<script lang="ts" src="./ConfigurationServerView.ts"></script>
