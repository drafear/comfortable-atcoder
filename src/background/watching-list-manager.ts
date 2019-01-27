interface WatchingData<DataType> {
  data: DataType,
  updatedAt: number,
}

export class WatchingListManager<DataType> {
  constructor(readonly id: string, private readonly timeToRemove: number, readonly defaultData: DataType) { }

  private get storageKey(): string {
    return `WLM-${this.id}`;
  }

  async clear() {
    await new Promise(resolve => {
      chrome.storage.local.set({ [this.storageKey]: {} }, resolve);
    });
  }

  private async getCurrentWatchingList(now = Date.now()): Promise<{ [key: string]: WatchingData<DataType> }> {
    const watchingList: { [key: string]: WatchingData<DataType> } =
      await new Promise(resolve => {
        chrome.storage.local.get({ [this.storageKey]: {} }, items => {
          resolve(items[this.storageKey]);
        });
      });
    // remove outdated data
    for (const [key, val] of Object.entries(watchingList)) {
      if (val.updatedAt > now + this.timeToRemove) {
        delete watchingList[key];
      }
    }
    console.log('WatchingListManager: getCurrentWatchingList:', watchingList);
    return watchingList;
  }

  getKey(watchingId: string) {
    return `#id:${watchingId}`;
  }

  async set(watchingId: string, data: DataType) {
    const now = Date.now();
    const watchingList = await this.getCurrentWatchingList(now);
    // update
    watchingList[this.getKey(watchingId)] = {
      updatedAt: now,
      data: data,
    };
    // save
    console.log("save", watchingList);
    await new Promise(resolve => {
      chrome.storage.local.set({ [this.storageKey]: watchingList }, resolve);
    });
  }

  async isWatching(watchingId: string): Promise<boolean> {
    const watchingList = await this.getCurrentWatchingList();
    return this.getKey(watchingId) in watchingList;
  }

  async get(watchingId: string): Promise<DataType> {
    const watchingList = await this.getCurrentWatchingList();
    if (this.getKey(watchingId) in watchingList) {
      return watchingList[this.getKey(watchingId)].data;
    }
    return this.defaultData;
  }

  async remove(watchingId: string) {
    const watchingList = await this.getCurrentWatchingList();
    // update
    delete watchingList[this.getKey(watchingId)];
    // save
    await new Promise(resolve => {
      chrome.storage.local.set({ [this.storageKey]: watchingList }, resolve);
    });
  }
}

export class WatchingSetManager {
  private manager: WatchingListManager<null>;

  constructor(id: string, timeToRemove: number = 24 * 60 * 60 * 1000) {
    this.manager = new WatchingListManager<null>(id, timeToRemove, null);
  }

  async has(watchingId: string): Promise<boolean> {
    return await this.manager.isWatching(watchingId);
  }
  async add(watchingId: string) {
    this.manager.set(watchingId, null);
  }
  async delete(watchingId: string) {
    await this.manager.remove(watchingId);
  }
}
