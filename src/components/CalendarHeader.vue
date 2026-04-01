<template>
  <div class="header">
    <button @click="$emit('prev-month')">
      <i class="fa-sharp fa-solid fa-chevron-left"></i>
    </button>
    <h2>
      <i class="fa-sharp fa-solid fa-calendar-days"></i> {{ monthYear }}
    </h2>
    <button @click="$emit('next-month')">
      <i class="fa-sharp fa-solid fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  monthYear: {
    type: String,
    required: true,
  },
});

defineEmits(["prev-month", "next-month"]);
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9375rem 1.25rem;
  background: linear-gradient(135deg, var(--primary), #ff6b6b);
  color: var(--white);
}

.header h2 {
  margin: 0;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.header button {
  background: transparent;
  border: 0.0625rem solid var(--white);
  color: var(--white);
  padding: 0.3125rem 0.625rem;
  border-radius: 0.3125rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 2.5rem;
  height: 2.5rem;
}

.header button:hover {
  background: var(--white);
  color: var(--primary);
}
</style>
