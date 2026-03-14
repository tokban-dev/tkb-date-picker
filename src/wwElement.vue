<template>
  <!-- ═══ ALWAYS VISIBLE (inline calendar) ═══ -->
  <div
    v-if="content.showOn === 'alwaysVisible'"
    class="tkb-dp-root"
    :class="{ 'tkb-dp-dark': content.isDarkMode }"
    :style="cssVars"
  >
    <div class="tkb-dp-inline">
      <div class="tkb-dp-popover tkb-dp-inline-popover" :class="{ 'tkb-dp-has-presets': content.showPresets }">
        <div v-if="content.showPresets" class="tkb-dp-presets">
          <ul>
            <li
              v-for="preset in presets"
              :key="preset.key"
              :class="{ 'tkb-dp-preset-active': activePreset === preset.key }"
              @click="applyPreset(preset)"
            >{{ preset.label }}</li>
          </ul>
        </div>
        <div class="tkb-dp-panels">
          <template v-if="isRange">
            <div
              v-for="(panelDate, idx) in panelDates"
              :key="idx"
              class="tkb-dp-month-panel"
            >
              <CalendarPanel
                :panel-date="panelDate"
                :view="calendarView"
                :selected-start="selectedStart"
                :selected-end="selectedEnd"
                :hover-date="hoverDate"
                :is-range="true"
                :today="today"
                :locale="resolvedLocale"
                :first-day-of-week="content.firstDayOfWeek"
                :show-nav="idx === 0 ? 'left' : 'right'"
                @select-day="handleDaySelect"
                @hover-day="handleDayHover"
                @nav-prev-month="navMonth(idx, -1)"
                @nav-next-month="navMonth(idx, 1)"
                @nav-prev-year="navYear(idx, -1)"
                @nav-next-year="navYear(idx, 1)"
                @select-month="(m) => handleMonthSelect(idx, m)"
                @select-year="(y) => handleYearSelect(idx, y)"
                @change-view="(v) => handleViewChange(idx, v)"
              />
              <div v-if="idx < panelDates.length - 1" class="tkb-dp-panel-divider"></div>
            </div>
          </template>
          <template v-else>
            <div class="tkb-dp-month-panel">
              <CalendarPanel
                :panel-date="panelDates[0]"
                :view="calendarView"
                :selected-start="selectedStart"
                :selected-end="selectedEnd"
                :hover-date="hoverDate"
                :is-range="false"
                :today="today"
                :locale="resolvedLocale"
                :first-day-of-week="content.firstDayOfWeek"
                show-nav="both"
                @select-day="handleDaySelect"
                @hover-day="handleDayHover"
                @nav-prev-month="navMonth(0, -1)"
                @nav-next-month="navMonth(0, 1)"
                @nav-prev-year="navYear(0, -1)"
                @nav-next-year="navYear(0, 1)"
                @select-month="(m) => handleMonthSelect(0, m)"
                @select-year="(y) => handleYearSelect(0, y)"
                @change-view="(v) => handleViewChange(0, v)"
              />
            </div>
          </template>
        </div>
        <div v-if="content.showTodayButton || content.showClearButton" class="tkb-dp-footer">
          <span v-if="content.showTodayButton" class="tkb-dp-footer-link" @click="goToToday">{{ t('today') }}</span>
          <span v-if="content.showClearButton" class="tkb-dp-footer-link" @click="clearSelection">{{ t('clear') }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ CLICK / HOVER (input + popover) ═══ -->
  <div
    v-else
    class="tkb-dp-root"
    :class="{ 'tkb-dp-dark': content.isDarkMode }"
    :style="[cssVars, layoutStyle]"
    ref="rootRef"
  >
    <!-- Input trigger(s) -->
    <div
      class="tkb-dp-input-wrap"
      :class="{
        'tkb-dp-range-input': isRange,
        'tkb-dp-open': isOpen,
      }"
      @click="content.showOn === 'click' && !isEditing ? toggleOpen() : null"
      @mouseenter="content.showOn === 'hover' && !isEditing ? openPicker() : null"
      @mouseleave="content.showOn === 'hover' && !isEditing ? closePicker() : null"
    >
      <input
        type="text"
        class="tkb-dp-input"
        :placeholder="content.placeholder || t('selectDate')"
        :value="displayValue"
        readonly
      />
      <span class="tkb-dp-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span
        v-if="hasValue && content.showClearButton"
        class="tkb-dp-clear"
        @click.stop="clearSelection"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
        </svg>
      </span>
    </div>

    <!-- Second input for range (if startEndInputs) -->
    <div
      v-if="isRange && content.startEndInputs && content.showOn !== 'alwaysVisible'"
      class="tkb-dp-input-wrap"
      :class="{ 'tkb-dp-open': isOpen }"
      @click="content.showOn === 'click' && !isEditing ? toggleOpen() : null"
      @mouseenter="content.showOn === 'hover' && !isEditing ? openPicker() : null"
    >
      <input
        type="text"
        class="tkb-dp-input"
        :placeholder="t('endDate')"
        :value="displayValueEnd"
        readonly
      />
      <span class="tkb-dp-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
    </div>

    <!-- Calendar Popover -->
    <transition name="tkb-dp-fade">
      <div
        v-if="isOpen"
        class="tkb-dp-popover"
        :class="{ 'tkb-dp-has-presets': content.showPresets }"
        @mouseenter="content.showOn === 'hover' ? cancelClose() : null"
        @mouseleave="content.showOn === 'hover' && !isEditing ? closePicker() : null"
      >
        <!-- Preset sidebar -->
        <div v-if="content.showPresets" class="tkb-dp-presets">
          <ul>
            <li
              v-for="preset in presets"
              :key="preset.key"
              :class="{ 'tkb-dp-preset-active': activePreset === preset.key }"
              @click="applyPreset(preset)"
            >{{ preset.label }}</li>
          </ul>
        </div>

        <!-- Calendar panels -->
        <div class="tkb-dp-panels">
          <template v-if="isRange">
            <div
              v-for="(panelDate, idx) in panelDates"
              :key="idx"
              class="tkb-dp-month-panel"
            >
              <CalendarPanel
                :panel-date="panelDate"
                :view="calendarView"
                :selected-start="selectedStart"
                :selected-end="selectedEnd"
                :hover-date="hoverDate"
                :is-range="true"
                :today="today"
                :locale="resolvedLocale"
                :first-day-of-week="content.firstDayOfWeek"
                :show-nav="idx === 0 ? 'left' : 'right'"
                @select-day="handleDaySelect"
                @hover-day="handleDayHover"
                @nav-prev-month="navMonth(idx, -1)"
                @nav-next-month="navMonth(idx, 1)"
                @nav-prev-year="navYear(idx, -1)"
                @nav-next-year="navYear(idx, 1)"
                @select-month="(m) => handleMonthSelect(idx, m)"
                @select-year="(y) => handleYearSelect(idx, y)"
                @change-view="(v) => handleViewChange(idx, v)"
              />
              <div v-if="idx < panelDates.length - 1" class="tkb-dp-panel-divider"></div>
            </div>
          </template>
          <template v-else>
            <div class="tkb-dp-month-panel">
              <CalendarPanel
                :panel-date="panelDates[0]"
                :view="calendarView"
                :selected-start="selectedStart"
                :selected-end="selectedEnd"
                :hover-date="hoverDate"
                :is-range="false"
                :today="today"
                :locale="resolvedLocale"
                :first-day-of-week="content.firstDayOfWeek"
                show-nav="both"
                @select-day="handleDaySelect"
                @hover-day="handleDayHover"
                @nav-prev-month="navMonth(0, -1)"
                @nav-next-month="navMonth(0, 1)"
                @nav-prev-year="navYear(0, -1)"
                @nav-next-year="navYear(0, 1)"
                @select-month="(m) => handleMonthSelect(0, m)"
                @select-year="(y) => handleYearSelect(0, y)"
                @change-view="(v) => handleViewChange(0, v)"
              />
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div v-if="content.showTodayButton || content.showClearButton" class="tkb-dp-footer">
          <span v-if="content.showTodayButton" class="tkb-dp-footer-link" @click="goToToday">{{ t('today') }}</span>
          <span v-if="content.showClearButton" class="tkb-dp-footer-link" @click="clearSelection">{{ t('clear') }}</span>
        </div>
      </div>
    </transition>

    <!-- Click-outside overlay -->
    <div v-if="isOpen && content.showOn === 'click'" class="tkb-dp-backdrop" @click="closePicker"></div>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted, onBeforeUnmount, defineComponent, h } from "vue";

