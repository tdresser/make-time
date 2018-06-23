class ThreadList {
  constructor(itemAddedCallback) {
    // TODO: Make ThreadList an EventTarget and use events instead.
    this.itemAddedCallback_ = itemAddedCallback;
    this.threads_ = {};
    this.length = 0;
    this.queueNames_ = [];
  }

  createQueue_(queue) {
    if (this.threads_[queue])
      return;
    this.threads_[queue] = [];
    this.queueNames_.push(queue);
    this.queueNames_.sort(LabelUtils.compareLabels);
  }

  async push(thread) {
    let queue = await thread.getQueue();
    this.createQueue_(queue);
    let list = this.threads_[queue];
    list.push(thread);
    this.length++;
    this.itemAddedCallback_();

    if (this.length == 1)
      this.prefetchFirst();
  }

  currentQueue() {
    return this.queueNames_[0];
  }

  prefetchFirst() {
    let queue = this.currentQueue();
    let list = this.threads_[queue];
    if (list)
      list[list.length - 1].fetchMessageDetails();
  }

  pop() {
    if (!this.length)
      return null;

    let queue = this.currentQueue();
    let list = this.threads_[queue];
    // Clear out the queue if it will be empty after this call.
    if (list.length == 1) {
      delete this.threads_[queue];
      this.queueNames_.shift();
    }
    this.length--;
    return list.pop();
  }
}