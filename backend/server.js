const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();

app.use(cors());


let bookingsData = [];


fs.createReadStream('hotel_booking.csv')
  .pipe(csv())
  .on('data', (row) => {
    bookingsData.push(row); 
    
  })
  .on('end', () => {
    console.log('file successfully loading');
  });
  

app.get('/api/bookings', (req, res) => {
  const { startDate, endDate } = req.query;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const filteredData = bookingsData.filter((booking) => {
    const arrivalDate = new Date(`${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`);
    return arrivalDate >= start && arrivalDate <= end;
  });
 
  res.json(filteredData);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
