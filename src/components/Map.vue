<template>
  <div id="map"/>
</template>

<script>
  import api from "../apis/api";
  import L from "leaflet";
  import "mapbox-gl-leaflet";
  import "leaflet.markercluster"
  import {EventBus} from "../utils/event-bus";
  import Storage from "../utils/storage";
  import * as geolib from 'geolib';

  export default {
    data() {
      return {
        currentSelected: null,
        mapToken: process.env.VUE_APP_MAP_TOKEN,
        date: new Date().toISOString().slice(0, 10),
        logs: [],
        layers: [],
        dataIcon: L.divIcon({
          iconSize: null,
          html: '<div class="data-icon"></div>'
        }),
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
      EventBus.$on("toggleMarker", () => {
        this.drawLogsMap();
      });
      EventBus.$on("toggleMusic", () => {
        this.drawLogsMap();
      });
    },
    async mounted() {
      this.map = L.map("map", {zoomControl: false, maxZoom: 18}).setView([0, 0], 13);
      L.mapboxGL({
        attribution:
          '<a href="https://www.maptiler.com/license/maps/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
        accessToken: "not-needed",
        style: `https://api.maptiler.com/maps/3a221b59-0834-47e1-a21a-4c0e3488bb09/style.json?key=${
          this.mapToken
        }`
      }).addTo(this.map);

      this.initializeDeleteListeners();

      this.drawLogsMap();
    },
    methods: {
      findPoint(locationList, createdAtClient) {
        const laterLocationIndex = locationList.findIndex(log => new Date(log.createdAtClient).getTime() <= new Date(createdAtClient).getTime());
        const laterLocation = locationList[laterLocationIndex];
        const earlierLocation = locationList[laterLocationIndex - 1 >= 0 ? laterLocationIndex - 1 : 0];

        const laterEarlierDifference = new Date(earlierLocation.createdAtClient).getTime() - new Date(laterLocation.createdAtClient).getTime();
        const laterCreatedAtDifference = new Date(createdAtClient).getTime() - new Date(laterLocation.createdAtClient).getTime();
        const percentageDate = laterCreatedAtDifference / laterEarlierDifference;

        const distance = geolib.getDistance(earlierLocation.data, laterLocation.data);
        const direction = geolib.getRhumbLineBearing(earlierLocation.data, laterLocation.data);
        const destination = geolib.computeDestinationPoint(earlierLocation.data, distance * percentageDate, direction);

        if (destination.latitude && destination.longitude) return new L.LatLng(destination.latitude, destination.longitude);
      },
      async drawLogsMap(skipBoundFit = false) {
        this.clearMap();
        let [fromDate, toDate] = Storage.getDates();
        this.logs = (await api.log.getLogs(fromDate, toDate)).logs;

        let locationList = this.logs.filter(log => log.key === "CoordEntity");

        let pointList = locationList.map(log => {
          let point = new L.LatLng(log.data.latitude, log.data.longitude);
          if (Storage.getMarkerToggle()) {
            this.layers.push(L.marker(point, {icon: this.icon, log: log}).bindPopup(log.data.getMarker(log).content));
          }

          return point;
        });

        const markersCluster = L.markerClusterGroup({
          showCoverageOnHover: false, iconCreateFunction: function (cluster) {
            return L.divIcon({html: '<div class="cluster-icon">' + cluster.getChildCount() + '</div>'});
          }
        });
        if (Storage.getMusicToggle()) {
          this.logs.filter(log => log.key !== "CoordEntity").forEach(log => {
            try {
              const point = this.findPoint(locationList, log.createdAtClient);
              if (point) markersCluster.addLayer(L.marker(point, {icon: this.dataIcon}).bindTooltip(log.data.getDesc(), {
                permanent: true,
                className: "label",
                offset: [4, 4]
              }));
            } catch (e) {
              console.error(e)
            }
          });
        }

        if (pointList.length) {
          let polyLine = new L.Polyline(pointList.filter(x => x), {
            color: "#323232",
            weight: 1.5,
            opacity: 0.5,
            smoothFactor: 1
          });

          this.layers.push(polyLine);
          this.layers.push(markersCluster);
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
      async initializeDeleteListeners() {
        this.map.on("popupopen", event => {
          this.currentSelected = {log: event.popup._source.options.log};
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
              this.deleteLog(this.currentSelected.log.id).then(() =>
                this.drawLogsMap(true)
              );
            }
          }
        });
      },
      deleteLog(id) {
        return api.log.deleteLog(id);
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

    .label {
      border: none;
      background: none;
      box-shadow: none;

      &:before {
        display: none;
      }
    }

    .data-icon {
      background-color: red;
      width: 10px;
      border-radius: 10px;
      height: 10px;
    }

    .cluster-icon {
      border: 2px solid red;
      color: red;
      border-radius: 7px;
      width: 22px;
      height: 22px;
      text-align: center;
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
