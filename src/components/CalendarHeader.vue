<template>
  <div class="header-nav">
    <!-- Prev Month Button -->
    <Button 
      icon="fa-sharp fa-solid fa-chevron-left" 
      severity="secondary" 
      variant="outlined" 
      @click="$emit('prev-month')"
      class="nav-btn"
      aria-label="ก่อนหน้า"
    />
    
    <!-- Month/Year Display -->
    <h2 class="month-title">
      <i class="fa-sharp fa-solid fa-calendar-days text-primary"></i> {{ monthYear }}
    </h2>
    
    <!-- Next Month Button -->
    <Button 
      icon="fa-sharp fa-solid fa-chevron-right" 
      severity="secondary" 
      variant="outlined" 
      @click="$emit('next-month')"
      class="nav-btn"
      aria-label="ถัดไป"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";

defineProps({
  monthYear: {
    type: String,
    required: true,
  },
});

defineEmits(["prev-month", "next-month"]);
</script>

<style scoped>
.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: var(--dark-card);
  border-bottom: 1px solid var(--dark-border);
}

.month-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.text-primary {
  color: var(--primary) !important;
}

/* Nav Button overrides */
.nav-btn {
  width: 2.25rem !important;
  height: 2.25rem !important;
  border-color: var(--dark-border) !important;
  background: rgba(255, 255, 255, 0.02) !important;
  color: var(--dark-text) !important;
  border-radius: 0.5rem !important;
}

.nav-btn:hover {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  color: var(--white) !important;
}
</style>
