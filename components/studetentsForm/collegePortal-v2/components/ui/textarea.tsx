// filepath: e:\stigmata\collegeportal\collegePortal-v2\collegePortal-v2\components\ui\LocationSelector.tsx
"use client";

import React, { useEffect, useState } from "react";

const LocationSelector = ({ onLocationChange }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedState, setSelectedState] = useState("");
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

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedDistrict("");
    setPlaces([]);
    onLocationChange({ state: e.target.value, district: "", place: "" });
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setPlaces([]);
    onLocationChange({ state: selectedState, district: e.target.value, place: "" });
  };

  const handlePlaceChange = (e) => {
    onLocationChange({ state: selectedState, district: selectedDistrict, place: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">State</label>
        <select value={selectedState} onChange={handleStateChange} className="block w-full border rounded p-2">
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.id} value={state.name}>{state.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">District</label>
        <select value={selectedDistrict} onChange={handleDistrictChange} className="block w-full border rounded p-2" disabled={!selectedState}>
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district.id} value={district.name}>{district.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Place</label>
        <select value={places} onChange={handlePlaceChange} className="block w-full border rounded p-2" disabled={!selectedDistrict}>
          <option value="">Select Place</option>
          {places.map((place) => (
            <option key={place.id} value={place.name}>{place.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;