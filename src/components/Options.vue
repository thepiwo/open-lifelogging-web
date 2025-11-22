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

    <VueDatePicker
      v-model="range"
      :range="true"
      :locale="vdpLocale"
      :enable-time-picker="false" />
  </div>
</template>

<script>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import {EventBus} from "@/utils/event-bus";
import Storage from "@/utils/storage";
import * as moment from 'moment';

export default {
  components: {
    VueDatePicker
  },
  data() {
    return {
      range: [],
      toggleMusic: false,
      toggleMarker: false,
      dateButtons: ["Day", "Week", "Month", "Year"],
      vdpLocale: "en-GB"
    };
  },
  watch: {
    toggleMusic: function (toggleMusic) {
      Storage.setMusicToggle(toggleMusic);
      EventBus.emit("toggle-music");
    },
    toggleMarker: function (toggleMarker) {
      Storage.setMarkerToggle(toggleMarker);
      EventBus.emit("toggle-marker");
    },
    range: function (range) {
      // Normalize to full-day boundaries when user changes range
      const from = moment(range[0]).startOf('day').toDate();
      const to = moment(range[1]).endOf('day').toDate();
      Storage.setDates(from, to);
      EventBus.emit("date-change");
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
      // Update component range (display) with normalized day bounds
      const from = fromDate.startOf('day').toDate();
      const to = toDate.endOf('day').toDate();
      this.range = [from, to];
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
