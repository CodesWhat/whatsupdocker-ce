import { defineComponent } from 'vue';
import ApplicationLogs from '@/components/ApplicationLogs.vue';
import ConfigurationItem from '@/components/ConfigurationItem.vue';
import { getLog } from '@/services/log';

export default defineComponent({
  components: {
    ConfigurationItem,
    ApplicationLogs,
  },
  data() {
    return {
      log: {} as any,
    };
  },

  computed: {
    configurationItem() {
      return {
        type: 'logs',
        name: 'configuration',
        icon: 'fas fa-terminal',
        configuration: {
          level: this.log.level,
        },
      };
    },
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const log = await getLog();
      next((vm: any) => (vm.log = log));
    } catch (e: any) {
      next((vm: any) => {
        vm.$eventBus.emit(
          'notify',
          `Error when trying to load the log configuration (${e.message})`,
          'error',
        );
      });
    }
  },
});
