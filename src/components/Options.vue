<template>
  <div>
    <div class="show-toggles">
      <label>Music:
        <input
          v-model="toggleMusic"
          type="checkbox">
      </label>
      <label>Marker:
        <input
          v-model="toggleMarker"
          type="checkbox">
      </label>
    </div>
    <div
      v-for="unit in dateButtons"
      :key="unit"
      class="set-date">
      <input
        class="btn plus-minus"
        type="button"
        value="-"
        @click="setDate(unit, 'minus')">
      <input
        class="btn"
        type="button"
        :value="unit"
        @click="setDate(unit)">
      <input
        class="btn plus-minus"
        type="button"
        value="+"
        @click="setDate(unit, 'plus')">
    </div>

    <vue-datepicker-local
      v-model="range"
      :local="local"
      range-separator="-" />
  </div>
</template>

<script>
import VueDatepickerLocal from "vue-datepicker-local";
import {EventBus} from "@/utils/event-bus";
import Storage from "@/utils/storage";
import * as moment from 'moment';

export default {
  components: {
    VueDatepickerLocal
  },
  data() {
    return {
      range: [],
      toggleMusic: false,
      toggleMarker: false,
      dateButtons: ["Day", "Week", "Month", "Year"],
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
    toggleMusic: function (toggleMusic) {
      Storage.setMusicToggle(toggleMusic);
      EventBus.$emit("toggle-music");
    },
    toggleMarker: function (toggleMarker) {
      Storage.setMarkerToggle(toggleMarker);
      EventBus.$emit("toggle-marker");
    },
    range: function (range) {
      Storage.setDates(range[0], range[1]);
      EventBus.$emit("date-change");
    }
  },
  created() {
    this.range = Storage.getDates();

    this.toggleMarker = Storage.getMarkerToggle();
    this.toggleMusic = Storage.getMusicToggle();
  },
  methods: {
    setDate(unit, change = null) {
      let momentUnit = unit.toLowerCase() + 's';

      let toDate = moment();
      let fromDate = moment();
      if (change) {
        fromDate = moment(this.range[0]);
        toDate = moment(this.range[1]);
      }

      if (change === "plus") toDate.add(1, momentUnit);
      if (change === "minus") toDate.subtract(1, momentUnit);
      fromDate = toDate.clone();
      if (unit !== 'Day') fromDate.subtract(1, momentUnit);

      Storage.setUnit(unit);
      this.range = [fromDate.toDate(), toDate.toDate()];
    }
  }
};
</script>

<style lang="scss" scoped>

.datepicker:before {
  background: none;
}

.datepicker input {
  border-radius: 0.25rem;
}

.datepicker-range .datepicker-popup {
  border-radius: 0.25rem;
  @media only screen and (min-width: 514px) {
    width: 415px !important;
    left: -90px;
  }
  @media only screen and (max-width: 514px) {
    width: 415px !important;
    left: -48px;
    transform: scale(0.8);
  }
}

.set-date {
  margin-right: 20px;
  @media only screen and (max-width: 527px) {
    margin-bottom: 4px;
  }

  .btn {
    padding: 0 2px 0 2px;
  }
}

.show-toggles {
  margin-right: 10px;

  input[type=checkbox] {
    margin-right: 5px;
  }
}
</style>
