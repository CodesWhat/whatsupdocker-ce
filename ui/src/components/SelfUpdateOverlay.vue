<template>
  <v-overlay
    v-model="active"
    persistent
    scrim="black"
    :opacity="0.85"
    class="self-update-overlay"
    :z-index="9999"
  >
    <!-- Desktop: DVD bounce -->
    <img
      v-if="active && !smAndDown"
      src="@/assets/whale-logo.png"
      alt="drydock"
      class="bouncing-logo"
      :style="{
        position: 'fixed',
        left: x + 'px',
        top: y + 'px',
        width: logoSize + 'px',
        height: logoSize + 'px',
        objectFit: 'contain',
        filter: `hue-rotate(${hue}deg) brightness(1.2) drop-shadow(0 0 20px hsl(${hue}, 80%, 60%))`,
        transition: 'filter 0.3s ease',
        zIndex: 10000,
        pointerEvents: 'none',
      }"
    />

    <div
      class="d-flex flex-column align-center justify-center"
      style="height: 100vh; width: 100vw; pointer-events: none"
    >
      <!-- Mobile: static centered with fade-in -->
      <img
        v-if="active && smAndDown"
        src="@/assets/whale-logo.png"
        alt="drydock"
        class="mobile-logo mb-6"
        :style="{
          width: '80px',
          height: '80px',
          objectFit: 'contain',
          filter: `hue-rotate(${hue}deg) brightness(1.2) drop-shadow(0 0 16px hsl(${hue}, 80%, 60%))`,
        }"
      />
      <div
        class="text-h5 font-weight-light text-white mb-4"
        style="text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5)"
      >
        {{ statusText }}
      </div>
      <v-progress-linear
        v-if="phase !== 'ready'"
        indeterminate
        color="primary"
        style="max-width: 300px; pointer-events: none"
      />
      <v-icon v-if="phase === 'ready'" color="success" size="48"
        >fas fa-circle-check</v-icon
      >
    </div>
  </v-overlay>
</template>

<script lang="ts" src="./SelfUpdateOverlay.ts"></script>

<style scoped>
.self-update-overlay {
  user-select: none;
}
.bouncing-logo {
  will-change: left, top, filter;
}
.mobile-logo {
  animation: fadeInScale 0.6s ease-out forwards;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.7) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
