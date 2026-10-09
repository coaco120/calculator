'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const QimenTime = require('../qimen-time.js');
const lunarLibrary = require('../lunar.js');

function input(year, month, day, clock) {
  return { year, month, day, ...QimenTime.parseClock(clock) };
}

test('23:00 starts next-day 子時; midnight stays on its civil day and 01:00 starts 丑時', () => {
  const cases = [
    ['22:59', 8, 11, 22, false],
    ['23:00', 9, 0, 0, true],
    ['23:30', 9, 0, 0, true],
    ['23:59', 9, 0, 0, true],
    ['00:00', 8, 0, 0, false],
    ['00:59', 8, 0, 0, false],
    ['01:00', 8, 1, 2, false]
  ];
  for (const [clock, day, index, hour, isNextDay] of cases) {
    const normalized = QimenTime.normalize(input(2026, 10, 8, clock));
    assert.deepEqual(normalized.effectiveDate, { year: 2026, month: 10, day }, clock);
    assert.equal(normalized.hourIndex, index, clock);
    assert.equal(normalized.hour, hour, clock);
    assert.equal(normalized.minute, 0, clock);
    assert.equal(normalized.isNextDay, isNextDay, clock);
    assert.deepEqual(normalized.civilDate, { year: 2026, month: 10, day: 8 });
    assert.equal(normalized.civilClock, clock);
  }
});

test('all 1,440 civil minutes belong to exactly one of twelve periods', () => {
  for (let minute = 0; minute < 1440; minute++) {
    const hour = Math.floor(minute / 60);
    const normalized = QimenTime.normalize({ year: 2026, month: 10, day: 8, hour, minute: minute % 60 });
    const expectedIndex = Math.floor((minute + 60) / 120) % 12;
    assert.equal(normalized.hourIndex, expectedIndex, `minute ${minute}`);
    assert.equal(normalized.effectiveDate.day, hour === 23 ? 9 : 8);
  }
});

test('late 子時 rolls across month, leap-day, century and year boundaries', () => {
  const cases = [
    [[2026, 1, 31], [2026, 2, 1]],
    [[2024, 2, 28], [2024, 2, 29]],
    [[2024, 2, 29], [2024, 3, 1]],
    [[2025, 2, 28], [2025, 3, 1]],
    [[1900, 2, 28], [1900, 3, 1]],
    [[2000, 2, 28], [2000, 2, 29]],
    [[2026, 12, 31], [2027, 1, 1]],
    [[1, 12, 31], [2, 1, 1]],
    [[99, 12, 31], [100, 1, 1]]
  ];
  for (const [before, after] of cases) {
    const effective = QimenTime.normalize(input(...before, '23:30')).effectiveDate;
    assert.deepEqual([effective.year, effective.month, effective.day], after);
  }
});

test('date arithmetic preserves the bundled lunar calendar historical convention', () => {
  assert.deepEqual(QimenTime.shiftDate({ year: 1500, month: 2, day: 28 }, 1), { year: 1500, month: 2, day: 29 });
  assert.deepEqual(QimenTime.shiftDate({ year: 1582, month: 10, day: 4 }, 1), { year: 1582, month: 10, day: 15 });
  assert.deepEqual(QimenTime.shiftDate({ year: 1582, month: 10, day: 15 }, -1), { year: 1582, month: 10, day: 4 });
  assert.throws(() => QimenTime.validateDate({ year: 1582, month: 10, day: 10 }), RangeError);
});

test('navigation crosses 子時 once and moves through twelve continuous periods', () => {
  assert.deepEqual(QimenTime.shiftShichen(input(2026, 10, 8, '22:30'), 1), {
    year: 2026, month: 10, day: 9, hourIndex: 0, hour: 0, minute: 0, clock: '00:00'
  });
  assert.deepEqual(QimenTime.shiftShichen(input(2026, 10, 8, '23:30'), 1), {
    year: 2026, month: 10, day: 9, hourIndex: 1, hour: 2, minute: 0, clock: '02:00'
  });
  assert.deepEqual(QimenTime.shiftShichen(input(2026, 10, 9, '00:30'), -1), {
    year: 2026, month: 10, day: 8, hourIndex: 11, hour: 22, minute: 0, clock: '22:00'
  });
  let current = input(2026, 12, 31, '00:00');
  const seen = [];
  for (let i = 0; i < 12; i++) {
    seen.push(QimenTime.normalize(current).hourIndex);
    current = QimenTime.shiftShichen(current, 1);
  }
  assert.deepEqual(seen, Array.from({ length: 12 }, (_, i) => i));
  assert.equal(current.year, 2027);
  assert.equal(current.month, 1);
  assert.equal(current.day, 1);
  for (let i = 0; i < 12; i++) current = QimenTime.shiftShichen(current, -1);
  assert.deepEqual([current.year, current.month, current.day, current.clock], [2026, 12, 31, '00:00']);
});

test('invalid dates, clocks and out-of-range date rolls are rejected', () => {
  for (const date of [
    { year: '', month: 1, day: 1 }, { year: '2026.5', month: 1, day: 1 },
    { year: 0, month: 1, day: 1 }, { year: 10000, month: 1, day: 1 },
    { year: 2026, month: 13, day: 1 }, { year: 2026, month: 4, day: 31 },
    { year: 2025, month: 2, day: 29 }, { year: 1900, month: 2, day: 29 },
    { year: 2026, month: 1, day: -1 }, { year: '2026x', month: 1, day: 1 }
  ]) assert.throws(() => QimenTime.validateDate(date), RangeError);
  for (const clock of ['', '9:30', '24:00', '23:60', '23:30:10', 'x']) {
    assert.throws(() => QimenTime.parseClock(clock), RangeError);
  }
  assert.throws(() => QimenTime.normalize(input(9999, 12, 31, '23:30')), RangeError);
  assert.throws(() => QimenTime.shiftShichen(input(1, 1, 1, '00:00'), -1), RangeError);
  assert.throws(() => QimenTime.shiftShichen(input(9999, 12, 31, '22:00'), 1), RangeError);
});

