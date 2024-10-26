import React, { useState, useEffect } from 'react';
import Page6 from './Page6.jsx';
import Page7 from './Page7.jsx';
import { message, Select, Button, Card, DatePicker,ConfigProvider } from 'antd';
import moment from 'moment';
const { Option } = Select;
const { RangePicker } = DatePicker;

const apiUrl = 'http://3.110.23.123/api/Shifts.php'; // URL used for both GET and POST

const Shifts = () => {
  const [data, setData] = useState([]); // Initialize state for data
  const [loading, setLoading] = useState(false); // Initialize state for loading

  // States for filter dropdowns
  const [filters, setFilters] = useState({
    empId: [],
    empName: [],
    role: [],
    dept: [],
    project: [],
    team: [],
    shift: [],
    dateRange: [], // State for date range
  });

  // Unique data for filters
  const [uniqueData, setUniqueData] = useState({
    empIds: [],
    empNames: [],
    roles: [],
    depts: [],
    projects: [],
    teams: [],
    shifts: [],
  });

  // Fetch data from the backend using GET method
  const fetchData = async () => {
    if (loading) return; // Prevent multiple fetch calls if already loading
    setLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'GET', // Using GET to retrieve data
      });
      const result = await response.json();
      setUniqueData({
        empIds: result.uniqueEmpIds,
        empNames: result.uniqueEmpNames,
        roles: result.uniqueRoles,
        depts: result.uniqueDepts,
        projects: result.uniqueProjects,
        teams: result.uniqueTeams,
        shifts: result.uniqueShifts,
      });

      message.success(`${result.data.length} items loaded!`);
    } catch (error) {
      console.error('Error fetching the data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to send filters to the backend
  const handleSubmit = async () => {
    // Convert arrays to comma-separated strings or default to 'ALL' if empty
    const formattedFilters = Object.keys(filters).reduce((acc, key) => {
      if (key !== 'dateRange') {
        acc[key] = filters[key].length ? filters[key].join(',') : 'ALL';
      }
      return acc;
    }, {});

    // Handle date range separately
    const [startDate, endDate] = filters.dateRange;
    if (startDate && endDate) {
      formattedFilters.startDate = startDate.format('YYYY-MM-DD');
      formattedFilters.endDate = endDate.format('YYYY-MM-DD');
    } else {
      const today = moment().format('YYYY-MM-DD');
      formattedFilters.startDate = today;
      formattedFilters.endDate = today;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST', // Using POST to send filtered data
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedFilters), // Send the filters in the request body
      });

      if (response.ok) {
        const result = await response.json(); 
        setData(result.data);
        message.success('Filters applied successfully!');
      } else {
        message.error('Failed to apply filters.');
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      message.error('Error applying filters.');
    }
  };

  const handleReset = () => {
    // Reset all filter states
    setFilters({
      empId: [],
      empName: [],
      role: [],
      dept: [],
      project: [],
      team: [],
      shift: [],
      dateRange: [], 
    });
    setData([]);
    fetchData(); // Fetch all data
  };

  // Handle data save (for editing rows in Page6 and adding new rows in Page7)
  const handleSave = async (updatedRow) => {
    setData((prevData) =>
      prevData.map((row) => (row.EMPID === updatedRow.EMPID ? updatedRow : row))
    );

    try {
      const response = await fetch(apiUrl, {
        method: 'PUT', // Use PUT method to update data
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRow), // Send the updated row data in the request body
      });

      if (response.ok) {
        message.success('Data updated successfully!');
        fetchData(); // Fetch data to update the table with any new changes
      } else {
        message.error('Failed to update data.');
      }
    } catch (error) {
      console.error('Error updating the data:', error);
      message.error('Error updating the data.');
    }
  };

  useEffect(() => {
    fetchData(); // Initial data load
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, values) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
  };

  return (
    <div>
     
        <div >
        <Card title={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Filters</span>
        <Page7 onSave={handleSave} />
      </div>
    } >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Date Picker */}
            <div style={{ flex: '1', marginRight: 10 }}>
            <ConfigProvider
                theme={{
                  token: {
                    fontSize: 10, // Adjust globally if applicable
                  },
                }}
              >
              <RangePicker
                size="small"
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                onChange={(dates) => setFilters((prev) => ({ ...prev, dateRange: dates }))}
                value={filters.dateRange}
                placeholder={['Start Date', 'End Date']} 
              />
              </ConfigProvider>
            </div>
            
            {/* Filters */}
            {Object.keys(filters).map((key) => (
              key !== 'dateRange' && (
                <div key={key} style={{ flex: '1', marginRight: 10 }}>
                  <Select
                    size="small"
                    mode="multiple"
                    dropdownClassName="custom-dropdown1"
                    style={{ width: '100%' }}
                    className='pyt'
                    placeholder={`${key.replace(/([A-Z])/g, ' $1')}`}
                    dropdownStyle={{ width: '150px' }}
                    value={filters[key]}
                    onChange={(values) => handleFilterChange(key, values)}
                    allowClear
                  >
                    <Option value="ALL">All</Option>
                    {(uniqueData[`${key}s`] || []).map(value => (
                      <Option key={value} value={value}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </div>
              )
            ))}
            
            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
              <Button type="primary" onClick={handleSubmit} size="small">
                Filters
              </Button>
              <Button size="small" onClick={handleReset}>Reset</Button>
            </div>
          </div>
        </Card>


          {/*<Card title="Add Data" style={{ width: '25%' }}>
            <Page7 onSave={handleSave} />
          </Card>*/}
        </div>
    

      <Page6 data={data} onSave={handleSave} /> {/* Pass data to Page6 */}
    </div>
  );
};

export default Shifts;
