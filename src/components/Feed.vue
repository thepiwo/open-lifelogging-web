<template>
  <div
    id="feed"
    class="container card">
    <div class="card-body">
      <h1
        v-if="user"
        class="card-title">
        {{ fromDate }} to {{ toDate }} feed for {{ user.username }}
        <small v-show="logs">{{ logs.length }} logs (of {{ countTotal }})</small>
      </h1>
      <ul class="card-text">
        <div
          v-for="log in logs"
          :key="log.id"
          class="row">
          <div class="col-sm-4 col-lg-2">
            <span class="badge badge">{{ log.createdAtClient }}</span>
          </div>
          <div class="col-sm-2">
            <span class="badge badge-primary">{{ log.key }}</span>
          </div>
          <div class="col-sm-7 d-none d-md-block">
            {{ log.data.getDesc() }}
          </div>

          <div class="col-sm-1 d-none d-md-block">
            <button
              type="button"
              class="close"
              aria-label="Close"
              @click="deleteLog(log.id)">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
      </ul>
      <a
        class="btn btn-default"
        @click="downloadGPX()">Download GPX</a>
    </div>
  </div>
</template>


<script>
import api from "../apis/api";
import { EventBus } from "../utils/event-bus";
import Storage from "../utils/storage";
import GPX from "../utils/gpx";
import {LimitType} from "@/models/log";

export default {
  data() {
    return {
      fromDate: "",
      toDate: "",
      logs: [],
      user: null,
      countTotal: 0
    };
  },
  created() {
    let [fromDate, toDate] = Storage.getDates();
    this.fromDate = fromDate;
    this.toDate = toDate;

    api.user.getCurrentUser().then(user => (this.user = user));
    this.loadLogs();

    EventBus.$on("dateChange", () => {
      this.loadLogs();
    });
  },
  methods: {
    async deleteLog(id) {
      await api.log.deleteLog(id);
      this.loadLogs();
    },
    loadLogs() {
      let [fromDate, toDate] = Storage.getDates();
      this.fromDate = fromDate.toISOString().slice(0, 10);
      this.toDate = toDate.toISOString().slice(0, 10);
      api.log.getLogs(fromDate, toDate).then(logReturn => {
        this.logs = logReturn.logs;
        this.countTotal = logReturn.countTotal;
      });
    },
    async downloadGPX() {
      let [fromDate, toDate] = Storage.getDates();
      this.fromDate = fromDate.toISOString().slice(0, 10);
      this.toDate = toDate.toISOString().slice(0, 10);

      let logReturn = await api.log.getLocationsLogs(fromDate, toDate, LimitType.UNLIMITED);
      GPX.createFile(logReturn.logs);
    }
  }
};
</script>

<style lang="scss">
#feed {
  margin-top: 1em;
}
</style>
