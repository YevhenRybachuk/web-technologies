let timings = {
  red: 5000,
  yellow: 3000,
  green: 7000,
};

let currentState = "off";
let timerId;

const lights = {
  red: document.getElementById("red"),
  yellow: document.getElementById("yellow"),
  green: document.getElementById("green"),
};
const display = document.getElementById("status-display");

function clearLights() {
  lights.red.classList.remove("red-on");
  lights.yellow.classList.remove("yellow-on");
  lights.green.classList.remove("green-on");
}

function setupTimings() {
  timings.red = (prompt("Час червоного (сек):", 5) || 5) * 1000;
  timings.yellow = (prompt("Час жовтого (сек):", 3) || 3) * 1000;
  timings.green = (prompt("Час зеленого (сек):", 7) || 7) * 1000;
}

function setLight(color) {
  clearTimeout(timerId);
  clearLights();
  currentState = color;

  if (color === "red") {
    lights.red.classList.add("red-on");
    display.innerText = "Червоний";
    timerId = setTimeout(() => setLight("yellow"), timings.red);
  } else if (color === "yellow") {
    lights.yellow.classList.add("yellow-on");
    display.innerText = "Жовтий";
    timerId = setTimeout(() => setLight("green"), timings.yellow);
  } else if (color === "green") {
    lights.green.classList.add("green-on");
    display.innerText = "Зелений";
    timerId = setTimeout(() => startBlinkingYellow(), timings.green);
  }
}

function startBlinkingYellow() {
  clearLights();
  currentState = "blinking";
  display.innerText = "Увага (миготіння)";

  let counts = 0;
  const blinkInterval = setInterval(() => {
    lights.yellow.classList.toggle("yellow-on");
    counts++;

    if (counts >= 6) {
      clearInterval(blinkInterval);
      setLight("red");
    }
  }, 500);
}

function manualNext() {
  clearTimeout(timerId);
  if (currentState === "red") setLight("yellow");
  else if (currentState === "yellow") setLight("green");
  else if (currentState === "green") startBlinkingYellow();
  else setLight("red");
}

function startTrafficLight() {
  setLight("red");
}
