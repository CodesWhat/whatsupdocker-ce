import { mount } from '@vue/test-utils';
import { getAuditLog } from '@/services/audit';
import { getAllContainers } from '@/services/container';
import HomeView from '@/views/HomeView';

// Mock services
vi.mock('@/services/container', () => ({
  getContainerIcon: vi.fn(() => 'fab fa-docker'),
  getAllContainers: vi.fn(() =>
    Promise.resolve([
      { id: 1, updateAvailable: true },
      { id: 2, updateAvailable: false },
    ]),
  ),
}));
vi.mock('@/services/registry', () => ({
  getRegistryIcon: vi.fn(() => 'fas fa-database'),
  getAllRegistries: vi.fn(() => Promise.resolve([{}, {}, {}])),
}));
vi.mock('@/services/trigger', () => ({
  getTriggerIcon: vi.fn(() => 'fas fa-bell'),
  getAllTriggers: vi.fn(() => Promise.resolve([{}])),
}));
vi.mock('@/services/watcher', () => ({
  getWatcherIcon: vi.fn(() => 'fas fa-arrows-rotate'),
  getAllWatchers: vi.fn(() => Promise.resolve([{}, {}])),
}));
vi.mock('@/services/audit', () => ({
  getAuditLog: vi.fn(() =>
    Promise.resolve({
      entries: [
        {
          id: '1',
          timestamp: '2025-01-15T10:30:00Z',
          action: 'update-applied',
          containerName: 'nginx',
          status: 'success',
        },
      ],
      total: 1,
    }),
  ),
}));
vi.mock('@/services/image-icon', () => ({
  getEffectiveDisplayIcon: vi.fn((icon) => icon || 'fab fa-docker'),
}));

