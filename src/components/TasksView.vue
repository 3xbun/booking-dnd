<template>
  <div class="tasks-table-container">
    <Card class="table-card">
      <template #content>
        <!-- PrimeVue DataTable -->
        <DataTable
          :value="tasks"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          removableSort
          class="custom-table"
        >
          <!-- Date Column -->
          <Column field="Date" header="Date" sortable style="width: 25%">
            <template #body="slotProps">
              <span class="table-date">
                <i class="fa-pixel fa-solid fa-calendar icon-dim"></i>
                {{ formatDate(slotProps.data.Date) }}
              </span>
            </template>
          </Column>

          <!-- Time Column -->
          <Column field="Time" header="Time" sortable style="width: 20%">
            <template #body="slotProps">
              <span class="table-time">
                <i class="fa-pixel fa-solid fa-clock icon-dim"></i>
                {{ slotProps.data.Time }}
              </span>
            </template>
          </Column>

          <!-- Title/Booking Name Column -->
          <Column
            field="Title"
            header="Booking Details"
            sortable
            style="width: 35%"
          >
            <template #body="slotProps">
              <span class="table-title">{{ slotProps.data.Title }}</span>
            </template>
          </Column>

          <!-- Category/Type Column -->
          <Column header="Category" style="width: 20%">
            <template #body="slotProps">
              <Tag
                :value="getCategoryLabel(slotProps.data)"
                :severity="getCategorySeverity(slotProps.data)"
                class="table-category-tag"
              />
            </template>
          </Column>

          <!-- Empty State Layout -->
          <template #empty>
            <div class="table-empty-state">
              <i class="fa-pixel fa-solid fa-magnifying-glass empty-icon"></i>
              <p>No booking records found in the system</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";

defineProps({
  tasks: {
    type: Array,
    required: true,
  },
});

// Format Date to Thai local format
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dayjs(dateStr).format("D MMMM YYYY");
};

// Help map category labels
const getCategoryLabel = (task) => {
  if (!task.Title) return "Other";
  if (task.Title.includes("[SS")) return "Campaign";
  if (task.Title.includes("[OS")) return "One Shot";
  if (task.Title.includes("Vacation")) return "Vacation";
  if (task.Title.includes("BGC")) return "Board Game";
  return "Other";
};

// Map category severity for color coding
const getCategorySeverity = (task) => {
  if (!task.Title) return "secondary";
  if (task.Title.includes("[SS")) return "info"; // Blue
  if (task.Title.includes("[OS")) return "success"; // Teal/Green
  if (task.Title.includes("Vacation")) return "warn"; // Orange
  if (task.Title.includes("BGC")) return "danger"; // Red/Purple
  return "secondary"; // Gray
};
</script>

<style scoped>
.tasks-table-container {
  width: 100%;
}

.table-card {
  background: var(--dark-card) !important;
  border: 1px solid var(--dark-border) !important;
  border-radius: 1rem !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden;
}

.table-card :deep(.p-card-body) {
  padding: 0 !important;
}

/* Custom DataTable styles to match dark dashboard theme */
:deep(.p-datatable) {
  background: var(--dark-card) !important;
  font-family: inherit;
}

:deep(.p-datatable-header) {
  background: var(--dark-card) !important;
  border-bottom: 1px solid var(--dark-border) !important;
}

:deep(.p-datatable-thead > tr > th) {
  background: rgba(255, 255, 255, 0.01) !important;
  color: var(--white) !important;
  font-weight: 700;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--dark-border) !important;
  padding: 1rem 1.25rem !important;
  transition: background-color 0.2s;
}

:deep(.p-datatable-tbody > tr) {
  background: var(--dark-card) !important;
  color: var(--dark-text) !important;
  transition: background-color 0.2s;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.02) !important;
}

:deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid var(--dark-border) !important;
  padding: 1rem 1.25rem !important;
  font-size: 0.95rem;
  vertical-align: middle;
}

/* Pagination panel styles */
:deep(.p-paginator) {
  background: var(--dark-card) !important;
  border-top: 1px solid var(--dark-border) !important;
  border-bottom: none !important;
  padding: 0.75rem 1rem !important;
  color: var(--dark-text-secondary) !important;
}

:deep(.p-paginator .p-paginator-page),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last),
:deep(.p-paginator-rpp-select) {
  color: var(--dark-text-secondary) !important;
  border-radius: 0.375rem !important;
  transition:
    background-color 0.2s,
    color 0.2s;
}

:deep(.p-paginator .p-paginator-page:hover),
:deep(.p-paginator-rpp-select:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: var(--white) !important;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
  background: var(--primary) !important;
  color: var(--white) !important;
}

:deep(.p-paginator-rpp-select) {
  background: #171717 !important;
  border: 1px solid var(--dark-border) !important;
}

/* Table elements styling */
.table-date,
.table-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-dim {
  color: var(--dark-text-secondary);
  opacity: 0.7;
}

.table-title {
  font-weight: 600;
  color: var(--white);
}

.table-category-tag {
  font-size: 0.75rem !important;
  padding: 0.25rem 0.6rem !important;
  border-radius: 0.375rem !important;
}

/* Table Empty state */
.table-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--dark-text-secondary);
  gap: 1rem;
  width: 100%;
}

.empty-icon {
  font-size: 3rem;
  color: var(--dark-border);
}
</style>
