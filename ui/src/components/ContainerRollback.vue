<template>
  <v-dialog v-model="isOpen" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="warning">fas fa-rotate-left</v-icon>
        Rollback {{ containerName }}
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="close" :disabled="rolling">
          <v-icon>fas fa-xmark</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Loading state -->
      <v-card-text v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <div class="mt-4 text-medium-emphasis">Loading backups...</div>
      </v-card-text>

      <!-- Error state -->
      <v-card-text v-else-if="error && backups.length === 0" class="text-center py-8">
        <v-icon size="48" color="error">fas fa-triangle-exclamation</v-icon>
        <div class="mt-4 text-error">{{ error }}</div>
        <v-btn variant="outlined" class="mt-4" @click="fetchBackups">
          Retry
        </v-btn>
      </v-card-text>

      <!-- No backups -->
      <v-card-text v-else-if="backups.length === 0" class="text-center py-8">
        <v-icon size="48" color="info">fas fa-box-open</v-icon>
        <div class="mt-4 text-medium-emphasis">No backups available for this container.</div>
      </v-card-text>

      <!-- Backup list -->
      <v-card-text v-else class="pa-0">
        <v-alert v-if="error" type="error" variant="tonal" class="mx-4 mt-4">
          {{ error }}
        </v-alert>
        <v-list density="compact" class="py-0">
          <v-list-item
            v-for="backup in backups"
            :key="backup.id"
            :active="selectedBackupId === backup.id"
            @click="selectBackup(backup.id)"
            class="cursor-pointer"
          >
            <v-list-item-title>
              {{ backup.imageTag }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDate(backup.timestamp) }} &middot; {{ backup.triggerName }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-icon v-if="selectedBackupId === backup.id" color="primary">
                fas fa-check-circle
              </v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions v-if="!loading">
        <v-spacer />
        <v-btn variant="outlined" @click="close" :disabled="rolling">Cancel</v-btn>
        <v-btn
          v-if="backups.length > 0"
          color="warning"
          variant="elevated"
          :disabled="!selectedBackupId"
          :loading="rolling"
          @click="confirmRollback"
        >
          <v-icon start>fas fa-rotate-left</v-icon>
          Rollback
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" src="./ContainerRollback.ts"></script>