// ═══════════════════════════════════════════════
// i18n translations
// ═══════════════════════════════════════════════
const TRANSLATIONS = {
  en: {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    weekdaysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    today: "Today",
    clear: "Clear",
    selectDate: "Select date",
    startDate: "Start date",
    endDate: "End date",
    yesterday: "Yesterday",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastYear: "Last Year",
  },
  id: {
    months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    weekdays: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    weekdaysMin: ["Mi", "Se", "Se", "Ra", "Ka", "Ju", "Sa"],
    today: "Hari Ini",
    clear: "Hapus",
    selectDate: "Pilih tanggal",
    startDate: "Tanggal mulai",
    endDate: "Tanggal akhir",
    yesterday: "Kemarin",
    lastWeek: "Minggu Lalu",
    lastMonth: "Bulan Lalu",
    lastYear: "Tahun Lalu",
  },
  "zh-CN": {
    months: ["\u4e00\u6708", "\u4e8c\u6708", "\u4e09\u6708", "\u56db\u6708", "\u4e94\u6708", "\u516d\u6708", "\u4e03\u6708", "\u516b\u6708", "\u4e5d\u6708", "\u5341\u6708", "\u5341\u4e00\u6708", "\u5341\u4e8c\u6708"],
    monthsShort: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
    weekdays: ["\u5468\u65e5", "\u5468\u4e00", "\u5468\u4e8c", "\u5468\u4e09", "\u5468\u56db", "\u5468\u4e94", "\u5468\u516d"],
    weekdaysMin: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d"],
    today: "\u4eca\u5929",
    clear: "\u6e05\u9664",
    selectDate: "\u9009\u62e9\u65e5\u671f",
    startDate: "\u5f00\u59cb\u65e5\u671f",
    endDate: "\u7ed3\u675f\u65e5\u671f",
    yesterday: "\u6628\u5929",
    lastWeek: "\u4e0a\u5468",
    lastMonth: "\u4e0a\u4e2a\u6708",
    lastYear: "\u53bb\u5e74",
  },
  "zh-TW": {
    months: ["\u4e00\u6708", "\u4e8c\u6708", "\u4e09\u6708", "\u56db\u6708", "\u4e94\u6708", "\u516d\u6708", "\u4e03\u6708", "\u516b\u6708", "\u4e5d\u6708", "\u5341\u6708", "\u5341\u4e00\u6708", "\u5341\u4e8c\u6708"],
    monthsShort: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
    weekdays: ["\u9031\u65e5", "\u9031\u4e00", "\u9031\u4e8c", "\u9031\u4e09", "\u9031\u56db", "\u9031\u4e94", "\u9031\u516d"],
    weekdaysMin: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d"],
    today: "\u4eca\u5929",
    clear: "\u6e05\u9664",
    selectDate: "\u9078\u64c7\u65e5\u671f",
    startDate: "\u958b\u59cb\u65e5\u671f",
    endDate: "\u7d50\u675f\u65e5\u671f",
    yesterday: "\u6628\u5929",
    lastWeek: "\u4e0a\u9031",
    lastMonth: "\u4e0a\u500b\u6708",
    lastYear: "\u53bb\u5e74",
  },
};

