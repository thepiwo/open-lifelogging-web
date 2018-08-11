<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <router-link
        class="navbar-brand"
        to="/">open-lifelogging</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"/>
      </button>

      <div
        id="navbarSupportedContent"
        class="collapse navbar-collapse">
        <ul class="navbar-nav mr-auto">

          <li class="nav-item">
            <a
              class="nav-link"
              href="/feed">Feed</a>
          </li>

          <li class="nav-item">
            <a
              class="nav-link"
              href="/map">Map</a>
          </li>

        </ul>

        <input
          id="reset-today"
          class="btn"
          type="button"
          value="Today"
          @click="resetToday()">

        <vue-datepicker-local
          v-model="range"
          :local="local"
          range-separator="-" />
      </div>
    </nav>

    <router-view/>
  </div>
</template>

<script>
import VueDatepickerLocal from "vue-datepicker-local";
import { EventBus } from "./utils/event-bus";
import Storage from "./utils/storage";

export default {
  components: {
    VueDatepickerLocal
  },
  data() {
    return {
      range: [],
      local: {
        dow: 1,
        hourTip: "Select Hour",
        minuteTip: "Select Minute",
        secondTip: "Select Second",
        yearSuffix: "",
        monthsHead: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ],
        months: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ],
        weeks: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        cancelTip: "cancel",
        submitTip: "confirm"
      }
    };
  },
  watch: {
    range: function(range) {
      Storage.setDates(range[0], range[1]);
      EventBus.$emit("dateChange");
    }
  },
  created() {
    this.range = Storage.getDates();
  },
  methods: {
    async resetToday() {
      this.range = [new Date(), new Date()];
      Storage.setDates(this.range[0], this.range[1]);
      EventBus.$emit("dateChange");
    }
  }
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2e2e2e;
}

.datepicker:before {
  background: none;
}

.datepicker-range .datepicker-popup {
  width: 415px !important;
  left: -90px;
}

#reset-today {
  margin-right: 10px;
}
</style>
