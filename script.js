document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chart-form');
    const clock = document.getElementById('clock-time');
    const period = document.getElementById('time');

    initializeThemeControls();
    setCurrentDateTime();
    form.addEventListener('submit', event => {
        event.preventDefault();
        calculate();
    });
    document.getElementById('now-button').addEventListener('click', () => {
        setCurrentDateTime();
        calculate();
    });
    clock.addEventListener('change', () => {
        if (clock.value) period.value = QimenTime.getTimeIndex(QimenTime.parseClock(clock.value).hour);
    });
    period.addEventListener('change', () => {
        clock.value = `${String(QimenTime.canonicalHour(Number(period.value))).padStart(2, '0')}:00`;
        calculate();
    });
    document.getElementById('ju-select').addEventListener('change', calculate);
    ['year', 'month', 'day'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('focus', () => input.select());
    });
    form.addEventListener('input', () => {
        document.querySelector('.chart-workspace').classList.add('is-stale');
        const status = document.querySelector('.chart-status');
        if (status) status.textContent = '待重新起盤';
    });
    document.getElementById('previous-time').addEventListener('click', () => changeTime(-1));
    document.getElementById('next-time').addEventListener('click', () => changeTime(1));
    initializePalaceDetails();
    calculate();
    initializeFontSizeControls();
});

function initializeThemeControls() {
    const storageKey = 'qimen-theme';
    const buttons = Array.from(document.querySelectorAll('.theme-button'));
    const themes = buttons.map(button => button.dataset.theme);
    const themeColors = { jade: '#173f35', warm: '#694a30', dark: '#112129' };
    const applyTheme = theme => {
        document.documentElement.dataset.theme = theme;
        buttons.forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
        });
        document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColors[theme]);
    };

    let preferredTheme = 'jade';
    try {
        const savedTheme = localStorage.getItem(storageKey);
        if (themes.includes(savedTheme)) preferredTheme = savedTheme;
    } catch {
        // Theme switching also works without browser storage.
    }
    applyTheme(preferredTheme);
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            applyTheme(theme);
            try {
                localStorage.setItem(storageKey, theme);
            } catch {
                // Keep this theme for the current page even without storage.
            }
        });
    });
}

function initializeFontSizeControls() {
    const storageKey = 'qimen-board-font-size';
    const buttons = Array.from(document.querySelectorAll('.font-size-button'));
    const sizes = buttons.map(button => button.dataset.boardFontSize);
    const board = document.getElementById('qimenPanResult');
    const hint = document.getElementById('board-scroll-hint');
    const updateScrollHint = () => {
        const scrollable = board.scrollWidth > board.clientWidth + 1;
        hint.hidden = !scrollable;
        if (scrollable) {
            board.setAttribute('tabindex', '0');
            board.setAttribute('aria-describedby', hint.id);
        } else {
            board.removeAttribute('tabindex');
            board.removeAttribute('aria-describedby');
        }
    };
    const applySize = size => {
        document.documentElement.dataset.boardFontSize = size;
        buttons.forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.boardFontSize === size));
        });
        updateScrollHint();
    };

    let preferredSize = 'large';
    try {
        const savedSize = localStorage.getItem(storageKey);
        if (sizes.includes(savedSize)) preferredSize = savedSize;
    } catch {
        // The controls still work when the browser blocks local storage.
    }
    applySize(preferredSize);
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const size = button.dataset.boardFontSize;
            applySize(size);
            try {
                localStorage.setItem(storageKey, size);
            } catch {
                // Keep this selection for the current page even without storage.
            }
        });
    });
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(updateScrollHint).observe(board);
    }
    window.addEventListener('resize', updateScrollHint);
}

function setCurrentDateTime() {
    const now = new Date();
    document.getElementById('year').value = now.getFullYear();
    document.getElementById('month').value = now.getMonth() + 1;
    document.getElementById('day').value = now.getDate();
    document.getElementById('clock-time').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('time').value = QimenTime.getTimeIndex(now.getHours());
}

