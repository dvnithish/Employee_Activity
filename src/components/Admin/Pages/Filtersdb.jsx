import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spin, Typography, Card, Button, Space, Popconfirm, Tooltip, Modal, Form, Input, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import '../Css/Filtersds.css';

const { Title } = Typography;
const { Option } = Select;

const Filtersdb = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    EMPID: [],
    EMPNAME: [],
    DEPARTMENT: [],
    ROLE: [],
    PROJECT: [],
    TEAM: [],
    SYS_USER_NAME: [],
    ACTIVE_YN: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    selectedEMPID: [],
    selectedEMPNAME: [],
    selectedDEPARTMENT: [],
    selectedROLE: [],
    selectedPROJECT: [],
    selectedTEAM: [],
    selectedSYS_USER_NAME: [],
    selectedACTIVE_YN: [],
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [tableVisible, setTableVisible] = useState(false); // New state for table visibility

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://3.110.23.123/api/fetch_data1.php');
      const fetchedData = response.data;
      setData(fetchedData);

      setFilters({
        EMPID: fetchedData.uniqueValues.EMPID || [],
        EMPNAME: fetchedData.uniqueValues.EMPNAME || [],
        DEPARTMENT: fetchedData.uniqueValues.DEPARTMENT || [],
        ROLE: fetchedData.uniqueValues.ROLE || [],
        PROJECT: fetchedData.uniqueValues.PROJECT || [],
        TEAM: fetchedData.uniqueValues.TEAM || [],
        SYS_USER_NAME: fetchedData.uniqueValues.SYS_USER_NAME || [],
        ACTIVE_YN: fetchedData.uniqueValues.ACTIVE_YN || [],
      });

      setSelectedFilters({
        selectedEMPID: [],
        selectedEMPNAME: [],
        selectedDEPARTMENT: [],
        selectedROLE: [],
        selectedPROJECT: [],
        selectedTEAM: [],
        selectedSYS_USER_NAME: [],
        selectedACTIVE_YN: [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      const formatFilters = (filtersArray) => filtersArray.join(',');

      const filtersToSend = {};

      if (selectedFilters.selectedEMPID.length > 0) {
        filtersToSend.EMPID = formatFilters(selectedFilters.selectedEMPID);
      }
      if (selectedFilters.selectedEMPNAME.length > 0) {
        filtersToSend.EMPNAME = formatFilters(selectedFilters.selectedEMPNAME);
      }
      if (selectedFilters.selectedDEPARTMENT.length > 0) {
        filtersToSend.DEPARTMENT = formatFilters(selectedFilters.selectedDEPARTMENT);
      }
      if (selectedFilters.selectedROLE.length > 0) {
        filtersToSend.ROLE = formatFilters(selectedFilters.selectedROLE);
      }
      if (selectedFilters.selectedPROJECT.length > 0) {
        filtersToSend.PROJECT = formatFilters(selectedFilters.selectedPROJECT);
      }
      if (selectedFilters.selectedTEAM.length > 0) {
        filtersToSend.TEAM = formatFilters(selectedFilters.selectedTEAM);
      }
      if (selectedFilters.selectedSYS_USER_NAME.length > 0) {
        filtersToSend.SYS_USER_NAME = formatFilters(selectedFilters.selectedSYS_USER_NAME);
      }
      if (selectedFilters.selectedACTIVE_YN.length > 0) {
        filtersToSend.ACTIVE_YN = formatFilters(selectedFilters.selectedACTIVE_YN);
      }

      // Check if all filters are empty
      const allFiltersEmpty = Object.values(filtersToSend).every(value => !value);

      if (allFiltersEmpty) {
        setTableVisible(false);
        message.info('No filters selected. Please select at least one filter.');
        return;
      }

      const queryParams = new URLSearchParams(filtersToSend).toString();
      const url = `http://3.110.23.123/api/fetch_data1.php?${queryParams}`;

      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      setData(response.data);
      setTableVisible(true); // Make table visible after fetching data
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      await axios.post('http://3.110.23.123/api/update_data1.php', { ...currentRecord, ...values }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      message.success('Data updated successfully!');
      setEditModalVisible(false);
      fetchInitialData();
    } catch (error) {
      message.error(`Error updating data: ${error.message}`);
    }
  };

  const handleDelete = async (record) => {
    try {
      const { EMPID, EMPNAME, SYS_USER_NAME, SHIFT_START_TIME, SHIFT_END_TIME } = record;
      const dataToSend = { EMPID, EMPNAME, SYS_USER_NAME, SHIFT_START_TIME, SHIFT_END_TIME };

      const response = await axios.post('http://3.110.23.123/api/delete.php', dataToSend, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.status === 200) {
        message.success('Data deleted successfully!');
        fetchInitialData();
      } else {
        message.error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred';
      message.error(`Error deleting data: ${errorMessage}`);
    }
  };

  const handleFilterChange = (key, values) => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      [`selected${key}`]: values
    }));
  };

  const handleFilterClick = () => {
    fetchFilteredData();
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      selectedEMPID: [],
      selectedEMPNAME: [],
      selectedDEPARTMENT: [],
      selectedROLE: [],
      selectedPROJECT: [],
      selectedTEAM: [],
      selectedSYS_USER_NAME: [],
      selectedACTIVE_YN: [],
    });
    setTableVisible(false); // Hide the table when filters are reset
    fetchInitialData();
  };

  const hasFilters = Object.values(selectedFilters).some(filterArray => filterArray.length > 0);

  if (loading) {
    return (
      <div style={{display:"flex", justifyContent:"center"}}><Spin size="small" /></div>
    );
  }

  if (!data) {
    return <div>No Internet connection</div>;
  }

  const { columns, data: tableData } = data;

  // Step 1: Exclude indices 15 and 16
  const filteredColumns = columns.filter((_, index) => index !== 15 && index !== 16);

  // Step 2: Slice the filtered columns starting from index 4
  const slicedColumns = filteredColumns.slice(4);

  // Step 3: Map the sliced columns to the desired format
  const tableColumns = slicedColumns.map(col => ({
    title: col,
    dataIndex: col,
    key: col,
    width: col.length * 20, // Optional: Customize column width based on column title length
  }));
  tableColumns.push({
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space size="middle">
        <Tooltip title="Edit">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRecord(record);
              setEditModalVisible(true);
            }}
            type="primary"
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Popconfirm
            title="Are you sure to delete this item?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              type="danger"
            />
          </Popconfirm>
        </Tooltip>
      </Space>
    ),
  });

  return (
    <div>
      <Card bordered={false}>
        <div className='kkk'>
          {Object.keys(filters).map(key => (
            <div key={key} style={{ flex: '1 1 auto' }}>
              <Select
                size="small"
                mode="multiple"
                dropdownClassName="custom-dropdown1"
                style={{ width: "100%" }}
                className='pyt'
                placeholder={`${key}`}
                dropdownStyle={{ width: '150px' }}
                value={selectedFilters[`selected${key}`]}
                onChange={values => handleFilterChange(key, values)}
              >
                <Option value="all">All</Option>
                {(filters[key] || []).map(value => (
                  <Option key={value} value={value}>
                    {value}
                  </Option>
                ))}
              </Select>
            </div>
          ))}
          <Button type="default" size="small" onClick={handleResetFilters} disabled={!hasFilters}>
            Reset
          </Button>
          <Button type="primary" size="small" onClick={handleFilterClick} style={{ marginLeft: 8 }}>
            Filter
          </Button>
        </div>
      </Card>

      {tableVisible && (
        <>
          <Title level={3}>Table Data</Title>
          <Table
            columns={tableColumns}
            dataSource={tableData}
            rowKey="DB_ID"
            scroll={{ x: 'max-content' }}
            style={{ width: '100%' }}
          />
        </>
      )}

      <Modal
        title="Edit Record"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={currentRecord}
          onFinish={handleEditSubmit}
        >
          {columns.slice(4).map(col => (
            <Form.Item
              key={col}
              name={col}
              label={col}
              rules={[{ required: true, message: `Please input ${col}!` }]}
            >
              <Input />
            </Form.Item>
          ))}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Filtersdb;
