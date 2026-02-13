<template>
  <v-container fluid class="pa-4">
    <div class="mb-3">
      <configuration-item :item="configurationItem" />
    </div>
    <v-card rounded="lg" elevation="1">
      <v-card-title class="pa-3 d-flex align-center bg-surface">
        <v-icon class="mr-2">fas fa-file-lines</v-icon>
        Application Logs
      </v-card-title>
      <v-card-text class="pa-0">
        <application-logs :configured-level="log.level" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" src="./ConfigurationLogsView.ts"></script>
