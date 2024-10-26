// GraphPlotting.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DatePicker, Button, Spin, message } from 'antd';
import moment from 'moment';
import 'antd/dist/antd.css';
import './graph.css'; // Create this file for any custom styling

const { RangePicker } = DatePicker;

const GraphPlotting = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment().endOf('month')]);

  useEffect(() => {
    fetchGraphData();
  }, [dateRange]);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/graph-data', {
        params: {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        },
      });
      setData(response.data);
    } catch (err) {
      setError(err.message);
      message.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  return (
    <div className="graph-plotting-container">
      <h2>Graph Plotting</h2>
      <RangePicker value={dateRange} onChange={handleDateChange} />
      <Button onClick={fetchGraphData} type="primary" style={{ marginLeft: '10px' }}>
        Fetch Data
      </Button>
      {loading ? (
        <Spin tip="Loading..." />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <LineChart
          width={800}
          height={400}
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="loggedHours" stroke="#8884d8" />
          <Line type="monotone" dataKey="idleHours" stroke="#82ca9d" />
          <Line type="monotone" dataKey="productiveHours" stroke="#ffc658" />
        </LineChart>
      )}
    </div>
  );
};

export default GraphPlotting;
