import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    container: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },

  computed: {
    hookPre(): string | null {
      return this.container.labels?.['dd.hook.pre'] ?? this.container.labels?.['wud.hook.pre'] ?? null;
    },
    hookPost(): string | null {
      return this.container.labels?.['dd.hook.post'] ?? this.container.labels?.['wud.hook.post'] ?? null;
    },
    hookPreAbort(): boolean {
      return (this.container.labels?.['dd.hook.pre.abort'] ?? this.container.labels?.['wud.hook.pre.abort'] ?? 'true') === 'true';
    },
    hookTimeout(): number {
      return Number.parseInt(this.container.labels?.['dd.hook.timeout'] ?? this.container.labels?.['wud.hook.timeout'] ?? '60000', 10);
    },
    hasHooks(): boolean {
      return Boolean(this.hookPre || this.hookPost);
    },
    autoRollback(): boolean {
      return (this.container.labels?.['dd.rollback.auto'] ?? this.container.labels?.['wud.rollback.auto'] ?? 'false') === 'true';
    },
    rollbackWindow(): number {
      return Number.parseInt(this.container.labels?.['dd.rollback.window'] ?? this.container.labels?.['wud.rollback.window'] ?? '300000', 10);
    },
    rollbackInterval(): number {
      return Number.parseInt(this.container.labels?.['dd.rollback.interval'] ?? this.container.labels?.['wud.rollback.interval'] ?? '10000', 10);
    },
  },

  methods: {
    copyToClipboard(kind: string, value: string) {
      navigator.clipboard.writeText(value);
      this.$eventBus.emit('notify', `${kind} copied to clipboard`);
    },
  },
});
