import { defineComponent } from 'vue';
import { getAgents } from '@/services/agent';
import { getLogEntries } from '@/services/log';

export default defineComponent({
  props: {
    configuredLevel: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      entries: [] as any[],
      loading: false,
      error: null as string | null,
      level: 'all',
      tail: 100,
      source: 'server' as string,
      agents: [] as { name: string; connected: boolean }[],
    };
  },
  computed: {
    sourceItems(): { title: string; value: string; props?: { disabled: boolean } }[] {
      const items: { title: string; value: string; props?: { disabled: boolean } }[] = [
        { title: 'Server', value: 'server' },
      ];
      for (const agent of this.agents) {
        items.push({
          title: agent.name,
          value: agent.name,
          props: { disabled: !agent.connected },
        });
      }
      return items;
    },
    formattedLogs(): string {
      return this.entries
        .map(
          (e) =>
            `${new Date(e.timestamp).toISOString()} [${e.level.toUpperCase().padEnd(5)}] [${e.component}] ${e.msg}`,
        )
        .join('\n');
    },
  },
  methods: {
    async fetchAgents() {
      try {
        this.agents = await getAgents();
      } catch {
        this.agents = [];
      }
    },
    async fetchEntries() {
      this.loading = true;
      this.error = null;
      try {
        this.entries = await getLogEntries({
          level: this.level === 'all' ? undefined : this.level,
          tail: this.tail,
          agent: this.source === 'server' ? undefined : this.source,
        });
        this.$nextTick(() => {
          const el = this.$refs.logPre as HTMLElement | undefined;
          if (el) el.scrollTop = el.scrollHeight;
        });
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    levelColor(level: string): string {
      switch (level) {
        case 'error':
        case 'fatal':
          return '#e06c75';
        case 'warn':
          return '#e5c07b';
        case 'debug':
        case 'trace':
          return '#61afef';
        default:
          return '#d4d4d4';
      }
    },
  },
  mounted() {
    this.fetchAgents();
    this.fetchEntries();
  },
  watch: {
    level() {
      this.fetchEntries();
    },
    tail() {
      this.fetchEntries();
    },
    source() {
      this.fetchEntries();
    },
  },
});
