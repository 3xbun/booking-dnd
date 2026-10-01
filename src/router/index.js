import { createRouter, createWebHistory } from "vue-router";

import CalendarView from "../views/CalendarView.vue";
import AdventuresView from "../views/AdventuresView.vue";
import AdventurePickerView from "../views/AdventurePickerView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "calendar",
      component: CalendarView,
    },
    {
      path: "/adventures",
      name: "adventures",
      component: AdventuresView,
    },
    {
      path: "/adventures/random",
      name: "adventure-picker",
      component: AdventurePickerView,
    },
    // Fallback: unknown routes go back to the calendar
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
