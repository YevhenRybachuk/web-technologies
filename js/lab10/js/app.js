const $ = id => document.getElementById(id);
const PER_PAGE = 30;

let allUsers = [];
let filtered = [];
let currentPage = 1;
let totalPages = 1;
let showOnlyFav = false;
let appInitialized = false;

const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

const normalize = value => String(value || '').trim().toLowerCase();
const toInt = (value, fallback) => Number.parseInt(value, 10) || fallback;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char]));

const formatDate = iso => iso
  ? new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })
  : '-';

const showToast = (message, type = '') => {
  const toast = $('toast');
  toast.textContent = message;
  toast.className = `show${type ? ` toast-${type}` : ''}`;
  setTimeout(() => {
    toast.className = '';
  }, 2800);
};

const getErrorEl = input => {
  const parent = input.closest('.password-box') || input;
  const sibling = parent.nextElementSibling;
  return sibling && sibling.classList.contains('error') ? sibling : null;
};

const setError = (input, message) => {
  input.classList.add('invalid');
  input.classList.remove('valid');
  const error = getErrorEl(input);
  if (error) error.textContent = message;
};

const setSuccess = input => {
  input.classList.remove('invalid');
  const error = getErrorEl(input);
  if (error) error.textContent = '';
  if (input.id === 'loginUsername' || input.id === 'loginPassword') {
    input.classList.remove('valid');
    return;
  }
  input.classList.toggle('valid', Boolean(input.value.trim()));
};

const clearValidation = form => {
  form.querySelectorAll('.valid,.invalid').forEach(el => el.classList.remove('valid', 'invalid'));
  form.querySelectorAll('.error').forEach(el => {
    el.textContent = '';
  });
};

const showMsg = (id, text, type) => {
  const el = $(id);
  el.textContent = text;
  el.className = `auth-msg ${type}`;
  el.style.display = 'block';
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+380\d{9}$/;

const cities = {
  ua: ['Kyiv', 'Lviv', 'Chernivtsi', 'Odesa', 'Kharkiv', 'Dnipro'],
  pl: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan'],
  de: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'],
  fr: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux'],
  us: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
  gb: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow'],
};

const getAge = birthDate => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getCurrentUserEmail = () => {
  const session = getSessionUser() || {};
  return session.email || 'guest';
};
const getFavKey = () => `ff_favs_${getCurrentUserEmail()}`;
const getFavs = () => new Set(JSON.parse(localStorage.getItem(getFavKey()) || '[]'));
const saveFavs = favs => localStorage.setItem(getFavKey(), JSON.stringify([...favs]));

const getFilterState = () => ({
  q: normalize($('search-input').value),
  firstName: normalize($('f-first-name').value),
  lastName: normalize($('f-last-name').value),
  gender: $('f-gender').value,
  country: $('f-country').value,
  city: $('f-city').value,
  ageMin: toInt($('f-age-min').value, 0),
  ageMax: toInt($('f-age-max').value, 999),
  year: $('f-birth-year').value,
  favs: getFavs(),
  onlyFav: showOnlyFav,
});

const sortUsers = (users, key) => {
  if (!key) return users;
  const direction = key.endsWith('-asc') ? 1 : -1;
  const field = key.replace(/-asc|-desc/, '');
  return [...users].sort((a, b) => {
    if (field === 'name') {
      return direction * `${a.name.first} ${a.name.last}`.localeCompare(`${b.name.first} ${b.name.last}`);
    }
    if (field === 'age') return direction * (a.dob.age - b.dob.age);
    if (field === 'reg') return direction * (new Date(a.registered.date) - new Date(b.registered.date));
    return 0;
  });
};

const filterUsers = (users, state) => users.filter(user => {
  const firstName = normalize(user.name.first);
  const lastName = normalize(user.name.last);
  const fullName = `${firstName} ${lastName}`;
  const city = user.location.city;
  const country = user.location.country;
  const cityNormalized = normalize(city);
  const countryNormalized = normalize(country);
  const birthYear = new Date(user.dob.date).getFullYear();

  if (state.q && ![fullName, firstName, lastName, cityNormalized, countryNormalized].some(value => value.includes(state.q))) return false;
  if (state.firstName && !firstName.includes(state.firstName)) return false;
  if (state.lastName && !lastName.includes(state.lastName)) return false;
  if (state.gender && user.gender !== state.gender) return false;
  if (state.country && country !== state.country) return false;
  if (state.city && city !== state.city) return false;
  if (user.dob.age < state.ageMin || user.dob.age > state.ageMax) return false;
  if (state.year && birthYear !== Number.parseInt(state.year, 10)) return false;
  if (state.onlyFav && !state.favs.has(user.login.uuid)) return false;
  return true;
});

const getPageRange = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
    pages.push(page);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
};

