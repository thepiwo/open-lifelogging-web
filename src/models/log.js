import LogReturn from "./log-return";

export default class Log {
  constructor(opts) {
    this.id = opts.id;
    this.userId = opts.userId;
    this.key = opts.key;
    this.hash = opts.hash;
    this.data = this.getDataClass(opts.key, opts.data);
    this.createdAt = opts.createdAt;
    this.createdAtClient = opts.createdAtClient;
  }

  getDataClass(key, data) {
    switch (key) {
      case "CoordEntity":
        return new LogLocation(data);
      case "WifiEntity":
        return new LogWifi(data);
      case "LastFMSong":
        return new LogLastFm(data);
    }
  }

  static mapLogs(promise) {
    return promise.then(logReturn => new LogReturn(logReturn));
  }
}

export class LogLastFm {
  constructor(opts) {
    this.name = opts.name;
    this.artist = opts.artist;
    this.album = opts.album;
  }

  getDesc() {
    return `Song: ${this.name} - ${this.artist["#text"]}`;
  }
}

export class LogWifi {
  constructor(opts) {
    this.ssid = opts.ssid;
    this.speed = opts.speed;
    this.status = opts.status;
  }

  getDesc() {
    return `SSID: ${this.ssid} - ${this.status}`;
  }
}

export class LogLocation {
  constructor(opts) {
    this.accuracy = opts.accuracy;
    this.altitude = opts.altitude;
    this.latitude = opts.latitude;
    this.longitude = opts.longitude;
  }

  getDesc() {
    return `Location: ${this.latitude}, ${this.longitude}`;
  }

  getMarker(log) {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      content: `${log.createdAtClient}<br/>
                  Accuracy: ${this.accuracy}m<br/>
                  Altitude: ${this.altitude}m<br/>`
    };
  }
}
