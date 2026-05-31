const DEFAULTS = { modifier: "cmd", threshold: 80 };
const VALID_MODIFIERS = ["cmd", "option", "hyper"];
const MIN_THRESHOLD = 30;
const MAX_THRESHOLD = 200;

const keyOptions = document.getElementById("keyOptions");
const slider = document.getElementById("thresholdSlider");
const numberInput = document.getElementById("thresholdInput");

function renderModifier(mod) {
  for (const el of keyOptions.querySelectorAll(".key-option")) {
    el.classList.toggle("selected", el.dataset.key === mod);
  }
}

function renderThreshold(value) {
  slider.value = value;
  if (document.activeElement !== numberInput) {
    numberInput.value = value;
  }
}

function clampThreshold(raw) {
  let v = parseInt(raw, 10);
  if (isNaN(v)) v = DEFAULTS.threshold;
  return Math.max(MIN_THRESHOLD, Math.min(MAX_THRESHOLD, v));
}

function commitModifier(mod) {
  if (!VALID_MODIFIERS.includes(mod)) return;
  renderModifier(mod);
  chrome.storage.local.set({ modifier: mod });
}

function commitThreshold(raw) {
  const v = clampThreshold(raw);
  renderThreshold(v);
  chrome.storage.local.set({ threshold: v });
}

chrome.storage.local.get(DEFAULTS, (stored) => {
  let mod = stored.modifier ?? DEFAULTS.modifier;
  if (!VALID_MODIFIERS.includes(mod)) {
    mod = DEFAULTS.modifier;
    chrome.storage.local.set({ modifier: mod });
  }
  renderModifier(mod);
  renderThreshold(clampThreshold(stored.threshold ?? DEFAULTS.threshold));
});

keyOptions.addEventListener("click", (event) => {
  const el = event.target.closest(".key-option");
  if (!el) return;
  commitModifier(el.dataset.key);
});

slider.addEventListener("input", () => {
  commitThreshold(slider.value);
});

numberInput.addEventListener("change", () => {
  commitThreshold(numberInput.value);
});
