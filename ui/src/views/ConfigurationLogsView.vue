<template>
  <v-container fluid>
    <v-row>
      <v-col :cols="12" class="pt-2 pb-2">
        <configuration-item :item="configurationItem" />
      </v-col>
    </v-row>
    <v-row>
      <v-col :cols="12" class="pt-2 pb-2">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">fas fa-file-lines</v-icon>
            Application Logs
          </v-card-title>
          <v-card-text class="pa-0">
            <application-logs :configured-level="log.level" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" src="./ConfigurationLogsView.ts"></script>
