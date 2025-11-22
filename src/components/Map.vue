<template>
  <div id="map" />
</template>

<script>
  import api from "../apis/api";
  import mapboxgl from 'mapbox-gl'
  import 'mapbox-gl/dist/mapbox-gl.css'
  import {EventBus} from "@/utils/event-bus";
  import Storage from "../utils/storage";
  import * as geolib from 'geolib';

  // Access tokens

  mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN

  export default {
    data() {
      return {
        currentSelected: null,
        logs: [],
        map: null,
        // internal flags to avoid re-adding layers and event handlers
        handlersBound: false,
        initialized: false,
        // ensure we fit to the full route once after the first render
        hasFitOnce: false,
        redrawTimer: null,
        lastRangeKey: '',
        logsCache: {},
        // caches for performance
        fullPointFeatures: [],
        fullRouteCoords: [],
        // viewport-based rendering knobs
        // Slightly less aggressive thinning/simplification per user feedback
        // Smaller grid cells keep more regular markers visible
        gridCellSizePx: 12,
        // Lower base tolerance preserves more route detail
        lineToleranceBasePx: 1.25
      };
    },
    created() {
      const onDate = () => this.scheduleRedraw('date-change');
      const onToggle = () => this.scheduleRedraw('toggle');
      EventBus.on("date-change", onDate);
      EventBus.on("toggle-marker", onToggle);
      EventBus.on("toggle-music", onToggle);
    },
    async mounted() {
      this.map = new mapboxgl.Map({
        container: 'map',
        style: this.getStyleUrl(),
        center: [0, 0],
        zoom: 2
      });

      this.map.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'top-right')

      this.map.on('load', async () => {
        this.initialized = true;
        await this.drawLogsMap();
        // Update viewport-thinned datasets when zoom/pan settles
        this.map.on('moveend', () => this.updateViewportDerivedData());
      })

      this.initializeDeleteListeners();
    },
    methods: {
      getStyleUrl() {
        // Prefer MapTiler look (closer to classic OSM/Leaflet look) if token provided
        const mapTilerToken = process.env.VUE_APP_MAPTILER_TOKEN;
        const envStyle = process.env.VUE_APP_MAP_STYLE_URL;
        if (envStyle) return envStyle;
        if (mapTilerToken) {
          // Streets vector style
          return `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerToken}`;
        }
        // Fallback to Mapbox streets
        return 'mapbox://styles/mapbox/streets-v12';
      },
      scheduleRedraw(reason = 'toggle') {
        if (!this.initialized) return;
        if (this.redrawTimer) clearTimeout(this.redrawTimer);
        this.redrawTimer = setTimeout(() => {
          this.drawLogsMap({ reason });
        }, 150);
      },
      findPoint(locationList, createdAtClient) {
        // Interpolate between two nearest location samples for the given timestamp.
        // Assumes locationList is sorted DESC by createdAtClient (newest first).
        if (!locationList || locationList.length < 2) return null;
        const target = new Date(createdAtClient).getTime();

        // Binary search for the first index whose time <= target (the "later" point)
        let lo = 0, hi = locationList.length - 1, ans = -1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const t = new Date(locationList[mid].createdAtClient).getTime();
          if (t <= target) { ans = mid; hi = mid - 1; } else { lo = mid + 1; }
        }
        if (ans <= 0) return null;

        const later = locationList[ans];
        const earlier = locationList[ans - 1];
        if (!earlier || !later) return null;

        const tEarlier = new Date(earlier.createdAtClient).getTime();
        const tLater = new Date(later.createdAtClient).getTime();
        const tTotal = tEarlier - tLater;
        if (tTotal <= 0) return null;
        const tPart = target - tLater;
        const ratio = Math.max(0, Math.min(1, tPart / tTotal));

        const distance = geolib.getDistance(earlier.data, later.data);
        const bearing = geolib.getRhumbLineBearing(earlier.data, later.data);
        const dest = geolib.computeDestinationPoint(earlier.data, distance * ratio, bearing);
        return (dest && dest.latitude != null && dest.longitude != null) ? [dest.longitude, dest.latitude] : null;
      },
      ensureLayer(id, def) {
        if (!this.map.getLayer(id)) {
          this.map.addLayer(def);
        }
      },
      ensureSource(id, def) {
        if (!this.map.getSource(id)) {
          this.map.addSource(id, def);
        }
      },
      setGeoJSON(id, featureCollection) {
        const source = this.map.getSource(id);
        if (source) {
          source.setData(featureCollection);
        }
      },
      // --- Viewport-based thinning & simplification ---
      // Douglas–Peucker simplification on projected (pixel) coordinates for smoothness
      simplifyLineProjected(coords, tolerancePx) {
        if (!coords || coords.length <= 2) return coords || [];
        const map = this.map;
        const pts = coords.map(c => ({ c, p: map.project({ lng: c[0], lat: c[1] }) }));

        const sqTol = tolerancePx * tolerancePx;

        function getSqSegDist(p, p1, p2) {
          let x = p1.x;
          let y = p1.y;
          let dx = p2.x - x;
          let dy = p2.y - y;
          if (dx !== 0 || dy !== 0) {
            const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) { x = p2.x; y = p2.y; }
            else if (t > 0) { x += dx * t; y += dy * t; }
          }
          dx = p.x - x; dy = p.y - y;
          return dx * dx + dy * dy;
        }

        function dp(points, first, last, out) {
          let maxDist = 0, index = 0;
          for (let i = first + 1; i < last; i++) {
            const dist = getSqSegDist(points[i].p, points[first].p, points[last].p);
            if (dist > maxDist) { index = i; maxDist = dist; }
          }
          if (maxDist > sqTol) {
            if (index - first > 1) dp(points, first, index, out);
            out.push(points[index]);
            if (last - index > 1) dp(points, index, last, out);
          }
        }

        const out = [pts[0]];
        dp(pts, 0, pts.length - 1, out);
        out.push(pts[pts.length - 1]);
        // return original lon/lat order preserved
        return out.map(o => o.c);
      },
      // Thin points by screen-space grid; keep first per cell for stability
      thinPointsByGrid(features, cellPx) {
        if (!features || features.length === 0) return [];
        const map = this.map;
        const seen = new Set();
        const kept = [];
        for (let i = 0; i < features.length; i++) {
          const f = features[i];
          const [lng, lat] = f.geometry.coordinates;
          const p = map.project({ lng, lat });
          const key = `${Math.floor(p.x / cellPx)},${Math.floor(p.y / cellPx)}`;
          if (!seen.has(key)) {
            seen.add(key);
            kept.push(f);
          }
        }
        return kept;
      },
      updateViewportDerivedData() {
        if (!this.map) return;
        // Decide line tolerance relative to zoom so it adapts smoothly
        const z = this.map.getZoom();
        // More simplification at low zoom, less at high zoom
        // Make it less aggressive overall: multipliers 2 / 1.5 / 1 (was 3 / 2 / 1)
        // Also allow a slightly lower minimum tolerance for high-zoom fidelity
        const tol = Math.max(0.75, this.lineToleranceBasePx * (z < 8 ? 2 : z < 11 ? 1.5 : 1));

        // Regular points: viewport thinning (no clustering)
        if (this.fullPointFeatures && this.fullPointFeatures.length) {
          const thinned = this.thinPointsByGrid(this.fullPointFeatures, this.gridCellSizePx);
          const src = this.map.getSource('points');
          if (src) src.setData({ type: 'FeatureCollection', features: thinned });
        }

        // Route simplification using DP on projected space
        if (this.fullRouteCoords && this.fullRouteCoords.length) {
          const simplified = this.simplifyLineProjected(this.fullRouteCoords, tol);
          const src = this.map.getSource('route');
          if (src) src.setData({
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: simplified } }]
          });
        }
      },
      bindOneTimeHandlers() {
        if (this.handlersBound) return;
        // Popup on regular marker point click
        this.map.on('click', 'marker-points', (e) => {
          const feature = e.features[0]
          new mapboxgl.Popup({ offset: 12 })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(feature.properties.popup)
            .addTo(this.map)
        })
        // Music cluster click: smart zoom — try fit bounds of cluster leaves; fallback to expansion zoom
        this.map.on('click', 'music-cluster-layer', (e) => {
          const features = this.map.queryRenderedFeatures(e.point, { layers: ['music-cluster-layer'] })
          if (!features.length) return;
          const clusterId = features[0].properties.cluster_id
          const source = this.map.getSource('music')
          // Try to compute bounds from leaves for nicer zooming
          source.getClusterLeaves(clusterId, 1000, 0, (err, leaves) => {
            if (!err && leaves && leaves.length) {
              const bounds = leaves.reduce((b, f) => b.extend(f.geometry.coordinates), new mapboxgl.LngLatBounds(leaves[0].geometry.coordinates, leaves[0].geometry.coordinates))
              this.map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 300 })
            } else {
              source.getClusterExpansionZoom(clusterId, (err2, zoom) => {
                if (err2) return
                this.map.easeTo({ center: features[0].geometry.coordinates, zoom })
              })
            }
          })
        })
        this.handlersBound = true;
      },
      async drawLogsMap({ reason } = { reason: 'toggle' }) {
        if (!this.map || !this.map.isStyleLoaded()) return;
        let [fromDate, toDate] = Storage.getDates();
        const rangeKey = `${+fromDate}-${+toDate}`;
        if (this.lastRangeKey !== rangeKey) {
          this.logs = (await api.log.getLogs(fromDate, toDate)).logs;
          this.logsCache[rangeKey] = this.logs;
          this.lastRangeKey = rangeKey;
        } else {
          this.logs = this.logsCache[rangeKey] || [];
        }

        const locationList = this.logs.filter(log => log.key === 'CoordEntity');
        const coords = locationList.map(l => [l.data.longitude, l.data.latitude]).filter(p => p[0] != null && p[1] != null)

        // Add route line
        if (coords.length > 1) {
          this.ensureSource('route', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
          })
          // cache full route and let viewport-based updater set appropriate simplification
          this.fullRouteCoords = coords;
          // initialize with a simplified dataset based on current viewport
          this.updateViewportDerivedData();
          this.ensureLayer('route-line', {
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#1a73e8', 'line-width': 3, 'line-opacity': 0.6 }
          })
        }

        // Regular markers without clustering (only if markers toggle is on)
        const pointFeatures = locationList.map(l => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [l.data.longitude, l.data.latitude] },
            properties: {
              id: l.id,
              popup: l.data.getMarker(l).content
            }
          }))

        if (Storage.getMarkerToggle() && pointFeatures.length) {
          this.ensureSource('points', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
            // no clustering for regular markers
          })
          // cache full points and let viewport-based updater thin points
          this.fullPointFeatures = pointFeatures;
          this.updateViewportDerivedData();

          this.ensureLayer('marker-points', {
            id: 'marker-points',
            type: 'circle',
            source: 'points',
            paint: {
              'circle-radius': 4,
              'circle-color': '#202124',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1
            }
          })

          this.bindOneTimeHandlers();
        } else {
          // If markers disabled, clear data if source exists to reduce draw load
          const src = this.map.getSource('points');
          if (src) src.setData({ type: 'FeatureCollection', features: [] })
          this.fullPointFeatures = [];
        }

        // Music/data labels — cluster music only
        if (Storage.getMusicToggle() && coords.length > 1) {
          const musicFeatures = this.logs.filter(l => l.key !== 'CoordEntity')
            .map(l => {
              const p = this.findPoint(locationList, l.createdAtClient)
              if (!p) return null
              return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: p },
                properties: { desc: l.data.getDesc() }
              }
            }).filter(Boolean)

          this.ensureSource('music', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
            cluster: true,
            clusterRadius: 60,
            clusterMaxZoom: 14
          })
          this.setGeoJSON('music', { type: 'FeatureCollection', features: musicFeatures })

          // Music clusters (circles)
          this.ensureLayer('music-cluster-layer', {
            id: 'music-cluster-layer',
            type: 'circle',
            source: 'music',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step', ['get', 'point_count'],
                '#f8b4b4', 10, '#f98080', 50, '#e02424'
              ],
              'circle-radius': [
                'step', ['get', 'point_count'],
                12, 10, 16, 50, 22
              ],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2
            }
          })

          // Music cluster counts
          this.ensureLayer('music-cluster-count', {
            id: 'music-cluster-count',
            type: 'symbol',
            source: 'music',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': ['get','point_count'],
              'text-size': 12
            },
            paint: { 'text-color': '#ffffff' }
          })

          // Unclustered music points (visible wider zoom)
          this.ensureLayer('music-points', {
            id: 'music-points',
            type: 'circle',
            source: 'music',
            filter: ['!', ['has', 'point_count']],
            minzoom: 3,
            paint: { 'circle-radius': 5, 'circle-color': '#d93025' }
          })
          this.ensureLayer('music-labels', {
            id: 'music-labels',
            type: 'symbol',
            source: 'music',
            filter: ['!', ['has', 'point_count']],
            minzoom: 5,
            layout: {
              'text-field': ['get','desc'],
              'text-size': 12,
              'text-offset': [0.6, 0.6],
              'text-anchor': 'top-left',
              'text-allow-overlap': false
            },
            paint: { 'text-color': '#d93025' }
          })
        }
        else {
          const src = this.map.getSource('music');
          if (src) src.setData({ type: 'FeatureCollection', features: [] })
        }

        // Fit bounds
        // 1) Always fit once on initial render if we have a route (fixes: "zooming to fit the line on load")
        // 2) Also fit on explicit date changes (user actions)
        if (((!this.hasFitOnce && coords.length > 1) || reason === 'date-change') && coords.length) {
          const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]))
          this.map.fitBounds(bounds, { padding: 40, maxZoom: 16, duration: 0 })
          this.hasFitOnce = true;
        }
      },
      async initializeDeleteListeners() {
        // Keep keyboard delete shortcut by tracking last clicked feature popup
        let lastFeature = null
        this.map.on('click', 'marker-points', (e) => {
          lastFeature = e.features[0]
        })
        window.addEventListener('keyup', async (event) => {
          if (event.code === 'Delete' && lastFeature && lastFeature.properties && lastFeature.properties.id) {
            const id = lastFeature.properties.id
            if (confirm(`Delete Log ${id}?`)) {
              await this.deleteLog(id)
              await this.drawLogsMap()
            }
          }
        })
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
  }
</style>
