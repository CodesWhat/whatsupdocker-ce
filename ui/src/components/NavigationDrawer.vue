<template>
  <v-navigation-drawer
    app
    :rail="!smAndDown && mini"
    :permanent="!smAndDown"
    :temporary="smAndDown"
    v-model="drawerModel"
    :disable-route-watcher="true"
    color="primary"
    theme="dark"
  >
    <div class="drawer-brand">
      <img :src="logo" alt="drydock logo" class="drawer-logo" />
      <span v-if="!mini || smAndDown" class="drawer-brand-text">DRYDOCK</span>
      <v-spacer />
      <v-btn
        v-if="!smAndDown"
        icon
        variant="text"
        size="small"
        @click.stop="toggleDrawer"
        class="drawer-collapse-btn"
      >
        <v-icon size="small">{{ mini ? 'fas fa-angles-right' : 'fas fa-angles-left' }}</v-icon>
      </v-btn>
    </div>

    <v-divider />

    <v-list nav density="compact" class="pt-1 pb-0">
      <v-list-item to="/" prepend-icon="fas fa-house">
        <v-list-item-title>Home</v-list-item-title>
      </v-list-item>
      <v-list-item to="/containers" :prepend-icon="containerIcon">
        <v-list-item-title>Containers</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list nav density="compact" class="pt-0 pb-0">
      <v-list-subheader v-if="!mini || smAndDown" class="text-uppercase">
        Monitoring
      </v-list-subheader>
      <v-list-item
        v-for="item in monitoringItemsSorted"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
      >
        <v-list-item-title class="text-capitalize">{{ item.name }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list nav density="compact" class="pt-0 pb-0">
      <v-list-subheader v-if="!mini || smAndDown" class="text-uppercase">
        Configuration
      </v-list-subheader>
      <v-list-item
        v-for="item in configurationItemsSorted"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
      >
        <v-list-item-title class="text-capitalize">{{ item.name }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <template v-slot:append v-if="!mini || smAndDown">
      <v-divider />
      <v-list density="compact">
        <v-list-item class="d-flex justify-center mb-1">
          <v-btn-toggle
            v-model="themeMode"
            mandatory
            density="compact"
            @update:model-value="onThemeModeChange"
          >
            <v-btn value="light" size="small"><v-icon>fas fa-sun</v-icon></v-btn>
            <v-btn value="system" size="small"><v-icon>fas fa-desktop</v-icon></v-btn>
            <v-btn value="dark" size="small"><v-icon>fas fa-moon</v-icon></v-btn>
          </v-btn-toggle>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>
<script lang="ts" src="./NavigationDrawer.ts"></script>
<style scoped>
.drawer-brand {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 10px;
  min-height: 48px;
}

.drawer-logo {
  height: 28px;
  width: auto;
  flex-shrink: 0;
}

.drawer-brand-text {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
}

.drawer-collapse-btn {
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}
</style>