describe('HomeView', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(HomeView);

    // Simulate data loaded from beforeRouteEnter
    await wrapper.setData({
      containers: [
        {
          id: 1,
          updateAvailable: true,
          displayName: 'nginx',
          displayIcon: 'fab fa-docker',
          image: { name: 'nginx', tag: { value: '1.24' } },
          updateKind: { kind: 'tag', semverDiff: 'minor', remoteValue: '1.25' },
        },
        {
          id: 2,
          updateAvailable: false,
          displayName: 'redis',
          displayIcon: 'fab fa-docker',
          image: { name: 'redis', tag: { value: '7.0' } },
        },
      ],
      watchers: [
        {
          configuration: {
            maintenancewindow: '0 2 * * *',
            maintenancenextwindow: '2026-02-13T02:00:00.000Z',
            maintenancewindowopen: false,
          },
        },
      ],
      containersCount: 2,
      triggersCount: 1,
      watchersCount: 2,
      registriesCount: 3,
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('renders all status cards', () => {
    const cards = wrapper.findAll('.stat-card');
    expect(cards).toHaveLength(4);
  });

  it('displays correct counts', () => {
    const text = wrapper.text();
    expect(text).toContain('2');
    expect(text).toContain('Containers');
    expect(text).toContain('1');
    expect(text).toContain('Triggers');
    expect(text).toContain('Watchers');
    expect(text).toContain('3');
    expect(text).toContain('Registries');
  });

  it('displays update warning when updates are available', () => {
    expect(wrapper.vm.containersWithUpdates).toHaveLength(1);
    expect(wrapper.find('.stat-badge--warning').exists()).toBe(true);
    expect(wrapper.find('.stat-badge--warning').text()).toBe('1');
  });

  it('displays success message when no updates are available', async () => {
    await wrapper.setData({
      containers: [
        {
          id: 1,
          updateAvailable: false,
          displayName: 'nginx',
          displayIcon: 'fab fa-docker',
          image: { name: 'nginx', tag: { value: '1.24' } },
        },
        {
          id: 2,
          updateAvailable: false,
          displayName: 'redis',
          displayIcon: 'fab fa-docker',
          image: { name: 'redis', tag: { value: '7.0' } },
        },
      ],
    });
    expect(wrapper.text()).toContain('up to date');
  });

  it('shows recent activity when entries exist', async () => {
    await wrapper.setData({
      recentActivity: [
        {
          id: '1',
          timestamp: '2025-01-15T10:30:00Z',
          action: 'update-applied',
          containerName: 'nginx',
          status: 'success',
        },
      ],
    });
    expect(wrapper.text()).toContain('nginx');
    expect(wrapper.text()).toContain('update-applied');
  });

  it('shows empty state when no recent activity', async () => {
    await wrapper.setData({ recentActivity: [] });
    expect(wrapper.text()).toContain('No activity recorded yet');
  });

  it('returns correct action icons', () => {
    expect(wrapper.vm.actionIcon('update-applied')).toBe('fas fa-circle-check');
    expect(wrapper.vm.actionIcon('update-failed')).toBe('fas fa-circle-xmark');
    expect(wrapper.vm.actionIcon('unknown')).toBe('fas fa-circle-question');
  });

  it('returns correct action colors', () => {
    expect(wrapper.vm.actionColor('update-applied')).toBe('success');
    expect(wrapper.vm.actionColor('update-failed')).toBe('error');
    expect(wrapper.vm.actionColor('unknown')).toBe('default');
  });

  it('formats time correctly', () => {
    expect(wrapper.vm.formatTime('2025-01-15T10:30:00Z')).toBeTruthy();
    expect(wrapper.vm.formatTime('')).toBe('');
  });

  it('shows maintenance countdown when next window is available', async () => {
    await wrapper.setData({
      maintenanceCountdownNow: Date.parse('2026-02-13T01:30:00.000Z'),
      watchers: [
        {
          configuration: {
            maintenancewindow: '0 2 * * *',
            maintenancewindowopen: false,
            maintenancenextwindow: '2026-02-13T02:00:00.000Z',
          },
        },
      ],
    });
    expect(wrapper.text()).toContain('30m');
  });

  it('shows maintenance window open status when window is active', async () => {
    await wrapper.setData({
      watchers: [
        {
          configuration: {
            maintenancewindow: '0 2 * * *',
            maintenancewindowopen: true,
          },
        },
      ],
    });
    expect(wrapper.text()).toContain('Open now');
  });

  it('returns empty maintenance label when no maintenance watchers exist', async () => {
    await wrapper.setData({
      watchers: [],
    });
    expect(wrapper.vm.maintenanceCountdownLabel).toBe('');
  });

  it('returns configured label when maintenance window has no next start', async () => {
    await wrapper.setData({
      watchers: [
        {
          configuration: {
            maintenancewindow: '0 2 * * *',
            maintenancewindowopen: false,
          },
        },
      ],
    });
    expect(wrapper.vm.maintenanceCountdownLabel).toBe('Scheduled');
  });

  it('returns opening soon label when next window is in the past', async () => {
    await wrapper.setData({
      maintenanceCountdownNow: Date.parse('2026-02-13T02:00:00.000Z'),
      watchers: [
        {
          configuration: {
            maintenancewindow: '0 2 * * *',
            maintenancewindowopen: false,
            maintenancenextwindow: '2026-02-13T01:59:00.000Z',
          },
        },
      ],
    });
    expect(wrapper.vm.maintenanceCountdownLabel).toBe('Opening soon');
  });

  it('ignores invalid maintenance next window timestamps', async () => {
    await wrapper.setData({
      watchers: [
        {
          configuration: {
            maintenancewindow: '0 2 * * *',
            maintenancenextwindow: 'not-a-date',
          },
        },
      ],
    });

    expect(wrapper.vm.nextMaintenanceWindowAt).toBeUndefined();
  });

  it('formats long durations as days and hours', () => {
    expect(wrapper.vm.formatDuration(2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)).toBe('2d 3h');
  });

  it('returns update kind color/label for all branches', () => {
    expect(wrapper.vm.updateKindColor({ updateKind: { kind: 'digest' } })).toBe('info');
    expect(wrapper.vm.updateKindColor({ updateKind: { kind: 'tag', semverDiff: 'major' } })).toBe(
      'error',
    );
    expect(wrapper.vm.updateKindColor({ updateKind: { kind: 'tag', semverDiff: 'minor' } })).toBe(
      'warning',
    );
    expect(wrapper.vm.updateKindColor({ updateKind: { kind: 'tag', semverDiff: 'patch' } })).toBe(
      'success',
    );
    expect(wrapper.vm.updateKindColor({ updateKind: { kind: 'tag', semverDiff: 'unknown' } })).toBe(
      'info',
    );

    expect(wrapper.vm.updateKindLabel({ updateKind: { kind: 'digest' } })).toBe('digest');
    expect(wrapper.vm.updateKindLabel({ updateKind: { semverDiff: 'minor' } })).toBe('minor');
    expect(wrapper.vm.updateKindLabel({ updateKind: undefined })).toBe('unknown');
  });

  it('navigates to correct routes', () => {
    const cards = wrapper.findAll('.stat-card');
    const paths = cards.map((w) => w.attributes('to') || w.props('to')).filter(Boolean);

    expect(paths).toContain('/containers');
    expect(paths).toContain('/configuration/triggers');
    expect(paths).toContain('/configuration/watchers');
    expect(paths).toContain('/configuration/registries');
  });
});

// Separate test block for the route hook logic if needed
describe('HomeView Route Hook', () => {
  it('fetches data on beforeRouteEnter', async () => {
    const next = vi.fn();
    const from = {};
    const to = {};

    await HomeView.beforeRouteEnter.call(HomeView, to, from, next);

    // Check if next was called with a callback
    expect(next).toHaveBeenCalledWith(expect.any(Function));

    // Simulate the callback execution
    const vm = {
      containers: [],
      containersCount: 0,
      triggersCount: 0,
      watchersCount: 0,
      registriesCount: 0,
      recentActivity: [],
    };
    const callback = next.mock.calls[0][0];
    callback(vm);

    expect(vm.containersCount).toBe(2);
    expect(vm.registriesCount).toBe(3);
    expect(vm.recentActivity).toHaveLength(1);
  });

  it('falls back to empty recent activity when audit fetch fails', async () => {
    vi.mocked(getAuditLog).mockRejectedValueOnce(new Error('audit disabled'));
    const next = vi.fn();

    await HomeView.beforeRouteEnter.call(HomeView, {}, {}, next);

    const vm = {
      containers: [],
      watchers: [],
      containersCount: 0,
      triggersCount: 0,
      watchersCount: 0,
      registriesCount: 0,
      recentActivity: [{ id: 'stale' }],
    };
    const callback = next.mock.calls[0][0];
    callback(vm);

    expect(vm.recentActivity).toEqual([]);
  });

  it('handles beforeRouteEnter errors', async () => {
    vi.mocked(getAllContainers).mockRejectedValueOnce(new Error('containers fetch failed'));
    const next = vi.fn();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      await HomeView.beforeRouteEnter.call(HomeView, {}, {}, next);

      expect(next).toHaveBeenCalledWith(expect.any(Function));
      const callback = next.mock.calls[0][0];
      callback({});
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    } finally {
      consoleSpy.mockRestore();
    }
  });
});

describe('HomeView lifecycle', () => {
  it('updates countdown now on interval and clears timer on unmount', async () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const wrapper = mount(HomeView);
    const before = wrapper.vm.maintenanceCountdownNow;

    vi.advanceTimersByTime(30 * 1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.maintenanceCountdownNow).toBeGreaterThanOrEqual(before);

    wrapper.unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
    vi.useRealTimers();
  });
});
