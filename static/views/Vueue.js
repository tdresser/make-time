class Vueue extends HTMLElement {
  constructor(threadlist, cleanupDelegate) {
    super();

    console.log('Constructor called');
    this.threadlist_ = threadlist;
    this.recentlyProcessed_ = new ThreadList(this.updateRecentlyProcessed_);
    this.cleanupDelegate_ = cleanupDelegate;

    // I will never truly love javascript
    this.handleDone_ = this.handleDone_.bind(this);
  }

  connectedCallback() {
    this.initialThreadsView_ = document.createElement('div');

    let nextThread = this.threadlist_.pop();
    while (nextThread) {
      let nextRow = new VueueRow_(nextThread);
      this.initialThreadsView_.append(nextRow);

      nextThread = this.threadlist_.pop();
    }

    this.append(this.initialThreadsView_);

    let footer = document.createElement('div');
    footer.className = 'footer';
    this.doneBtn_ = document.createElement('button');
    this.doneBtn_.innerHTML = "Archive selected and begin triage";
    this.doneBtn_.addEventListener('click', this.handleDone_);
    footer.append(this.doneBtn_);

    this.append(footer);
  }

  handleDone_ () {
    let selectedThreads = [];
    let unselectedThreads = [];
    for (let child of this.initialThreadsView_.children) {
      let destination = child.checked ? selectedThreads : unselectedThreads;
      destination.push(child.thread);
    }

    let unprocessedThread = this.recentlyProcessed_.pop();
    while (unprocessedThread) {
      unselectedThreads.push(unprocessedThread);
      unprocessedThread = this.recentlyProcessed_.pop();
    }

    this.cleanupDelegate_(selectedThreads, unselectedThreads);
  }

  async push(thread) {
    this.recentlyProcessed_.push(thread);
  }

  async updateRecentlyProcessed_() {
    // TODO :D
  }

}
window.customElements.define('mt-vueue', Vueue);

class VueueRow_ extends HTMLElement {
  constructor(thread) {
    super();

    this.thread_ = thread;

    this.thread_.getDisplayableQueue()
    .then( queue => {
      let label = document.createElement('label');

      this.checkBox_ = document.createElement('input');
      this.checkBox_.type = 'checkbox';
      label.append(this.checkBox_);
      label.append(`${queue} - ${this.thread_.snippet}`);

      this.appendChild(label);
    })

    this.style.display = 'flex';
  }

  get checked() {
    return this.checkBox_.checked;
  }

  get thread() {
    return this.thread_;
  }
}
window.customElements.define('mt-vueue-row', VueueRow_);