import { defineComponent } from 'vue';
import { useDisplay } from 'vuetify';
import ContainerDetail from '@/components/ContainerDetail.vue';
import ContainerError from '@/components/ContainerError.vue';
import ContainerImage from '@/components/ContainerImage.vue';
import ContainerLogs from '@/components/ContainerLogs.vue';
import ContainerPreview from '@/components/ContainerPreview.vue';
import ContainerRollback from '@/components/ContainerRollback.vue';
import ContainerTriggers from '@/components/ContainerTriggers.vue';
import ContainerUpdate from '@/components/ContainerUpdate.vue';
import IconRenderer from '@/components/IconRenderer.vue';
import { refreshContainer, scanContainer, updateContainerPolicy } from '@/services/container';
import {
  restartContainer,
  startContainer,
  stopContainer,
  updateContainer,
} from '@/services/container-actions';
import { getEffectiveDisplayIcon } from '@/services/image-icon';
import { getRegistryProviderIcon } from '@/services/registry';

export default defineComponent({
  setup() {
    const { smAndUp, mdAndUp } = useDisplay();
    return { smAndUp, mdAndUp };
  },
  components: {
    ContainerDetail,
    ContainerError,
    ContainerImage,
    ContainerLogs,
    ContainerPreview,
    ContainerRollback,
    ContainerTriggers,
    ContainerUpdate,
    IconRenderer,
  },

  props: {
    container: {
      type: Object,
      required: true,
    },
    agents: {
      type: Array,
      required: false,
      default: () => [],
    },
    previousContainer: {
      type: Object,
      required: false,
    },
    groupingLabel: {
      type: String,
      required: true,
    },
    oldestFirst: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      showDetail: false,
      showPreview: false,
      showRollback: false,
      dialogDelete: false,
      tab: 0,
      deleteEnabled: false,
      isRefreshingContainer: false,
      isUpdatingContainer: false,
      isStarting: false,
      isStopping: false,
      isRestarting: false,
      isScanningContainer: false,
      containerActionsEnabled: false,
    };
  },
  computed: {
    agentStatusColor() {
      const agents = Array.isArray(this.agents) ? this.agents : [];
      const agent = agents.find((a) => a.name === this.container.agent);
      if (agent) {
        return agent.connected ? 'success' : 'error';
      }
      return 'info';
    },

    effectiveDisplayIcon() {
      return getEffectiveDisplayIcon(this.container.displayIcon, this.container.image.name);
    },

    registryIcon() {
      return getRegistryProviderIcon(this.container.image.registry.name);
    },

    osIcon() {
      let icon = 'fas fa-circle-question';
      switch (this.container.image.os) {
        case 'linux':
          icon = 'fab fa-linux';
          break;
        case 'windows':
          icon = 'fab fa-windows';
          break;
      }
      return icon;
    },

    newVersion() {
      let newVersion = 'unknown';
      const resultCreated = this.container.result?.created;
      if (resultCreated && this.container.image.created !== resultCreated) {
        newVersion = this.$filters.dateTime(resultCreated);
      }
      if (this.container.updateKind?.remoteValue) {
        newVersion = this.container.updateKind.remoteValue;
      }
      if (this.container.updateKind?.kind === 'digest') {
        newVersion = this.$filters.short(newVersion, 15);
      }
      return newVersion;
    },

    newVersionClass() {
      let color = 'warning';
      if (this.container.updateKind?.kind === 'tag') {
        switch (this.container.updateKind.semverDiff) {
          case 'major':
            color = 'error';
            break;
          case 'patch':
            color = 'success';
            break;
        }
      }
      return color;
    },
    hasSnooze() {
      return Boolean(this.container.updatePolicy?.snoozeUntil);
    },
    hasSkippedTags() {
      const skipTags = this.container.updatePolicy?.skipTags;
      return Array.isArray(skipTags) && skipTags.length > 0;
    },
    hasSkippedDigests() {
      const skipDigests = this.container.updatePolicy?.skipDigests;
      return Array.isArray(skipDigests) && skipDigests.length > 0;
    },
    hasAnyUpdatePolicy() {
      return this.hasSnooze || this.hasSkippedTags || this.hasSkippedDigests;
    },
    isSnoozed() {
      const snoozeUntil = this.container.updatePolicy?.snoozeUntil;
      if (!snoozeUntil) {
        return false;
      }
      const snoozeUntilDate = new Date(snoozeUntil);
      if (Number.isNaN(snoozeUntilDate.getTime())) {
        return false;
      }
      return snoozeUntilDate.getTime() > Date.now();
    },
    isCurrentUpdateSkipped() {
      const updateKind = this.container.updateKind;
      const updatePolicy = this.container.updatePolicy || {};
      if (!updateKind || !updateKind.remoteValue) {
        return false;
      }
      if (updateKind.kind === 'tag') {
        return (
          Array.isArray(updatePolicy.skipTags) &&
          updatePolicy.skipTags.includes(updateKind.remoteValue)
        );
      }
      if (updateKind.kind === 'digest') {
        return (
          Array.isArray(updatePolicy.skipDigests) &&
          updatePolicy.skipDigests.includes(updateKind.remoteValue)
        );
      }
      return false;
    },
    updatePolicyChipLabel() {
      if (this.isSnoozed) {
        return 'snoozed';
      }
      if (this.isCurrentUpdateSkipped) {
        return 'skipped';
      }
      if (this.hasAnyUpdatePolicy) {
        return 'policy';
      }
      return '';
    },
    updatePolicyDescription() {
      if (this.isSnoozed) {
        return `Snoozed until ${this.container.updatePolicy.snoozeUntil}`;
      }
      if (this.isCurrentUpdateSkipped && this.container.updateKind?.remoteValue) {
        return `Skipping ${this.container.updateKind.kind} update ${this.container.updateKind.remoteValue}`;
      }
      if (this.hasAnyUpdatePolicy) {
        return 'Custom update policy active';
      }
      return 'No custom update policy';
    },
    securityScan() {
      return this.container.security?.scan;
    },
    signatureVerification() {
      return this.container.security?.signature;
    },
    hasSecurityScan() {
      return Boolean(this.securityScan?.scannedAt);
    },
    hasSignatureVerification() {
      return Boolean(this.signatureVerification?.verifiedAt);
    },
    vulnerabilityChipColor() {
      const scanStatus = this.securityScan?.status;
      if (scanStatus === 'blocked') {
        return 'error';
      }
      if (scanStatus === 'error') {
        return 'warning';
      }
      if (scanStatus === 'passed') {
        return 'success';
      }
      return 'info';
    },
    vulnerabilityChipLabel() {
      const scanStatus = this.securityScan?.status;
      if (scanStatus === 'blocked') {
        return `blocked (${this.securityScan?.blockingCount || 0})`;
      }
      if (scanStatus === 'error') {
        return 'scan error';
      }
      if (scanStatus === 'passed') {
        return 'safe';
      }
      return 'no scan';
    },
    vulnerabilityTooltipDescription() {
      if (!this.hasSecurityScan) {
        return 'No vulnerability scan result';
      }
      const summary = this.securityScan?.summary || {};
      const critical = summary.critical ?? 0;
      const high = summary.high ?? 0;
      const medium = summary.medium ?? 0;
      const low = summary.low ?? 0;
      const unknown = summary.unknown ?? 0;
      const scannedAt = this.securityScan?.scannedAt
        ? this.$filters.dateTime(this.securityScan.scannedAt)
        : 'unknown';
      const scanStatus = this.securityScan?.status || 'unknown';
      if (scanStatus === 'error') {
        return `Security scan failed at ${scannedAt}: ${this.securityScan?.error || 'unknown error'}`;
      }
      if (scanStatus === 'blocked') {
        return `Blocked at ${scannedAt}. Critical: ${critical}, High: ${high}, Medium: ${medium}, Low: ${low}, Unknown: ${unknown}`;
      }
      return `Scanned at ${scannedAt}. Critical: ${critical}, High: ${high}, Medium: ${medium}, Low: ${low}, Unknown: ${unknown}`;
    },
    signatureChipColor() {
      const signatureStatus = this.signatureVerification?.status;
      if (signatureStatus === 'unverified') {
        return 'error';
      }
      if (signatureStatus === 'error') {
        return 'warning';
      }
      if (signatureStatus === 'verified') {
        return 'success';
      }
      return 'info';
    },
    signatureChipLabel() {
      const signatureStatus = this.signatureVerification?.status;
      if (signatureStatus === 'unverified') {
        return 'unsigned';
      }
      if (signatureStatus === 'error') {
        return 'sig error';
      }
      if (signatureStatus === 'verified') {
        return 'signed';
      }
      return 'no sig';
    },
    signatureTooltipDescription() {
      if (!this.hasSignatureVerification) {
        return 'No signature verification result';
      }
      const verifiedAt = this.signatureVerification?.verifiedAt
        ? this.$filters.dateTime(this.signatureVerification.verifiedAt)
        : 'unknown';
      const signatureStatus = this.signatureVerification?.status || 'unknown';
      if (signatureStatus === 'error') {
        return `Signature verification failed at ${verifiedAt}: ${
          this.signatureVerification?.error || 'unknown error'
        }`;
      }
      if (signatureStatus === 'unverified') {
        return `No valid image signature found at ${verifiedAt}: ${
          this.signatureVerification?.error || 'signature missing or invalid'
        }`;
      }
      const signatures = this.signatureVerification?.signatures ?? 0;
      const verificationMode = this.signatureVerification?.keyless ? 'keyless' : 'public-key';
      return `Verified at ${verifiedAt}. ${signatures} signature${
        signatures === 1 ? '' : 's'
      } (${verificationMode})`;
    },
  },

  methods: {
    async applyContainerUpdatePolicy(
      action: string,
      payload = {},
      successMessage = 'Update policy saved',
    ) {
      try {
        const containerUpdated = await updateContainerPolicy(this.container.id, action, payload);
        this.$emit('container-refreshed', containerUpdated);
        this.$eventBus.emit('notify', successMessage);
      } catch (e: any) {
        this.$eventBus.emit('notify', `Error when trying to update policy (${e.message})`, 'error');
      }
    },

    async skipCurrentUpdate() {
      await this.applyContainerUpdatePolicy('skip-current', {}, 'Current update skipped');
    },

    async snoozeUpdates(days: number) {
      await this.applyContainerUpdatePolicy(
        'snooze',
        { days },
        `Updates snoozed for ${days} day${days > 1 ? 's' : ''}`,
      );
    },

    async clearSnooze() {
      await this.applyContainerUpdatePolicy('unsnooze', {}, 'Snooze cleared');
    },

    async clearUpdatePolicy() {
      await this.applyContainerUpdatePolicy('clear', {}, 'Update policy cleared');
    },

    async deleteContainer() {
      this.$emit('delete-container');
    },

    async refreshContainerNow(notifyOnSuccess = true) {
      this.isRefreshingContainer = true;
      try {
        const containerRefreshed = await refreshContainer(this.container.id);
        if (!containerRefreshed) {
          this.$eventBus.emit('notify', 'Container no longer found in Docker', 'warning');
          this.$emit('container-missing', this.container.id);
          return;
        }
        this.$emit('container-refreshed', containerRefreshed);
        if (notifyOnSuccess) {
          this.$eventBus.emit('notify', 'Container refreshed');
        }
      } catch (e: any) {
        this.$eventBus.emit(
          'notify',
          `Error when trying to refresh container (${e.message})`,
          'error',
        );
      } finally {
        this.isRefreshingContainer = false;
      }
    },

    async updateContainerNow() {
      this.isUpdatingContainer = true;
      try {
        const result = await updateContainer(this.container.id);
        if (result.container) {
          this.$emit('container-refreshed', result.container);
        }
        this.$eventBus.emit('notify', 'Container updated');
      } catch (e: any) {
        this.$eventBus.emit(
          'notify',
          `Error when trying to update container (${e.message})`,
          'error',
        );
      } finally {
        this.isUpdatingContainer = false;
      }
    },

    async onRollbackSuccess() {
      this.$eventBus.emit('notify', 'Container rolled back successfully');
      await this.refreshContainerNow(false);
    },

    async startContainerAction() {
      this.isStarting = true;
      try {
        const result = await startContainer(this.container.id);
        this.$eventBus.emit('notify', 'Container started');
        if (result.container) {
          this.$emit('container-refreshed', result.container);
        }
      } catch (e: any) {
        this.$eventBus.emit('notify', `Error starting container (${e.message})`, 'error');
      } finally {
        this.isStarting = false;
      }
    },

    async stopContainerAction() {
      this.isStopping = true;
      try {
        const result = await stopContainer(this.container.id);
        this.$eventBus.emit('notify', 'Container stopped');
        if (result.container) {
          this.$emit('container-refreshed', result.container);
        }
      } catch (e: any) {
        this.$eventBus.emit('notify', `Error stopping container (${e.message})`, 'error');
      } finally {
        this.isStopping = false;
      }
    },

    async restartContainerAction() {
      this.isRestarting = true;
      try {
        const result = await restartContainer(this.container.id);
        this.$eventBus.emit('notify', 'Container restarted');
        if (result.container) {
          this.$emit('container-refreshed', result.container);
        }
      } catch (e: any) {
        this.$eventBus.emit('notify', `Error restarting container (${e.message})`, 'error');
      } finally {
        this.isRestarting = false;
      }
    },

    async scanContainerNow() {
      this.isScanningContainer = true;
      try {
        const containerScanned = await scanContainer(this.container.id);
        this.$emit('container-refreshed', containerScanned);
        this.$eventBus.emit('notify', 'Security scan completed');
      } catch (e: any) {
        this.$eventBus.emit('notify', `Error when running security scan (${e.message})`, 'error');
      } finally {
        this.isScanningContainer = false;
      }
    },

    copyToClipboard(kind: string, value: string) {
      navigator.clipboard.writeText(value);
      this.$eventBus.emit('notify', `${kind} copied to clipboard`);
    },

    collapseDetail() {
      // Prevent collapse when selecting text only
      if (globalThis.getSelection()?.type !== 'Range') {
        this.showDetail = !this.showDetail;
      }

      // Hack because of a render bug on tabs inside a collapsible element
      const tabs = this.$refs.tabs as { onResize?: () => void } | undefined;
      if (tabs?.onResize) {
        tabs.onResize();
      }
    },

    normalizeFontawesome(iconString: string, prefix: string) {
      const prefixToStrip = `${prefix}:`;
      return `${prefix} fa-${iconString.replace(prefixToStrip, '')}`;
    },
  },

  mounted() {
    this.deleteEnabled = this.$serverConfig?.feature?.delete || false;
    this.containerActionsEnabled = this.$serverConfig?.feature?.containeractions ?? true;
  },
});
