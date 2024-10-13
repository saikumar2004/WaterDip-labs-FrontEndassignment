import React, { useState, useEffect } from "react";
import axios from "axios";
import ApexCharts from "react-apexcharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const App: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date("2015-07-01"));
  const [endDate, setEndDate] = useState<Date | null>(new Date("2015-07-10"));
  const [data, setData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
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

  type ChartSeries = { x: string; y: number }[];

  type ChartData = {
    timeSeries: ChartSeries;
    columnChart: ChartSeries;
    sparklineAdults: number[];
    sparklineChildren: number[];
  };

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
    <div style={{ backgroundColor: "#121212", color: "#ffffff", padding: "20px", minHeight: "100vh" }}>
      <h1 style={{ color: "#4CAF50" }}>Hotel Booking Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Start Date: </label>
        <DatePicker 
          selected={startDate} 
          onChange={(date: Date | null) => date && setStartDate(date)} 
          className="date-picker"
          style={{ color: "#000" }}
        />

        <label style={{ marginLeft: "20px", marginRight: "10px" }}>End Date: </label>
        <DatePicker 
          selected={endDate} 
          onChange={(date: Date | null) => date && setEndDate(date)} 
          className="date-picker"
          style={{ color: "#000" }}
        />
      </div>

      <div>
        <h2 style={{ color: "#FF9800" }}>Time Series Chart</h2>
        <ApexCharts
          options={{
            theme: { mode: 'dark' },
            tooltip: { followCursor: true },
            chart: { id: "time-series-chart", background: "#1e1e1e" },
            xaxis: { type: "datetime", title: { text: 'Date', style: { color: '#FF9800' } } },
            yaxis: { title: { text: 'Number of Visitors', style: { color: '#FF9800' } } },
            stroke: { curve: "smooth" },
            colors: ['#00E396'],
          }}
          series={[{ data: chartData.timeSeries }]}
          type="line"
          height={300}
        />

        <h2 style={{ color: "#03A9F4" }}>Column Chart</h2>
        <ApexCharts
          options={{
            theme: { mode: 'dark' },
            tooltip: { followCursor: true },
            chart: { id: "column-chart", background: "#1e1e1e" },
            xaxis: { type: "category", title: { text: 'Country', style: { color: '#03A9F4' } } },
            yaxis: { title: { text: 'Number of Visitors per Country', style: { color: '#03A9F4' } } },
            plotOptions: { bar: { horizontal: false } },
            colors: ['#FF4560'],
          }}
          series={[{ data: chartData.columnChart }]}
          type="bar"
          height={300}
        />

        <h2 style={{ color: "#FFEB3B" }}>Sparkline Charts</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ width: '45%', backgroundColor: '#212121', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ color: "#8BC34A" }}>Sparkline Chart for Adults</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8BC34A' }}>
              {chartData.sparklineAdults.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>
            <ApexCharts
              options={{
                chart: { type: "line", sparkline: { enabled: true } },
                tooltip: {
                  y: { formatter: (val) => `${val}` }
                },
                stroke: { curve: "smooth" },
                colors: ['#00E396'],
              }}
              series={[{ data: chartData.sparklineAdults }]}
              type="line"
              height={100}
            />
          </div>

          <div style={{ width: '45%', backgroundColor: '#212121', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ color: "#FF5722" }}>Sparkline Chart for Children</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF5722' }}>
              {chartData.sparklineChildren.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>
            <ApexCharts
              options={{
                chart: { type: "line", sparkline: { enabled: true } },
                tooltip: {
                  y: { formatter: (val) => `${val}` }
                },
                stroke: { curve: "smooth" },
                colors: ['#FF4560'],
              }}
              series={[{ data: chartData.sparklineChildren }]}
              type="line"
              height={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
