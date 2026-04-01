<template>
  <div class="calendar">
    <calendar-header
      :month-year="monthYear"
      @prev-month="prevMonth"
      @next-month="nextMonth"
    ></calendar-header>
    <calendar-grid
      :days-of-week="daysOfWeek"
      :calendar-grid="calendarGrid"
    ></calendar-grid>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import dayjs from "dayjs";
import CalendarHeader from "./CalendarHeader.vue";
import CalendarGrid from "./CalendarGrid.vue";

const now = ref(dayjs());
const today = dayjs();

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthYear = computed(() => {
  return now.value.format("MMMM YYYY");
});

const calendarGrid = computed(() => {
  const firstDayOfMonth = now.value.startOf("month").day();
  const daysInMonth = now.value.daysInMonth();
  const grid = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    grid.push({ date: null, day: "", class: "empty" });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = now.value.date(i);
    let cellClass = "day";
    if (today.isSame(date, "day")) {
      cellClass += " today";
    }
    grid.push({
      date: date,
      day: i,
      class: cellClass,
    });
  }

  return grid;
});

const prevMonth = () => {
  now.value = now.value.subtract(1, "month");
};

const nextMonth = () => {
  now.value = now.value.add(1, "month");
};
</script>

<style scoped>
.calendar {
  width: 100%;
  max-width: 56.25rem;
  margin: 2em auto;
  font-family: sans-serif;
}
</style>
