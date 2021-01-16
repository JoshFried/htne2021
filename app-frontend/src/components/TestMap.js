import React, {useEffect, useState, useCallback} from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import { formatRelative } from "date-fns";

import "@reach/combobox/styles.css";
import axios from 'axios'
import config from'../Utils/config'
import RedirectButton from './RedirectButton';
const libraries = ["places"];
const mapContainerStyle = {
  height: "70vh",
  width: "100vw",
};
const options = {
  disableDefaultUI: true,
  zoomControl: true,
};
const center = {
  lat: 0,
  lng: 0,
};

function TestMap() {
    const [latitude,setLatitude] = useState(0)
    const [longitude,setLongitude] = useState(0)
    const [data,setData] = useState([])
    const [infoOpen, setInfoOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState("ChIJfa5skuXNQIYRqmKStrxzUw0");
    const [markerMap, setMarkerMap] = useState({});
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.MAPS_API_KEY,
    libraries,
  });
  useEffect(() => {
      console.log("heysdfsdfs")
      axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?input=homeless%20shelter&keyword=homeless%20shelter&inputtype=textquery&fields=photos,geometry,formatted_address,name,photos,opening_hours,rating,formatted_phone_number,website&&radius=100000&location=${latitude},${longitude}&key=${config.MAPS_API_KEY}`,{})
            .then((response) => {
                setData(response.data.results)
                console.log(data)
            }).catch((err) => {
                console.log(err)           
            }) 
         
    },[latitude,longitude])
  const [selected, setSelected] = useState(null);
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    console.log(lat,lng,"lattt")
    setLatitude(lat)
    setLongitude(lng)
    console.log(typeof lat,lng,"coords")
    mapRef.current.setZoom(14);
  }, []);
  // We have to create a mapping of our places to actual Marker objects
    const markerLoadHandler = (marker, shelter) => {
    return setMarkerMap(prevState => {
      return { ...prevState, [shelter.place_id]: marker };
    });
  };

  const markerClickHandler = (event, shelter) => {
    // Remember which place was clicked
    setSelectedPlace(shelter);
    console.log(selectedPlace, "selectedPlace")

    // Required so clicking a 2nd marker works as expected
    if (infoOpen) {
      setInfoOpen(false);
    }
      setInfoOpen(true);


    // If you want to zoom in a little on marker click

    // if you want to center the selected Marker
    //setCenter(place.pos)
  };
  
   
  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div>
      <h1>
      </h1>

      <Search panTo={panTo} />
      <Locate panTo={panTo} />
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onLoad={onMapLoad}  >
         {data.map((shelter) => (
            <Marker
               class = "unverified"
               key={shelter.place_id}
               position={shelter.geometry.location}
               onClick={event => markerClickHandler(event, shelter)}
              />
    ))}
    {infoOpen && selectedPlace && 
    (
        <InfoWindow
            position = {selectedPlace.geometry.location}
            onCloseClick={() => setInfoOpen(false)}
        >
        <div>
            <h1>{selectedPlace.business_status}</h1>
            <RedirectButton link = {`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${selectedPlace.place_id}`}/>
            <div>{selectedPlace.name}</div>
            <div>{selectedPlace.vicinity}</div>
            {selectedPlace.opening_hours && 
            <div>Open: {selectedPlace.open_now ? "Yes" : "No"}</div>
            }
          </div>
        </InfoWindow>
    )}
      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  return (
    <button
      className="locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
        );
      }}
    >
    Find Me!</button>
  );
}
function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 43.6532, lng: () => -79.3832 },
      radius: 100 * 1000,
    },
  });

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="search">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Search your location"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}

export default TestMap