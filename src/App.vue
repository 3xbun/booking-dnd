<template>
  <div class="container dashboard">
    <!-- Header Section -->
    <header class="dashboard-header">
      <div class="logo-wrapper">
        <img class="logo" src="/logo.png" alt="logo" />
      </div>
      <div class="header-text">
        <h1>ระบบจองคิวบอร์ดเกม & ตารางงาน</h1>
        <p class="subtitle">
          <i class="fa-sharp fa-solid fa-circle-check text-success"></i>
          ข้อมูลตารางงานอัปเดตเรียลไทม์สำหรับลูกค้า
        </p>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <i class="fa-sharp fa-solid fa-spinner fa-spin loading-icon"></i>
      <p>กำลังโหลดข้อมูลตารางงาน...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <Message severity="error" life="5000">
        <i class="fa-sharp fa-solid fa-triangle-exclamation"></i>
        ไม่สามารถดึงข้อมูลตารางงานได้ กรุณาลองใหม่อีกครั้ง
      </Message>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- KPI Stats Grid -->
      <section class="stats-grid">
        <!-- Total Bookings -->
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <span class="stat-label">รายการจองทั้งหมด</span>
                <span class="stat-value text-red">{{ totalBookings }}</span>
              </div>
              <div class="stat-icon-wrapper bg-red-dim">
                <i class="fa-sharp fa-solid fa-calendar-days text-red"></i>
              </div>
            </div>
          </template>
        </Card>

        <!-- Campaign Sessions -->
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <span class="stat-label">แคมเปญเซสชัน (SS)</span>
                <span class="stat-value text-blue">{{ campaignSessions }}</span>
              </div>
              <div class="stat-icon-wrapper bg-blue-dim">
                <i class="fa-sharp fa-solid fa-shield-halved text-blue"></i>
              </div>
            </div>
          </template>
        </Card>

        <!-- One Shot Sessions -->
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <span class="stat-label">One Shot Adventure</span>
                <span class="stat-value text-teal">{{ oneShots }}</span>
              </div>
              <div class="stat-icon-wrapper bg-teal-dim">
                <i class="fa-sharp fa-solid fa-dice-d20 text-teal"></i>
              </div>
            </div>
          </template>
        </Card>

        <!-- Vacation Days -->
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <span class="stat-label">วันหยุด / Vacation</span>
                <span class="stat-value text-orange">{{ vacationDays }}</span>
              </div>
              <div class="stat-icon-wrapper bg-orange-dim">
                <i class="fa-sharp fa-solid fa-umbrella-beach text-orange"></i>
              </div>
            </div>
          </template>
        </Card>

        <!-- Next Session -->
        <Card class="stat-card next-session-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <span class="stat-label">เซสชันถัดไป</span>
                <template v-if="nextSession">
                  <span class="next-session-title truncate">{{
                    nextSession.Title
                  }}</span>
                  <span class="next-session-date">
                    <i class="fa-sharp fa-solid fa-clock"></i>
                    {{ formatDate(nextSession.Date) }} ({{ nextSession.Time }})
                  </span>
                </template>
                <template v-else>
                  <span class="next-session-title text-secondary"
                    >ไม่มีเซสชันเร็วๆ นี้</span
                  >
                </template>
              </div>
              <div class="stat-icon-wrapper bg-green-dim">
                <i class="fa-sharp fa-solid fa-hourglass-start text-green"></i>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <!-- View Controls & Filters -->
      <section class="controls-section">
        <Card class="controls-card">
          <template #content>
            <div class="controls-wrapper">
              <!-- View Toggle (Calendar vs List) -->
              <div class="view-toggle-container">
                <SelectButton
                  v-model="currentView"
                  :options="viewOptions"
                  optionLabel="label"
                  optionValue="value"
                  :allowEmpty="false"
                />
              </div>

              <!-- Search and Category Filters -->
              <div class="filters-container">
                <!-- Search Box -->
                <div class="search-box">
                  <span class="p-input-icon-left w-full">
                    <i
                      class="fa-sharp fa-solid fa-magnifying-glass search-icon"
                    ></i>
                    <input
                      type="text"
                      v-model="searchQuery"
                      placeholder="ค้นหาชื่อตารางงาน..."
                      class="custom-search-input"
                    />
                  </span>
                </div>

                <!-- Category Pills -->
                <div class="category-pills">
                  <Button
                    v-for="pill in categoryOptions"
                    :key="pill.value"
                    :label="pill.label"
                    :class="[
                      'p-button-rounded p-button-sm',
                      activeFilter === pill.value
                        ? 'p-button-primary'
                        : 'p-button-outlined p-button-secondary',
                    ]"
                    @click="activeFilter = pill.value"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <!-- Main Display View -->
      <section class="main-view-container">
        <Transition name="fade" mode="out-in">
          <div v-if="currentView === 'calendar'" key="calendar">
            <CalendarView :tasks="filteredTasks" />
          </div>
          <div v-else key="list">
            <TasksView :tasks="filteredTasks" />
          </div>
        </Transition>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/th"; // For Thai dates if needed

import Card from "primevue/card";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import Message from "primevue/message";

import CalendarView from "./components/CalendarView.vue";
import TasksView from "./components/TasksView.vue";

// State
const Tasks = ref([]);
const loading = ref(true);
const error = ref(false);
const currentView = ref("calendar");
const searchQuery = ref("");
const activeFilter = ref("All");

// Dropdown/Toggle Options
const viewOptions = ref([
  { label: "ตารางปฏิทิน", value: "calendar" },
  { label: "รายการทั้งหมด", value: "list" },
]);

