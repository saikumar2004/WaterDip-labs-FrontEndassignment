import React, { useState, useEffect } from "react";
import axios from "axios";
import ApexCharts from "react-apexcharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const App: React.FC = () => {
    const [startDate, setStartDate] = useState<Date | null>(new Date("2015-07-01"));
  const [endDate, setEndDate] = useState<Date | null>(new Date("2015-07-10"));
  const [data, setData] = useState<any[]>([]);
  const [chartData, setChartData] = useState({
    timeSeries: [],
    columnChart: [],
    sparklineAdults: [],
    sparklineChildren: [],
  });
  useEffect(() => {
    if (startDate && endDate) {
      axios
        .get("http://localhost:5000/api/bookings", {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        })
        .then((response) => {
          setData(response.data);
          processChartData(response.data);
        });
    }
  }, [startDate, endDate]);
  const processChartData = (data: any[]) => {
    
    const timeSeriesData = data.map((booking) => ({
      x: `${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`,
      y: Number(booking.adults) + Number(booking.children) + Number(booking.babies),
    }));

    
    const columnChartData = data.reduce((acc: any, booking: any) => {
      const country = booking.country;
      const totalVisitors = Number(booking.adults) + Number(booking.children) + Number(booking.babies);
      if (acc[country]) {
        acc[country] += totalVisitors;
      } else {
        acc[country] = totalVisitors;
      }
      return acc;
    }, {});

    const columnChartSeries = Object.keys(columnChartData).map((country) => ({
      x: country,
      y: columnChartData[country],
    }));

    
    const sparklineAdults = data.map((booking) => Number(booking.adults));
    const sparklineChildren = data.map((booking) => Number(booking.children));

    setChartData({
      timeSeries: timeSeriesData,
      columnChart: columnChartSeries,
      sparklineAdults,
      sparklineChildren,
    });
  };

  return (
    <div>
      <h1>Hotel Booking Dashboard</h1>
      <div>
        <label>Start Date: </label>
        <DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} />
        <label>End Date: </label>
        <DatePicker selected={endDate} onChange={(date: Date) => setEndDate(date)} />
      </div>

      <div>
        <h1>Time Series Chart </h1>
        <ApexCharts
          options={{
            chart: { id: "time-series-chart" },
            xaxis: { type: "datetime" },
          }}
          series={[{ data: chartData.timeSeries }]}
          type="line"
          height={300}
        />

        <h1>Column Chart </h1>
        <ApexCharts
          options={{
            chart: { id: "column-chart" },
            xaxis: { type: "category" },
            plotOptions: { bar: { horizontal: false } },
          }}
          series={[{ data: chartData.columnChart }]}
          type="bar"
          height={300}
        />

        <h1>Sparkline Charts </h1>
        <div>
          <ApexCharts
            options={{ chart: { type: "line" }, stroke: { curve: "smooth" } }}
            series={[{ data: chartData.sparklineAdults }]}
            type="line"
            height={100}
          />
          <ApexCharts
            options={{ chart: { type: "line" }, stroke: { curve: "smooth" } }}
            series={[{ data: chartData.sparklineChildren }]}
            type="line"
            height={100}
          />
        </div>
      </div>
    </div>
  );
 
};

export default App;