// ═══════════════════════════════════════════════
// Date utilities
// ═══════════════════════════════════════════════
function startOfDay(d) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function endOfDay(d) {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}
function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isBetween(d, start, end) {
  if (!d || !start || !end) return false;
  const dt = startOfDay(d).getTime();
  const st = startOfDay(start).getTime();
  const et = startOfDay(end).getTime();
  const lo = Math.min(st, et);
  const hi = Math.max(st, et);
  return dt > lo && dt < hi;
}
function addMonths(d, n) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}
function addYears(d, n) {
  const r = new Date(d);
  r.setFullYear(r.getFullYear() + n);
  return r;
}
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Format date to display string
function formatDate(d, fmt, locale) {
  if (!d) return "";
  const trans = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const pad = (n) => String(n).padStart(2, "0");
  return fmt
    .replace("dd", pad(d.getDate()))
    .replace("d", String(d.getDate()))
    .replace("MMMM", trans.months[d.getMonth()])
    .replace("MMM", trans.monthsShort[d.getMonth()])
    .replace("MM", pad(d.getMonth() + 1))
    .replace("yyyy", String(d.getFullYear()))
    .replace("YYYY", String(d.getFullYear()));
}

// ═══════════════════════════════════════════════
// CalendarPanel sub-component (inline)
// ═══════════════════════════════════════════════
const CalendarPanel = defineComponent({
  name: "CalendarPanel",
  props: {
    panelDate: { type: Date, required: true },
    view: { type: String, default: "days" }, // days | months | years
    selectedStart: { type: Date, default: null },
    selectedEnd: { type: Date, default: null },
    hoverDate: { type: Date, default: null },
    isRange: { type: Boolean, default: false },
    today: { type: Date, required: true },
    locale: { type: String, default: "en" },
    firstDayOfWeek: { type: Number, default: 0 },
    showNav: { type: String, default: "both" }, // left | right | both
  },
  emits: [
    "select-day",
    "hover-day",
    "nav-prev-month",
    "nav-next-month",
    "nav-prev-year",
    "nav-next-year",
    "select-month",
    "select-year",
    "change-view",
  ],
  setup(props, { emit }) {
    const localView = ref("days");

    watch(
      () => props.view,
      (v) => {
        localView.value = v;
      },
      { immediate: true }
    );

    const trans = computed(() => TRANSLATIONS[props.locale] || TRANSLATIONS.en);
    const year = computed(() => props.panelDate.getFullYear());
    const month = computed(() => props.panelDate.getMonth());

    // Reorder weekdays based on firstDayOfWeek
    const weekdayHeaders = computed(() => {
      const names = [...trans.value.weekdaysMin];
      const fdow = props.firstDayOfWeek || 0;
      return [...names.slice(fdow), ...names.slice(0, fdow)];
    });

    // Build days grid (6 rows x 7 cols = 42 cells)
    const daysGrid = computed(() => {
      const y = year.value;
      const m = month.value;
      const totalDays = getDaysInMonth(y, m);
      const firstDay = getFirstDayOfMonth(y, m);
      const fdow = props.firstDayOfWeek || 0;

      let startOffset = firstDay - fdow;
      if (startOffset < 0) startOffset += 7;

      const cells = [];
      // Previous month
      const prevMonth = m === 0 ? 11 : m - 1;
      const prevYear = m === 0 ? y - 1 : y;
      const prevDays = getDaysInMonth(prevYear, prevMonth);
      for (let i = startOffset - 1; i >= 0; i--) {
        cells.push({
          date: new Date(prevYear, prevMonth, prevDays - i),
          isOtherMonth: true,
        });
      }
      // Current month
      for (let d = 1; d <= totalDays; d++) {
        cells.push({
          date: new Date(y, m, d),
          isOtherMonth: false,
        });
      }
      // Next month
      const nextMonth = m === 11 ? 0 : m + 1;
      const nextYear = m === 11 ? y + 1 : y;
      let nextDay = 1;
      while (cells.length < 42) {
        cells.push({
          date: new Date(nextYear, nextMonth, nextDay++),
          isOtherMonth: true,
        });
      }
      return cells;
    });

    // Year grid (12 years centered on current)
    const yearsGrid = computed(() => {
      const base = year.value - (year.value % 12);
      const arr = [];
      for (let i = 0; i < 12; i++) arr.push(base + i);
      return arr;
    });

    function getDayClasses(cell) {
      const d = cell.date;
      const cls = ["tkb-dp-day"];
      if (cell.isOtherMonth) cls.push("tkb-dp-day--other");
      if (isSameDay(d, props.today)) cls.push("tkb-dp-day--today");

      if (props.isRange && props.selectedStart && props.selectedEnd) {
        if (isSameDay(d, props.selectedStart))
          cls.push("tkb-dp-day--range-start");
        if (isSameDay(d, props.selectedEnd))
          cls.push("tkb-dp-day--range-end");
        if (isBetween(d, props.selectedStart, props.selectedEnd))
          cls.push("tkb-dp-day--in-range");
      } else if (
        props.isRange &&
        props.selectedStart &&
        !props.selectedEnd &&
        props.hoverDate
      ) {
        // Preview range while hovering
        if (isSameDay(d, props.selectedStart))
          cls.push("tkb-dp-day--range-start");
        if (isBetween(d, props.selectedStart, props.hoverDate))
          cls.push("tkb-dp-day--in-range");
        if (isSameDay(d, props.hoverDate)) cls.push("tkb-dp-day--range-end");
      } else if (!props.isRange && props.selectedStart) {
        if (isSameDay(d, props.selectedStart))
          cls.push("tkb-dp-day--selected");
      }
      return cls.join(" ");
    }

    return () => {
      const t = trans.value;

      // Header with navigation
      const showPrev =
        props.showNav === "both" || props.showNav === "left";
      const showNext =
        props.showNav === "both" || props.showNav === "right";

      const navPrevYear = showPrev
        ? h(
            "button",
            {
              class: "tkb-dp-nav-btn tkb-dp-nav-super",
              onClick: () => emit("nav-prev-year"),
              title: t.months ? "Previous year" : "",
            },
            [
              h(
                "svg",
                {
                  width: 14,
                  height: 14,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": 2,
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                },
                [
                  h("polyline", { points: "11,18 5,12 11,6" }),
                  h("polyline", { points: "19,18 13,12 19,6" }),
                ]
              ),
            ]
          )
        : h("span", { class: "tkb-dp-nav-spacer" });

      const navPrevMonth = showPrev
        ? h(
            "button",
            {
              class: "tkb-dp-nav-btn",
              onClick: () => emit("nav-prev-month"),
            },
            [
              h(
                "svg",
                {
                  width: 14,
                  height: 14,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": 2,
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                },
                [h("polyline", { points: "15,18 9,12 15,6" })]
              ),
            ]
          )
        : h("span", { class: "tkb-dp-nav-spacer" });

      const navNextMonth = showNext
        ? h(
            "button",
            {
              class: "tkb-dp-nav-btn",
              onClick: () => emit("nav-next-month"),
            },
            [
              h(
                "svg",
                {
                  width: 14,
                  height: 14,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": 2,
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                },
                [h("polyline", { points: "9,6 15,12 9,18" })]
              ),
            ]
          )
        : h("span", { class: "tkb-dp-nav-spacer" });

      const navNextYear = showNext
        ? h(
            "button",
            {
              class: "tkb-dp-nav-btn tkb-dp-nav-super",
              onClick: () => emit("nav-next-year"),
            },
            [
              h(
                "svg",
                {
                  width: 14,
                  height: 14,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": 2,
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                },
                [
                  h("polyline", { points: "5,6 11,12 5,18" }),
                  h("polyline", { points: "13,6 19,12 13,18" }),
                ]
              ),
            ]
          )
        : h("span", { class: "tkb-dp-nav-spacer" });

      const monthLabel = h(
        "button",
        {
          class: "tkb-dp-header-label",
          onClick: () => {
            localView.value =
              localView.value === "months" ? "days" : "months";
            emit("change-view", localView.value);
          },
        },
        t.monthsShort[month.value]
      );

      const yearLabel = h(
        "button",
        {
          class: "tkb-dp-header-label",
          onClick: () => {
            localView.value =
              localView.value === "years" ? "days" : "years";
            emit("change-view", localView.value);
          },
        },
        String(year.value)
      );

      const header = h("div", { class: "tkb-dp-header" }, [
        navPrevYear,
        navPrevMonth,
        h("div", { class: "tkb-dp-header-center" }, [monthLabel, yearLabel]),
        navNextMonth,
        navNextYear,
      ]);

      // ─── Days view ───
      if (localView.value === "days") {
        const weekdayRow = h(
          "div",
          { class: "tkb-dp-weekdays" },
          weekdayHeaders.value.map((wd) =>
            h("span", { class: "tkb-dp-weekday" }, wd)
          )
        );

        const daysCells = h(
          "div",
          { class: "tkb-dp-days" },
          daysGrid.value.map((cell) =>
            h(
              "span",
              {
                class: getDayClasses(cell),
                onClick: () => emit("select-day", cell.date),
                onMouseenter: () => emit("hover-day", cell.date),
              },
              String(cell.date.getDate())
            )
          )
        );

        return h("div", { class: "tkb-dp-panel-inner" }, [
          header,
          weekdayRow,
          daysCells,
        ]);
      }

      // ─── Months view ───
      if (localView.value === "months") {
        const monthCells = h(
          "div",
          { class: "tkb-dp-month-grid" },
          t.monthsShort.map((name, i) => {
            const cls = ["tkb-dp-month-cell"];
            if (i === props.today.getMonth() && year.value === props.today.getFullYear())
              cls.push("tkb-dp-month-cell--current");
            if (i === month.value)
              cls.push("tkb-dp-month-cell--selected");
            return h(
              "span",
              {
                class: cls.join(" "),
                onClick: () => {
                  emit("select-month", i);
                  localView.value = "days";
                  emit("change-view", "days");
                },
              },
              name
            );
          })
        );

        return h("div", { class: "tkb-dp-panel-inner" }, [header, monthCells]);
      }

      // ─── Years view ───
      if (localView.value === "years") {
        const yearCells = h(
          "div",
          { class: "tkb-dp-year-grid" },
          yearsGrid.value.map((y) => {
            const cls = ["tkb-dp-year-cell"];
            if (y === props.today.getFullYear())
              cls.push("tkb-dp-year-cell--current");
            if (y === year.value)
              cls.push("tkb-dp-year-cell--selected");
            return h(
              "span",
              {
                class: cls.join(" "),
                onClick: () => {
                  emit("select-year", y);
                  localView.value = "days";
                  emit("change-view", "days");
                },
              },
              String(y)
            );
          })
        );

        return h("div", { class: "tkb-dp-panel-inner" }, [header, yearCells]);
      }
    };
  },
});

