<template>
  <div class="container">
    <header>
      <img class="logo" src="/logo.png" alt="logo" />
      <h1>ตารางงาน</h1>
    </header>
    <div class="warning" v-if="windowWidth < 650">
      ใช้จอแนวนอนเพื่อดูตารางงาน หรือใช้งานบน Tablet / PC
    </div>
    <iframe
      src="https://ndb.3xbun.com/nc/calendar/4c14a9bf-557a-4c69-8466-1fb1349e8eee?disableTopbar=true&disableToolbar=true&disableSidebar=true"
      width="100%"
      height="70%"
      v-else
    ></iframe>
    <!-- <CalendarView />
    <TasksView v-if="Tasks.length > 0" :Tasks="Tasks" /> -->
  </div>
</template>

<style scoped>
header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #e8e8e8;
  margin-bottom: 1em;
}

.logo {
  height: 15vh;
  margin-bottom: -1.5em;
}

.warning {
  text-align: center;
}

iframe {
  border-radius: 1em;
  box-shadow:
    rgba(66, 4, 4, 0.07) 0px 1px 2px,
    rgba(66, 4, 4, 0.07) 0px 2px 4px,
    rgba(66, 4, 4, 0.07) 0px 4px 8px,
    rgba(66, 4, 4, 0.07) 0px 8px 16px,
    rgba(66, 4, 4, 0.07) 0px 16px 32px,
    rgba(66, 4, 4, 0.07) 0px 32px 64px;
  border: 1px solid #171717;
}
</style>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import axios from "axios";

import CalendarView from "./components/CalendarView.vue";
import TasksView from "./components/TasksView.vue";

const Tasks = ref([]);
const windowWidth = ref(window.innerWidth);

onMounted(() => {
  axios
    .get("https://donetick.10oct.us/eapi/v1/chore", {
      headers: {
        secretkey:
          "3fab1294d6bc112ad4ec9b5e4a1a8c4de9ff990d034fdeb8a9ac31ee624b0bc9",
      },
    })
    .then((res) => {
      Tasks.value = res.data;
    });

  window.onresize = () => {
    windowWidth.value = window.innerWidth;
  };
});
</script>
