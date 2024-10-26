import React, { useEffect, useState } from 'react';
import { Spin, Alert, message, Select, Row, Col, DatePicker, Button, Table } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Designation = () => {
  const [dataSource, setDataSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState({
    dates: [],
    EMPID: [],
    EMPNAME: [],
    ROLE: [],
    DEPARTMENT: [],
    TEAM: [],
    PROJECT: [],
    SHIFT: [],
    DESIGNATION: [],
  });
  const [tableData, setTableData] = useState([]);
  const [departmentRoleShiftData, setDepartmentRoleShiftData] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetch('http://3.110.23.123/api/uniquefilters.php')
      .then(response => response.json())
      .then(data => {
        setDataSource(data);
        setLoading(false);
      })
      .catch(error => {
        message.error('An error occurred while fetching data');
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleDateChange = (dates) => {
    setSelectedData((prev) => ({ ...prev, dates }));
  };

  const handleDropdownChange = (label, values) => {
    setSelectedData((prev) => ({
      ...prev,
      [label]: values,
    }));
  };

  const handleFilter = async () => {
    const { dates, ...dropdownValues } = selectedData;
    const startDate = dates[0] ? dates[0].format('YYYY-MM-DD') : '';
    const endDate = dates[1] ? dates[1].format('YYYY-MM-DD') : '';

    const requestData = {
      startDate,
      endDate,
      ...dropdownValues,
    };

    setFetching(true);

    try {
      const response = await fetch('http://3.110.23.123/api/designation.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result && result.data && Array.isArray(result.data)) {
        setTableData(result.data);
        const groupedData = generateDepartmentRoleShiftData(result.data);
        setDepartmentRoleShiftData(groupedData);
      } else {
        message.error('Invalid data received from server');
      }
    } catch (error) {
      message.error('An error occurred while fetching data');
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const timeStringToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
};

const generateDepartmentRoleShiftData = (data) => {
  const grouped = {};

  data.forEach(item => {
      const {
          Department,
          DESIGNATION_CATEGORY,
          SHIFTTYPE,
          EmpName,
          TotalLoggedHours,
          TotalIdleHours,
          TotalProductiveHours,
          PRODUCTIVITY_STATUS // New field
      } = item;

      const totalLoggedHoursInSeconds = timeStringToSeconds(TotalLoggedHours);
      const totalIdleHoursInSeconds = timeStringToSeconds(TotalIdleHours);
      const totalProductiveHoursInSeconds = timeStringToSeconds(TotalProductiveHours);

      if (!grouped[Department]) {
          grouped[Department] = {};
      }

      if (!grouped[Department][DESIGNATION_CATEGORY]) {
          grouped[Department][DESIGNATION_CATEGORY] = {};
      }

      if (!grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE]) {
          grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE] = {
              employeeCount: 0,
              productiveCount: 0, // Count of productive staff
              nonProductiveCount: 0, // Count of non-productive staff
              totalProductiveHours: 0,
              totalLoggedHours: 0,
              totalIdleHours: 0,
              employees: []
          };
      }

      grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE].employeeCount++;
      if (PRODUCTIVITY_STATUS === "PRODUCTIVE") {
          grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE].productiveCount++;
      } else if (PRODUCTIVITY_STATUS === "NON PRODUCTIVE") {
          grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE].nonProductiveCount++;
      }

      grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE].totalProductiveHours += totalProductiveHoursInSeconds;
      grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE].totalLoggedHours += totalLoggedHoursInSeconds;
      grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE].totalIdleHours += totalIdleHoursInSeconds;

      grouped[Department][DESIGNATION_CATEGORY][SHIFTTYPE].employees.push({ EmpName });
  });

  const flatData = [];

  Object.entries(grouped).forEach(([department, roles]) => {
      Object.entries(roles).forEach(([role, shifts]) => {
          Object.entries(shifts).forEach(([shift, value]) => {
              const {
                  employeeCount,
                  productiveCount,
                  nonProductiveCount,
                  totalProductiveHours,
                  totalLoggedHours,
                  totalIdleHours
              } = value;

              flatData.push({
                  department,
                  role,
                  shifts: shift,
                  employeeCount,
                  productiveCount, // Include productive count
                  nonProductiveCount, // Include non-productive count
                  avgProductiveHours: employeeCount > 0 ? secondsToTimeString(totalProductiveHours / employeeCount) : '00:00:00',
                  avgLoggedHours: employeeCount > 0 ? secondsToTimeString(totalLoggedHours / employeeCount) : '00:00:00',
                  avgIdleHours: employeeCount > 0 ? secondsToTimeString(totalIdleHours / employeeCount) : '00:00:00',
                  employees: value.employees
              });
          });
      });
  });

  return flatData;
};


