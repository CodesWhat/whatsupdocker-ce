<template>
  <div>
    <div class="d-flex align-center pa-2" style="gap: 8px">
      <v-select
        v-model="tail"
        :items="[50, 100, 500]"
        label="Lines"
        density="compact"
        hide-details
        style="max-width: 120px"
      />
      <v-btn
        icon
        size="small"
        variant="text"
        @click="fetchLogs"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>

    <div v-if="loading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="error" type="error" class="ma-2">
      {{ error }}
    </v-alert>

    <pre
      v-else-if="logs"
      class="pa-3 ma-2"
      style="
        background-color: #1e1e1e;
        color: #d4d4d4;
        max-height: 400px;
        overflow-y: auto;
        font-size: 0.85rem;
        border-radius: 4px;
      "
    >{{ logs }}</pre>

    <div v-else class="text-center pa-4 text-medium-emphasis">
      No logs available
    </div>
  </div>
</template>

<script lang="ts" src="./ContainerLogs.ts"></script>
