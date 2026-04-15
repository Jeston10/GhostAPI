type QueueTask = {
  id: string;
  run: () => Promise<void>;
};

const DEFAULT_MAX_ACTIVE_TESTS = 3;

type SchedulerState = {
  activeCount: number;
  queue: QueueTask[];
  running: Set<string>;
};

declare global {
  var __ghostApiLoadTestScheduler: SchedulerState | undefined;
}

const scheduler: SchedulerState = globalThis.__ghostApiLoadTestScheduler ?? {
  activeCount: 0,
  queue: [],
  running: new Set<string>(),
};

if (!globalThis.__ghostApiLoadTestScheduler) {
  globalThis.__ghostApiLoadTestScheduler = scheduler;
}

export function getQueueLength() {
  return scheduler.queue.length;
}

export function isRunning(testId: string) {
  return scheduler.running.has(testId);
}

export function schedule(testId: string, run: () => Promise<void>) {
  scheduler.queue.push({ id: testId, run });
  drainQueue();
}

export function removeFromQueue(testId: string) {
  const index = scheduler.queue.findIndex((item) => item.id === testId);
  if (index >= 0) {
    scheduler.queue.splice(index, 1);
    return true;
  }
  return false;
}

async function runTask(task: QueueTask) {
  scheduler.activeCount += 1;
  scheduler.running.add(task.id);
  try {
    await task.run();
  } finally {
    scheduler.running.delete(task.id);
    scheduler.activeCount -= 1;
    drainQueue();
  }
}

function drainQueue() {
  const maxActive = Number(process.env.LOADTEST_MAX_ACTIVE_TESTS ?? DEFAULT_MAX_ACTIVE_TESTS);
  while (scheduler.activeCount < maxActive && scheduler.queue.length > 0) {
    const task = scheduler.queue.shift();
    if (!task) return;
    void runTask(task);
  }
}
