/**
 * Limits concurrent async work. Each `run()` waits for an available slot
 * before executing the task (see PRD: avoid unbounded Promise.all fan-out).
 */
export class WorkerPool {
  private active = 0;
  private readonly waiters: Array<() => void> = [];

  constructor(private readonly limit: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) {
      await new Promise<void>((resolve) => {
        this.waiters.push(resolve);
      });
    }

    this.active += 1;
    try {
      return await task();
    } finally {
      this.active -= 1;
      const next = this.waiters.shift();
      if (next) next();
    }
  }
}