// Run the actual page calculator, including lunar conversion and all nine palaces,
// without browser dependencies. The DOM only receives the generated result.
function calculator(page = 'qm.html') {
  const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  const elements = new Map();
  const workspace = { classList: { add() {}, remove() {} } };
  const status = { textContent: '' };
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { value: '', innerHTML: '', textContent: '', hidden: true, dataset: {} });
      return elements.get(id);
    },
    querySelector(selector) {
      return selector === '.chart-workspace' ? workspace : selector === '.chart-status' ? status : null;
    }
  };
  const solarDates = [];
  const Solar = {
    ...lunarLibrary.Solar,
    fromYmd(year, month, day) {
      solarDates.push([year, month, day]);
      return lunarLibrary.Solar.fromYmd(year, month, day);
    }
  };
  const context = vm.createContext({
    ...lunarLibrary, Solar, QimenTime, document,
    console: { log() {} }
  });
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    const source = match[1];
    if (/const version\s*=|function overrideDunAndJuIfSelected|const GAN\s*=/.test(source)) {
      vm.runInContext(source, context, { filename: page });
    }
  }
  function run(date, ju = 'auto') {
    for (const id of ['year', 'month', 'day']) document.getElementById(id).value = String(date[id]);
    document.getElementById('clock-time').value = QimenTime.formatClock(date.hour, date.minute);
    document.getElementById('time').value = String(QimenTime.getTimeIndex(date.hour));
    document.getElementById('ju-select').value = ju;
    const succeeded = vm.runInContext('calculate()', context);
    return {
      succeeded,
      error: document.getElementById('form-error').textContent,
      state: JSON.parse(vm.runInContext('JSON.stringify({ pan: Object.fromEntries(pan), gongs: gongs.slice(1).map(gong => Object.fromEntries(gong)) })', context)),
      board: document.getElementById('qimenPanResult').innerHTML,
      elements: document.getElementById('hotGongResult').innerHTML,
      summary: document.getElementById('qimenJuResult').innerHTML,
      solarDate: solarDates.at(-1)
    };
  }
  return { run, context, document };
}

test('23:30 charts exactly match following-day 00:30 across civil, lunar and pillar boundaries', () => {
  const cases = [
    [2026, 10, 8], [2026, 1, 31], [2024, 2, 28], [2024, 2, 29],
    [2026, 12, 31], [2026, 2, 16], [2026, 2, 3], [2026, 6, 20], [2026, 12, 21]
  ];
  for (const before of cases) {
    const next = QimenTime.shiftDate({ year: before[0], month: before[1], day: before[2] }, 1);
    const late = calculator().run(input(...before, '23:30'));
    const early = calculator().run({ ...next, ...QimenTime.parseClock('00:30') });
    assert.equal(late.succeeded, true, before.join('-'));
    assert.equal(early.succeeded, true, before.join('-'));
    assert.deepEqual(late.solarDate, [next.year, next.month, next.day]);
    assert.deepEqual(late.state, early.state, before.join('-'));
    assert.equal(late.board, early.board, before.join('-'));
    assert.equal(late.elements, early.elements, before.join('-'));
    assert.match(late.summary, /23:30/);
    assert.match(late.summary, /翌日子時/);
    assert.doesNotMatch(late.summary, /undefined|NaN/);
  }
});

test('manual 遁局 applies to late 子時 and automatic mode recovers after either manual override', () => {
  const before = input(2026, 10, 8, '23:30');
  const after = input(2026, 10, 9, '00:30');
  for (const ju of ['yang-3', 'yin-7']) {
    const late = calculator().run(before, ju);
    const early = calculator().run(after, ju);
    assert.deepEqual(late.state, early.state);
    assert.equal(late.board, early.board);
    assert.match(late.summary, ju === 'yang-3' ? /陽遁三局/ : /陰遁七局/);
  }
  for (const [manual, date] of [['yang-3', input(2026, 7, 9, '12:00')], ['yin-7', input(2026, 1, 9, '12:00')]]) {
    const reused = calculator();
    reused.run(date, manual);
    const autoAfterManual = reused.run(date);
    const freshAuto = calculator().run(date);
    assert.deepEqual(autoAfterManual.state, freshAuto.state);
    assert.equal(autoAfterManual.board, freshAuto.board);
    assert.equal(autoAfterManual.summary, freshAuto.summary);
  }
});

test('page calculation rejects invalid civil input and accepts years 1 through 9999 without empty pillars', () => {
  const calc = calculator();
  calc.document.getElementById('year').value = '2026';
  calc.document.getElementById('month').value = '2';
  calc.document.getElementById('day').value = '30';
  calc.document.getElementById('clock-time').value = '23:30';
  assert.equal(vm.runInContext('calculate()', calc.context), false);
  assert.match(calc.document.getElementById('form-error').textContent, /日期無效/);
  for (const year of [1, 3, 99, 9999]) {
    const result = calculator().run(input(year, 6, 1, '00:30'));
    assert.equal(result.succeeded, true, String(year));
    assert.doesNotMatch(result.summary, /undefined|NaN/, String(year));
  }
});
