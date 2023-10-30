const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());

app.get('/api/location', async (req, res) => {
  try {
    const userId = req.query.userId;
    const response = await axios.get(`https://gateway-control-ui.tsa-dev.pp.ua/location-control/geolocation/getByUserId?userId=${req.query.userId}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6IldFQl9ERVZFTE9QRVIiLCJkYXRlIjoxNjk3MTgxNjkzODEwLCJpYXQiOjE2OTcxODE2OTMsImV4cCI6MTcyODcxNzY5M30.0FOxfeK-2lyLH7iYP90Javv8SNAnqsqaHDe6uxMe3Uw'
      }
    });

    res.json(response.data);
    console.log('HTTP Status Code:', response.status);
    console.log('HTTP Status Text:', response.statusText);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/*app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get('https://gateway-control-ui.tsa-dev.pp.ua/auth/v1/getUsersByAppId', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6IldFQl9ERVZFTE9QRVIiLCJkYXRlIjoxNjk3MTgxNjkzODEwLCJpYXQiOjE2OTcxODE2OTMsImV4cCI6MTcyODcxNzY5M30.0FOxfeK-2lyLH7iYP90Javv8SNAnqsqaHDe6uxMe3Uw'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});*/

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
