import React, { useState } from 'react';
import { Select, Button ,Card} from 'antd';
import moment from 'moment';
import ApexChart2 from './Monthapexchart';
const { Option } = Select;

const MonthviewTimeline = ({ options }) => {
    const [selectedId, setSelectedId] = useState('');
    const [filteredId, setFilteredId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [fetchedData, setFetchedData] = useState(null); // State to hold fetched data

    // Check if options and EMPID are defined
    if (!options || !Array.isArray(options.EMPID) || options.EMPID.length === 0) {
        return <div>No employee IDs available.</div>;
    }

    const employeeIds = options.EMPID.map(emp => emp.value);

    // Month names for display
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = moment().year();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i); // Last 10 years

    const handleChange = (value) => {
        setSelectedId(value);
    };

    const handleFilter = async () => {
      if (selectedId && selectedMonth && selectedYear) {
          setFilteredId(selectedId);
  
          // Create start and end dates using moment
          const startDate = moment(`${selectedYear}-${selectedMonth}-01`).format('YYYY-MM-DD'); // First day of the month
          const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD'); // Last day of the month
  
          // Log the data to be sent
          console.log(`Sending data: Employee ID: ${selectedId}, Start Date: ${startDate}, End Date: ${endDate}`);
  
          // Send the data to the server
          try {
              const response = await fetch('http://3.110.23.123/api/xampp.php', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      EMPID: selectedId,
                      date: startDate,
                      enddate: endDate,
                  }),
              });
  
              const data = await response.json();
              console.log('Response from server:', data);
              setFetchedData(data); // Update state with fetched data
          } catch (error) {
              console.error('Error sending data:', error);
          }
      } else {
          console.log('Please select an employee ID, month, and year to filter.');
      }
  };
  

    const handleReset = () => {
        setSelectedId('');
        setFilteredId('');
        setSelectedMonth(null);
        setSelectedYear(null);
        setFetchedData(null); // Reset fetched data
    };

    return (
        <div>
            <Card title="Select an Employee ID:">
            <Select
                value={selectedId || filteredId || undefined}
                onChange={handleChange}
                size="large"

                placeholder="SELECT EMPID"
                style={{ width: 200, marginRight: 10 }}
            >
                {employeeIds.map(id => (
                    <Option key={id} value={id}>
                        {id}
                    </Option>
                ))}
            </Select>
            <Select
                value={selectedMonth || undefined}
                onChange={setSelectedMonth}
                placeholder="MONTH"
                size="large"

                style={{ width: 150, marginRight: 10 }}
            >
                {monthNames.map((month, index) => (
                    <Option key={index + 1} value={index + 1}>
                        {month} {/* Display month names */}
                    </Option>
                ))}
            </Select>
            <Select
                value={selectedYear || undefined}
                onChange={setSelectedYear}
                placeholder="YEAR"
                size="large"
                style={{ width: 120, marginRight: 10 }}
            >
                {years.map(year => (
                    <Option key={year} value={year}>
                        {year}
                    </Option>
                ))}
            </Select>

            <Button type="primary" size="small" onClick={handleFilter} style={{ marginRight: 10 }}>
                Filter
            </Button>
            <Button onClick={handleReset} size="small">
                Reset
            </Button>
            </Card>
            <ApexChart2 data={fetchedData} />
            {/* Uncomment below if you want to display fetched data */}
            {/* {fetchedData && (
                <div>
                    <h4>Fetched Data:</h4>
                    <pre>{JSON.stringify(fetchedData, null, 2)}</pre>
                </div>
            )} */}
        </div>
    );
};

export default MonthviewTimeline;
