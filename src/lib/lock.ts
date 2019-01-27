interface Queue {
  task: () => Promise<void>;
  resolve: (value?: {} | PromiseLike<{}> | undefined) => void;
  reject: (reason?: any) => void;
}

export class Lock {
  private busy: boolean;
  private queue: Queue[];
  constructor() {
    this.busy = false;
    this.queue = [];
  }
  private dequeue() {
    const next_queue = this.queue.shift();
    if (next_queue) {
      this.busy = true;
      this.execute(next_queue);
    }
    else {
      this.busy = false;
    }
  }
  private execute(next_queue: Queue) {
    next_queue.task().then(() => { next_queue.resolve(); }, next_queue.reject).then(() => {
      this.dequeue();
    });
  }
  public acquire(task: () => Promise<void>) {
    return new Promise((resolve, reject) => {
        this.queue.push({
          task: task,
          resolve: resolve,
          reject: reject
        });
        if (!this.busy) {
          this.dequeue();
        }
    });
  }
}
