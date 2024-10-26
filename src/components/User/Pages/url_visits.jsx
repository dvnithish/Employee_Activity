import React, { useEffect, useState } from 'react';
import { Table } from 'antd';

// Utility function to calculate the maximum width of a column
const calculateColumnWidths = (data, columns) => {
  const columnWidths = {};

  columns.forEach(column => {
    const maxContentWidth = Math.max(
      ...data.map(item => {
        const value = item[column.dataIndex];
        return (value && typeof value === 'string') ? value.length * 8 : 50; // Estimate width based on character length
      }),
      column.title.length * 8 // Include title length in the calculation
    );

    columnWidths[column.dataIndex] = maxContentWidth;
  });

  return columnWidths;
};

const UrlVisits = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetch('http://3.110.23.123/api/fetch_url.php')
      .then(response => response.json())
      .then(result => {
        if (result.status === 'success') {
          // Map fetched data to the format expected by Ant Design Table
          const formattedData = result.data.map((item, index) => ({
            key: index, // Add a unique key for each row
            ...item,
          }));

          // Define columns dynamically based on fetched data
          const dynamicColumns = result.columns.map((column, index) => ({
            title: column,
            dataIndex: column,
            // Width will be set later after calculating the maximum width
            sorter: (a, b) => {
              if (typeof a[column] === 'number' && typeof b[column] === 'number') {
                return a[column] - b[column];
              }
              if (typeof a[column] === 'string' && typeof b[column] === 'string') {
                return a[column].localeCompare(b[column]);
              }
              return 0;
            },
          }));

          // Calculate column widths for all columns
          const columnWidths = calculateColumnWidths(formattedData, dynamicColumns);

          // Update columns with auto-adjusted widths
          const updatedColumns = dynamicColumns.map((column, index) => {
            // Determine width for the second column
            const calculatedWidth = index === 1 ? Math.min(columnWidths[column.dataIndex] + 50, 300) : columnWidths[column.dataIndex] + 50;

            return {
              ...column,
              width: calculatedWidth, // Set width with max for second column
            };
          });

          setColumns(updatedColumns);
          setData(formattedData);
        } else {
          console.error('Error fetching data:', result.message);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <h1>URL Visits</h1>
      <Table 
        columns={columns} 
        dataSource={data} 
        onChange={onChange} 
        scroll={{ x: '100%', y: 400 }} // Adjust scroll properties as needed
        // Removed pagination here
        bordered
      />
    </div>
  );
};

export default UrlVisits;
