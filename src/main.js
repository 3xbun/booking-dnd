import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "./style.css";
import App from "./App.vue";

createApp(App)
  .use(PrimeVue, {
    license:
      "eyJpZCI6IjkzOGJhMDE1LWFlNDYtNDNjOC1hMTIzLWQ3ZTBiODBlYTVjNSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODY3Mjc2ODgsImV4cCI6MTgxODI2MzY4OH0.t2mnhiIr0yehlJDnEMqZs5bll_4BsFFrVkW1xHG8qfjcecL09pgl7Y48rXo3-i7ND6swPMxriF37oA5oh5WrDQ",
    theme: {
      preset: Aura,
      options: {
        prefix: "p",
        darkModeSelector: ".dark",
        cssLayer: false,
        cssVariables: true,
      },
    },
  })
  .mount("#app");
