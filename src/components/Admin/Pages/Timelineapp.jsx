import React, { useEffect, useState } from 'react';
import { Spin, Button, Modal, Table } from 'antd'; // Import necessary components from Ant Design
import ApexChart1 from './Timelineappchart';

const Timelineapp = ({ selectedDate, selectedEmployees }) => {
  const [timelineData, setTimelineData] = useState(null);
  const [userUsageData, setUserUsageData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false); // State for modal visibility

  useEffect(() => {
    const fetchTimelineData = async () => {
      console.log("Selected Date:", selectedDate);
      console.log("Selected Employees:", selectedEmployees);
      setLoading(true);
      try {
        const response = await fetch('http://3.110.23.123/api/timelineapp.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            date: selectedDate,
            EMPID: selectedEmployees,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        setTimelineData(result); // Set the fetched timeline data directly
        await fetchUserUsage(selectedDate, selectedEmployees);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [selectedDate, selectedEmployees]);

  const fetchUserUsage = async (date, employees) => {
    try {
      const response = await fetch('http://3.110.23.123/api/userusage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          date: date,
          EMPID: employees,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setUserUsageData(result); // Set the fetched user usage data directly
    } catch (error) {
      console.error('Error fetching user usage:', error.message);
    }
  };

  const handleExportCSV = () => {
    if (!userUsageData || userUsageData.length === 0) return;

    const csvRows = [];
    const headers = Object.keys(userUsageData[0]);
    csvRows.push(headers.join(',')); // Add headers

    for (const row of userUsageData) {
      csvRows.push(headers.map(header => row[header]).join(',')); // Add row data
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'user_usage_data.csv');
    a.click();
  };

  // Function to generate columns dynamically from fetched user usage data
  const generateColumns = (data) => {
    if (!data || data.length === 0) return [];
    
    return Object.keys(data[0]).map(key => ({
      title: key.replace(/([A-Z])/g, ' $1'), // Format key for display
      dataIndex: key,
      key: key,
    }));
  };

  const columns = generateColumns(userUsageData); // Generate columns based on user usage data

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Button type="default" onClick={handleExportCSV} style={{ marginLeft: '10px' }}>
        Export CSV
      </Button>


      <ApexChart1 data={timelineData} />
    </div>
  );
};

export default Timelineapp;
