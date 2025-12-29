import { Router } from "./router.js";

const LMS = {
  init() {
    Router.init();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  LMS.init();
});
