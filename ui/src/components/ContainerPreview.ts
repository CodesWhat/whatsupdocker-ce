import { defineComponent } from 'vue';
import { previewContainer } from '@/services/preview';

type PreviewDialogState = 'opened' | 'closed';

interface ContainerUpdateKind {
  kind: 'tag' | 'digest' | 'unknown';
  localValue?: string;
  remoteValue?: string;
  semverDiff?: 'major' | 'minor' | 'patch' | 'prerelease' | 'unknown';
}

interface ContainerPreviewResult {
  containerName?: string;
  currentImage?: string;
  newImage?: string;
  updateKind?: ContainerUpdateKind;
  isRunning?: boolean;
  networks?: string[];
  changes?: string[];
  error?: string;
}

interface ContainerPreviewData {
  loading: boolean;
  error: string;
  preview: ContainerPreviewResult | null;
}

export default defineComponent({
  props: {
    containerId: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue', 'update-confirmed'],
  data(): ContainerPreviewData {
    return {
      loading: false,
      error: '',
      preview: null,
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
    updateKindColor(): string {
      const updateKind = this.preview?.updateKind;
      if (!updateKind) return 'info';
      if (updateKind.kind === 'digest') return 'info';
      switch (updateKind.semverDiff) {
        case 'major':
          return 'error';
        case 'minor':
          return 'warning';
        case 'patch':
          return 'success';
        default:
          return 'info';
      }
    },
  },
  watch: {
    modelValue() {
      this.handleDialogStateChange();
    },
  },
  methods: {
    currentDialogState(): PreviewDialogState {
      return this.modelValue ? 'opened' : 'closed';
    },
    handleDialogStateChange() {
      const stateActions: Record<PreviewDialogState, () => void> = {
        opened: this.handleDialogOpened,
        closed: this.handleDialogClosed,
      };
      stateActions[this.currentDialogState()]();
    },
    handleDialogOpened() {
      this.fetchPreview();
    },
    handleDialogClosed() {
      this.resetPreviewState();
    },
    resetPreviewState() {
      this.preview = null;
      this.error = '';
    },
    async fetchPreview() {
      this.loading = true;
      this.error = '';
      this.preview = null;
      try {
        this.preview = await previewContainer(this.containerId);
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to load preview';
      } finally {
        this.loading = false;
      }
    },
    close() {
      this.isOpen = false;
    },
    confirmUpdate() {
      this.$emit('update-confirmed');
      this.close();
    },
  },
});
