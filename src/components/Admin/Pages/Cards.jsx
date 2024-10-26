import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, Col, Row, Modal } from 'antd';

// Utility function to format time strings
const formatTimeString = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(':');
  return `${hours}h ${minutes}m ${seconds}s`;
};

const Cards = ({ columns, aggregateData, aggregateColumns, totals, employeecount, datadis }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [xAxisLabel, setXAxisLabel] = useState('');

  if (aggregateData.length === 0 || aggregateColumns.length === 0) {
    return <div>No data available</div>;
  }

  // Extract x-axis data (dates)
  const xAxisData = aggregateData.map(item => new Date(item.date).getTime()); // Convert date strings to timestamps

  // Generate series for each column (except the first one)
  const series = aggregateColumns.slice(1).map(col => ({
    name: col.title,
    data: aggregateData.map(item => item[col.dataIndex])
  }));

  // Define colors for each series
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#33FFF4']; // Customize these colors as needed

  // Define chart titles and total values
  const chartTitles = [
    'LOGGED HOURS',
    'IDLE HOURS',
    'PRODUCTIVE HOURS',
    'TIME ON SYSTEM',
    'TIME AWAY FROM SYSTEM'
  ];

  // Generate chart options for each series
  const chartOptions = (title, data, color) => ({
    series: [{
      name: title,
      data: data
    }],
    chart: {
      type: 'bar', // Use 'area' chart type
      toolbar: {
        show: false
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const { seriesIndex, dataPointIndex } = config;

          // Ensure data exists before accessing it
          if (data[seriesIndex] && data[seriesIndex][dataPointIndex] !== undefined) {
            const selectedData = data[seriesIndex][dataPointIndex];
            const xAxisValue = xAxisData[dataPointIndex];

            // Find the corresponding x-axis label
            const xAxisLabel = new Date(xAxisValue).toLocaleDateString();

            console.log('Selected Data:', selectedData);
            console.log('xAxis Label:', xAxisLabel);

            setModalData({
              data: selectedData,
              xAxisLabel: xAxisLabel
            });
            setModalVisible(true);
          } else {
            console.error('Data not available for the selected point.');
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 1
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        gradientToColors: [color],
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.7,
        stops: [0, 100]
      }
    },
    colors: [color],
    xaxis: {
      type: 'datetime',
      categories: xAxisData,
      labels: {
        format: 'dd/MM/yy',
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    grid: {
      show: false
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy'
      }
    }
  });

  return (
    <div className="p-4">
    <Row gutter={16}>
      {/* Card with static content */}
      <Col xs={24} sm={12} md={8}>
        <Card style={{height:'92%'}}
        >
          <h2>Employee</h2>
          <h3>{employeecount}</h3>
        </Card>
      </Col>

      {/* Cards with totals as chart titles */}
      {series.map((ser, index) => (
        <Col xs={24} sm={12} md={8} key={index} style={{ marginBottom: '16px' }}>
          <Card
            bordered={false}
  
          >
            <p style={{ margin: '-7%' }}>{chartTitles[index]}</p>
            <p>{formatTimeString(totals[Object.keys(totals)[index]])}</p>
            <div style={{marginLeft:'-25%',marginBottom:'-10%',}}>
              
                <ReactApexChart
                  options={chartOptions(ser.name, ser.data, colors[index % colors.length])}
                  series={chartOptions(ser.name, ser.data, colors[index % colors.length]).series}
                  type="bar" // Use 'area' chart type
                  overflow="hidden"
                 height="85%"
                 width="110%"
                />
              
            </div>
          </Card>
        </Col>
      ))}
    </Row>

    {/* Modal to display selected data */}
    <Modal
      title="Data Point Details"
      visible={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
    >
      <p><strong>Date:</strong> {modalData?.xAxisLabel}</p>
      <pre>{JSON.stringify(modalData?.data, null, 2)}</pre>
    </Modal>
  </div>
  );
}

export default Cards;
