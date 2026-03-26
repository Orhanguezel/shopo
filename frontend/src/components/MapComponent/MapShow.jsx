"use client";
import {
  GoogleMap,
  MarkerF,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useState, useEffect } from "react";

const containerStyle = {
  width: "100%",
  height: "400px",
};
const libraries = ["places"];

export default function MapShow({ mapKey, origin, destination }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: mapKey,
    libraries: libraries,
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const calculateRoute = async () => {
      if (!isLoaded) return;

      const directionsService = new window.google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(results);

      if (map) {
        const bounds = new window.google.maps.LatLngBounds();
        // Ensure both origin and destination are included in the bounds
        bounds.extend(
          typeof origin === "object"
            ? origin
            : results.routes[0].legs[0].start_location
        );
        bounds.extend(
          typeof destination === "object"
            ? destination
            : results.routes[0].legs[0].end_location
        );
        map.fitBounds(bounds);
      }
    };

    calculateRoute();
  }, [isLoaded, origin, destination, map]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={origin}
        zoom={7}
        onLoad={(mapInstance) => setMap(mapInstance)} // Set map instance on load
      >
        <MarkerF
          position={origin}
          icon={{
            url: "/assets/images/deliveryman_location_point.svg", // Fast delivery scooter icon
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />
        <MarkerF
          position={destination}
          icon={{
            url: "/assets/images/user_location_point.png", // Location pin icon
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />

        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{ suppressMarkers: true }}
          />
        )}
      </GoogleMap>
    </>
  );
}
