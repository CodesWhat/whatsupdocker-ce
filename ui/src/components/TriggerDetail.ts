import { defineComponent } from 'vue';
import { getAllContainers } from '@/services/container';
import { runTrigger } from '@/services/trigger';

export default defineComponent({
  components: {},
  props: {
    trigger: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showDetail: false,
      showTestForm: false,
      isTriggering: false,
      testContainers: [] as any[],
      selectedContainerId: '',
    };
  },
  computed: {
    configurationItems() {
      return Object.keys(this.trigger.configuration || [])
        .map((key) => ({
          key,
          value: this.trigger.configuration[key],
        }))
        .sort((trigger1, trigger2) => trigger1.key.localeCompare(trigger2.key));
    },
  },

  methods: {
    collapse() {
      this.showDetail = !this.showDetail;
    },
    async openTestForm() {
      this.showTestForm = true;
      if (this.testContainers.length > 0) {
        return;
      }
      try {
        const containers = await getAllContainers();
        this.testContainers = Array.isArray(containers)
          ? containers.filter((container) => !container.agent)
          : [];
        if (this.testContainers.length === 1) {
          this.selectedContainerId = this.testContainers[0].id;
        }
      } catch (err: any) {
        this.$eventBus.emit(
          'notify',
          `Failed to load containers for trigger test (${err.message})`,
          'error',
        );
      }
    },
    async runTrigger() {
      this.isTriggering = true;
      try {
        if (!this.selectedContainerId) {
          throw new Error('Select a container to run the test');
        }
        const container = this.testContainers.find((item) => item.id === this.selectedContainerId);
        if (!container) {
          throw new Error('Selected container is no longer available');
        }
        await runTrigger({
          triggerType: this.trigger.type,
          triggerName: this.trigger.name,
          container,
        });
        this.$eventBus.emit('notify', 'Trigger executed with success');
      } catch (err: any) {
        this.$eventBus.emit('notify', `Trigger executed with error (${err.message})`, 'error');
      } finally {
        this.isTriggering = false;
      }
    },
    formatValue(value: any) {
      if (value === undefined || value === null || value === '') {
        return '<empty>';
      }
      return value;
    },
  },
});
