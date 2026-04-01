<template>
  <div>
    <!-- <ul>
      <li v-for="task in Tasks" :key="task.id">
        {{ task }}
      </li>
    </ul> -->
  </div>
</template>

<script setup>
defineProps({
  Tasks: {
    type: Array,
    required: true,
  },
});
</script>

<style lang="css" scoped></style>