// ═══════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════
export default {
  components: { CalendarPanel },
  emits: ["update:content", "trigger-event"],
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  setup(props) {
    const today = ref(startOfDay(new Date()));

    const { value: variableValueStart, setValue: setValueStart } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: "start",
        type: "string",
        defaultValue: computed(() =>
          props.content.initValueStart
            ? startOfDay(new Date(props.content.initValueStart)).toString()
            : ""
        ),
      });

    const { value: variableValueEnd, setValue: setValueEnd } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: "end",
        type: "string",
        defaultValue: computed(() =>
          props.content.initValueEnd
            ? endOfDay(new Date(props.content.initValueEnd)).toString()
            : ""
        ),
      });

    return { today, variableValueStart, variableValueEnd, setValueStart, setValueEnd };
  },
  data() {
    return {
      isOpen: false,
      calendarView: "days",
      selectedStart: null,
      selectedEnd: null,
      hoverDate: null,
      rangePicking: false, // true = waiting for second click
      activePreset: null,
      closeTimeout: null,
      panelBaseDate: new Date(),
    };
  },
  computed: {
    isEditing() {
      /* wwEditor:start */
      return (
        this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION
      );
      /* wwEditor:end */
      return false;
    },
    isRange() {
      return this.content.pickerMode === "range";
    },
    resolvedLocale() {
      if (this.content.lang === "pageLang") {
        const pageLang =
          typeof wwLib !== "undefined" ? wwLib.wwLang.lang : "en";
        // Map page lang to our supported locales
        if (pageLang.startsWith("zh")) {
          return pageLang.includes("TW") || pageLang.includes("Hant")
            ? "zh-TW"
            : "zh-CN";
        }
        return TRANSLATIONS[pageLang] ? pageLang : "en";
      }
      return this.content.lang || "en";
    },
    panelDates() {
      if (this.isRange) {
        const cols = this.content.columns || 2;
        const dates = [];
        for (let i = 0; i < cols; i++) {
          dates.push(addMonths(this.panelBaseDate, i));
        }
        return dates;
      }
      return [this.panelBaseDate];
    },
    presets() {
      const t = TRANSLATIONS[this.resolvedLocale] || TRANSLATIONS.en;
      const now = new Date();
      return [
        {
          key: "yesterday",
          label: t.yesterday,
          getRange: () => {
            const d = new Date(now);
            d.setDate(d.getDate() - 1);
            return { start: startOfDay(d), end: endOfDay(d) };
          },
        },
        {
          key: "lastWeek",
          label: t.lastWeek,
          getRange: () => {
            const d = new Date(now);
            const dayOfWeek = d.getDay();
            const startOfThisWeek = new Date(d);
            startOfThisWeek.setDate(d.getDate() - dayOfWeek);
            const end = new Date(startOfThisWeek);
            end.setDate(end.getDate() - 1);
            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            return { start: startOfDay(start), end: endOfDay(end) };
          },
        },
        {
          key: "lastMonth",
          label: t.lastMonth,
          getRange: () => {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start: startOfDay(start), end: endOfDay(end) };
          },
        },
        {
          key: "lastYear",
          label: t.lastYear,
          getRange: () => {
            const start = new Date(now.getFullYear() - 1, 0, 1);
            const end = new Date(now.getFullYear() - 1, 11, 31);
            return { start: startOfDay(start), end: endOfDay(end) };
          },
        },
      ];
    },
    hasValue() {
      return !!this.selectedStart;
    },
    displayValue() {
      const fmt = this.content.dateFormat || "dd MMM yyyy";
      const loc = this.resolvedLocale;
      if (this.isRange && !this.content.startEndInputs) {
        if (this.selectedStart && this.selectedEnd) {
          return (
            formatDate(this.selectedStart, fmt, loc) +
            (this.content.rangeDelimiter || " \u2013 ") +
            formatDate(this.selectedEnd, fmt, loc)
          );
        }
        if (this.selectedStart) {
          return formatDate(this.selectedStart, fmt, loc) + (this.content.rangeDelimiter || " \u2013 ") + "...";
        }
        return "";
      }
      return this.selectedStart ? formatDate(this.selectedStart, fmt, loc) : "";
    },
    displayValueEnd() {
      const fmt = this.content.dateFormat || "dd MMM yyyy";
      return this.selectedEnd
        ? formatDate(this.selectedEnd, fmt, this.resolvedLocale)
        : "";
    },
    cssVars() {
      return {
        "--tkb-primary": this.content.primaryColor || "#F08227",
        "--tkb-primary-light": this.content.primaryLightColor || "#FFF3E8",
        "--tkb-primary-hover": this.content.primaryHoverColor || "#FFFAF5",
        "--tkb-text": this.content.textColor || "#2C3131",
        "--tkb-border": this.content.borderColor || "#E8E8E8",
        "--tkb-radius": (this.content.borderRadius || 8) + "px",
      };
    },
    layoutStyle() {
      return {
        "--direction": this.content.direction || "row",
        "--alignement": this.content.alignement || "center",
      };
    },
  },
  watch: {
    "content.initValueStart"(newVal, oldVal) {
      if (newVal === oldVal) return;
      if (newVal) {
        this.selectedStart = startOfDay(new Date(newVal));
        this.setValueStart(this.selectedStart.toString());
      } else {
        this.selectedStart = null;
        this.setValueStart("");
      }
      this.$emit("trigger-event", {
        name: "initValueChange",
        event: { value: newVal },
      });
    },
    "content.initValueEnd"(newVal, oldVal) {
      if (newVal === oldVal) return;
      if (newVal) {
        this.selectedEnd = endOfDay(new Date(newVal));
        this.setValueEnd(this.selectedEnd.toString());
      } else {
        this.selectedEnd = null;
        this.setValueEnd("");
      }
      this.$emit("trigger-event", {
        name: "initValueChange",
        event: { value: newVal },
      });
    },
  },
  mounted() {
    // Initialize from init values
    if (this.content.initValueStart) {
      this.selectedStart = startOfDay(new Date(this.content.initValueStart));
      this.panelBaseDate = new Date(this.selectedStart);
    }
    if (this.content.initValueEnd) {
      this.selectedEnd = endOfDay(new Date(this.content.initValueEnd));
    }
    if (!this.selectedStart) {
      this.panelBaseDate = new Date();
    }
  },
  methods: {
    t(key) {
      const trans = TRANSLATIONS[this.resolvedLocale] || TRANSLATIONS.en;
      return trans[key] || key;
    },

    // ─── Popover ───
    toggleOpen() {
      this.isOpen ? this.closePicker() : this.openPicker();
    },
    openPicker() {
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
      this.isOpen = true;
      this.calendarView = "days";
      if (this.selectedStart) {
        this.panelBaseDate = new Date(this.selectedStart);
      }
    },
    closePicker() {
      this.closeTimeout = setTimeout(() => {
        this.isOpen = false;
        this.hoverDate = null;
        this.rangePicking = false;
      }, 150);
    },
    cancelClose() {
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
    },

    // ─── Day selection ───
    handleDaySelect(date) {
      if (!this.isRange) {
        // Single date mode
        this.selectedStart = startOfDay(date);
        this.selectedEnd = null;
        this.setValueStart(this.selectedStart.toString());
        this.setValueEnd("");
        this.activePreset = null;
        this.$emit("trigger-event", {
          name: "change",
          event: {
            value: {
              start: this.selectedStart.toString(),
              end: "",
            },
          },
        });
        if (this.content.showOn !== "alwaysVisible") {
          setTimeout(() => (this.isOpen = false), 200);
        }
        return;
      }

      // Range mode
      if (!this.rangePicking) {
        // First click
        this.selectedStart = startOfDay(date);
        this.selectedEnd = null;
        this.rangePicking = true;
        this.activePreset = null;
      } else {
        // Second click
        let start = this.selectedStart;
        let end = startOfDay(date);
        // Normalize: ensure start <= end
        if (end.getTime() < start.getTime()) {
          [start, end] = [end, start];
        }
        this.selectedStart = startOfDay(start);
        this.selectedEnd = endOfDay(end);
        this.rangePicking = false;
        this.hoverDate = null;

        this.setValueStart(this.selectedStart.toString());
        this.setValueEnd(this.selectedEnd.toString());
        this.$emit("trigger-event", {
          name: "change",
          event: {
            value: {
              start: this.selectedStart.toString(),
              end: this.selectedEnd.toString(),
            },
          },
        });
        if (this.content.showOn !== "alwaysVisible") {
          setTimeout(() => (this.isOpen = false), 300);
        }
      }
    },
    handleDayHover(date) {
      if (this.rangePicking) {
        this.hoverDate = startOfDay(date);
      }
    },

    // ─── Navigation ───
    navMonth(idx, delta) {
      if (this.isRange && idx > 0) {
        // For second+ panels, shift base so that panel stays consistent
        this.panelBaseDate = addMonths(this.panelBaseDate, delta);
      } else {
        this.panelBaseDate = addMonths(this.panelBaseDate, delta);
      }
    },
    navYear(idx, delta) {
      this.panelBaseDate = addYears(this.panelBaseDate, delta);
    },
    handleMonthSelect(idx, monthIndex) {
      const d = new Date(this.panelBaseDate);
      d.setMonth(monthIndex);
      this.panelBaseDate = d;
      this.calendarView = "days";
    },
    handleYearSelect(idx, year) {
      const d = new Date(this.panelBaseDate);
      d.setFullYear(year);
      this.panelBaseDate = d;
      this.calendarView = "days";
    },
    handleViewChange(idx, view) {
      this.calendarView = view;
    },

    // ─── Presets ───
    applyPreset(preset) {
      const { start, end } = preset.getRange();
      this.selectedStart = start;
      this.selectedEnd = end;
      this.rangePicking = false;
      this.activePreset = preset.key;
      this.panelBaseDate = new Date(start);

      this.setValueStart(start.toString());
      this.setValueEnd(end.toString());
      this.$emit("trigger-event", {
        name: "change",
        event: {
          value: {
            start: start.toString(),
            end: end.toString(),
          },
        },
      });
      if (this.content.showOn !== "alwaysVisible") {
        setTimeout(() => (this.isOpen = false), 300);
      }
    },

    // ─── Footer actions ───
    goToToday() {
      this.panelBaseDate = new Date();
      this.calendarView = "days";
      if (!this.isRange) {
        this.handleDaySelect(new Date());
      }
    },
    clearSelection() {
      this.selectedStart = null;
      this.selectedEnd = null;
      this.rangePicking = false;
      this.activePreset = null;
      this.hoverDate = null;
      this.setValueStart("");
      this.setValueEnd("");
      this.$emit("trigger-event", {
        name: "change",
        event: { value: { start: "", end: "" } },
      });
    },
  },
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   TOKBAN DATE PICKER — Scoped Styles
   ═══════════════════════════════════════════════ */

