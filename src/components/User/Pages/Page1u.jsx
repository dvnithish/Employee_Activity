import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Typography, Divider, Card, Row, Col } from 'antd';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const { Title } = Typography;

// Helper function to format numbers into "HH:mm"
const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins < 10 ? `0${mins}` : mins}`;
};

// Bar Chart Component
const BarGraph = ({ data, dataKey, name, fillColor, width, height }) => (
  <ResponsiveContainer width={width} height={height}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString()} />
      <YAxis tickFormatter={(tick) => formatMinutesToTime(tick)} />
      <Tooltip formatter={(value) => formatMinutesToTime(value)} />
      <Legend />
      <Bar dataKey={dataKey} fill={fillColor} name={name} />
    </BarChart>
  </ResponsiveContainer>
);

const Page1u = () => {
  const location = useLocation();
  const { username } = location.state || {};
  const [detailedData, setDetailedData] = useState([]);
  const [aggregateByDate, setAggregateByDate] = useState([]);
  const [aggregateByDay, setAggregateByDay] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      axios.get('http://3.110.23.123/api/fetchuserdata.php', { params: { username } })
        .then(response => {
          const { data, aggregateByDate, aggregateByDay, totals } = response.data;

          if (Array.isArray(data) && Array.isArray(aggregateByDate) && Array.isArray(aggregateByDay)) {
            setDetailedData(data);
            setAggregateByDate(aggregateByDate);
            setAggregateByDay(aggregateByDay);
            setTotals(totals);
            setLoading(false);
          } else {
            throw new Error('Invalid data format');
          }
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError('Username not found.');
      setLoading(false);
    }
  }, [username]);

  const columnsForDetailedData = detailedData.length > 0
    ? Object.keys(detailedData[0]).map(key => ({
        title: key,
        dataIndex: key,
        key: key,
        align: 'center',
        width: Math.max(100, key.length * 10),
      }))
    : [];

  // Prepare chart data for totals
  const chartData = aggregateByDate.map(item => ({
    date: item.date,
    logged_hours: item.total_logged_hours,
    idle_hours: item.total_idle_hours,
    productive_hours: item.total_productive_hours,
    time_on_system: item.total_time_on_system,
    time_away_from_system: item.total_time_away_from_system,
  }));

  return (
    <div style={{ padding: '24px' }}>
      {loading && <Spin tip="Loading..." />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}

      {!loading && !error && (
        <Card>
        <Row gutter={16}>
        <Col span={8}>
        <Card bordered={false} style={{ marginBottom: '10px',height:"80%",
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
         }}>
          <div style={{marginTop:"-15%"}}>
          <Title level={2}>Employee</Title>
          <h3>{username}</h3>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ marginBottom: '10px' ,height:"80%",
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{marginTop:"-5%"}}>
          Logged Hours 
          <h2 style={{marginTop:"-2%"}}>{totals.total_logged_hours}</h2>
          <div style={{marginTop:"-15%"}}>
          
          </div>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ marginBottom: '10px',height:"80%",
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
          <div style={{marginTop:"-5%"}}>
          Idle Hours
          <h2 style={{marginTop:"-2%"}}>{totals.total_idle_hours}</h2>
          <div style={{marginTop:"-15%"}}>
          
          </div>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false} style={{ marginBottom: '20px',height:"80%",
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
            <div style={{marginTop:"-5%"}}>
            Productive Hours
            <h2 style={{marginTop:"-2%"}}>{totals.total_productive_hours}</h2>
            <div style={{marginTop:"-15%"}}>

          
          </div>
          </div>
        </Card>
      </Col>
      <Col span={8}>
      <Card bordered={false} style={{ marginBottom: '20px',height:"80%",
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
       }}>
        <div style={{marginTop:"-5%"}}>
        Time on System
        <h2 style={{marginTop:"-2%"}}>{totals.total_time_on_system}</h2>
        <div style={{marginTop:"-15%"}}>

       
        </div>
        </div>
      </Card>
    </Col>
    <Col span={8}>
      <Card bordered={false} style={{ marginBottom: '20px',height:"80%",
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
       }}>
        <div style={{marginTop:"-5%"}}>
          Time Away from System
          <h2 style={{marginTop:"-2%"}}>{totals.total_idle_hours}</h2>
          <div style={{marginTop:"-15%"}}>
        </div>
        </div>
      </Card>
    </Col>
    </Row>
    </Card>
  )}
        <>

        
          {detailedData.length > 0 && (
            <>
              <Title level={4}>Detailed Data</Title>
              
              <Table
                columns={columnsForDetailedData}
                dataSource={detailedData}
                scroll={{ x: 'max-content' }}
                pagination={false}
                bordered
              />
              <Divider />
            </>
          )}

          {aggregateByDate.length > 0 && (
            <>
              <Title level={4}>Aggregate by Date</Title>
              <Table
                columns={Object.keys(aggregateByDate[0] || {}).map(key => ({
                  title: key,
                  dataIndex: key,
                  key: key,
                  align: 'center',
                  width: Math.max(100, key.length * 10),
                }))}
                dataSource={aggregateByDate}
                scroll={{ x: 'max-content' }}
                pagination={false}
                bordered
              />
              <Divider />
            </>
          )}

          {aggregateByDay.length > 0 && (
            <>
              <Title level={4}>Aggregate by Day</Title>
              <Table
                columns={Object.keys(aggregateByDay[0] || {}).map(key => ({
                  title: key,
                  dataIndex: key,
                  key: key,
                  align: 'center',
                  width: Math.max(100, key.length * 10),
                }))}
                dataSource={aggregateByDay}
                scroll={{ x: 'max-content' }}
                pagination={false}
                bordered
              />
              <Divider />
            </>
          )}

          {totals && (
            <>
              <Title level={4}>Totals</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Card bordered={false} style={{ marginBottom: '10px', height: '80%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                    <Title level={2}>Logged Hours</Title>
                    <h2>{totals.total_logged_hours}</h2>
                    <BarGraph
                      data={chartData}
                      dataKey="logged_hours"
                      name="Logged Hours"
                      fillColor="#8884d8"
                      width={400}
                      height={200}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card bordered={false} style={{ marginBottom: '10px', height: '80%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                    <Title level={2}>Idle Hours</Title>
                    <h2>{totals.total_idle_hours}</h2>
                    <BarGraph
                      data={chartData}
                      dataKey="idle_hours"
                      name="Idle Hours"
                      fillColor="#82ca9d"
                      width={400}
                      height={200}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card bordered={false} style={{ marginBottom: '10px', height: '80%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                    <Title level={2}>Productive Hours</Title>
                    <h2>{totals.total_productive_hours}</h2>
                    <BarGraph
                      data={chartData}
                      dataKey="productive_hours"
                      name="Productive Hours"
                      fillColor="#ffc658"
                      width={400}
                      height={200}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card bordered={false} style={{ marginBottom: '10px', height: '80%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                    <Title level={2}>Time on System</Title>
                    <h2>{totals.total_time_on_system}</h2>
                    <BarGraph
                      data={chartData}
                      dataKey="time_on_system"
                      name="Time on System"
                      fillColor="#ff7300"
                      width={400}
                      height={200}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card bordered={false} style={{ marginBottom: '10px', height: '80%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                    <Title level={2}>Time Away from System</Title>
                    <h2>{totals.total_time_away_from_system}</h2>
                    <BarGraph
                      data={chartData}
                      dataKey="time_away_from_system"
                      name="Time Away from System"
                      fillColor="#d5a6bd"
                      width={250}
                      height={100}
                    />
                  </Card>
                </Col>
              </Row>
              <Divider />
            </>
          )}
        </>
        
    </div>
  );
};

export default Page1u;
