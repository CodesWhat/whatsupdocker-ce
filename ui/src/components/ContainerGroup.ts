import { defineComponent, type PropType } from 'vue';
import ContainerItem from '@/components/ContainerItem.vue';
import { getContainerTriggers, refreshContainer, runTrigger } from '@/services/container';

interface ContainerSummary {
  id: string;
  name: string;
  updateAvailable: boolean;
}

export default defineComponent({
  components: {
    ContainerItem,
  },

  props: {
    groupName: {
      type: String,
      default: null,
    },
    containers: {
      type: Array as PropType<ContainerSummary[]>,
      required: true,
    },
    agents: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },
    oldestFirst: {
      type: Boolean,
      required: false,
    },
  },

  emits: ['delete-container', 'container-refreshed', 'container-missing'],

  data() {
    return {
      expanded: true,
      isUpdatingAll: false,
    };
  },

  computed: {
    displayName(): string {
      return this.groupName || 'Ungrouped';
    },
    containerCount(): number {
      return this.containers.length;
    },
    updateCount(): number {
      return this.containers.filter((c) => c.updateAvailable).length;
    },
    hasUpdates(): boolean {
      return this.updateCount > 0;
    },
  },

  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },
    onDeleteContainer(container: ContainerSummary) {
      this.$emit('delete-container', container);
    },
    onContainerRefreshed(container: ContainerSummary) {
      this.$emit('container-refreshed', container);
    },
    onContainerMissing(containerId: string) {
      this.$emit('container-missing', containerId);
    },
    async updateAllInGroup() {
      this.isUpdatingAll = true;
      const updatableContainers = this.containers.filter((c) => c.updateAvailable);
      let errorCount = 0;

      for (const container of updatableContainers) {
        try {
          const triggers = await getContainerTriggers(container.id);
          if (!Array.isArray(triggers) || triggers.length === 0) {
            continue;
          }
          for (const trigger of triggers) {
            const result = await runTrigger({
              containerId: container.id,
              triggerType: trigger.type,
              triggerName: trigger.name,
              triggerAgent: trigger.agent,
            });
            if (result?.error) {
              errorCount++;
            }
          }
          const refreshed = await refreshContainer(container.id);
          if (refreshed) {
            this.$emit('container-refreshed', refreshed);
          }
        } catch {
          errorCount++;
        }
      }

      if (errorCount > 0) {
        this.$eventBus.emit(
          'notify',
          `Group update completed with ${errorCount} error(s)`,
          'warning',
        );
      } else {
        this.$eventBus.emit('notify', `All containers in "${this.displayName}" updated`);
      }
      this.isUpdatingAll = false;
    },
  },
});
