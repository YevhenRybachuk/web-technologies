const lamp = document.getElementById("lamp");
let isOn = false;
let timer;
let currentType = "normal";

function toggleLamp() {
  isOn = !isOn;
  updateLampVisuals();
  resetTimer();
}

function changeType(type, element) {
  currentType = type;

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (element) element.classList.add('active');

  if (isOn) {
    updateLampVisuals();
  }

  resetTimer();
}

function updateLampVisuals() {
  lamp.classList.remove("on", "off", "eco", "led");

  if (isOn) {
    lamp.classList.add("on");
    if (currentType !== "normal") {
      lamp.classList.add(currentType);
    }
    lamp.style.opacity = "1";
  } else {
    lamp.classList.add("off");
    lamp.style.opacity = "1";
  }
}

function changeBrightness() {
  if (!isOn) {
    alert("Спочатку увімкніть лампочку");
    return;
  }

  if (currentType === "eco") {
    alert("Енергозберігаюча лампа не підтримує зміну яскравості");
    return;
  }

  let value = prompt("Введіть яскравість (0-100):");
  if (value === null) return;

  value = Number(value);
  if (isNaN(value) || value < 0 || value > 100) {
    alert("Введіть число від 0 до 100");
    return;
  }

  lamp.style.opacity = value / 100;
  resetTimer();
}

function resetTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    isOn = false;
    updateLampVisuals();
    alert("Лампочка автоматично вимкнулась через бездіяльність");
  }, 300000);
}

resetTimer();
