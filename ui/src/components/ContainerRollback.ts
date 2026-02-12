import { defineComponent } from 'vue';
import { getBackups, rollback } from '@/services/backup';

export default defineComponent({
  props: {
    containerId: {
      type: String,
      required: true,
    },
    containerName: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue', 'rollback-success', 'rollback-error'],
  data() {
    return {
      loading: false,
      rolling: false,
      error: '',
      backups: [] as any[],
      selectedBackupId: null as string | null,
    };
  },
  computed: {
    isOpen: {
      get(): boolean {
        return this.modelValue;
      },
      set(value: boolean) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  watch: {
    modelValue() {
      if (this.modelValue) {
        this.handleDialogOpened();
        return;
      }
      this.handleDialogClosed();
    },
  },
  methods: {
    handleDialogOpened() {
      this.fetchBackups();
    },
    handleDialogClosed() {
      this.backups = [];
      this.error = '';
      this.selectedBackupId = null;
    },
    async fetchBackups() {
      this.loading = true;
      this.error = '';
      this.backups = [];
      this.selectedBackupId = null;
      try {
        this.backups = await getBackups(this.containerId);
      } catch (e: any) {
        this.error = e.message || 'Failed to load backups';
      } finally {
        this.loading = false;
      }
    },
    selectBackup(id: string) {
      this.selectedBackupId = id;
    },
    async confirmRollback() {
      if (!this.selectedBackupId) return;
      this.rolling = true;
      try {
        await rollback(this.containerId, this.selectedBackupId);
        this.$emit('rollback-success');
        this.close();
      } catch (e: any) {
        this.error = e.message || 'Rollback failed';
        this.$emit('rollback-error', this.error);
      } finally {
        this.rolling = false;
      }
    },
    close() {
      this.isOpen = false;
    },
    formatDate(dateStr: string) {
      return this.$filters.dateTime(dateStr);
    },
  },
});
