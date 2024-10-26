import React, { useEffect, useState } from 'react';
import { Card, Select, message, Button, DatePicker, Spin, Tabs } from 'antd';
import { FilterOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useFilterContext } from '../../../FilterContext';
import ApexChart from './Timeline';
import Timelineapp from './Timelineapp.jsx';
import MonthviewTimeline from './MonthviewTimeline.jsx';

const { Option } = Select;
const { TabPane } = Tabs;

const Page3 = () => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({});
  const [employeeid, setEmployeeid] = useState([]);
  const [tempSelectedEmployees, setTempSelectedEmployees] = useState([]);
  const [showTimelineApp, setShowTimelineApp] = useState(false);
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [exportEnabled, setExportEnabled] = useState(false);
  const [selectedTab, setSelectedTab] = useState('1'); // Track the selected tab
  const [data, setData] = useState([]); // Store the fetched data

  const {
    selectedValues,
    setSelectedValues,
    selectedDate,
    setSelectedDate,
    selectedEmployees,
    setSelectedEmployees,
    resetFilters
  } = useFilterContext();

  // Fetch initial unique filter options on mount
  useEffect(() => {
    fetch('http://3.110.23.123/api/uniquefilters.php')
      .then(response => response.json())
      .then(data => {
        if (data.data) {
          const allOptions = Object.entries(data.data).reduce((acc, [key, values]) => {
            acc[key] = values.map(value => ({ value, label: value }));
            return acc;
          }, {});
          setOptions(allOptions);
        } else {
          message.error('Failed to fetch data');
        }
        setLoading(false);
      })
      .catch(error => {
        message.error('An error occurred while fetching data');
        setLoading(false);
      });
  }, []);

  // Fetch filtered data when shouldFetchData changes
  useEffect(() => {
    if (shouldFetchData) {
      setDataLoading(true);
      const filterParams = Object.entries(selectedValues)
        .map(([key, values]) => `${encodeURIComponent(key)}=${encodeURIComponent(values.join(','))}`)
        .concat(selectedDate ? [`date=${encodeURIComponent(selectedDate)}`] : [])
        .join('&');

      fetch('http://3.110.23.123/api/timeline.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: filterParams
      })
        .then(response => response.json())
        .then(data => {
          setData(data);
          const employeeid = Array.from(new Set(data.map(item => item.EMPID)));
          setEmployeeid(employeeid);
          message.success('Data fetched successfully');
          setExportEnabled(true); // Enable the export button
        })
        .catch(error => {
          message.error('An error occurred while fetching data');
        })
        .finally(() => {
          setShouldFetchData(false);
          setDataLoading(false);
        });
    }
  }, [shouldFetchData, selectedValues, selectedDate]);

  // Handle change for filter values
  const handleChange = (value, key) => {
    setSelectedValues(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? date.format('YYYY-MM-DD') : null);
  };

  const handleReset = () => {
    resetFilters();
    setShowTimelineApp(false);
    setData([]); // Clear data on reset
    setExportEnabled(false);
  };

  const handleApplyFilters = () => {
    setShouldFetchData(true);
  };

  const handleSubmit = () => {
    if (tempSelectedEmployees.length > 0) {
      setSelectedEmployees(tempSelectedEmployees);
      setShowTimelineApp(true);
    } else {
      message.error('Please select at least one employee');
    }
  };

  const handleEmployeeChange = (value) => {
    setTempSelectedEmployees(value);
  };

  const handleResetEmployees = () => {
    setTempSelectedEmployees([]);
    setSelectedEmployees([]);
  };

  const fetchExportData = () => {
    const filterParams = Object.entries(selectedValues)
      .map(([key, values]) => `${encodeURIComponent(key)}=${encodeURIComponent(values.join(','))}`)
      .concat(selectedDate ? [`date=${encodeURIComponent(selectedDate)}`] : [])
      .join('&');

    fetch('http://3.110.23.123/api/usertimeagg.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: filterParams
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          // Generate CSV
          const csvData = data.map(row => Object.values(row));
          const csvContent = [
            Object.keys(data[0]).join(','), // Header row
            ...csvData.map(e => e.join(',')) // Data rows
          ].join('\n');

          // Create and download the CSV file
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', 'exported_data.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          message.error('No data found for export');
        }
      })
      .catch(error => {
        message.error('An error occurred while fetching export data');
      });
  };

  const getFilteredOptions = (columnName) => {
    const selected = selectedValues;
    return options[columnName]?.filter(option => {
      return !Object.keys(selected).some(key => 
        key !== columnName && selected[key].includes(option.value)
      );
    }) || [];
  };

  const filtersToExclude = ['SHIFT', 'DESIGNATION_CATEGORY'];

  return (
    <div>
      <Tabs defaultActiveKey="1" activeKey={selectedTab} onChange={setSelectedTab}>
        <TabPane tab="Activity Timeline" key="1">
          <Card bordered={false} title="Activity Timeline:">
            <div className="kkk">
              <DatePicker
                size="small"
                onChange={handleDateChange}
                value={selectedDate ? moment(selectedDate, 'YYYY-MM-DD') : null}
                placeholder={selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : 'Select date'}
              />

              {Object.keys(options)
                .filter(key => !filtersToExclude.includes(key))
                .map(key => (
                  <div key={key} style={{ flex: '1 1 auto' }}>
                    <Select
                      mode="multiple"
                      size="small"
                      className="pyt"
                      dropdownClassName="custom-dropdown1"
                      style={{ width: '100%' }}
                      dropdownStyle={{ width: '150px' }}
                      placeholder={`${key}`}
                      value={selectedValues[key] || []}
                      onChange={(value) => handleChange(value, key)}
                    >
                      {getFilteredOptions(key).map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                ))}

              <Button icon={<FilterOutlined />} type="primary" size="small" onClick={handleApplyFilters}>
                Filter
              </Button>
              <Button icon={<ReloadOutlined />} size="small" style={{ marginLeft: '8px' }} onClick={handleReset}>
                Reset
              </Button>
              <Button
                icon={<ExportOutlined />}
                type="default"
                size="small"
                onClick={fetchExportData}
                disabled={!exportEnabled}
                style={{ marginLeft: '8px' }}
              >
                Export Data
              </Button>
            </div>
          </Card>

          <Spin spinning={dataLoading}>
            {data.length > 0 && <ApexChart data={data} />}
          </Spin>

          {data.length > 0 && (
            <Card bordered={false} title="Application Usage Timeline:" style={{ marginTop: '20px' }}>
              <Select
                size="large"
                placeholder="Select Employees"
                style={{ width: '20%' }}
                value={tempSelectedEmployees}
                onChange={handleEmployeeChange}
              >
                {employeeid.map(name => (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                size="small"
                onClick={handleSubmit}
                style={{ marginTop: '10px' }}
              >
                Submit
              </Button>
              <Button
                type="default"
                size="small"
                onClick={handleResetEmployees}
                style={{ marginTop: '10px', marginLeft: '8px' }}
              >
                Reset
              </Button>
            </Card>
          )}

          <Spin spinning={dataLoading}>
            {showTimelineApp && <Timelineapp selectedDate={selectedDate} selectedEmployees={selectedEmployees} />}
          </Spin>
        </TabPane>

        <TabPane tab="Month View Timeline" key="2">
          <MonthviewTimeline options={options} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Page3;