function readCivilDateTime() {
    const clock = QimenTime.parseClock(document.getElementById('clock-time').value);
    return {
        year: Number(document.getElementById('year').value),
        month: Number(document.getElementById('month').value),
        day: Number(document.getElementById('day').value),
        ...clock
    };
}

function changeTime(offset) {
    try {
        const next = QimenTime.shiftShichen(readCivilDateTime(), offset);
        ['year', 'month', 'day'].forEach(id => { document.getElementById(id).value = next[id]; });
        document.getElementById('clock-time').value = next.clock;
        document.getElementById('time').value = QimenTime.getTimeIndex(next.hour);
        calculate();
    } catch (error) {
        const message = document.getElementById('form-error');
        message.textContent = error.message;
        message.hidden = false;
    }
}

function initializePalaceDetails() {
    const board = document.getElementById('qimenPanResult');
    const dialog = document.getElementById('palace-dialog');
    let trigger = null;
    const open = palace => {
        if (document.querySelector('.chart-workspace').classList.contains('is-stale')) {
            if (!calculate()) return;
            palace = document.getElementById(palace.id);
        }
        trigger = palace;
        showPalaceDetails(Number(palace.id.split('-')[1]));
        dialog.showModal();
        document.body.classList.add('dialog-open');
    };
    board.addEventListener('click', event => {
        const palace = event.target.closest('.grid-item');
        if (palace) open(palace);
    });
    board.addEventListener('keydown', event => {
        const palace = event.target.closest('.grid-item');
        if (palace && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            open(palace);
        }
    });
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
        document.body.classList.remove('dialog-open');
        if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
}

function showPalaceDetails(index) {
    const palace = gongs[index];
    document.getElementById('palace-dialog-title').textContent = `${palace.get('宮')}宮 · 第${convertToChinese(index)}宮`;
    const content = document.getElementById('palace-dialog-content');
    content.replaceChildren();
    const section = (label, value, description) => {
        if (!value) return;
        const block = document.createElement('section');
        block.className = 'detail-section';
        const heading = document.createElement('h3');
        heading.textContent = `${label} · ${value}`;
        block.append(heading);
        if (description) {
            const paragraph = document.createElement('p');
            paragraph.textContent = description;
            block.append(paragraph);
        }
        content.append(block);
    };
    section('宮位', palace.get('宮'), getGongDescription(palace.get('宮')));
    if (index === 5) {
        section('旬首', pan.get('旬'));
        section('時柱', pan.get('時干') + pan.get('時支'));
        section('值符星', pan.get('值符星'), getXingDescription(pan.get('值符星')));
        section('值使門', pan.get('值使門'), getMenDescription(pan.get('值使門')));
    } else {
        section('天盤神', palace.get('天盤神'), getShenDescription(palace.get('天盤神')));
        section('九星', palace.get('星'), getXingDescription(palace.get('星')));
        section('八門', palace.get('門'), getMenDescription(palace.get('門')));
        section('地盤神', palace.get('地盤神'), getShenDescription(palace.get('地盤神')));
    }
    for (const key of ['天盤天干', '地盤天干', '隱干']) {
        const stems = palace.get(key);
        if (stems) section(key, Array.from(stems).join('、'), Array.from(stems).map(getGanDescription).filter(Boolean).join('；'));
    }
    const earthStem = (palace.get('地盤天干') || [])[0];
    for (const stem of (palace.get('天盤天干') || [])) {
        section('干格', stem + earthStem, getJuDescription(stem + earthStem));
    }
    const marks = ['空亡', '擊刑', '自刑', '入墓', '馬星', '門迫'].filter(key => palace.get(key));
    if (marks.length) section('宮位標記', marks.join(' · '));
    if (index === 5) {
        const conditions = Array.from(document.querySelectorAll('#palace-5 .marks')).map(item => item.textContent.trim()).filter(Boolean);
        if (conditions.length) section('盤局標記', conditions.join(' · '));
    }
}
