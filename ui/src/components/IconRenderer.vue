<template>
  <img
    v-if="isHomarrIcon"
    :src="homarrIconUrl"
    :style="imageStyle"
    :alt="icon"
  />
  <img
    v-else-if="isSelfhstIcon"
    :src="selfhstIconUrl"
    :style="imageStyle"
    :alt="icon"
  />
  <img
    v-else-if="isSimpleIcon"
    :src="simpleIconUrl"
    :style="imageStyle"
    :alt="icon"
    class="simple-icon"
  />
  <img
    v-else-if="isCustomIconUrl"
    :src="customIconUrl"
    :style="imageStyle"
    :alt="icon"
    class="custom-icon"
  />
  <v-icon v-else :style="iconStyle">
    {{ normalizedIcon }}
  </v-icon>
</template>

<script lang="ts" src="./IconRenderer.ts"></script>

<style scoped>
.simple-icon {
  filter: brightness(0) saturate(100%) opacity(0.87);
}

.v-theme--dark .simple-icon {
  filter: brightness(0) saturate(100%) invert(1) opacity(0.87);
}

.custom-icon {
  object-fit: contain;
}
</style>
