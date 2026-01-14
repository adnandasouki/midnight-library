import { CONFIG } from "./config.js";

export const authState = {
  user: null,
  isAuthenticated: false,
};

export const UI = {
  formatDate(dateStr) {
    const dateObj = new Date(dateStr);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = String(dateObj.getFullYear());
    return `${day}/${month}/${year}`;
  },

  relativeDate(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const timePassed = now - date;

    const msPerSecond = 1000; // 1 second = 1000 ms
    const msPerMinute = 60 * msPerSecond;
    const msPerHour = 60 * msPerMinute;
    const msPerDay = 24 * msPerHour;
    const msPerWeek = 7 * msPerDay;
    const msPerMonth = 4 * msPerWeek;

    // less than a minute (seconds)
    if (timePassed < msPerMinute)
      return `${Math.round(timePassed / msPerSecond)} seconds ago`;
    // less than an hour (minutes)
    else if (timePassed < msPerHour)
      return `${Math.round(timePassed / msPerMinute)} minutes ago`;
    // less than a day (hours)
    else if (timePassed < msPerDay)
      return `${Math.round(timePassed / msPerHour)} hours ago`;
    // less than a week (days)
    else if (timePassed < msPerWeek)
      return `${Math.round(timePassed / msPerDay)} days ago`;
    // less than a month (weeks)
    else if (timePassed < msPerMonth)
      return `${Math.round(timePassed / msPerWeek)} weeks ago`;
  },

  toLocaleDateFormatter(date) {
    const dateObj = new Date(date);
    const formatted = dateObj.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return formatted;
  },

  showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = msg;
    toast.style.backgroundColor = type === "error" ? "#e74c3c" : "#2ecc71";

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, CONFIG.TOAST_DURATION);
  },
};

export const Url = {
  getParams() {
    return new URLSearchParams(window.location.search);
  },

  get(key) {
    return this.getParams().get(key);
  },

  set(params) {
    const url = new URL(window.location);

    Object.entries(params).forEach(([key, value]) => {
      if (!value) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    });

    window.history.pushState({}, "", url);
  },
};