.tkb-dp-root {
  position: relative;
  display: inline-flex;
  flex-direction: var(--direction, row);
  justify-content: var(--alignement, center);
  align-items: var(--alignement, center);
  gap: 8px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Input ── */
.tkb-dp-input-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 180px;
}
.tkb-dp-input-wrap.tkb-dp-range-input {
  min-width: 260px;
}
.tkb-dp-input {
  width: 100%;
  padding: 10px 60px 10px 14px;
  border: 1.5px solid var(--tkb-border);
  border-radius: var(--tkb-radius);
  font-size: 14px;
  font-family: inherit;
  color: var(--tkb-text);
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  cursor: pointer;
}
.tkb-dp-input::placeholder {
  color: #A8A8A8;
}
.tkb-dp-input:hover {
  border-color: #C9C9C9;
}
.tkb-dp-input-wrap.tkb-dp-open .tkb-dp-input {
  border-color: var(--tkb-primary);
  box-shadow: 0 0 0 3px rgba(240, 130, 39, 0.12);
}
.tkb-dp-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #A8A8A8;
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: color 0.2s;
}
.tkb-dp-input-wrap.tkb-dp-open .tkb-dp-icon {
  color: var(--tkb-primary);
}
.tkb-dp-clear {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  color: #C9C9C9;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  z-index: 2;
}
.tkb-dp-clear:hover {
  color: #616161;
}

