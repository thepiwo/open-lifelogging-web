export default {
  setDates(fromDate, toDate) {
    localStorage.setItem("fromDate", fromDate.getTime());
    localStorage.setItem("toDate", toDate.getTime());
  },

  getDates() {
    let fromDate = localStorage.getItem("fromDate");
    let toDate = localStorage.getItem("toDate");

    if (!fromDate || !toDate) {
      return [new Date(), new Date()];
    } else {
      return [new Date(Number(fromDate)), new Date(Number(toDate))];
    }
  },

  setUnit(unit) {
    localStorage.setItem("unit", unit);
  },

  setMarkerToggle(setting) {
    localStorage.setItem("toggleMarker", setting);
  },

  setMusicToggle(setting) {
    localStorage.setItem("toggleMusic", setting);
  },

  getUnit() {
    return localStorage.getItem("unit")
  },

  getMarkerToggle() {
    return localStorage.getItem("toggleMarker") === "true";
  },

  getMusicToggle() {
    return localStorage.getItem("toggleMusic") === "true";
  },

  setApiUrl(apiUrl) {
    localStorage.setItem("apiUrl", apiUrl);
  },

  setToken(token) {
    localStorage.setItem("token", token);
  },

  getApiUrl() {
    return localStorage.getItem("apiUrl");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  hasLogin() {
    return this.getApiUrl() && this.getToken();
  }
};
