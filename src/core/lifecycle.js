export class TaskLifetime {
  constructor() {
    this.alive = true;
    this.timers = new Set();
    this.cleanups = new Set();
  }
  later(callback, delay) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (this.alive) callback();
    }, delay);
    this.timers.add(timer);
    return timer;
  }
  onDispose(callback) {
    if (!this.alive) { callback(); return; }
    this.cleanups.add(callback);
  }
  dispose() {
    if (!this.alive) return;
    this.alive = false;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const callback of this.cleanups) callback();
    this.cleanups.clear();
  }
}
