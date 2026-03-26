import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { useState, useCallback, useEffect, useRef } from "react";
import InputCom from "../Helpers/InputCom";

const containerStyle = {
  width: "100%",
  height: "400px",
};
const libraries = ["places"];
export default function MapComponent({
  searchEnabled,
  searchInputValue,
  searchInputHandler,
  searchInputError = false,
  mapKey,
  mapStatus,
  location,
  locationHandler,
}) {
  // == == == all references
  const inputRef = useRef(null);
  // == == == all state store
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [hasUserSelectedLocation, setHasUserSelectedLocation] = useState(false);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: mapKey, // Use environment variable for API key
    libraries: libraries,
  });
  // permission
  const getUserLocation = useCallback(() => {
    // Don't get user location if user has manually selected a location
    if (hasUserSelectedLocation) {
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (location) {
            setMarkerPosition(location);
            setMapCenter(location);
            getPlaceName(location.lat, location.lng);
          } else {
            const { latitude, longitude } = position.coords;
            setMarkerPosition({ lat: latitude, lng: longitude });
            setMapCenter({ lat: latitude, lng: longitude });
            locationHandler({
              lat: latitude,
              lng: longitude,
            });
            getPlaceName(latitude, longitude);
          }
        },
        (error) => {
          // Handle different types of geolocation errors
          let userMessage = "";
          let isUserChoice = false;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              userMessage =
                "Location access was not granted. You can manually select your location on the map below.";
              isUserChoice = true;
              break;
            case error.POSITION_UNAVAILABLE:
              userMessage =
                "Location information is currently unavailable. You can manually select your location on the map below.";
              break;
            case error.TIMEOUT:
              userMessage =
                "Location request timed out. You can manually select your location on the map below.";
              break;
            default:
              userMessage =
                "Unable to get your location. You can manually select your location on the map below.";
          }

          console.log("Location access:", {
            code: error.code,
            message: error.message,
            userMessage: userMessage,
            isUserChoice: isUserChoice,
          });

          // Store the message for UI display
          if (isUserChoice) {
            setLocationInfo(userMessage);
          } else {
            setLocationError(userMessage);
          }

          // Fallback to a default location
          setMapCenter({ lat: 37.7749, lng: -122.4194 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback to a default location (optional)
      setMapCenter({ lat: 37.7749, lng: -122.4194 });
    }
  }, [location, locationHandler, searchInputHandler]);

  // Initialize Google Places services - Only when map is enabled
  useEffect(() => {
    if (isLoaded && window.google && mapStatus === 1) {
      // Modern Google Maps API doesn't require service initialization
      // The AutocompleteSuggestion and Place APIs are available globally
      console.log("Google Maps API loaded successfully");
    }
  }, [isLoaded, mapStatus]);

  // == == == methods
  const getPlaceName = useCallback(
    (lat, lng) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const placeName = results[0].formatted_address;
          searchInputHandler(placeName);
        } else {
          console.error("Geocoder failed due to: " + status);
        }
      });
    },
    [searchInputHandler]
  );
  const getPlacePredictions = useCallback(async (input) => {
    if (!input.trim()) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      // Check if modern API is available
      if (
        window.google?.maps?.places?.AutocompleteSuggestion
          ?.findAutocompletePredictions
      ) {
        // Use the modern AutocompleteSuggestion API
        const suggestions =
          await window.google.maps.places.AutocompleteSuggestion.findAutocompletePredictions(
            {
              input: input,
              componentRestrictions: { country: [] },
              types: ["geocode", "establishment"],
            }
          );

        if (suggestions && suggestions.length > 0) {
          setPredictions(suggestions);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      } else {
        // Fallback to currently available AutocompleteService
        const autocompleteService =
          new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: input,
            componentRestrictions: { country: [] },
            types: ["geocode", "establishment"],
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setPredictions(predictions);
              setShowPredictions(true);
            } else {
              setPredictions([]);
              setShowPredictions(false);
            }
          }
        );
      }
    } catch (error) {
      console.error("Error getting place predictions:", error);
      setPredictions([]);
      setShowPredictions(false);
    }
  }, []);

  const selectPlace = useCallback(
    async (placeId) => {
      try {
        // Check if modern API is available
        if (window.google?.maps?.places?.Place?.findByPlaceId) {
          // Use the modern Place API
          const place = await window.google.maps.places.Place.findByPlaceId(
            placeId
          );

          if (place && place.geometry && place.geometry.location) {
            const location = place.geometry.location;
            const lat = location.lat;
            const lng = location.lng;

            console.log("Place selected (modern API):", {
              lat,
              lng,
              place: place.formattedAddress,
            });

            setMapCenter({ lat, lng });
            setMarkerPosition({ lat, lng });
            locationHandler({ lat, lng });
            setHasUserSelectedLocation(true); // Mark that user has selected a location

            if (mapStatus) {
              searchInputHandler(place.formattedAddress || place.name);
            }

            setPredictions([]);
            setShowPredictions(false);
          }
        } else {
          // Fallback to currently available PlacesService
          const placesService = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );

          placesService.getDetails(
            {
              placeId: placeId,
              fields: ["geometry", "formatted_address", "name"],
            },
            (place, status) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                place
              ) {
                const location = place.geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                console.log("Place selected (legacy API):", {
                  lat,
                  lng,
                  place: place.formatted_address,
                });

                setMapCenter({ lat, lng });
                setMarkerPosition({ lat, lng });
                locationHandler({ lat, lng });
                setHasUserSelectedLocation(true); // Mark that user has selected a location

                if (mapStatus) {
                  searchInputHandler(place.formatted_address || place.name);
                }

                setPredictions([]);
                setShowPredictions(false);
              } else {
                // Final fallback: use prediction data directly
                const prediction = predictions.find(
                  (p) => p.place_id === placeId
                );
                if (prediction) {
                  searchInputHandler(prediction.description);
                  setPredictions([]);
                  setShowPredictions(false);
                }
              }
            }
          );
        }
      } catch (error) {
        console.error("Error getting place details:", error);
        // Fallback: try to use the prediction data directly
        const prediction = predictions.find((p) => p.place_id === placeId);
        if (prediction) {
          searchInputHandler(prediction.description);
          setPredictions([]);
          setShowPredictions(false);
        }
      }
    },
    [locationHandler, mapStatus, searchInputHandler, predictions]
  );

  const onMapClick = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({
        lat: lat,
        lng: lng,
      });
      locationHandler({
        lat: lat,
        lng: lng,
      });
      setHasUserSelectedLocation(true); // Mark that user has selected a location
      getPlaceName(lat, lng);
    },
    [locationHandler, getPlaceName]
  );

  // Handler when the marker is dragged to a new location
  const onMarkerDragEnd = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({
        lat: lat,
        lng: lng,
      });
      locationHandler({
        lat: lat,
        lng: lng,
      });
      setHasUserSelectedLocation(true); // Mark that user has selected a location
      getPlaceName(lat, lng);
    },
    [locationHandler, getPlaceName]
  );

  // == == == effects
  useEffect(() => {
    // Get user's location when the component mounts - Only when map is enabled
    if (isLoaded && mapStatus === 1) {
      getUserLocation();
    }
  }, [isLoaded, getUserLocation, mapStatus]);

  // Debug effect to monitor map center changes
  useEffect(() => {
    if (mapCenter) {
      console.log("Map center updated:", mapCenter);
    }
  }, [mapCenter]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      {locationError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-yellow-800">{locationError}</span>
          </div>
          <button
            onClick={() => {
              setLocationError(null);
              setHasUserSelectedLocation(false); // Reset user selection flag
              getUserLocation();
            }}
            className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900"
          >
            Try again
          </button>
        </div>
      )}

      {locationInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-blue-800">{locationInfo}</span>
          </div>
        </div>
      )}
      {searchEnabled && mapStatus === 1 ? (
        <div className="relative">
          {/* Search Input for Places Autocomplete - Only when map is enabled */}
          <div>
            <InputCom
              ref={inputRef}
              value={searchInputValue}
              inputHandler={(e) => {
                const value = e.target.value;
                searchInputHandler(value);
                getPlacePredictions(value);
              }}
              onFocus={() => {
                if (predictions.length > 0) {
                  setShowPredictions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding predictions to allow clicking on them
                setTimeout(() => setShowPredictions(false), 200);
              }}
              label="Address"
              placeholder="Your Address here"
              inputClasses="w-full h-[50px]"
              error={searchInputError}
            />
            {searchInputError ? (
              <span className="text-sm mt-1 text-qred">{searchInputError}</span>
            ) : (
              ""
            )}
          </div>

          {/* Predictions Dropdown */}
          {showPredictions && predictions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => {
                    selectPlace(prediction.place_id);
                    searchInputHandler(prediction.description);
                  }}
                >
                  <div className="text-sm text-gray-900">
                    {prediction.structured_formatting?.main_text ||
                      prediction.description}
                  </div>
                  {prediction.structured_formatting?.secondary_text && (
                    <div className="text-xs text-gray-500">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <InputCom
            value={searchInputValue}
            inputHandler={(e) => searchInputHandler(e.target.value)}
            label="Address"
            placeholder="Your Address here"
            inputClasses="w-full h-[50px]"
            error={searchInputError}
          />
          {searchInputError ? (
            <span className="text-sm mt-1 text-qred">{searchInputError}</span>
          ) : (
            ""
          )}
        </div>
      )}

      {mapStatus === 1 && mapCenter && (
        <GoogleMap
          key={`${mapCenter.lat}-${mapCenter.lng}`}
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={12}
          onClick={onMapClick} // Set marker on map click
        >
          {markerPosition && (
            <MarkerF
              position={markerPosition}
              draggable={true} // Make the marker draggable
              onDragEnd={onMarkerDragEnd}
            />
          )}
          {/* Add more markers or functionality as needed */}
        </GoogleMap>
      )}
    </div>
  );
}
