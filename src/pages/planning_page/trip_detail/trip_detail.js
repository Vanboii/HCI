import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import TopBanner from '../../../components/banner';
import Select from 'react-select';
import countryList from 'country-list';
import { City } from 'country-state-city'; // Removed unused 'Country' import
import './trip_detail.css';
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
import { useItineraries } from '../../../test/useGetItineraries';
import { auth } from '../../../firebase';


// Transform the country list to match react-select's expected format
const countries = countryList.getData().map((country) => ({
  value: country.code,
  label: country.name,
}));

const TripDetailPage = () => {

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const { addItinerary } = useItineraries()
  // const [ itineraryID, setItineraryID] = useState("")

  const [country, setCountry] = useState(null);
  const [city, setCity] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const navigate = useNavigate();
  const today = new Date();

  const handleCountryChange = (selectedCountry) => {
    setCountry(selectedCountry);
    setCity(null); // Reset city selection when country changes
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!country || !city || !startDate || !endDate || numberOfPeople < 1) {
      return; // If any required field is missing, prevent form submission
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

    // Navigate to invite page
    navigate(`/planning/invite/${id}`);
  };

  // Get the list of cities for the selected country
  const cityOptions = country
    ? City.getCitiesOfCountry(country.value).map((city) => ({
        value: city.name,
        label: city.name,
      }))
    : [];

  return (
    <div className="trip-detail-container">
      <TopBanner />
      <main>
        <h1>Plan your next travel</h1>
        <p>Gateway to Planning Your Next Trip</p>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="country">Where?</label>
            <div className="location-group">
              <div className="input-container">
                <Select
                  id="country"
                  placeholder="Enter Country"
                  value={country}
                  onChange={handleCountryChange}
                  options={countries}
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
            <label htmlFor="start-date">When?</label>
            <div className="date-group">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Start Date"
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
                placeholderText="End Date"
                id="end-date"
                required
                minDate={startDate || today}
                className="custom-date-picker end-date"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="number-of-people">How many people are going?</label>
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
