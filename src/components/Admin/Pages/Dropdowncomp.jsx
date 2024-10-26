// page1.jsx
import React, { useState, useEffect } from 'react';
import { Select, Card, Button, DatePicker } from 'antd';
import { fetchUniqueFilters } from '../../../apiService'; // Import the API functions
import moment from 'moment'; // For date formatting
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const   Dropdowncomp = ({ onFilterResults }) => {
    const [uniqueFilters, setUniqueFilters] = useState(null);
    const [selectedValues, setSelectedValues] = useState({
        EMPID: [],
        EMPNAME: [],
        ROLE: [],
        DEPARTMENT: [],
        TEAM: [],
        PROJECT: [],
        DATE: null
    });
    const [filteredResults, setFilteredResults] = useState(null);

    // Fetch unique filters on component mount
    useEffect(() => {
        const loadUniqueFilters = async () => {
            try {
                const data = await fetchUniqueFilters();
                setUniqueFilters(data); // Set unique filters data
            } catch (error) {
                console.error('Error fetching unique filters:', error);
            }
        };

        loadUniqueFilters();
    }, []);

    // Handle dropdown change
    const handleDropdownChange = (value, name) => {
        setSelectedValues((prevValues) => ({
            ...prevValues,
            [name]: value
        }));
    };

    // Handle date change
    const handleDateChange = (date, dateString) => {
        setSelectedValues((prevValues) => ({
            ...prevValues,
            DATE: dateString || null
        }));
    };

    // Handle filter button click
    const handleFilter = () => {
        // Logic for filtering results based on selected values
        // For now, just display selected values as filtered results
        const results = selectedValues;
        setFilteredResults(results);
        if (onFilterResults) {
            onFilterResults(results); // Call the callback with filtered results
        }
    };

    // Handle reset button click
    const handleReset = () => {
        setSelectedValues({
            EMPID: [],
            EMPNAME: [],
            ROLE: [],
            DEPARTMENT: [],
            TEAM: [],
            PROJECT: [],
            SHIFT: [], // Still part of the state but won't be rendered
            DATE: null
        });
        setFilteredResults(null);
        if (onFilterResults) {
            onFilterResults(null); // Clear results in the parent component
        }
    };

    // Function to get filtered options based on key
    const getFilteredOptions = (key) => {
        return uniqueFilters && uniqueFilters.data[key] ? uniqueFilters.data[key] : [];
    };

    return (
        <div>
            

            <Card bordered={false} style={{ marginBottom: '16px' }}>
                <div className="kkk" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <DatePicker
                        size="small"
                        format="YYYY-MM-DD"
                        onChange={handleDateChange}
                        value={selectedValues.DATE ? moment(selectedValues.DATE, 'YYYY-MM-DD') : null}
                        placeholder="Select date"
                        style={{ marginRight: '5px', flex: '1 1 auto', width: '15%' }}
                    />
                    {Object.keys(selectedValues)
                        .filter(key => key !== 'DATE' && key !== 'SHIFT') // Exclude DATE and SHIFT from dropdown filters
                        .map(key => (
                            <div key={key} style={{ flex: '1 1 auto'}}>
                                <Select
                                    mode="multiple"
                                    size="small"
                                    className="pyt"
                                    dropdownClassName="custom-dropdown1"
                                    style={{ width: '100%' }} // Changed width to 100% for consistency
                                    dropdownStyle={{ width: '150px' }} // Dropdown width customization
                                    placeholder={key} // Use the key directly
                                    value={selectedValues[key]}
                                    onChange={(value) => handleDropdownChange(value, key)}
                                >
                                    {getFilteredOptions(key).map(option => (
                                        <Option key={option} value={option}>
                                            {option}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        ))}
                    <Button
                        icon={<FilterOutlined />}
                        type="primary"
                        size="small"
                        onClick={handleFilter}
                        style={{ marginRight: '8px' }}
                    >
                        Filter
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        size="small"
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Dropdowncomp;
