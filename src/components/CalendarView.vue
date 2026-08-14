<template>
  <div class="calendar-wrapper">
    <Card class="calendar-card">
      <template #content>
        <!-- Calendar Grid -->
        <CalendarGrid
          :days-of-week="daysOfWeek"
          :calendar-grid="calendarGrid"
          @select-day="onSelectDay"
        />
      </template>
    </Card>

    <!-- Dialog for Day Details -->
    <Dialog 
      v-model:visible="displayDialog" 
      modal 
      :header="dialogHeader" 
      :style="{ width: '90vw', maxWidth: '440px' }"
      class="custom-dialog"
    >
      <div v-if="selectedDayTasks.length > 0" class="dialog-tasks-list">
        <div v-for="task in selectedDayTasks" :key="task.Id" class="dialog-task-item">
          <!-- Category Indicator Bar -->
          <div class="category-indicator" :class="getCategoryClass(task)"></div>
          
          <div class="task-info-block">
            <div class="task-header-row">
              <span class="task-time">
                <i class="fa-sharp fa-solid fa-clock"></i> {{ task.Time }}
              </span>
              <span class="task-badge" :class="getCategoryClass(task)">
                {{ getCategoryLabel(task) }}
              </span>
            </div>
            <h4 class="task-title">{{ task.Title }}</h4>
          </div>
        </div>
      </div>
      <div v-else class="dialog-empty-state">
        <i class="fa-sharp fa-solid fa-calendar-circle-exclamation empty-icon"></i>
        <p>ไม่มีตารางงานหรือรายการจองในวันนี้</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <Button label="ปิดหน้าต่าง" icon="fa-sharp fa-solid fa-xmark" @click="displayDialog = false" class="p-button-text" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/th";

import Card from "primevue/card";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

import CalendarGrid from "./CalendarGrid.vue";

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
  },
  currentMonth: {
    type: Object, // dayjs object passed from parent (App.vue)
    required: true,
  }
});

const today = dayjs();

// Dialog state
const displayDialog = ref(false);
const selectedDay = ref(null);
const selectedDayTasks = ref([]);

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarGrid = computed(() => {
  const firstDayOfMonth = props.currentMonth.startOf("month").day();
  const daysInMonth = props.currentMonth.daysInMonth();
  const grid = [];

  // Pad the start of the grid with empty days
  for (let i = 0; i < firstDayOfMonth; i++) {
    grid.push({ date: null, day: "", class: "empty", tasks: [] });
  }

  // Populate days of the current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = props.currentMonth.date(i);
    let cellClass = "day";
    
    if (today.isSame(date, "day")) {
      cellClass += " today";
    }

    // Match tasks
    const dateStr = date.format("YYYY-MM-DD");
    const dayTasks = props.tasks.filter(task => task.Date === dateStr);

    if (dayTasks.length > 0) {
      cellClass += " has-tasks";
    }

    grid.push({
      date: date,
      day: i,
      class: cellClass,
      tasks: dayTasks,
    });
  }

  return grid;
});

// Handle selecting a day to show details
const onSelectDay = (day) => {
  if (!day.date) return;
  selectedDay.value = day.date;
  selectedDayTasks.value = day.tasks;
  displayDialog.value = true;
};

// Computed Dialog Header Title
const dialogHeader = computed(() => {
  if (!selectedDay.value) return "รายการจอง";
  return `รายการจองวันที่ ${selectedDay.value.locale("th").format("D MMMM YYYY")}`;
});

// Helper functions for categorization styling
const getCategoryClass = (task) => {
  if (!task.Title) return "cat-default";
  if (task.Title.includes("[SS")) return "cat-campaign";
  if (task.Title.includes("[OC")) return "cat-oneshot";
  if (task.Title.includes("Vacation")) return "cat-vacation";
  if (task.Title.includes("BGC")) return "cat-bgc";
  return "cat-default";
};

const getCategoryLabel = (task) => {
  if (!task.Title) return "อื่นๆ";
  if (task.Title.includes("[SS")) return "Campaign";
  if (task.Title.includes("[OC")) return "One Shot";
  if (task.Title.includes("Vacation")) return "วันหยุด";
  if (task.Title.includes("BGC")) return "Board Game Club";
  return "อื่นๆ";
};
</script>

<style scoped>
.calendar-wrapper {
  width: 100%;
  margin: 0 auto;
}

.calendar-card {
  background: var(--dark-card) !important;
  border: 1px solid var(--dark-border) !important;
  border-radius: 1rem !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden;
}

.calendar-card :deep(.p-card-body) {
  padding: 0 !important;
}

/* Dialog Styling overrides */
:deep(.custom-dialog) {
  background: var(--dark-card) !important;
  border: 1px solid var(--dark-border) !important;
  border-radius: 1.25rem !important;
}

:deep(.p-dialog-header) {
  background: var(--dark-card) !important;
  color: var(--white) !important;
  border-bottom: 1px solid var(--dark-border) !important;
  padding: 1.25rem 1.5rem !important;
}

:deep(.p-dialog-content) {
  background: var(--dark-card) !important;
  color: var(--dark-text) !important;
  padding: 1.5rem !important;
}

:deep(.p-dialog-footer) {
  background: var(--dark-card) !important;
  border-top: 1px solid var(--dark-border) !important;
  padding: 1rem 1.5rem !important;
}

/* Day Dialog List */
.dialog-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dialog-task-item {
  display: flex;
  background: #171717;
  border: 1px solid var(--dark-border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: border-color 0.2s;
}

.dialog-task-item:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.category-indicator {
  width: 5px;
  flex-shrink: 0;
}

.task-info-block {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.task-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-time {
  font-size: 0.85rem;
  color: var(--dark-text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.task-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
}

/* Category Specific Styles */
.cat-campaign {
  background-color: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
  border-left: 5px solid #3b82f6;
}
div.category-indicator.cat-campaign {
  background-color: #3b82f6;
  border: none;
}

.cat-oneshot {
  background-color: rgba(20, 184, 166, 0.1) !important;
  color: #14b8a6 !important;
  border-left: 5px solid #14b8a6;
}
div.category-indicator.cat-oneshot {
  background-color: #14b8a6;
  border: none;
}

.cat-vacation {
  background-color: rgba(245, 158, 11, 0.1) !important;
  color: #f59e0b !important;
  border-left: 5px solid #f59e0b;
}
div.category-indicator.cat-vacation {
  background-color: #f59e0b;
  border: none;
}

.cat-bgc {
  background-color: rgba(139, 92, 246, 0.1) !important;
  color: #8b5cf6 !important;
  border-left: 5px solid #8b5cf6;
}
div.category-indicator.cat-bgc {
  background-color: #8b5cf6;
  border: none;
}

.cat-default {
  background-color: rgba(160, 160, 160, 0.1) !important;
  color: var(--dark-text-secondary) !important;
  border-left: 5px solid var(--dark-text-secondary);
}
div.category-indicator.cat-default {
  background-color: var(--dark-text-secondary);
  border: none;
}

/* Empty State */
.dialog-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: var(--dark-text-secondary);
  gap: 0.75rem;
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--dark-border);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