/* ── Popover ── */
.tkb-dp-popover {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 9999;
  margin-top: 6px;
  background: white;
  border: 1px solid var(--tkb-border);
  border-radius: var(--tkb-radius);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.06),
    0 8px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  overflow: hidden;
}
.tkb-dp-inline-popover {
  position: static;
  margin-top: 0;
}
.tkb-dp-panels {
  display: flex;
}
.tkb-dp-month-panel {
  display: flex;
}
.tkb-dp-panel-inner {
  padding: 16px;
  width: 296px;
}
.tkb-dp-panel-divider {
  width: 1px;
  background: var(--tkb-border);
  margin: 12px 0;
}

/* ── Presets sidebar ── */
.tkb-dp-presets {
  padding: 12px 0;
  border-right: 1px solid var(--tkb-border);
  min-width: 120px;
}
.tkb-dp-presets ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.tkb-dp-presets li {
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--tkb-text);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.tkb-dp-presets li:hover {
  background: var(--tkb-primary-hover);
  color: var(--tkb-primary);
}
.tkb-dp-presets li.tkb-dp-preset-active {
  background: var(--tkb-primary-light);
  color: var(--tkb-primary);
  font-weight: 600;
}

/* ── Calendar Header ── */
.tkb-dp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  height: 32px;
  gap: 2px;
}
.tkb-dp-header-center {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}
.tkb-dp-header-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--tkb-text);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.tkb-dp-header-label:hover {
  background: #F4F4F4;
  color: var(--tkb-primary);
}
.tkb-dp-nav-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--tkb-border);
  border-radius: 6px;
  background: white;
  color: #616161;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
  flex-shrink: 0;
}
.tkb-dp-nav-btn:hover {
  border-color: var(--tkb-primary);
  color: var(--tkb-primary);
  background: var(--tkb-primary-hover);
}
.tkb-dp-nav-btn:active {
  background: var(--tkb-primary-light);
}
.tkb-dp-nav-super {
  width: 24px;
  height: 28px;
  border: none;
  background: transparent;
}
.tkb-dp-nav-super:hover {
  background: #F4F4F4;
  border: none;
}
.tkb-dp-nav-spacer {
  width: 24px;
  flex-shrink: 0;
}

