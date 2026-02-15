import { Counter, register } from 'prom-client';

interface CounterModule {
  init(): void;
  getCounter(): Counter<string> | undefined;
}

export function createCounter(name: string, help: string, labelNames: string[]): CounterModule {
  let counter: Counter<string> | undefined;

  return {
    init() {
      if (counter) {
        register.removeSingleMetric(name);
      }
      counter = new Counter({ name, help, labelNames });
    },
    getCounter() {
      return counter;
    },
  };
}