const updateCitySelect = (selectedCity = '') => {
  const country = $('f-country').value;
  const source = country ? allUsers.filter(user => user.location.country === country) : allUsers;
  const citiesList = [...new Set(source.map(user => user.location.city))].sort();
  $('f-city').innerHTML = '<option value="">Усі міста</option>' + citiesList
    .map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`)
    .join('');
  if (selectedCity && citiesList.includes(selectedCity)) $('f-city').value = selectedCity;
};

const buildLocationFilters = () => {
  const selectedCountry = new URLSearchParams(location.search).get('country') || '';
  const selectedCity = new URLSearchParams(location.search).get('city') || '';
  const countries = [...new Set(allUsers.map(user => user.location.country))].sort();
  $('f-country').innerHTML = '<option value="">Усі країни</option>' + countries
    .map(country => `<option value="${escapeHtml(country)}">${escapeHtml(country)}</option>`)
    .join('');
  if (selectedCountry && countries.includes(selectedCountry)) $('f-country').value = selectedCountry;
  updateCitySelect(selectedCity);
};

const readParams = () => {
  const params = new URLSearchParams(location.search);
  $('search-input').value = params.get('q') || '';
  $('sort-select').value = params.get('sort') || '';
  $('f-first-name').value = params.get('first') || '';
  $('f-last-name').value = params.get('last') || '';
  $('f-gender').value = params.get('gender') || '';
  $('f-age-min').value = params.get('ageMin') || '';
  $('f-age-max').value = params.get('ageMax') || '';
  $('f-birth-year').value = params.get('year') || '';
  currentPage = toInt(params.get('page'), 1);
};

const writeParams = () => {
  const params = new URLSearchParams();
  const pairs = [
    ['q', $('search-input').value.trim()],
    ['sort', $('sort-select').value],
    ['first', $('f-first-name').value.trim()],
    ['last', $('f-last-name').value.trim()],
    ['gender', $('f-gender').value],
    ['country', $('f-country').value],
    ['city', $('f-city').value],
    ['ageMin', $('f-age-min').value],
    ['ageMax', $('f-age-max').value],
    ['year', $('f-birth-year').value],
  ];
  pairs.forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (currentPage > 1) params.set('page', currentPage);
  history.replaceState({}, '', params.toString() ? `?${params}` : location.pathname);
};

const updateFavCount = () => {
  $('fav-count').textContent = `♥ ${getFavs().size}`;
};

const toggleFav = uuid => {
  const favs = getFavs();
  if (favs.has(uuid)) favs.delete(uuid);
  else favs.add(uuid);
  saveFavs(favs);
  updateFavCount();
  document.querySelectorAll(`.fav-btn[data-uuid="${uuid}"]`).forEach(btn => {
    const active = favs.has(uuid);
    btn.classList.toggle('active', active);
    btn.textContent = active ? '♥' : '♡';
  });
};

const renderCard = user => {
  const isFav = getFavs().has(user.login.uuid);
  const flag = `https://flagcdn.com/24x18/${user.nat.toLowerCase()}.png`;
  const fullName = `${escapeHtml(user.name.first)} ${escapeHtml(user.name.last)}`;
  const city = escapeHtml(user.location.city);
  const country = escapeHtml(user.location.country);
  const uuid = escapeHtml(user.login.uuid);

  return `<article class="card">
    <img class="card-img" src="${escapeHtml(user.picture.large)}" alt="${fullName}" loading="lazy" onerror="this.src='https://api.dicebear.com/7.x/personas/svg?seed=${uuid}'">
    <button class="fav-btn ${isFav ? 'active' : ''}" data-uuid="${uuid}" onclick="toggleFav('${uuid}')" title="Обрані" type="button">${isFav ? '♥' : '♡'}</button>
    <div class="card-body">
      <h2 class="card-name">${fullName}</h2>
      <div class="card-email">${escapeHtml(user.email)}</div>
      <div class="card-meta">
        <span class="badge">${user.dob.age} р.</span>
        <span class="badge badge-green">${user.gender === 'male' ? 'Чоловіча' : 'Жіноча'}</span>
      </div>
      <div class="card-info">
        <span>☎ ${escapeHtml(user.phone)}</span>
        <span><img src="${flag}" width="16" height="12" alt="" loading="lazy"> ${city}, ${country}</span>
        <span>Дата реєстрації: ${formatDate(user.registered.date)}</span>
      </div>
    </div>
  </article>`;
};