/* ── Weekday headers ── */
.tkb-dp-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.tkb-dp-weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #A8A8A8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 4px 0;
}

/* ── Day cells ── */
.tkb-dp-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.tkb-dp-day {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--tkb-text);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid transparent;
}
.tkb-dp-day:hover {
  background: var(--tkb-primary-hover);
  color: var(--tkb-primary);
}

/* Today */
.tkb-dp-day--today {
  border-color: var(--tkb-primary);
  font-weight: 700;
}

/* Selected (single) */
.tkb-dp-day--selected {
  background: var(--tkb-primary) !important;
  color: white !important;
  font-weight: 700;
  border-color: var(--tkb-primary);
}

/* Range start */
.tkb-dp-day--range-start {
  background: var(--tkb-primary) !important;
  color: white !important;
  font-weight: 700;
  border-radius: 6px 0 0 6px;
  border-color: var(--tkb-primary);
}

/* Range end */
.tkb-dp-day--range-end {
  background: var(--tkb-primary) !important;
  color: white !important;
  font-weight: 700;
  border-radius: 0 6px 6px 0;
  border-color: var(--tkb-primary);
}

/* Range start + end same day */
.tkb-dp-day--range-start.tkb-dp-day--range-end {
  border-radius: 6px;
}

/* In-range */
.tkb-dp-day--in-range {
  background: var(--tkb-primary-light);
  color: var(--tkb-primary);
  border-radius: 0;
}
.tkb-dp-day--in-range:hover {
  background: var(--tkb-primary-light);
  filter: brightness(0.97);
}

