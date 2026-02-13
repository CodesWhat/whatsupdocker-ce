import { defineComponent } from 'vue';
import ContainerTrigger from '@/components/ContainerTrigger.vue';
import { getContainerTriggers } from '@/services/container';

export default defineComponent({
  components: {
    ContainerTrigger,
  },
  props: {
    container: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      triggers: [] as any[],
    };
  },

  async created() {
    this.triggers = await getContainerTriggers(this.container.id);
  },
});
