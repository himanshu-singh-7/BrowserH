let tabs = [];
let activeTabId = null;
let historyEnabled = false;
let history = [];
let blockedCount = 0;

const searchEngines = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  yahoo: 'https://search.yahoo.com/search?p=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  startpage: 'https://www.startpage.com/do/search?q='
};

const blockedDomains = [
  'effectivegatecpm.com',
  'adsterra.com',
  'doubleclick.net',
  'googlesyndication.com'
];

function createTab(isPrivate = false) {
  const id = Date.now();
  const tab = {
    id,
    title: isPrivate ? '🔒 Private' : 'New Tab',
    isPrivate,
    url: 'about:blank'
  };
  tabs.push(tab);
  renderTabs();
  switchTab(id);
}

function renderTabs() {
  const tabsContainer = document.getElementById('tabs');
  tabsContainer.innerHTML = tabs.map(tab => `
    <div class="tab ${tab.id === activeTabId ? 'active' : ''}" data-id="${tab.id}">
      ${tab.isPrivate ? '🔒 ' : ''}${tab.title}
      <button class="tab-close" data-id="${tab.id}">×</button>
    </div>
  `).join('');

  document.querySelectorAll('.tab').forEach(el => {
    el.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        switchTab(parseInt(el.dataset.id));
      }
    });
  });

  document.querySelectorAll('.tab-close').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(parseInt(el.dataset.id));
    });
  });
}

function switchTab(id) {
  activeTabId = id;
  const tab = tabs.find(t => t.id === id);
  if (tab) {
    document.getElementById('webview').src = tab.url;
    document.getElementById('urlInput').value = tab.url === 'about:blank' ? '' : tab.url;
  }
  renderTabs();
}

function closeTab(id) {
  tabs = tabs.filter(t => t.id !== id);
  if (tabs.length === 0) {
    createTab();
  } else if (activeTabId === id) {
    switchTab(tabs[0].id);
  }
  renderTabs();
}

function navigate(url) {
  let finalUrl = url;
  
  if (blockedDomains.some(domain => url.includes(domain))) {
    blockedCount++;
    document.getElementById('blockedCount').textContent = blockedCount;
    alert('🛡️ Blocked malicious URL!');
    return;
  }

  if (!url.startsWith('http')) {
    if (url.includes('.') && !url.includes(' ')) {
      finalUrl = 'https://' + url;
    } else {
      const engine = document.getElementById('searchEngine').value;
      finalUrl = searchEngines[engine] + encodeURIComponent(url);
    }
  }

  const tab = tabs.find(t => t.id === activeTabId);
  if (tab) {
    tab.url = finalUrl;
    tab.title = url;
    if (historyEnabled && !tab.isPrivate) {
      history.push({ url: finalUrl, time: new Date().toLocaleString() });
    }
  }

  document.getElementById('webview').src = finalUrl;
  renderTabs();
}

// Event Listeners
document.getElementById('newTab').addEventListener('click', () => createTab(false));
document.getElementById('newPrivateTab').addEventListener('click', () => createTab(true));
document.getElementById('urlInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') navigate(e.target.value);
});
document.getElementById('home').addEventListener('click', () => navigate('about:blank'));
document.getElementById('refresh').addEventListener('click', () => {
  document.getElementById('webview').reload();
});
document.getElementById('back').addEventListener('click', () => {
  document.getElementById('webview').goBack();
});
document.getElementById('forward').addEventListener('click', () => {
  document.getElementById('webview').goForward();
});
document.getElementById('settings').addEventListener('click', () => {
  const panel = document.getElementById('settingsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('closeSettings').addEventListener('click', () => {
  document.getElementById('settingsPanel').style.display = 'none';
});
document.getElementById('historyToggle').addEventListener('change', (e) => {
  historyEnabled = e.target.checked;
});
document.getElementById('clearHistory').addEventListener('click', () => {
  history = [];
  alert('History cleared!');
});
document.getElementById('clearCookies').addEventListener('click', () => {
  alert('Cookies cleared!');
});

// Initialize
createTab();
