document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const closeBtn = settingsMenu.querySelector(".settings-close");
  const minimizeBtn = settingsMenu.querySelector(".settings-minimize");
  const maximizeBtn = settingsMenu.querySelector(".settings-maximize");
  const optimizeToggle = document.getElementById("optimize-toggle");
  const backgroundColor = document.getElementById("background-color");
  const transparencySlider = document.getElementById("transparency-slider");
  const resetBtn = document.getElementById("reset-btn");

  // Load settings from localStorage
  loadSettings();

  settingsBtn.addEventListener("click", () => {
    settingsMenu.classList.toggle("hidden");
  });

  closeBtn.addEventListener("click", () => {
    settingsMenu.classList.add("hidden");
  });

  minimizeBtn.addEventListener("click", () => {
    settingsMenu.style.transform = "scale(0.2)";
    settingsMenu.style.right = "10px";
    settingsMenu.style.top = "10px";
  });

  maximizeBtn.addEventListener("click", () => {
    settingsMenu.style.transform = "scale(1)";
    settingsMenu.style.right = "50px";
    settingsMenu.style.top = "50px";
  });

  optimizeToggle.addEventListener("change", () => {
    document.body.classList.toggle("optimized", optimizeToggle.checked);
    saveSettings();
  });

  backgroundColor.addEventListener("input", () => {
    updateBackgroundColor();
    saveSettings();
  });

  transparencySlider.addEventListener("input", () => {
    updateTransparency();
    saveSettings();
  });

  resetBtn.addEventListener("click", () => {
    localStorage.removeItem("settings");
    location.reload();
  });

  function updateBackgroundColor() {
    const color = backgroundColor.value;
    document.body.style.background = color;
  }

  function updateTransparency() {
    const transparency = transparencySlider.value;
    document.documentElement.style.setProperty("--transparency", transparency / 100);
  }

  function saveSettings() {
    const settings = {
      optimize: optimizeToggle.checked,
      backgroundColor: backgroundColor.value,
      transparency: transparencySlider.value
    };
    localStorage.setItem("settings", JSON.stringify(settings));
  }

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("settings"));
    if (settings) {
      optimizeToggle.checked = settings.optimize;
      backgroundColor.value = settings.backgroundColor;
      transparencySlider.value = settings.transparency;
      updateBackgroundColor();
      updateTransparency();
      if (settings.optimize) {
        document.body.classList.add("optimized");
      }
    }
  }

  // Добавляем функционал перемещения окна
  let isDragging = false;
  let offsetX, offsetY;

  settingsMenu.addEventListener("mousedown", (e) => {
    if (e.target.closest(".settings-header")) {
      isDragging = true;
      offsetX = e.clientX - settingsMenu.getBoundingClientRect().left;
      offsetY = e.clientY - settingsMenu.getBoundingClientRect().top;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  });

  function onMouseMove(e) {
    if (isDragging) {
      settingsMenu.style.left = `${e.clientX - offsetX}px`;
      settingsMenu.style.top = `${e.clientY - offsetY}px`;
    }
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
});