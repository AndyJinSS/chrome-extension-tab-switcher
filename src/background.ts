let tabRelations: { [key: number]: number } = {};

function openTab(url: string, openerTabId?: number) {
  chrome.tabs.query({}, (tabs) => {
    let tabFound = false;
    for (let tab of tabs) {
      if (tab.url === url) {
        chrome.tabs.update(tab.id!, { active: true });
        if (openerTabId !== undefined) {
          tabRelations[tab.id!] = openerTabId;
          saveTabRelations();
        }

        tabFound = true;
        break;
      }
    }
    if (!tabFound) {
      chrome.tabs.create({ url }, (tab) => {
        if (openerTabId !== undefined && tab.id !== undefined) {
          tabRelations[tab.id] = openerTabId;
          saveTabRelations();
        }
      });
    }
  });
}

function saveTabRelations() {
  chrome.storage.local.set({ tabRelations }, () => {
    console.log('Tab relations saved');
  });
}

function loadTabRelations() {
  chrome.storage.local.get('tabRelations', (data) => {
    if (data.tabRelations) {
      tabRelations = data.tabRelations;
      console.log('Tab relations loaded');
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'opentab') {
    openTab(message.url, sender.tab?.id);
  } else if (message.action === 'returntab' && sender.tab?.id) {
    let originalTabId = tabRelations[sender.tab.id];
    if (originalTabId) {
      chrome.tabs.update(originalTabId, { active: true });
    }
  } else if (message.action === 'checkReturn') {
    console.log('checkReturn:', sender.tab?.id);
    if (sender.tab?.id) {
      sendResponse({visible: !!tabRelations[sender.tab?.id]})
    } else {
      sendResponse({ visible: false });
    }
  }
});

chrome.runtime.onStartup.addListener(() => {
  loadTabRelations();
});
loadTabRelations()
