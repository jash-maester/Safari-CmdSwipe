(() => {
  const DEFAULTS = { modifier: "cmd", threshold: 80, reverse: false };
  const IDLE_MS = 300;

  let settings = { ...DEFAULTS };
  let accumulatedX = 0;
  let idleTimer = null;

  chrome.storage.local.get(DEFAULTS, (stored) => {
    settings = { ...DEFAULTS, ...stored };
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    for (const key of Object.keys(changes)) {
      if (key in DEFAULTS) settings[key] = changes[key].newValue;
    }
  });

  const reset = () => {
    accumulatedX = 0;
    if (idleTimer !== null) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const scheduleIdleReset = () => {
    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = setTimeout(reset, IDLE_MS);
  };

  const modifierActive = (event) => {
    switch (settings.modifier) {
      case "cmd":
        return event.metaKey;
      case "option":
        return event.altKey;
      case "hyper":
        return event.metaKey && event.altKey && event.ctrlKey && event.shiftKey;
      default:
        return false;
    }
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (!modifierActive(event)) {
        reset();
        return;
      }

      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      if (absY > absX) return;

      event.preventDefault();

      accumulatedX += event.deltaX;
      scheduleIdleReset();

      const threshold = settings.threshold;
      const positiveDir = settings.reverse ? "prev" : "next";
      const negativeDir = settings.reverse ? "next" : "prev";
      if (accumulatedX >= threshold) {
        chrome.runtime.sendMessage({ action: "switchTab", direction: positiveDir });
        accumulatedX = 0;
      } else if (accumulatedX <= -threshold) {
        chrome.runtime.sendMessage({ action: "switchTab", direction: negativeDir });
        accumulatedX = 0;
      }
    },
    { passive: false }
  );

  window.addEventListener("blur", reset);
})();
