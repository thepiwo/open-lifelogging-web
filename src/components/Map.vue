<template>
  <div id="map"/>
</template>

<script>
import api from "../apis/api";
import L from "leaflet";
import "mapbox-gl-leaflet";
import { EventBus } from "../utils/event-bus";
import Storage from "../utils/storage";

export default {
  data() {
    return {
      currentSelected: null,
      mapToken: process.env.VUE_APP_MAP_TOKEN,
      date: new Date().toISOString().slice(0, 10),
      logs: [],
      layers: [],
      icon: L.divIcon({
        iconSize: null,
        html: '<div class="icon"></div>'
      })
    };
  },
  created() {
    EventBus.$on("dateChange", () => {
      this.drawLogsMap();
    });
  },
  async mounted() {
    this.map = L.map("map", { zoomControl: false }).setView([0, 0], 13);
    L.mapboxGL({
      attribution:
        '<a href="https://www.maptiler.com/license/maps/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
      accessToken: "not-needed",
      style: `https://maps.tilehosting.com/styles/basic/style.json?key=${
        this.mapToken
      }`
    }).addTo(this.map);

    this.initializeDeleteListeners();

    this.drawLogsMap();
  },
  methods: {
    async drawLogsMap(skipBoundFit = false) {
      this.clearMap();
      let [fromDate, toDate] = Storage.getDates();
      this.logs = await api.log.getLocationsLogs(fromDate, toDate);

      let pointList = this.logs.map(log => {
        let point = new L.LatLng(log.data.latitude, log.data.longitude);
        this.layers.push(
          L.marker(point, { icon: this.icon, log: log }).bindPopup(
            log.data.getMarker(log).content
          )
        );
        return point;
      });

      if (pointList.length) {
        let polyLine = new L.Polyline(pointList, {
          color: "#323232",
          weight: 2,
          opacity: 1,
          smoothFactor: 1
        });

        this.layers.push(polyLine);
        this.layers.forEach(layer => {
          layer.addTo(this.map);
        });

        let group = new L.featureGroup(this.layers);
        if (!skipBoundFit) this.map.fitBounds(group.getBounds());
      }
    },
    clearMap() {
      this.layers.forEach(layer => {
        this.map.removeLayer(layer);
      });
      this.layers = [];
    },
    initializeDeleteListeners() {
      this.map.on("popupopen", event => {
        this.currentSelected = { log: event.popup._source.options.log };
      });

      this.map.on("popupclose", () => (this.currentSelected = null));

      window.addEventListener("keyup", event => {
        if (event.code === "Delete" && this.currentSelected != null) {
          if (
            confirm(
              `Delete Log ${this.currentSelected.log.id} from ${
                this.currentSelected.log.createdAtClient
              }?`
            )
          ) {
            this.deleteLog(this.currentSelected.log.id);
            this.drawLogsMap(true);
          }
        }
      });
    },
    async deleteLog(id) {
      await api.log.deleteLog(id);
      this.logs = await api.log.getLogs(this.date);
    }
  }
};
</script>

<style lang="scss">
#map {
  height: calc(100vh - 56px);
  width: 100%;

  .leaflet-div-icon {
    background: none;
    border: 0;
  }

  .icon {
    background-color: #323232;
    border-radius: 50%;
    width: 6px;
    height: 6px;
    margin-top: -3px;
    margin-left: -3px;
  }
}
</style>
