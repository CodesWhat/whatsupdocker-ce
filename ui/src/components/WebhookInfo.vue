<template>
  <v-card variant="outlined" rounded class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon start>fas fa-satellite-dish</v-icon>
      Webhook API
      <v-spacer />
      <v-chip :color="enabled ? 'success' : 'default'" variant="tonal" size="small">
        {{ enabled ? 'Enabled' : 'Disabled' }}
      </v-chip>
    </v-card-title>
    <v-card-text v-if="enabled">
      <p class="text-body-2 mb-3">
        Use these endpoints to trigger watch cycles and updates via HTTP.
        All requests require a Bearer token in the Authorization header.
      </p>
      <v-table density="compact">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>POST /api/webhook/watch</code></td>
            <td>Trigger a full watch cycle on all watchers</td>
          </tr>
          <tr>
            <td><code>POST /api/webhook/watch/:name</code></td>
            <td>Watch a specific container by name</td>
          </tr>
          <tr>
            <td><code>POST /api/webhook/update/:name</code></td>
            <td>Trigger an update on a specific container</td>
          </tr>
        </tbody>
      </v-table>

      <div class="mt-4">
        <div class="text-subtitle-2 mb-1">Example</div>
        <v-sheet color="grey-darken-4" rounded class="pa-3">
          <code class="text-body-2" style="white-space: pre-wrap; color: #e0e0e0;">curl -X POST {{ baseUrl }}/api/webhook/watch \
  -H "Authorization: Bearer YOUR_TOKEN"</code>
        </v-sheet>
      </div>
    </v-card-text>
    <v-card-text v-else>
      <p class="text-body-2">
        Webhook API is disabled. Set <code>DD_SERVER_WEBHOOK_ENABLED=true</code> and
        <code>DD_SERVER_WEBHOOK_TOKEN</code> to enable it.
      </p>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" src="./WebhookInfo.ts"></script>
