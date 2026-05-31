chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.action !== "switchTab") return;

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    const activeIndex = tabs.findIndex((t) => t.active);
    if (activeIndex === -1) return;

    const lastIndex = tabs.length - 1;
    let nextIndex;
    if (message.direction === "next") {
      if (activeIndex >= lastIndex) return;
      nextIndex = activeIndex + 1;
    } else if (message.direction === "prev") {
      if (activeIndex <= 0) return;
      nextIndex = activeIndex - 1;
    } else {
      return;
    }

    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
});
