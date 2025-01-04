/**************************************************
  1. ВИЗНАЧЕННЯ ПОТОЧНОГО МІСЯЦЯ ТА РОКУ
**************************************************/
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // 0..11

/**************************************************
  2. ФУНКЦІЯ ГЕНЕРАЦІЇ КАЛЕНДАРЯ
**************************************************/
const calendarTitle = document.getElementById('calendarTitle');
const calendarTableBody = document.querySelector('#calendarTable tbody');

// Збереження виділених днів у LocalStorage
let highlightedDays = JSON.parse(localStorage.getItem('highlightedDays_v5')) || {};

function generateCalendar(year, month) {
  // Очищаємо попередні ряди
  calendarTableBody.innerHTML = '';

  // Назва місяця та року (українською)
  const monthName = new Date(year, month).toLocaleString('uk-UA', { month: 'long', year: 'numeric' });
  // Перша літера велика
  calendarTitle.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Знайдемо день тижня для 1-го числа
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // У JS неділя=0, понеділок=1... Зсув для Пн=1, Вт=2...
  const offset = (firstDayOfWeek + 6) % 7;
  
  // Кількість днів у цьому місяці
  const totalDays = new Date(year, month + 1, 0).getDate();

  let currentDay = 1;
  // Макс 6 тижнів (перебираємо рядки)
  for (let week = 0; week < 6; week++) {
    const row = document.createElement('tr');
    
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const cell = document.createElement('td');

      // Якщо ще не дійшли до початку місяця або вже вийшли за межі totalDays
      if ((week === 0 && dayOfWeek < offset) || currentDay > totalDays) {
        cell.textContent = '';
      } else {
        cell.textContent = currentDay;

        // Генеруємо ключ для LocalStorage
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(currentDay).padStart(2,'0')}`;
        cell.dataset.date = dateKey;

        // Перевірити, чи день у минулому
        const cellDate = new Date(year, month, currentDay);
        const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (isPast) {
          cell.classList.add('past-day');
        } else {
          // Якщо день не в минулому – можна виділяти (правий клік)
          cell.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // вимикаємо контекстне меню
            toggleHighlight(cell);
          });
          // При лівому кліку – оновимо віджет праворуч
          cell.addEventListener('click', () => {
            updateDateWidget(dateKey);
          });
        }

        // Якщо день вже виділений у LocalStorage
        if (highlightedDays[dateKey]) {
          cell.classList.add('highlighted');
        }

        currentDay++;
      }
      row.appendChild(cell);
    }
    
    calendarTableBody.appendChild(row);
  }
}

/**************************************************
  3. ФУНКЦІЯ ПЕРЕМИКАННЯ ВИДІЛЕННЯ
**************************************************/
function toggleHighlight(cell) {
  const dateKey = cell.dataset.date;
  if (!dateKey) return;

  if (cell.classList.contains('highlighted')) {
    cell.classList.remove('highlighted');
    delete highlightedDays[dateKey];
  } else {
    cell.classList.add('highlighted');
    highlightedDays[dateKey] = true;
  }
  localStorage.setItem('highlightedDays_v5', JSON.stringify(highlightedDays));
}

/**************************************************
  4. ВІДЖЕТ ПРАВОРУЧ – ОНОВЛЕННЯ ДНЯ/МІСЯЦЯ
**************************************************/
const widgetDayEl = document.getElementById('widgetDay');
const widgetMonthEl = document.getElementById('widgetMonth');

function updateDateWidget(dateKey) {
  if (!dateKey) return;
  const [yyyy, mm, dd] = dateKey.split('-');
  // dd – день, mm – місяць (1..12)
  widgetDayEl.textContent = dd;

  // Скорочена назва місяця
  const shortMonth = new Date(parseInt(yyyy), parseInt(mm)-1, parseInt(dd))
    .toLocaleString('uk-UA', { month: 'short' })
    .replace('.', ''); // іноді після короткої назви стоїть "."
  
  widgetMonthEl.textContent = shortMonth.toUpperCase();
}

/**************************************************
  5. СТАРТ
**************************************************/
generateCalendar(currentYear, currentMonth);
// За замовчуванням оновлюємо віджет сьогоднішнім днем 
const todayKey = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
const todayCell = document.querySelector(`td[data-date="${todayKey}"]`);
if (todayCell && !todayCell.classList.contains('past-day')) {
  updateDateWidget(todayKey);
}