const secondsToTimeString = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60); // Floor to get whole seconds

  return [hours, minutes, secs].map(v => String(v).padStart(2, '0')).join(':');
};





  const handleReset = () => {
    setSelectedData({
      dates: [],
      EMPID: [],
      EMPNAME: [],
      ROLE: [],
      DEPARTMENT: [],
      TEAM: [],
      PROJECT: [],
      SHIFT: [],
      DESIGNATION: [],
    });
    setTableData([]);
    setDepartmentRoleShiftData([]);
    message.success('Filters reset!');
  };

  if (loading) {
    return <Spin />;
  }

  if (!dataSource) {
    return <Alert message="No data available" type="info" />;
  }

  const dropdownOptions = Object.entries(dataSource.data).map(([key, values]) => ({
    label: key,
    options: values.map(value => ({ value })),
  }));

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      color: '#333',
    }}>
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={24}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            fontSize: '16px',
            color: '#555',
          }}></label>
          <RangePicker
            style={{ width: '100%' }}
            onChange={handleDateChange}
            placeholder={['Start Date', 'End Date']}
          />
        </Col>
      </Row>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
      }}>
        {dropdownOptions.map(({ label, options }) => (
          <div key={label} style={{ flex: '1 1 200px', minWidth: '150px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              fontSize: '16px',
              color: '#555',
            }}></label>
            <Select
              mode="multiple"
              placeholder={`${label}`}
              style={{ width: '100%' }}
              onChange={(values) => handleDropdownChange(label, values)}
              allowClear
            >
              {options.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.value}
                </Option>
              ))}
            </Select>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px' }}>
        <Button 
          type="primary" 
          onClick={handleFilter} 
          icon={<FilterOutlined />} 
          style={{ marginRight: '8px', backgroundColor: '#4CAF50', borderColor: '#4CAF50' }}
          loading={fetching}
        >
          Filter
        </Button>
        <Button 
          onClick={handleReset} 
          icon={<ReloadOutlined />} 
          style={{ backgroundColor: '#f44336', borderColor: '#f44336', color: '#fff' }}
        >
          Reset
        </Button>
      </div>

      {tableData.length > 0 && (
        <>
          <h3 style={{ marginTop: '24px' }}>Departments, Roles, and Shifts</h3>
          <Table 
  dataSource={departmentRoleShiftData} 
  columns={[
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 200,
      render: department => <div style={{ whiteSpace: 'pre-line' }}>{department}</div>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 200,
      render: role => <div style={{ whiteSpace: 'pre-line' }}>{role}</div>,
    },
    {
      title: 'Shifts',
      dataIndex: 'shifts',
      key: 'shifts',
      width: 200,
      render: shifts => <div style={{ whiteSpace: 'pre-line' }}>{shifts}</div>,
    },
    {
      title: 'Number of Employees',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 200,
      render: employeeCount => <div style={{ whiteSpace: 'pre-line' }}>{employeeCount}</div>,
    },
    {
      title: 'Productive Staff Count',
      dataIndex: 'productiveCount', // New column for productive count
      key: 'productiveCount',
      width: 200,
      render: productiveCount => <div style={{ whiteSpace: 'pre-line' }}>{productiveCount}</div>,
    },
    {
      title: 'Non-Productive Staff Count',
      dataIndex: 'nonProductiveCount', // New column for non-productive count
      key: 'nonProductiveCount',
      width: 200,
      render: nonProductiveCount => <div style={{ whiteSpace: 'pre-line' }}>{nonProductiveCount}</div>,
    },
    {
      title: 'Avg Productive Hours',
      dataIndex: 'avgProductiveHours',
      key: 'avgProductiveHours',
      width: 200,
      render: hours => <div style={{ whiteSpace: 'pre-line' }}>{hours}</div>,
    },
    {
      title: 'Avg Logged Hours',
      dataIndex: 'avgLoggedHours',
      key: 'avgLoggedHours',
      width: 200,
      render: hours => <div style={{ whiteSpace: 'pre-line' }}>{hours}</div>,
    },
    {
      title: 'Avg Idle Hours',
      dataIndex: 'avgIdleHours',
      key: 'avgIdleHours',
      width: 200,
      render: hours => <div style={{ whiteSpace: 'pre-line' }}>{hours}</div>,
    },
  ]}
  rowKey={(record, index) => index}
  style={{ marginTop: '16px' }}
  scroll={{ x: 'max-content', y: 400 }} // Enable horizontal and vertical scrolling
  pagination={false} // Disable pagination
/>


        </>
      )}
    </div>
  );
};

export default Designation;
