import '/style.css';
import { getWeather } from './public/icons/weather';
import { ICON_MAP } from './iconMap';

let current_page = 1;
let rows = 10;

let hourlyData = null;

navigator.geolocation.getCurrentPosition(positionSuccess, positionSuccess);

function positionSuccess({ coords }) {
  getWeather(
    coords.latitude,
    coords.longitude,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
    .then((data) => {
      renderWeather(data);
      let { hourly } = data;
      hourlyData = hourly;
      setupPagination(hourlyData, rows);
    })
    .catch((err) => {
      console.log(err);
    });
}

function positionError() {
  alert(
    'There was an error getting your location.Please allow us to use your location and refresh the page'
  );
}

function renderWeather({ current, daily, hourly }) {
  renderCurrentWeather(current);
  renderDailyWeather(daily);
  renderHourlyWeather(hourly, false);

  document.body.classList.remove('blurred');
}

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value;
}

function getIconUrl(iconCode) {
  return `icons/${ICON_MAP.get(iconCode)}.svg`;
}

const currentIcon = document.querySelector('[data-current-icon]');
function renderCurrentWeather(current) {
  currentIcon.src = getIconUrl(current.iconCode);

  setValue('current-temp', current.currentTemp);
  setValue('current-high', current.highTemp);
  setValue('current-low', current.lowTemp);
  setValue('current-fl-high', current.highFeelsLike);
  setValue('current-fl-low', current.lowFeelsLike);
  setValue('current-wind', current.windSpeed);
  setValue('current-precip', current.precip);
  setValue(
    'current-location',
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const dailySection = document.querySelector('[data-day-section]');
const dayCardTemplate = document.getElementById('day-card-template');
function renderDailyWeather(daily) {
  dailySection.innerHTML = '';
  daily.forEach((day) => {
    const element = dayCardTemplate.content.cloneNode(true);
    setValue('temp', day.maxTemp, { parent: element });
    setValue('date', DAY_FORMATTER.format(day.timestamp), { parent: element });
    element.querySelector('[data-icon]').src = getIconUrl(day.iconCode);
    dailySection.append(element);
  });
}

const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });
const hourlySection = document.querySelector('[data-hour-section]');
const hourRowTemplate = document.getElementById('hour-row-template');

export function renderHourlyWeather(hourly, clicked) {
  hourlySection.innerHTML = '';

  if (!clicked) {
    hourly = displayNumOfHourlyData(hourly, rows, current_page);
  }

  hourly.forEach((hour) => {
    const element = hourRowTemplate.content.cloneNode(true);
    setValue('temp', hour.temp, { parent: element });
    setValue('fl-temp', hour.feelsLike, { parent: element });
    setValue('wind', hour.windSpeed, { parent: element });
    setValue('precip', hour.precip, { parent: element });
    setValue('day', DAY_FORMATTER.format(hour.timestamp), { parent: element });
    setValue('time', HOUR_FORMATTER.format(hour.timestamp), {
      parent: element,
    });
    element.querySelector('[data-icon]').src = getIconUrl(hour.iconCode);
    hourlySection.append(element);
  });
}

export function displayNumOfHourlyData(items, rows_per_page, page) {
  page--;

  let start = rows_per_page * page;
  let end = start + rows_per_page;

  let paginatedItems = items.slice(start, end);

  return paginatedItems;
}

export function setupPagination(items, rows_per_page) {
  let paginationWrapper = document.querySelector('.pagination');
  paginationWrapper.innerHTML = '';

  let page_count = Math.ceil(items.length / rows_per_page);

  for (let i = 1; i < page_count + 1; i++) {
    let btn = paginationButton(i, items, rows_per_page);
    paginationWrapper.appendChild(btn);
  }
}

function paginationButton(page, items, rows_per_page) {
  let button = document.createElement('button');
  button.innerText = page;

  if (current_page == page) {
    button.classList.add('active');
  }

  button.addEventListener('click', () => {
    current_page = page;

    items = displayNumOfHourlyData(hourlyData, rows_per_page, current_page);

    renderHourlyWeather(items, true);

    let current_btn = document.querySelector('.pagination button.active');
    current_btn.classList.remove('active');

    button.classList.add('active');
  });

  return button;
}
