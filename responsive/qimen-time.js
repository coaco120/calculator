/* Civil input stays visible; charts use one continuous twelve-shichen day. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.QimenTime = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function integer(value) {
    if (typeof value === 'string' && !/^\d+$/.test(value)) return NaN;
    const result = Number(value);
    return Number.isInteger(result) ? result : NaN;
  }

  // Match the historical calendar convention of the bundled lunar.js library.
  function daysInMonth(year, month) {
    const leap = year < 1600 ? year % 4 === 0 : year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  }

  function validateDate(input) {
    const year = integer(input.year);
    const month = integer(input.month);
    const day = integer(input.day);
    if (!(year >= 1 && year <= 9999)) throw new RangeError('請輸入 1 至 9999 年。');
    if (!(month >= 1 && month <= 12)) throw new RangeError('請輸入 1 至 12 月。');
    if (!(day >= 1 && day <= daysInMonth(year, month))) throw new RangeError('日期無效，請檢查該月份的日數。');
    if (year === 1582 && month === 10 && day >= 5 && day <= 14) {
      throw new RangeError('曆法轉換期間，1582 年 10 月 5 至 14 日不存在。');
    }
    return { year, month, day };
  }

  function shiftDate(input, offset) {
    let { year, month, day } = validateDate(input);
    if (!Number.isInteger(offset)) throw new RangeError('日期調整必須是整數。');
    const direction = Math.sign(offset);
    for (let remaining = Math.abs(offset); remaining > 0; remaining--) {
      if (year === 1582 && month === 10 && day === (direction > 0 ? 4 : 15)) {
        day = direction > 0 ? 15 : 4;
        continue;
      }
      day += direction;
      if (day > daysInMonth(year, month)) {
        day = 1;
        if (++month > 12) { month = 1; year++; }
      } else if (day < 1) {
        if (--month < 1) { month = 12; year--; }
        day = daysInMonth(year, month);
      }
      if (year < 1 || year > 9999) throw new RangeError('調整後的日期超出 1 至 9999 年範圍。');
    }
    return { year, month, day };
  }

  function parseClock(value) {
    if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
      throw new RangeError('請完整填寫起盤時間。');
    }
    const [hour, minute] = value.split(':').map(Number);
    validateClock(hour, minute);
    return { hour, minute };
  }

  function validateClock(hour, minute) {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
      throw new RangeError('請輸入有效時間（00:00 至 23:59）。');
    }
  }

  function getTimeIndex(hour) {
    validateClock(hour, 0);
    return Math.floor((hour + 1) / 2) % 12;
  }

  function canonicalHour(index) {
    if (!Number.isInteger(index) || index < 0 || index > 11) throw new RangeError('請選擇有效時辰。');
    return index * 2;
  }

  function formatClock(hour, minute = 0) {
    validateClock(hour, minute);
    return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  }

  function formatDate(date) {
    const { year, month, day } = validateDate(date);
    return `${year} 年 ${month} 月 ${day} 日`;
  }

  function normalize(input) {
    const civilDate = validateDate(input);
    const hour = integer(input.hour);
    const minute = integer(input.minute === undefined ? 0 : input.minute);
    validateClock(hour, minute);
    const hourIndex = getTimeIndex(hour);
    const isNextDay = hour === 23;
    return {
      civilDate,
      civilClock: formatClock(hour, minute),
      effectiveDate: isNextDay ? shiftDate(civilDate, 1) : { ...civilDate },
      hourIndex,
      hour: canonicalHour(hourIndex),
      minute: 0,
      isNextDay
    };
  }

  function shiftShichen(input, offset) {
    if (!Number.isInteger(offset)) throw new RangeError('時辰調整必須是整數。');
    const normalized = normalize(input);
    const position = normalized.hourIndex + offset;
    const date = shiftDate(normalized.effectiveDate, Math.floor(position / 12));
    const hourIndex = ((position % 12) + 12) % 12;
    const hour = canonicalHour(hourIndex);
    return { ...date, hourIndex, hour, minute: 0, clock: formatClock(hour) };
  }

  return { daysInMonth, validateDate, shiftDate, parseClock, getTimeIndex, canonicalHour, formatClock, formatDate, normalize, shiftShichen };
});
