/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // biome-ignore lint/complexity/noBannedTypes: standard Vue SFC type declaration
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.svg' {
  const content: any;
  export default content;
}
