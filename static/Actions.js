class Actions extends HTMLElement {
  constructor(view, actions, opt_overflowActions) {
    super();
    this.style.display = 'flex';
    this.style.flexWrap = 'wrap';

    this.view_ = view;
    this.actions_ = actions;
    this.overflowActions_ = opt_overflowActions;

    this.setDestinations_();
    this.appendActions_(this, actions);

    if (opt_overflowActions) {
      let container = document.createElement('div');
      container.style.cssText = `display: flex;`;
      this.append(container);

      let overflow = document.createElement('div');
      overflow.style.display = 'none'

      let expander = document.createElement('div');
      expander.style.cssText = `
        font-size: 36px;
      `;
      expander.textContent = '»';
      expander.onclick = () => {
        let wasHidden = overflow.style.display == 'none';
        overflow.style.display = wasHidden ? 'flex' : 'none';
        expander.textContent = wasHidden ? '«' : '»';
      };

      container.append(expander, overflow);
      this.appendActions_(overflow, opt_overflowActions);
    }
  }

  appendActions_(container, actions) {
    for (let action of actions) {
      let button = document.createElement('button');
      button.tooltip = action.description;

      button.onclick = () => this.takeAction(action);
      button.onmouseenter = () => {
        button.tooltipElement = document.createElement('div');
        button.tooltipElement.style.cssText = `
          position: absolute;
          bottom: ${this.offsetHeight}px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
        `;

        let text = document.createElement('div');
        text.style.cssText = `
          background-color: white;
          border: 1px solid;
          padding: 4px;
          width: 300px;
        `;

        text.append(button.tooltip);
        button.tooltipElement.append(text);
        this.append(button.tooltipElement);
      }
      button.onmouseleave = () => {
        button.tooltipElement.remove();
      }
      let name = action.name;
      button.innerHTML = `<span class="shortcut">${name.charAt(0)}</span>${name.slice(1)}`;
      container.append(button);
    }
  }

  // Do this in the constructor since it depends on Labels.js
  setDestinations_() {
    // Done is removing all labels. Use null as a sentinel for that.
    Actions.ARCHIVE_ACTION.destination = null;
    Actions.VIEW_ALL_DONE_ACTION.destination = null;
    Actions.TLDR_ACTION.destination = Labels.READ_LATER_LABEL;
    Actions.REPLY_NEEDED_ACTION.destination = Labels.NEEDS_REPLY_LABEL;
    Actions.BLOCKED_ACTION.destination = Labels.BLOCKED_LABEL;
    Actions.SPAM_ACTION.destination = 'SPAM';
    Actions.MUTE_ACTION.destination = Labels.MUTED_LABEL;
    Actions.NEEDS_ACTION_ACTION.destination = Labels.ACTION_ITEM_LABEL;

    Actions.MUST_DO_ACTION.destination = Labels.MUST_DO_LABEL;
    Actions.IMPORTANT_AND_URGENT_ACTION.destination = Labels.IMPORTANT_AND_URGENT_LABEL;
    Actions.URGENT_AND_NOT_IMPORTANT_ACTION.destination = Labels.URGENT_AND_NOT_IMPORTANT_LABEL;
    Actions.IMPORTANT_AND_NOT_URGENT_ACTION.destination = Labels.IMPORTANT_AND_NOT_URGENT_LABEL;
  }

  findAction_(key, actions) {
    for (let action of actions) {
      // The first letter of the action name is always the keyboard shortcut.
      if (action.name.charAt(0).toLowerCase() == e.key) {
        this.takeAction(action, e);
        return;
      }
    }
  }

  dispatchShortcut(e) {
    let test = (action) => {
      return action.name.charAt(0).toLowerCase() == e.key;
    };

    let action = this.actions_.find(test);
    if (!action)
      action = this.overflowActions_.find(test);

    if (action)
      this.takeAction(action, e);
  }

  async takeAction(action, opt_e) {
    if (this.view_.shouldSuppressActions())
      return;

    if (!navigator.onLine) {
      new ErrorDialog(`This action requires a network connection.`);
      return;
    }

    if (opt_e)
      opt_e.preventDefault();

    await this.view_.takeAction(action);
  }
}

Actions.ARCHIVE_ACTION = {
  name: `Archive`,
  description: `Archive and remove from the current queue.`,
};

Actions.TLDR_ACTION = {
  name: `TL;DR`,
  description: `Too long, will read later. Goes in triaged/tldr label.`,
};

Actions.REPLY_NEEDED_ACTION = {
  name: `Reply Needed`,
  description: `Needs a reply. Goes in triaged/replyneeded label.`,
};

Actions.QUICK_REPLY_ACTION = {
  name: `Quick Reply`,
  description: `Give a short reply. Hit enter to send, escape to cancel. Allowed length is the allowed_reply_length setting.`,
};

Actions.BLOCKED_ACTION = {
  name: `Blocked`,
  description: `Block on action from someone else. Gets queued to be shown once a week on a day of your choosing via Settings.`,
};

Actions.SPAM_ACTION = {
  name: `Spam`,
  description: `Report spam. Same beavhior as reporting spam in gmail.`,
};

Actions.MUTE_ACTION = {
  name: `Mute`,
  description: `Like gmail mute, but more aggressive. Will never appear in your inbox again. Goes in triaged/supermuted label.`,
};

Actions.NEEDS_ACTION_ACTION = {
  name: `Needs Action`,
  description: `Needs some action taken other than an email reply. Goes in triaged/actionitem label.`,
};

Actions.UNDO_ACTION = {
  name: `Undo`,
  description: `Undoes the last action taken.`,
};

Actions.DONE_ACTION = {
  name: `Done`,
  description: `Transition to next triage phase.`,
}

Actions.VIEW_ALL_DONE_ACTION = {
  name: `Done and archive selected`,
  description: `Archive the selected threads and transition to next triage phase.`,
}

Actions.MUST_DO_ACTION = {
  name: `1: Must Do`,
  description: `Must do today. Literally won't go home till it's done.`,
}

Actions.IMPORTANT_AND_URGENT_ACTION = {
  name: `2: Important+Urgent`,
  description: `Important for achieving my mission and will be useless unless accomplished soon.`,
}

Actions.URGENT_AND_NOT_IMPORTANT_ACTION = {
  name: `3: Urgent+Not Important`,
  description: `Not important for achieving my mission, but will be useless unless accomplished soon. Try to find ways to delegate this work to someone for whom it will be important.`,
}

Actions.IMPORTANT_AND_NOT_URGENT_ACTION = {
  name: `4: Important+Not Urgent`,
  description: `Important for achieving my mission and but doesn't need to happen right away. Ideally you spend 60+% of your work day here.`,
}

window.customElements.define('mt-actions', Actions);
