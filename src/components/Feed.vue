<template>
    <div id="feed" class="container card">
        <div class="card-body">
            <h1 class="card-title" v-if="user">{{date}} feed for {{user.username}}
                <small v-show="logs">{{logs.length}} logs</small>
            </h1>
            <ul class="card-text">
                <div class="row" v-for="log in logs" :key='log.id'>
                    <div class="col-2">
                        <span class="badge badge">{{log.createdAtClient}}</span>
                    </div>
                    <div class="col-2">
                        <span class="badge badge-primary">{{log.key}}</span>
                    </div>
                    <div class="col-7">
                        {{log.data.getDesc()}}
                    </div>

                    <div class="col-1">
                        <button type="button" class="close" aria-label="Close" @click="deleteLog(log.id)">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
            </ul>
        </div>
    </div>
</template>


<script>
import api from "../apis/api";

export default {
  data() {
    return {
      date: "1970-01-18", //new Date().toISOString().slice(0, 10),
      logs: [],
      user: null
    };
  },
  created() {
    api.log.getLogs(this.date).then(logs => (this.logs = logs));
    api.user.getCurrentUser().then(user => (this.user = user));
  },
  methods: {
    async deleteLog(id) {
      await api.log.deleteLog(id);
      let logs = await api.log.getLogs(this.date);
      this.logs = logs;
    }
  }
};
</script>

<style lang="scss">
#feed {
  margin-top: 1em;
}
</style>
