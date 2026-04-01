<template>
  <div>
    <div class="days-of-week">
      <div v-for="day in daysOfWeek" :key="day">{{ day }}</div>
    </div>
    <div class="days-grid">
      <div v-for="(day, index) in calendarGrid" :key="index" :class="day.class">
        {{ day.day }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  daysOfWeek: {
    type: Array,
    required: true,
  },
  calendarGrid: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.days-of-week,
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  width: 100%;
}

.days-of-week div {
  padding: 0.5em;
  font-weight: bold;
  color: var(--dark-text-secondary);
}

.days-grid .day {
  justify-content: center;
  align-items: center;
  display: flex;
  height: 3.75rem;
  transition: background-color 0.3s;
}

.days-grid .day:hover {
  background-color: #333;
  cursor: pointer;
}

.days-grid .empty {
  background-color: var(--dark-card);
}

.day p {
  display: flex;
  align-items: center;
  height: fit-content;
  gap: 0.25em;
}

.today {
  background-color: var(--primary);
  border-radius: 0.5em;
}
</style>
