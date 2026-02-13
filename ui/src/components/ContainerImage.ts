import { defineComponent } from 'vue';
import { getRegistryProviderIcon } from '@/services/registry';

export default defineComponent({
  props: {
    image: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    registryIcon() {
      return getRegistryProviderIcon(this.image.registry.name);
    },

    osIcon() {
      let icon = 'fas fa-circle-question';
      switch (this.image.os) {
        case 'linux':
          icon = 'fab fa-linux';
          break;
        case 'windows':
          icon = 'fab fa-windows';
          break;
      }
      return icon;
    },
  },

  methods: {
    copyToClipboard(kind: string, value: string) {
      navigator.clipboard.writeText(value);
      this.$eventBus.emit('notify', `${kind} copied to clipboard`);
    },
  },
});
