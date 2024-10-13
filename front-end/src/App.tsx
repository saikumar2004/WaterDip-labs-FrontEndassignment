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
    <div>
      <h1>Hotel Booking Dashboard</h1>
      <div>
        <label>Start Date: </label>
        <DatePicker 
          selected={startDate} 
          onChange={(date: Date | null) => date && setStartDate(date)} 
        />

        <label>End Date: </label>
        <DatePicker 
          selected={endDate} 
          onChange={(date: Date | null) => date && setEndDate(date)} 
        />
      </div>

      <div>
        <h1>Time Series Chart</h1>
        <ApexCharts
          options={{
            theme: { mode: 'dark' },
            chart: { id: "time-series-chart" },
            xaxis: { type: "datetime", title: { text: 'Date', style: { color: '#0f0' } } },
            yaxis: { title: { text: 'Numbers of visitors', style: { color: '#0f0' } } },
            stroke: { curve: "smooth" },
          }}
          series={[{ data: chartData.timeSeries }]}
          type="line"
          height={300}
        />

        <h1>Column Chart</h1>
        <ApexCharts
          options={{
            theme: { mode: 'dark' },
            chart: { id: "column-chart" },
            xaxis: { type: "category", title: { text: 'Country', style: { color: '#0f0' } } },
            yaxis: { title: { text: 'Number of visitors per country', style: { color: '#0f0' } } },
            plotOptions: { bar: { horizontal: false } },
          }}
          series={[{ data: chartData.columnChart }]}
          type="bar"
          height={300}
        />

        <h1>Sparkline Charts</h1>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          
          <div style={{ width: '45%', backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h3>Sparkline Charts for Adults</h3>
            <h3>Total Value (Adults)</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {chartData.sparklineAdults.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>
            <ApexCharts
              options={{ chart: { type: "line", sparkline: { enabled: true } }, stroke: { curve: "smooth" }, colors: ['#3B82F6'] }}
              series={[{ data: chartData.sparklineAdults }]}
              type="line"
              height={100}
            />
          </div>

         
          <div style={{ width: '45%', backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h3>Sparkline Charts for Childers</h3>
            <h3>Total Value (Children)</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {chartData.sparklineChildren.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>
            <ApexCharts
              options={{ chart: { type: "line", sparkline: { enabled: true } }, stroke: { curve: "smooth" }, colors: ['#3B82F6'] }}
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
