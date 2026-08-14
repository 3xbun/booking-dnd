<template>
  <div class="calendar-grid-container">
    <!-- Days of Week Header -->
    <div class="days-of-week">
      <div v-for="day in daysOfWeek" :key="day" class="weekday-header">
        {{ translateDay(day) }}
      </div>
    </div>
    
    <!-- Days Grid -->
    <div class="days-grid">
      <div 
        v-for="(day, index) in calendarGrid" 
        :key="index" 
        :class="['grid-cell', day.class, { 'clickable': day.date }]"
        @click="day.date && $emit('select-day', day)"
      >
        <!-- Day Number Badge -->
        <div class="day-header">
          <span :class="['day-number', { 'today-badge': isToday(day) }]">
            {{ day.day }}
          </span>
        </div>
        
        <!-- List of Mini Tasks/Bookings (Max 2 shown) -->
        <div v-if="day.tasks && day.tasks.length > 0" class="cell-tasks-list">
          <div 
            v-for="task in day.tasks.slice(0, 2)" 
            :key="task.Id" 
            :class="['mini-task-bar', getMiniTaskClass(task)]"
            :title="`${task.Time} - ${task.Title}`"
          >
            <span class="mini-task-time">{{ task.Time }}</span>
            <span class="mini-task-title">{{ task.Title }}</span>
          </div>
          
          <!-- More items indicator -->
          <div v-if="day.tasks.length > 2" class="more-tasks-indicator">
            +{{ day.tasks.length - 2 }} รายการ...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

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

defineEmits(["select-day"]);

// Helper to check if a grid cell is today's date
const isToday = (day) => {
  if (!day.date) return false;
  return dayjs().isSame(day.date, "day");
};

// Translate Days of week to Thai if needed (otherwise return abbreviation)
const translateDay = (day) => {
  const map = {
    "Sun": "อา.",
    "Mon": "จ.",
    "Tue": "อ.",
    "Wed": "พ.",
    "Thu": "พฤ.",
    "Fri": "ศ.",
    "Sat": "ส."
  };
  return map[day] || day;
};

// Style classes for mini task indicators based on category
const getMiniTaskClass = (task) => {
  if (!task.Title) return "mini-default";
  if (task.Title.includes("[SS")) return "mini-campaign";
  if (task.Title.includes("Vacation")) return "mini-vacation";
  if (task.Title.includes("BGC")) return "mini-bgc";
  return "mini-default";
};
</script>

<style scoped>
.calendar-grid-container {
  width: 100%;
  background: var(--dark-bg);
}

.days-of-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--dark-border);
  background: rgba(255, 255, 255, 0.01);
}

.weekday-header {
  padding: 0.75rem 0.25rem;
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
  color: var(--dark-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(5.75rem, auto); /* Minimum height of 92px, grows if needed */
  background: var(--dark-border);
  gap: 1px; /* Creates clean cell borders */
}

.grid-cell {
  background: var(--dark-card);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 0.45rem;
  transition: background-color 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.grid-cell.clickable {
  cursor: pointer;
}

.grid-cell.clickable:hover {
  background-color: #242424;
}

.grid-cell.empty {
  background-color: #151515;
  cursor: default;
}

.day-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.25rem;
}

.day-number {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--dark-text-secondary);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Today's highlighting */
.today-badge {
  background: var(--primary);
  color: var(--white) !important;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(220, 39, 44, 0.4);
}

/* Tasks inside cell */
.cell-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.mini-task-bar {
  font-size: 0.68rem;
  padding: 0.2rem 0.35rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  overflow: hidden;
  font-weight: 600;
  line-height: 1.2;
}

.mini-task-time {
  opacity: 0.8;
  font-weight: 500;
  white-space: nowrap;
}

.mini-task-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

/* Mini Task Categories */
.mini-campaign {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border-left: 2px solid #3b82f6;
}

.mini-vacation {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border-left: 2px solid #f59e0b;
}

.mini-bgc {
  background: rgba(139, 92, 246, 0.12);
  color: #a78bfa;
  border-left: 2px solid #8b5cf6;
}

.mini-default {
  background: rgba(160, 160, 160, 0.12);
  color: var(--dark-text-secondary);
  border-left: 2px solid #9ca3af;
}

.more-tasks-indicator {
  font-size: 0.65rem;
  color: var(--dark-text-secondary);
  padding-left: 0.25rem;
  font-weight: 500;
  margin-top: 0.1rem;
}
</style>
