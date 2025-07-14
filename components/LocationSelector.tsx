import React, { useEffect, useState } from "react";

type LocationValue = {
  state: string;
  district: string;
  place: string;
};

interface LocationSelectorProps {
  value: LocationValue;
  onChange: (val: LocationValue) => void;
  country?: string; // default: "IN"
  label?: string;
}

const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"; // <-- Replace with your key

// Utility to load Google Maps JS API
function useGoogleMapsScript() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }
    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);
  return loaded;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  country = "IN",
  label = "Location",
}) => {
  const loaded = useGoogleMapsScript();

  // For each field, keep input and suggestions
  const [stateInput, setStateInput] = useState(value.state);
  const [stateOptions, setStateOptions] = useState<string[]>([]);
  const [districtInput, setDistrictInput] = useState(value.district);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [placeInput, setPlaceInput] = useState(value.place);
  const [placeOptions, setPlaceOptions] = useState<string[]>([]);

  // Fetch suggestions using Google Places AutocompleteService
  function fetchSuggestions(
    input: string,
    types: string[],
    componentRestrictions: any,
    cb: (opts: string[]) => void
  ) {
    if (!window.google?.maps?.places) return;
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input,
        types,
        componentRestrictions,
      },
      (predictions) => {
        if (!predictions) return cb([]);
        cb(predictions.map((p) => p.description));
      }
    );
  }

  // State suggestions (administrative_area_level_1)
  useEffect(() => {
    if (!loaded || !stateInput) return;
    fetchSuggestions(
      stateInput,
      ["(regions)"],
      { country },
      (opts) => setStateOptions(opts)
    );
  }, [stateInput, loaded, country]);

  // District suggestions (administrative_area_level_2) based on state
  useEffect(() => {
    if (!loaded || !districtInput || !value.state) return;
    fetchSuggestions(
      `${districtInput}, ${value.state}`,
      ["(regions)"],
      { country },
      (opts) => setDistrictOptions(opts)
    );
  }, [districtInput, loaded, value.state, country]);

  // Place suggestions (locality, sublocality, etc.) based on district+state
  useEffect(() => {
    if (!loaded || !placeInput || !value.district || !value.state) return;
    fetchSuggestions(
      `${placeInput}, ${value.district}, ${value.state}`,
      ["(cities)"],
      { country },
      (opts) => setPlaceOptions(opts)
    );
  }, [placeInput, loaded, value.district, value.state, country]);

  // Handlers
  const handleStateSelect = (desc: string) => {
    setStateInput(desc);
    setDistrictInput("");
    setPlaceInput("");
    setDistrictOptions([]);
    setPlaceOptions([]);
    onChange({ state: desc, district: "", place: "" });
  };
  const handleDistrictSelect = (desc: string) => {
    setDistrictInput(desc);
    setPlaceInput("");
    setPlaceOptions([]);
    onChange({ ...value, district: desc, place: "" });
  };
  const handlePlaceSelect = (desc: string) => {
    setPlaceInput(desc);
    onChange({ ...value, place: desc });
  };

  // Keep input fields in sync with value prop
  useEffect(() => {
    setStateInput(value.state);
    setDistrictInput(value.district);
    setPlaceInput(value.place);
  }, [value.state, value.district, value.place]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      {/* State */}
      <div className="relative">
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="State"
          value={stateInput}
          onChange={e => setStateInput(e.target.value)}
          autoComplete="off"
        />
        {stateOptions.length > 0 && (
          <ul className="border bg-white rounded shadow mt-1 max-h-40 overflow-auto z-10 absolute w-full">
            {stateOptions.map((opt, i) => (
              <li
                key={i}
                className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleStateSelect(opt)}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* District */}
      <div className="relative">
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="District"
          value={districtInput}
          onChange={e => setDistrictInput(e.target.value)}
          disabled={!value.state}
          autoComplete="off"
        />
        {districtOptions.length > 0 && (
          <ul className="border bg-white rounded shadow mt-1 max-h-40 overflow-auto z-10 absolute w-full">
            {districtOptions.map((opt, i) => (
              <li
                key={i}
                className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleDistrictSelect(opt)}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Place */}
      <div className="relative">
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="Place / Town / City"
          value={placeInput}
          onChange={e => setPlaceInput(e.target.value)}
          disabled={!value.district}
          autoComplete="off"
        />
        {placeOptions.length > 0 && (
          <ul className="border bg-white rounded shadow mt-1 max-h-40 overflow-auto z-10 absolute w-full">
            {placeOptions.map((opt, i) => (
              <li
                key={i}
                className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                onClick={() => handlePlaceSelect(opt)}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export type { LocationValue };