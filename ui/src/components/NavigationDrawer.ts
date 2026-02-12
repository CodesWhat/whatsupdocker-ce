import { computed, defineComponent, onMounted, ref } from 'vue';
import { useDisplay } from 'vuetify';
import logo from '@/assets/drydock.png';
import { getAgentIcon } from '@/services/agent';
import { getAppInfos } from '@/services/app';
import { getAuthenticationIcon } from '@/services/authentication';
import { getContainerIcon } from '@/services/container';
import { getLogIcon } from '@/services/log';
import { getRegistryIcon } from '@/services/registry';
import { getServerIcon } from '@/services/server';
import { getTriggerIcon } from '@/services/trigger';
import { getWatcherIcon } from '@/services/watcher';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { smAndDown } = useDisplay();
    const mini = ref(false);

    const drawerModel = computed({
      get: () => (smAndDown.value ? props.modelValue : true),
      set: (val: boolean) => emit('update:modelValue', val),
    });

    const monitoringItems = [
      {
        to: '/monitoring/history',
        name: 'history',
        icon: 'fas fa-clock-rotate-left',
      },
      {
        to: '/configuration/logs',
        name: 'logs',
        icon: getLogIcon(),
      },
    ];

    const configurationItems = [
      {
        to: '/configuration/agents',
        name: 'agents',
        icon: getAgentIcon(),
      },
      {
        to: '/configuration/authentications',
        name: 'auth',
        icon: getAuthenticationIcon(),
      },
      {
        to: '/configuration/registries',
        name: 'registries',
        icon: getRegistryIcon(),
      },
      {
        to: '/configuration/server',
        name: 'servers',
        icon: getServerIcon(),
      },
      {
        to: '/configuration/triggers',
        name: 'triggers',
        icon: getTriggerIcon(),
      },
      {
        to: '/configuration/watchers',
        name: 'watchers',
        icon: getWatcherIcon(),
      },
    ];

    const version = ref('...');

    onMounted(async () => {
      try {
        const info = await getAppInfos();
        version.value = info.version || 'unknown';
      } catch {
        version.value = 'unknown';
      }
    });

    const toggleDrawer = () => {
      if (smAndDown.value) {
        emit('update:modelValue', !props.modelValue);
      } else {
        mini.value = !mini.value;
      }
    };

    return {
      logo,
      mini,
      smAndDown,
      drawerModel,
      version,
      containerIcon: getContainerIcon(),
      monitoringItems,
      monitoringItemsSorted: [...monitoringItems].sort((a, b) => a.name.localeCompare(b.name)),
      configurationItems,
      configurationItemsSorted: [...configurationItems].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      toggleDrawer,
    };
  },
});
