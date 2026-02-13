import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WebhookInfo',
  props: {
    enabled: {
      type: Boolean,
      default: false,
    },
    baseUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showDetail: false,
    };
  },
});
