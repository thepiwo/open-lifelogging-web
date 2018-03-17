<template>
    <div id="app">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <router-link class="navbar-brand" to="/">open-lifelogging</router-link>
            <button class="navbar-toggler" type="button" data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">

                    <li class="nav-item">
                        <a class="nav-link" href="/feed">Feed</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="/map">Map</a>
                    </li>

                </ul>

                <div class="">
                    <vue-datepicker-local v-model="range" range-separator="-" :local="local" @confirm="changeDate()"/>
                </div>
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
        monthsHead: "January_February_March_April_May_June_July_August_September_October_November_December".split(
          "_"
        ),
        months: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        weeks: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        cancelTip: "cancel",
        submitTip: "confirm"
      }
    };
  },
  created() {
    this.range = Storage.getDates();
  },
  watch: {
    range: function(range) {
      Storage.setDates(range[0], range[1]);
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

.datepicker-range .datepicker-popup {
  width: 415px !important;
  left: -90px;
}
</style>
