import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import "./Map.scss";
import userList from "./users.json";

export const Map = () => {
  const [data, setData] = useState(null);
  const [userIds, setUserIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [userMarkers, setUserMarkers] = useState({});
  const [userPolylineColor, setUserPolylineColor] = useState({});

  const markers = [
    ['http://maps.google.com/mapfiles/ms/icons/blue-dot.png'],
    ['http://maps.google.com/mapfiles/ms/icons/red-dot.png'],
    ['http://maps.google.com/mapfiles/ms/icons/green-dot.png'],
    ['http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'],
    ['http://maps.google.com/mapfiles/ms/icons/purple-dot.png'],
    ['http://maps.google.com/mapfiles/ms/icons/pink-dot.png'],
    ['http://maps.google.com/mapfiles/ms/icons/orange-dot.png'],
  ];

  const [selectedMarker, setSelectedMarker] = useState(null);
  let color = getRandomColor();

  const handleAddUser = async () => {
    if (selectedUserId && !userIds.includes(selectedUserId)) {
      try {
        const response = await axios.get(`http://localhost:3001/api/location?userId=${selectedUserId}`);
        const userData = response.data;

        if (userData.length > 0) {
          const randomMarkerIndex = Math.floor(Math.random() * markers.length);
          const randomMarker = markers[randomMarkerIndex][0];

          const randomColor = getRandomColor();

          setUserPolylineColor(prevState => ({
            ...prevState,
            [selectedUserId]: randomColor
          }));

          setUserMarkers(prevState => ({
            ...prevState,
            [selectedUserId]: randomMarker
          }));

          setUserIds([...userIds, selectedUserId]);
          setData(prevData => prevData ? [...prevData, userData] : [userData]);
          setError('');

          console.log(userPolylineColor);
        } else {
          setError('Відсутній користувач з даним ID');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data');
      }
    }
  };
  /*
  const getUserList = () => {
    return axios.get(`http://localhost:3001/api/users`)
      .then(({ data }) => {
        userList = data;
      })
      .catch(error => {
        console.error('Error fetching user list:', error);
        throw new Error('An error occurred while fetching user list');
      });
  };
  */


  const handleRemoveUser = (userId) => {
    setUserIds(userIds.filter(id => id !== userId));
  };

  const [directions, setDirections] = useState(null);

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  const containerStyle = {
    width: '100%',
    height: '100%'
  };

  let center = {
    lat: 50.39581629,
    lng: 30.50185011,
  };

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  return (
    <div style={{ height: '100%', width: '100%' }} className="map">
      <div className="map-top">
        <div>
          <input
            type="text"
            className="map__input"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            placeholder="Введіть ID користувача"
          />
          <button onClick={handleAddUser} className="map__add-user">+</button>
        </div>
        <div>
          {/*<button onClick={handleGetDirections}>dir</button>*/}
          <ul className='map__halndle-user-list'>
            <li key={'erro'} className='map__halndle-user-item map__halndle-user-item__error'>
              {error && <span>{error}</span>}
            </li>

            {userIds.map(userId => {
              const userNameById = userList.find(item => +item.id === +userId);
              console.log(userNameById);
              return (
                <li key={userId} className='map__halndle-user-item'>
                  {userNameById?.nickname}
                  <button onClick={() => handleRemoveUser(userId)} className="map__remove-user">-</button>
                </li>
              );
            })}

          </ul>
        </div>
      </div>

      <LoadScript
        googleMapsApiKey="AIzaSyDUXJu8oMI6rN_tms3qcBoHQzev_frIHJw"
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={8}
        >
          {data && data.map(marker => (
            <>
              {marker.lat !== 0 && marker.lng !== 0 && (
                <React.Fragment key={marker.id}>
                  <Marker
                    position={{ lat: +marker.lat, lng: +marker.lng }}
                    name={marker.address}
                    icon={{
                      url: userMarkers[marker.userId] || `http://maps.google.com/mapfiles/ms/icons/blue-dot.png`,
                      scaledSize: new window.google.maps.Size(30, 30)
                    }}
                  />

                  <Polyline
                    path={marker}
                    options={{
                      strokeColor: userPolylineColor[marker.userId] || userPolylineColor[selectedUserId] || color,
                      strokeOpacity: 1,
                      strokeWeight: 2,
                    }
                    }
                  />

                  <DirectionsService
                    options={{
                      destination: new window.google.maps.LatLng(data[data.length - 1].lat, data[data.length - 1].lng),
                      origin: new window.google.maps.LatLng(data[0].lat, data[0].lng),
                      travelMode: 'DRIVING',
                    }}
                    callback={(result, status) => {
                      if (status === 'OK') {
                        setDirections(result);
                      } else {
                        console.error(`Directions request failed due to ${status}`);
                      }
                    }}
                  />
                </React.Fragment>
              )}
              <DirectionsRenderer directions={directions} />
            </>
          ))}
        </GoogleMap>

      </LoadScript>

    </div>
  );
}
