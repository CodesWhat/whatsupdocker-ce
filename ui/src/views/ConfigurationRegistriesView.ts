import { defineComponent } from 'vue';
import ConfigurationItem from '@/components/ConfigurationItem.vue';
import {
  getAllRegistries,
  getRegistryProviderColor,
  getRegistryProviderIcon,
} from '@/services/registry';

export default defineComponent({
  data() {
    return {
      registries: [] as any[],
    };
  },
  components: {
    ConfigurationItem,
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const registries = await getAllRegistries();
      const registriesWithIcons = registries
        .map((registry) => ({
          ...registry,
          icon: getRegistryProviderIcon(registry.type),
          iconColor: getRegistryProviderColor(registry.type),
        }))
        .sort((r1, r2) => r1.id.localeCompare(r2.id));
      next((vm: any) => (vm.registries = registriesWithIcons));
    } catch (e: any) {
      next((vm: any) => {
        vm.$eventBus.emit(
          'notify',
          `Error when trying to load the registries (${e.message})`,
          'error',
        );
      });
    }
  },
});
