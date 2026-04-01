function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  document.getElementById('clock').innerHTML = `${h}<span>:</span>${m}<span>:</span>${s}`;
}
setInterval(updateClock, 1000);

let countdownInterval;

function startCountdown() {
  const target = new Date(document.getElementById('targetDate').value);
  if (isNaN(target)) return;

  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      document.getElementById('countdown-display').innerText = "Час вийшов! 🎉";
      clearInterval(countdownInterval);
      return;
    }

    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown-display').innerHTML =
      `Залишилось: <br> <b>${months}м ${days}д ${hours}г ${mins}хв ${secs}с</b>`;
  }, 1000);
}

function updateCalendar() {
  const picker = document.getElementById('calendarPicker');
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const date = picker.value ? new Date(picker.value) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'day-name';
    el.innerText = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const offset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));

  for (let i = 1; i <= daysInMonth; i++) {
    const el = document.createElement('div');
    el.className = 'day';
    if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
      el.classList.add('today');
    }
    el.innerText = i;
    grid.appendChild(el);
  }
}
let birthdayTimer;

function calculateBirthday() {
  const input = document.getElementById('birthDateInput').value;
  if (!input) return;

  const resultDisplay = document.getElementById('birthday-result');
  const birthDate = new Date(input);
  const now = new Date();

  let nextBday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (nextBday < now) {
    nextBday.setFullYear(now.getFullYear() + 1);
  }

  clearInterval(birthdayTimer);

  birthdayTimer = setInterval(() => {
    const currentTime = new Date();
    const diff = nextBday - currentTime;

    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(totalDays / 30.44);
    const days = Math.floor(totalDays % 30.44);
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    resultDisplay.innerHTML = `
      <div style="color: #3498db; font-size: 0.9em; margin-bottom: 5px;">До вашого свята:</div>
      <b style="color: #00ff88;">${months}м ${days}д ${hours}г ${mins}хв ${secs}с</b>
    `;
  }, 1000);
}

updateCalendar();
updateClock();
