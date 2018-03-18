import FileSaver from "file-saver";

export default {
  createFile(logs) {
    let header = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?><gpx xmlns="http://www.topografix.com/GPX/1/1" creator="MapSource 6.15.5" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"><trk>\n`;
    let name = "<name>Location Logs</name><trkseg>\n";
    let segments = logs.reverse().map(log => {
      var ele = "";
      if (log.data.altitude) {
        ele = `<ele>${log.data.altitude}</ele>`;
      }
      let date = new Date(log.createdAtClient).toISOString();
      return `<trkpt lat="${log.data.latitude}" lon="${
        log.data.longitude
      }"><time>${date}</time>${ele}</trkpt>\n`;
    });
    let footer = "</trkseg></trk></gpx>";

    let gpx = header + name + segments.join("") + footer;

    let blob = new Blob([gpx], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "logs.gpx");
  }
};
