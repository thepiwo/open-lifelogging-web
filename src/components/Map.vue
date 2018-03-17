<template>
    <div id="map"></div>
</template>

<script>
import api from "../apis/api";
import L from "leaflet";

export default {
  data() {
    return {
      date: "1970-01-18", //new Date().toISOString().slice(0, 10),
      logs: [],
      layers: [],
      icon: L.divIcon({
        iconSize: null,
        html: '<div class="icon"></div>'
      })
    };
  },
  async mounted() {
    this.map = L.map("map", { zoomControl: false }).setView([0, 0], 13);
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    await api.log.getLocationsLogs(this.date).then(logs => (this.logs = logs));
    this.drawLogsMap();
  },
  methods: {
    drawLogsMap() {
      let pointList = this.logs.map(log => {
        let point = new L.LatLng(log.data.latitude, log.data.longitude);
        this.layers.push(
          L.marker(point, { icon: this.icon }).bindPopup(
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
        this.map.fitBounds(group.getBounds());
      }
    },
    clearMap() {
      this.layers.forEach(layer => {
        this.map.removeLayer(layer);
      });
      this.layers = [];
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
    width: 8px;
    height: 8px;
    margin-top: -4px;
    margin-left: -4px;
  }
}
</style>
