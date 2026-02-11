import { defineComponent } from 'vue';
import { getContainerLogs } from '@/services/container';

export default defineComponent({
  props: {
    container: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      logs: '',
      loading: false,
      error: null as string | null,
      tail: 100,
    };
  },
  methods: {
    async fetchLogs() {
      this.loading = true;
      this.error = null;
      try {
        const result = await getContainerLogs(this.container.id, this.tail);
        this.logs = result.logs;
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchLogs();
  },
  watch: {
    tail() {
      this.fetchLogs();
    },
  },
});
