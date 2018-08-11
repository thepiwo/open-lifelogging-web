<template>
  <div 
    id="feed" 
    class="container card">
    <div class="card-body">
      <h1 
        v-if="user" 
        class="card-title">{{ fromDate }} to {{ toDate }} feed for {{ user.username }}
        <small v-show="logs">{{ logs.length }} logs</small>
      </h1>
      <ul class="card-text">
        <div 
          v-for="log in logs" 
          :key="log.id" 
          class="row">
          <div class="col-2">
            <span class="badge badge">{{ log.createdAtClient }}</span>
          </div>
          <div class="col-2">
            <span class="badge badge-primary">{{ log.key }}</span>
          </div>
          <div class="col-7">
            {{ log.data.getDesc() }}
          </div>

          <div class="col-1">
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

export default {
  data() {
    return {
      fromDate: "",
      toDate: "",
      logs: [],
      user: null
    };
  },
  created() {
    let [fromDate, toDate] = Storage.getDates();
    this.fromDate = fromDate;
    this.toDate = toDate;

    api.user.getCurrentUser().then(user => (this.user = user));
    this.dateChange();

    EventBus.$on("dateChange", () => {
      this.dateChange();
    });
  },
  methods: {
    async deleteLog(id) {
      await api.log.deleteLog(id);
      this.logs = await api.log.getLogs(this.date);
    },
    dateChange() {
      let [fromDate, toDate] = Storage.getDates();
      this.fromDate = fromDate.toISOString().slice(0, 10);
      this.toDate = toDate.toISOString().slice(0, 10);
      api.log.getLogs(fromDate, toDate).then(logs => (this.logs = logs));
    },
    async downloadGPX() {
      let [fromDate, toDate] = Storage.getDates();
      this.fromDate = fromDate.toISOString().slice(0, 10);
      this.toDate = toDate.toISOString().slice(0, 10);

      let logs = await api.log.getLocationsLogs(fromDate, toDate, true);
      GPX.createFile(logs);
    }
  }
};
</script>

<style lang="scss">
#feed {
  margin-top: 1em;
}
</style>
