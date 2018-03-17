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
