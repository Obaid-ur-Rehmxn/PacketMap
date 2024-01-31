import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Loader from "./Loader";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [allMarkers, setAllMarkers] = useState([]);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setAllMarkers([
            {
              id: 1,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              text: "Current Location",
            },
          ]);
        });
      }
      const res = await fetch("http://192.168.18.101:5000/capture", {
        method: "GET",
        "Access-Control-Allow-Origin": "*",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setData(data);
      let markers = [];
      let id = 2;
      data.forEach((item) => {
        if (!item.src_location.includes("Location information not available")) {
          let booleanExisting = markers.some(
            (marker) => marker.text === item.src_ip
          );
          if (!booleanExisting) {
            let lat = item.src_location.split(",")[0];
            let lng = item.src_location.split(",")[1];
            let latitude = parseFloat(lat.split(":")[1].trim());
            let longitude = parseFloat(lng.split(":")[1].trim());
            markers.push({
              id: id++,
              lat: latitude,
              lng: longitude,
              text: item.src_ip,
            });
          }
        }
        if (!item.dst_location.includes("Location information not available")) {
          let booleanExisting = markers.some(
            (marker) => marker.text === item.dst_ip
          );
          if (!booleanExisting) {
            let lat = item.dst_location.split(",")[0];
            let lng = item.dst_location.split(",")[1];
            let latitude = parseFloat(lat.split(":")[1].trim());
            let longitude = parseFloat(lng.split(":")[1].trim());
            markers.push({
              id: id++,
              lat: latitude,
              lng: longitude,
              text: item.dst_ip,
            });
          }
        }
      });
      setAllMarkers((prev) => [...prev, ...markers]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="container" style={{ display: loading ? "none" : "flex" }}>
        <div className="button-container">
          <p>Click to capture packets and trace their location</p>
          <button
            className="button"
            onClick={() => {
              if (running) {
                setRunning(false);
                setData([]);
                setAllMarkers([]);
                setCenter({ lat: 0, lng: 0 });
              } else {
                setRunning(true);
                fetchData();
              }
            }}
          >
            {running ? "Reset" : "Capture"}
          </button>
        </div>

        <div className="map-container">
          <div className="table">
            <table className="styled-table" id="table">
              <thead>
                <tr>
                  <th style={{ width: "15%" }}>S.No</th>
                  <th style={{ width: "35%" }}>Time</th>
                  <th style={{ width: "25%" }}>Source IP</th>
                  <th style={{ width: "25%" }}>Destination IP</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.timestamp}</td>
                    <td>{item.src_ip}</td>
                    <td>{item.dst_ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="map">
            <LoadScript
              loadingElement={"Loading"}
              googleMapsApiKey="AIzaSyBoGaJqLrhneEtKHSJof3-O4IcccpnK1bM"
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={2}
                center={center}
              >
                {allMarkers.map((marker) => (
                  <Marker
                    key={marker.id}
                    position={{
                      lat: marker.lat,
                      lng: marker.lng,
                    }}
                    title={marker.text}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