const categoryOptions = ref([
  { label: "ทั้งหมด", value: "All" },
  { label: "Campaign", value: "Campaign" },
  { label: "One Shot", value: "OneShot" },
  { label: "วันหยุด", value: "Vacation" },
  { label: "อื่นๆ", value: "Other" },
]);

// Fetching Data
onMounted(() => {
  const options = {
    method: "GET",
    url: "https://ndb.3xbun.com/api/v2/tables/mrsyc7z6ooyi7ad/records",
    params: {
      offset: "0",
      limit: "150",
      where: "",
      viewId: "vwyaz6okcvlatosq",
    },
    headers: {
      "xc-token": import.meta.env.VITE_NDB_API,
    },
  };

  axios
    .request(options)
    .then((res) => {
      Tasks.value = res.data.list;
      loading.value = false;
    })
    .catch((err) => {
      console.error(err);
      error.value = true;
      loading.value = false;
    });
});

// Computed Properties for KPIs
const totalBookings = computed(() => Tasks.value.length);
const campaignSessions = computed(
  () => Tasks.value.filter((t) => t.Title?.includes("[SS")).length,
);
const oneShots = computed(
  () => Tasks.value.filter((t) => t.Title?.includes("[OS")).length,
);
const vacationDays = computed(
  () => Tasks.value.filter((t) => t.Title?.includes("Vacation")).length,
);

const nextSession = computed(() => {
  const todayStr = dayjs().format("YYYY-MM-DD");
  const upcoming = Tasks.value
    .filter((t) => t.Date >= todayStr && !t.Title?.includes("Vacation"))
    .sort((a, b) => a.Date.localeCompare(b.Date));
  return upcoming.length > 0 ? upcoming[0] : null;
});

// Computed Filtered Tasks
const filteredTasks = computed(() => {
  return Tasks.value.filter((task) => {
    // Search filter
    const matchesSearch =
      !searchQuery.value ||
      (task.Title &&
        task.Title.toLowerCase().includes(searchQuery.value.toLowerCase()));
    if (!matchesSearch) return false;

    // Category filter
    if (activeFilter.value === "All") return true;
    if (activeFilter.value === "Campaign") return task.Title?.includes("[SS");
    if (activeFilter.value === "OneShot") return task.Title?.includes("[OS");
    if (activeFilter.value === "Vacation")
      return task.Title?.includes("Vacation");
    if (activeFilter.value === "Other")
      return (
        !task.Title?.includes("[SS") &&
        !task.Title?.includes("[OS") &&
        !task.Title?.includes("Vacation")
      );
    return true;
  });
});

// Format Dates beautifully
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dayjs(dateStr).locale("th").format("D MMM YYYY");
};
</script>

<style scoped>
.dashboard {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--dark-card);
  padding: 1.25rem 2rem;
  border-radius: 1rem;
  border: 1px solid var(--dark-border);
}

.logo-wrapper {
  background: rgba(255, 255, 255, 0.03);
  padding: 0.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 4.5rem;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--dark-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-success {
  color: #10b981;
}

/* Loading & Error */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  height: 50vh;
  color: var(--dark-text-secondary);
}

.loading-icon {
  font-size: 3rem;
  color: var(--primary);
}

.error-container {
  margin: 3rem 0;
}

/* KPI Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--dark-card) !important;
  border: 1px solid var(--dark-border) !important;
  border-radius: 1rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  transition:
    transform 0.2s,
    border-color 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--dark-text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

/* KPI Colors */
.text-red {
  color: #ef4444;
}
.bg-red-dim {
  background: rgba(239, 68, 68, 0.1);
}

.text-blue {
  color: #3b82f6;
}
.bg-blue-dim {
  background: rgba(59, 130, 246, 0.1);
}

.text-teal {
  color: #14b8a6;
}
.bg-teal-dim {
  background: rgba(20, 184, 166, 0.1);
}

.text-orange {
  color: #f59e0b;
}
.bg-orange-dim {
  background: rgba(245, 158, 11, 0.1);
}

.text-green {
  color: #10b981;
}
.bg-green-dim {
  background: rgba(16, 185, 129, 0.1);
}

.stat-icon-wrapper {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

/* Next Session Specifics */
.next-session-card {
  grid-column: span 1;
}

@media (min-width: 1024px) {
  .next-session-card {
    grid-column: span 1;
  }
}

.next-session-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--white);
}

.next-session-date {
  font-size: 0.85rem;
  color: var(--dark-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Controls & Filters */
.controls-section {
  margin-bottom: 0.5rem;
}

.controls-card {
  background: var(--dark-card) !important;
  border: 1px solid var(--dark-border) !important;
  border-radius: 1rem !important;
}

.controls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .controls-wrapper {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.view-toggle-container :deep(.p-selectbutton) {
  border: 1px solid var(--dark-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

@media (min-width: 768px) {
  .filters-container {
    flex-direction: row;
    align-items: center;
    width: auto;
    max-width: 75%;
  }
}

.search-box {
  position: relative;
  width: 100%;
}

@media (min-width: 768px) {
  .search-box {
    width: 220px;
  }
}

.p-input-icon-left {
  display: flex;
  align-items: center;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--dark-text-secondary);
  font-size: 0.9rem;
  z-index: 2;
}

.custom-search-input {
  width: 100%;
  background: #171717;
  border: 1px solid var(--dark-border);
  color: var(--dark-text);
  padding: 0.6rem 1rem 0.6rem 2.25rem;
  border-radius: 0.5rem;
  outline: none;
  font-size: 0.9rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.custom-search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(220, 39, 44, 0.2);
}

.category-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-pills :deep(.p-button) {
  font-size: 0.85rem !important;
  padding: 0.4rem 0.85rem !important;
  height: auto !important;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
