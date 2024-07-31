
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import TopBanner from '../../../components/banner';
import Select from 'react-select';
// import countryList from 'country-list';
import './trip_detail.css';
import Cookies from 'js-cookie';

import { useItineraries } from '../../../test/useGetItineraries';
import { auth } from '../../../firebase';

// const countries = countryList.getData().map((country) => ({
//   value: country.code,
//   label: country.name,
// }));

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TripDetailPage = () => {

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const { addItinerary } = useItineraries()
  // const [ itineraryID, setItineraryID] = useState("")

  const [countriesData, setCountriesData] = useState([]);
  const [country, setCountry] = useState(null);
  const [city, setCity] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const navigate = useNavigate();
  const today = new Date();

  useEffect(() => {
    axios.get('/countries_cities.json')
      .then(response => setCountriesData(response.data.countries))
      .catch(error => console.error('Error fetching countries and cities data:', error));
  }, []);

  const countriesOptions = countriesData.map(country => ({
    value: country.code,
    label: country.name,
  }));

  const handleCountryChange = (selectedCountry) => {
    setCountry(selectedCountry);
    setCity(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!country || !city || !startDate || !endDate || numberOfPeople < 1) {
      return;
    }

    // Handle form submission
    console.log({ country: country.label, 
                  city: city.label, 
                  startDate: startDate, 
                  endDate : endDate, 
                  numberOfPeople : numberOfPeople,
                });
    const id = await addItinerary({  //Adds the itinerary to the database
      country: country.label, 
      city: city.label, 
      startDate: startDate, 
      endDate : endDate, 
      numberOfPeople : numberOfPeople,  // maybe change number of people to PAX?
      owner : {uid: auth.currentUser.uid, displayName: auth.currentUser.displayName},
    })

    console.log("Itinerary ID:", id)

    const encodedCity = encodeURIComponent(city.label);
    const encodedCountry = encodeURIComponent(country.label);
    const startMonth = monthNames[startDate.getMonth()]; // Convert start month to words
    const endMonth = monthNames[endDate.getMonth()]; // Convert end month to words
    const url = `https://bonvoyage-api.azurewebsites.net/get-categories?city=${encodedCity}&country=${encodedCountry}&startMonth=${startMonth}&endMonth=${endMonth}`;
  
    console.log('Fetching data from URL:', url);
  
    try {
      const response = await axios.get(url);
      const data = response.data;
      console.log('Data fetched:', data);
  
      Cookies.set('tripData', JSON.stringify(data), { expires: 7 });
      Cookies.set('tripUrl', url, { expires: 7 });
  
      // Save the trip details in a single cookie
      const tripDetails = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        city: city.label,
        country: country.label,
        numberOfPeople
      };
      Cookies.set('tripDetails', JSON.stringify(tripDetails), { expires: 7 });
  
      navigate(`/planning/invite/${id}?city=${encodedCity}&country=${encodedCountry}`);
    } catch (error) {
      console.error('Error fetching trip data:', error);
    }
  };
  

  const cityOptions = country
    ? countriesData.find(c => c.code === country.value)?.cities.map(city => ({
        value: city,
        label: city,
      })) || []
    : [];

  return (
    <div className="trip-detail-container">
      <TopBanner showAlertOnNavigate={true}/>
      <main>
        <h1>Enter your Trip Details</h1>
        <p>Gateway to Planning Your Ideal Itinerary</p>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="country">Location</label>
            <div className="location-group">
              <div className="input-container">
                <Select
                  id="country"
                  placeholder="Enter Country"
                  value={country}
                  onChange={handleCountryChange}
                  options={countriesOptions}
                  isClearable
                  isSearchable
                  required
                />
              </div>
              <div className="input-container">
                <Select
                  id="city"
                  placeholder="Enter City"
                  value={city}
                  onChange={setCity}
                  options={cityOptions}
                  isClearable
                  isSearchable
                  isDisabled={!country}
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-group when-group">
            <label htmlFor="start-date">Dates</label>
            <div className="date-group">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Check In"
                id="start-date"
                required
                minDate={today}
                className="custom-date-picker start-date"
              />
              <span>To</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Check Out"
                id="end-date"
                required
                minDate={startDate || today}
                className="custom-date-picker end-date"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="number-of-people">Number of People Going</label>
            <input
              type="number"
              id="number-of-people"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.valueAsNumber)}
              min="1"
              required
              className="people-count"
            />
          </div>
          <button type="submit" className="next-button">Next</button>
        </form>
      </main>
    </div>
  );
};

export default TripDetailPage;