const renderPagination = () => {
  const pagination = $('pagination');
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  const button = (label, page, disabled, active) =>
    `<button class="page-btn ${active ? 'active' : ''}" ${disabled ? 'disabled' : ''} onclick="goPage(${page})" type="button">${label}</button>`;

  let html = button('‹', currentPage - 1, currentPage === 1, false);
  getPageRange(currentPage, totalPages).forEach(page => {
    html += page === '...'
      ? '<span class="page-btn dots">...</span>'
      : button(page, page, false, page === currentPage);
  });
  html += button('›', currentPage + 1, currentPage === totalPages, false);
  pagination.innerHTML = html;
};

const render = () => {
  $('loader').style.display = 'none';
  const pageUsers = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  $('grid').innerHTML = pageUsers.length
    ? pageUsers.map(renderCard).join('')
    : '<div class="empty-state">За цими параметрами друзів не знайдено.</div>';
  renderPagination();
};

const applyFilters = () => {
  const sort = $('sort-select').value;
  filtered = sortUsers(filterUsers(allUsers, getFilterState()), sort);
  totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = 1;
  $('stats').textContent = `${filtered.length} користувачів`;
  writeParams();
  render();
};

const fetchUsers = async () => {
  $('loader').style.display = 'block';
  $('error-block').style.display = 'none';
  $('grid').innerHTML = '';

  try {
    const response = await fetch('https://randomuser.me/api/?results=300&seed=friendfinder2025');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    allUsers = data.results;
    buildLocationFilters();
    applyFilters();
  } catch (error) {
    $('loader').style.display = 'none';
    $('error-block').style.display = 'block';
    $('error-msg').textContent = `Помилка: ${error.message}`;
    showToast('Не вдалося завантажити користувачів', 'error');
  }
};

const onSortChange = () => {
  currentPage = 1;
  applyFilters();
};

const onCountryFilterChange = () => {
  updateCitySelect();
  currentPage = 1;
  applyFilters();
};

const toggleFilter = () => {
  const open = $('filter-panel').classList.toggle('open');
  $('filter-toggle').classList.toggle('active', open);
};

const clearFilters = () => {
  ['f-first-name', 'f-last-name', 'f-age-min', 'f-age-max', 'f-birth-year'].forEach(id => {
    $(id).value = '';
  });
  $('f-gender').value = '';
  $('f-country').value = '';
  updateCitySelect();
  currentPage = 1;
  applyFilters();
};

const toggleFavFilter = () => {
  showOnlyFav = !showOnlyFav;
  $('fav-filter-btn').classList.toggle('active', showOnlyFav);
  currentPage = 1;
  applyFilters();
};

const goPage = page => {
  currentPage = page;
  writeParams();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && currentPage < totalPages) {
    currentPage++;
    const pageUsers = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    $('grid').insertAdjacentHTML('beforeend', pageUsers.map(renderCard).join(''));
    renderPagination();
    writeParams();
  }
}, { rootMargin: '200px' });

const getSessionUser = () => {
  const session = localStorage.getItem('ff_session') || sessionStorage.getItem('ff_session');
  return session ? JSON.parse(session) : null;
};

const saveSession = (user, remember = false) => {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  otherStorage.removeItem('ff_session');
  storage.setItem('ff_session', JSON.stringify(user));
};

