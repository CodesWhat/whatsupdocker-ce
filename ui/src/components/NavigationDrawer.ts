import { ref, computed, onMounted, defineComponent } from "vue";
import { useTheme, useDisplay } from "vuetify";
import { getContainerIcon } from "@/services/container";
import { getRegistryIcon } from "@/services/registry";
import { getTriggerIcon } from "@/services/trigger";
import { getServerIcon } from "@/services/server";
import { getWatcherIcon } from "@/services/watcher";
import { getAuthenticationIcon } from "@/services/authentication";
import { getAgentIcon } from "@/services/agent";
import { getLogIcon } from "@/services/log";
import logo from "@/assets/drydock.png";

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const theme = useTheme();
    const { smAndDown } = useDisplay();
    const mini = ref(false);

    // On desktop, drawer is always visible (permanent).
    // On mobile, it's controlled by modelValue from the parent.
    const drawerModel = computed({
      get: () => smAndDown.value ? props.modelValue : true,
      set: (val: boolean) => emit("update:modelValue", val),
    });

    // Migrate legacy darkMode to themeMode
    if (localStorage.darkMode !== undefined && localStorage.themeMode === undefined) {
      localStorage.themeMode = localStorage.darkMode === "true" ? "dark" : "light";
      localStorage.removeItem("darkMode");
    }

    const themeMode = ref<string>(localStorage.themeMode || "system");
    const darkMode = ref(false);

    const applyTheme = () => {
      let isDark: boolean;
      if (themeMode.value === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDark = themeMode.value === "dark";
      }
      darkMode.value = isDark;
      theme.global.name.value = isDark ? "dark" : "light";
    };

    const onThemeModeChange = (value: string) => {
      themeMode.value = value;
      localStorage.themeMode = value;
      applyTheme();
    };

    const monitoringItems = [
      {
        to: "/monitoring/history",
        name: "history",
        icon: "fas fa-clock-rotate-left",
      },
      {
        to: "/configuration/logs",
        name: "logs",
        icon: getLogIcon(),
      },
    ];

    const configurationItems = [
      {
        to: "/configuration/agents",
        name: "agents",
        icon: getAgentIcon(),
      },
      {
        to: "/configuration/authentications",
        name: "auth",
        icon: getAuthenticationIcon(),
      },
      {
        to: "/configuration/registries",
        name: "registries",
        icon: getRegistryIcon(),
      },
      {
        to: "/configuration/server",
        name: "server",
        icon: getServerIcon(),
      },
      {
        to: "/configuration/triggers",
        name: "triggers",
        icon: getTriggerIcon(),
      },
      {
        to: "/configuration/watchers",
        name: "watchers",
        icon: getWatcherIcon(),
      },
    ];

    const toggleDrawer = () => {
      if (smAndDown.value) {
        emit("update:modelValue", !props.modelValue);
      } else {
        mini.value = !mini.value;
      }
    };

    onMounted(() => {
      applyTheme();
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (themeMode.value === "system") {
          applyTheme();
        }
      });
    });

    return {
      logo,
      mini,
      darkMode,
      themeMode,
      smAndDown,
      drawerModel,
      containerIcon: getContainerIcon(),
      monitoringItems,
      monitoringItemsSorted: [...monitoringItems].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      configurationItems,
      configurationItemsSorted: [...configurationItems].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      onThemeModeChange,
      toggleDrawer,
    };
  },
});
