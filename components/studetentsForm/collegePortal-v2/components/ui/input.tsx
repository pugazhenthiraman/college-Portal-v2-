// filepath: e:\stigmata\collegeportal\collegePortal-v2\collegePortal-v2\components\ui\LocationSelector.tsx
"use client";

import React, { useEffect, useState } from "react";

interface LocationSelectorProps {
  onLocationChange: (location: { state: string; district: string; place: string }) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange }) => {
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    // Fetch states from Google Places API or your backend
    const fetchStates = async () => {
      const response = await fetch("YOUR_API_ENDPOINT_FOR_STATES");
      const data = await response.json();
      setStates(data);
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      // Fetch districts based on selected state
      const fetchDistricts = async () => {
        const response = await fetch(`YOUR_API_ENDPOINT_FOR_DISTRICTS?state=${selectedState}`);
        const data = await response.json();
        setDistricts(data);
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setPlaces([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      // Fetch places based on selected district
      const fetchPlaces = async () => {
        const response = await fetch(`YOUR_API_ENDPOINT_FOR_PLACES?district=${selectedDistrict}`);
        const data = await response.json();
        setPlaces(data);
      };
      fetchPlaces();
    } else {
      setPlaces([]);
    }
  }, [selectedDistrict]);

  const handleStateChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setSelectedState(e.target.value as string);
    setSelectedDistrict("");
    onLocationChange({ state: e.target.value as string, district: "", place: "" });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
    onLocationChange({ state: selectedState, district: e.target.value, place: "" });
  }

  const handlePlaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLocationChange({ state: selectedState, district: selectedDistrict, place: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">State</label>
        <select value={selectedState} onChange={handleStateChange} className="block w-full border rounded">
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">District</label>
        <select value={selectedDistrict} onChange={handleDistrictChange} className="block w-full border rounded" disabled={!selectedState}>
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Place</label>
        <select onChange={handlePlaceChange} className="block w-full border rounded" disabled={!selectedDistrict}>
          <option value="">Select Place</option>
          {places.map((place) => (
            <option key={place} value={place}>{place}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;