const loginUser = (user, remember = false) => {
  saveSession(user, remember);
  $('auth-screen').style.display = 'none';
  $('app-screen').style.display = 'block';
  $('user-name-display').textContent = user.name || user.email.split('@')[0];
  $('user-avatar').src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`;
  initApp();
};

const logout = () => {
  localStorage.removeItem('ff_session');
  sessionStorage.removeItem('ff_session');
  $('app-screen').style.display = 'none';
  $('auth-screen').style.display = 'flex';
  $('loginUsername').value = '';
  $('loginPassword').value = '';
  $('login-msg').style.display = 'none';
  clearValidation($('login'));
};

const initApp = () => {
  updateFavCount();
  readParams();
  fetchUsers();
  if (!appInitialized) {
    observer.observe($('sentinel'));
    $('search-input').addEventListener('input', debounce(() => {
      currentPage = 1;
      applyFilters();
    }, 300));
    appInitialized = true;
  }
};

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
  });
});

document.querySelectorAll('.toggle').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.previousElementSibling;
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    button.textContent = shouldShow ? '🔓' : '🔒';
  });
});

$('country').addEventListener('change', function handleCountryChange() {
  const citySelect = $('city');
  citySelect.innerHTML = '<option value="">Місто</option>';
  if (this.value && cities[this.value]) {
    citySelect.disabled = false;
    cities[this.value].forEach(city => {
      const option = document.createElement('option');
      option.value = city.toLowerCase().replace(/\s+/g, '-');
      option.textContent = city;
      citySelect.appendChild(option);
    });
  } else {
    citySelect.disabled = true;
  }
});

$('register-btn').addEventListener('click', () => {
  let valid = true;
  const firstName = $('firstName');
  const lastName = $('lastName');
  const email = $('regEmail');
  const password = $('regPassword');
  const confirm = $('confirmPassword');
  const phone = $('phone');
  const birthInput = $('birth');
  const gender = $('gender');

  if (firstName.value.trim().length < 3 || firstName.value.trim().length > 15) {
    setError(firstName, 'Введіть 3-15 символів');
    valid = false;
  } else setSuccess(firstName);

  if (lastName.value.trim().length < 2 || lastName.value.trim().length > 20) {
    setError(lastName, 'Введіть 2-20 символів');
    valid = false;
  } else setSuccess(lastName);

  if (!emailRegex.test(email.value.trim())) {
    setError(email, 'Некоректний email');
    valid = false;
  } else setSuccess(email);

  if (password.value.length < 6) {
    setError(password, 'Мінімум 6 символів');
    valid = false;
  } else setSuccess(password);

  if (!confirm.value) {
    setError(confirm, 'Повторіть пароль');
    valid = false;
  } else if (confirm.value !== password.value) {
    setError(confirm, 'Паролі не збігаються');
    valid = false;
  } else setSuccess(confirm);

  if (!phoneRegex.test(phone.value.trim())) {
    setError(phone, 'Формат: +380XXXXXXXXX');
    valid = false;
  } else setSuccess(phone);

  if (!birthInput.value) {
    setError(birthInput, 'Оберіть дату народження');
    valid = false;
  } else if (getAge(birthInput.value) < 12 || Number.isNaN(getAge(birthInput.value))) {
    setError(birthInput, 'Вік має бути від 12 років');
    valid = false;
  } else setSuccess(birthInput);

  if (!gender.value) {
    setError(gender, 'Оберіть стать');
    valid = false;
  } else setSuccess(gender);

  if (!valid) return;

  const stored = JSON.parse(localStorage.getItem('ff_users') || '{}');
  const emailVal = email.value.trim();
  if (stored[emailVal]) {
    showMsg('register-msg', 'Email вже зареєстровано', 'error-msg');
    return;
  }

  const name = `${firstName.value.trim()} ${lastName.value.trim()}`;
  stored[emailVal] = { email: emailVal, pass: password.value, name };
  localStorage.setItem('ff_users', JSON.stringify(stored));
  showMsg('register-msg', 'Акаунт створено. Виконуємо вхід...', 'success-msg');
  setTimeout(() => loginUser({ email: emailVal, name }), 800);
});

$('login-btn').addEventListener('click', () => {
  let valid = true;
  const username = $('loginUsername');
  const password = $('loginPassword');

  if (!emailRegex.test(username.value.trim())) {
    setError(username, 'Введіть коректний email');
    valid = false;
  } else setSuccess(username);

  if (password.value.length < 6) {
    setError(password, 'Мінімум 6 символів');
    valid = false;
  } else setSuccess(password);

  if (!valid) return;

  const stored = JSON.parse(localStorage.getItem('ff_users') || '{}');
  const user = stored[username.value.trim()];
  if (!user || user.pass !== password.value) {
    setError(username, 'Невірний email або пароль');
    setError(password, 'Невірний email або пароль');
    showMsg('login-msg', 'Невірний email або пароль', 'error-msg');
    return;
  }

  loginUser(user, $('rememberMe').checked);
});

const checkSession = () => {
  const session = getSessionUser();
  if (session) {
    $('auth-screen').style.display = 'none';
    $('app-screen').style.display = 'block';
    $('user-name-display').textContent = session.name || session.email.split('@')[0];
    $('user-avatar').src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.name || session.email)}`;
    initApp();
  }
};

Object.assign(window, {
  applyFilters,
  clearFilters,
  fetchUsers,
  goPage,
  logout,
  onCountryFilterChange,
  onSortChange,
  toggleFav,
  toggleFavFilter,
  toggleFilter,
});

checkSession();
