<template>
  <v-card rounded="lg" elevation="1" class="mb-3">
    <v-card-title
      @click="showDetail = !showDetail"
      style="cursor: pointer"
      class="pa-3 d-flex align-center bg-surface"
    >
      <div class="d-flex align-center" style="gap: 12px">
        <div class="d-flex align-center justify-center flex-shrink-0" style="width: 32px">
          <v-icon :size="24">fas fa-anchor</v-icon>
        </div>
        <div class="d-flex flex-column" style="min-width: 0">
          <span class="text-body-2 font-weight-medium">Webhook API</span>
          <span class="text-caption text-medium-emphasis">webhook</span>
        </div>
      </div>
      <v-spacer />
      <v-chip :color="enabled ? 'success' : 'default'" variant="tonal" size="small" class="mr-2">
        {{ enabled ? 'Enabled' : 'Disabled' }}
      </v-chip>
      <v-icon>{{ showDetail ? 'fas fa-chevron-up' : 'fas fa-chevron-down' }}</v-icon>
    </v-card-title>
    <transition name="expand-transition">
      <v-card-text v-show="showDetail">
        <template v-if="enabled">
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
        </template>
        <p v-else class="text-body-2">
          Webhook API is disabled. Set <code>DD_SERVER_WEBHOOK_ENABLED=true</code> and
          <code>DD_SERVER_WEBHOOK_TOKEN</code> to enable it.
        </p>
      </v-card-text>
    </transition>
  </v-card>
</template>

<script lang="ts" src="./WebhookInfo.ts"></script>