/* Other month */
.tkb-dp-day--other {
  color: #C9C9C9;
}
.tkb-dp-day--other:hover {
  color: #A8A8A8;
  background: #FAFAFA;
}

/* ── Month Grid ── */
.tkb-dp-month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 0;
}
.tkb-dp-month-cell {
  padding: 10px 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--tkb-text);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.tkb-dp-month-cell:hover {
  background: var(--tkb-primary-hover);
  color: var(--tkb-primary);
}
.tkb-dp-month-cell--current {
  border: 2px solid var(--tkb-primary);
  font-weight: 600;
}
.tkb-dp-month-cell--selected {
  background: var(--tkb-primary) !important;
  color: white !important;
  font-weight: 700;
}

/* ── Year Grid ── */
.tkb-dp-year-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 0;
}
.tkb-dp-year-cell {
  padding: 10px 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--tkb-text);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.tkb-dp-year-cell:hover {
  background: var(--tkb-primary-hover);
  color: var(--tkb-primary);
}
.tkb-dp-year-cell--current {
  border: 2px solid var(--tkb-primary);
  font-weight: 600;
}
.tkb-dp-year-cell--selected {
  background: var(--tkb-primary) !important;
  color: white !important;
  font-weight: 700;
}

/* ── Footer ── */
.tkb-dp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid var(--tkb-border);
}
.tkb-dp-footer-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--tkb-primary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}
.tkb-dp-footer-link:hover {
  background: var(--tkb-primary-light);
}

/* ── Backdrop ── */
.tkb-dp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

/* ── Transitions ── */
.tkb-dp-fade-enter-active {
  animation: tkbDpFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.tkb-dp-fade-leave-active {
  animation: tkbDpFadeOut 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes tkbDpFadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes tkbDpFadeOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}

/* ── Dark Mode ── */
.tkb-dp-dark .tkb-dp-input {
  background: #1a1a1a;
  color: #e0e0e0;
  border-color: #333;
}
.tkb-dp-dark .tkb-dp-input::placeholder {
  color: #666;
}
.tkb-dp-dark .tkb-dp-popover {
  background: #1a1a1a;
  border-color: #333;
}
.tkb-dp-dark .tkb-dp-presets {
  border-color: #333;
}
.tkb-dp-dark .tkb-dp-presets li {
  color: #ccc;
}
.tkb-dp-dark .tkb-dp-presets li:hover {
  background: #2a2a2a;
}
.tkb-dp-dark .tkb-dp-header-label {
  color: #e0e0e0;
}
.tkb-dp-dark .tkb-dp-header-label:hover {
  background: #2a2a2a;
}
.tkb-dp-dark .tkb-dp-nav-btn {
  background: transparent;
  border-color: #333;
  color: #999;
}
.tkb-dp-dark .tkb-dp-nav-btn:hover {
  background: #2a2a2a;
  border-color: var(--tkb-primary);
  color: var(--tkb-primary);
}
.tkb-dp-dark .tkb-dp-weekday {
  color: #666;
}
.tkb-dp-dark .tkb-dp-day {
  color: #ccc;
}
.tkb-dp-dark .tkb-dp-day:hover {
  background: #2a2a2a;
}
.tkb-dp-dark .tkb-dp-day--other {
  color: #444;
}
.tkb-dp-dark .tkb-dp-day--in-range {
  background: rgba(240, 130, 39, 0.15);
}
.tkb-dp-dark .tkb-dp-panel-divider {
  background: #333;
}
.tkb-dp-dark .tkb-dp-footer {
  border-color: #333;
}
.tkb-dp-dark .tkb-dp-month-cell,
.tkb-dp-dark .tkb-dp-year-cell {
  color: #ccc;
}
.tkb-dp-dark .tkb-dp-month-cell:hover,
.tkb-dp-dark .tkb-dp-year-cell:hover {
  background: #2a2a2a;
}
</style>
