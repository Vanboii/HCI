import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBanner from '../../components/banner';
import CardComponent from '../../components/card'; 
import './mytripsPage.css';

// const upcomingTrips = [
//   { image: Cebu_Image, location: 'Cebu, Philippines', priceRange: '$700 - $1500', saves: 2, travelers: 1 },
//   { image: Finland_Image, location: 'Finland', priceRange: '$4000 - $8800', saves: 5, travelers: 2 },
// ];


const pastTrips = [
  { image: "kyoto-image.jpg", location: 'Kyoto, Japan', priceRange: '$2000 - $5200', saves: 8, travelers: 1 },
  { image: "maldives-image.jpeg", location: 'Maldives', priceRange: '$1500 - $2000', saves: 0, travelers: 1 },
  { image: "genting-image.jpg", location: 'Genting, Malaysia', priceRange: '$700 - $2230', saves: 0, travelers: 2 },
  { image: "melbourne-image.jpg", location: 'Melbourne, Australia', priceRange: '$6000 - $8500', saves: 0, travelers: 1 },
  { image: "phuket-image.jpg", location: 'Phuket, Thailand', priceRange: '$600 - $2600', saves: 0, travelers: 1 },
  { image: "newyork-image.jpg", location: 'New York, United States', priceRange: '$6000 - $12600', saves: 6, travelers: 2 },
];

const MyTripsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTrips, setFilteredTrips] = useState([]);
  // const [maxBudget, setMaxBudget] = useState(20000);
  const [savedTrips, setSavedTrips] = useState(JSON.parse(localStorage.getItem('savedTrips')) || []);
  const [allTrips, setAllTrips] = useState([]);

  useEffect(() => {
    if (activeTab === 'saved') {
      const savedTripsFromStorage = JSON.parse(localStorage.getItem('savedTrips')) || [];
      setSavedTrips(savedTripsFromStorage);
      setFilteredTrips(savedTripsFromStorage);
    } else if (activeTab === 'upcoming') {
      const upcomingTripsFromStorage = JSON.parse(localStorage.getItem('upcomingTrips')) || [];
      setAllTrips(upcomingTripsFromStorage);
      setFilteredTrips(upcomingTripsFromStorage);
    } else if (activeTab === 'past') {
      setFilteredTrips(pastTrips);
    }
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const trips = activeTab === 'upcoming' ? allTrips : activeTab === 'past' ? pastTrips : savedTrips;
    setFilteredTrips(trips.filter(trip => trip.location.toLowerCase().includes(e.target.value.toLowerCase())));
  };

  const handleFilter = (filter) => {
    const trips = activeTab === 'upcoming' ? allTrips : activeTab === 'past' ? pastTrips : savedTrips;
    if (filter === 'highest') {
      setFilteredTrips([...trips].sort((a, b) => parseInt(b.priceRange.split('-')[1].trim().slice(1)) - parseInt(a.priceRange.split('-')[1].trim().slice(1))));
    } else if (filter === 'lowest') {
      setFilteredTrips([...trips].sort((a, b) => parseInt(a.priceRange.split('-')[0].trim().slice(1)) - parseInt(b.priceRange.split('-')[0].trim().slice(1))));
    } else {
      setFilteredTrips(trips.filter(trip => {
        const maxPrice = parseInt(trip.priceRange.split('-')[1].trim().slice(1));
        return maxPrice <= filter;
      }));
    }
  };

  const handleSliderChange = (e) => {
    handleFilter(e.target.value);
  };

  const handleCardClick = (trip) => {
    navigate(`/results?tripId=${trip.id}`);
  };

  const clearUpcomingTrips = () => {
    localStorage.removeItem('upcomingTrips');
    setAllTrips([]);
    setFilteredTrips([]);
  };

  return (
    <div>
      <TopBanner />
      <div className="page-content">
        <div className="mytrips-tabs">
          <div className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => handleTabClick('upcoming')}>
            Upcoming Trips
          </div>
          <div className={`tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => handleTabClick('past')}>
            Past Trips
          </div>
          <div className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => handleTabClick('saved')}>
            Saved Trips
          </div>
        </div>
        <div className="search-filter-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search Destination"
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="filter">
            <button>Filter</button>
            <div className="filter-options">
              <button onClick={() => handleFilter('highest')}>Highest to Lowest Budget</button>
              <button onClick={() => handleFilter('lowest')}>Lowest to Highest Budget</button>
              <div className="slider-container">
                <label>Budget Slider</label>
                <div>Maximum Budget ${filteredTrips.length > 0 ? Math.max(...filteredTrips.map(trip => parseInt(trip.priceRange.split('-')[1].trim().slice(1)))) : 15000}</div>
                <input
                  type="range"
                  min="0"
                  max="15000"
                  onChange={handleSliderChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="trips-cards">
          {filteredTrips.map((trip, index) => (
            <CardComponent
              key={index}
              className="card-component"
              image={trip.image}
              location={trip.location} // Ensure the card displays the updated location
              priceRange={trip.priceRange}
              saves={trip.saves}
              travelers={trip.travelers}
              showSaveButton={false}
              showDeleteButton={false}
              onClick={() => handleCardClick(trip)}
            />
          ))}
        </div>
        <button onClick={clearUpcomingTrips}>Clear Upcoming Trips</button>
      </div>
    </div>
  );
};

export default MyTripsPage;