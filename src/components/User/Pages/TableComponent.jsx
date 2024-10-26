import React, { useState, useRef } from 'react';
import { Input, Button, Space, Table, Switch, Typography, message, Card } from 'antd';
import { SearchOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axios from 'axios';

const { Title } = Typography;

const TableComponent = ({ data, fetchData, setData }) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [editingData, setEditingData] = useState({}); // State to track edited data
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const searchInput = useRef(null);

  const handleEdit = (key) => {
    setEditingKey(key);
    const currentRow = data.find((item) => item.key === key);
    if (currentRow) {
      setEditingData({ ...currentRow }); // Create a new object for editing
    }
  };

  const handleEditChange = (field, value) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingData.key) {
      message.error('No data to save!');
      return;
    }

    // Format the data if needed before saving
    const formattedData = {
      ...editingData,
      status: editingData.status ? '1' : '0', // Convert boolean to database format
    };

    try {
      const response = await axios.post('http://localhost/update_data.php', formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      console.log('Server response:', response);
      message.success('Data updated successfully!');

      // Update only the single entry in the local state
      setData((prevData) =>
        prevData.map((item) =>
          item.key === editingData.key ? { ...item, ...formattedData } : item
        )
      );
    } catch (error) {
      console.error('Error updating data:', error.response ? error.response.data : error.message);
      message.error('Error updating data!');
    } finally {
      setEditingKey('');
      setEditingData({});
    }
  };

  const handleStatusChange = (key, checked) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, status: checked } : item
      )
    );
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: '15%',
      ...getColumnSearchProps('employeeId'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      ...getColumnSearchProps('name'),
      render: (text, record) =>
        editingKey === record.key ? (
          <Input value={editingData.name} onChange={(e) => handleEditChange('name', e.target.value)} />
        ) : (
          text
        ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      width: '20%',
      ...getColumnSearchProps('position'),
      render: (text, record) =>
        editingKey === record.key ? (
          <Input value={editingData.position} onChange={(e) => handleEditChange('position', e.target.value)} />
        ) : (
          text
        ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: '20%',
      ...getColumnSearchProps('department'),
      render: (text, record) =>
        editingKey === record.key ? (
          <Input value={editingData.department} onChange={(e) => handleEditChange('department', e.target.value)} />
        ) : (
          text
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text, record) => (
        <Switch
          checked={record.status}
          onChange={(checked) => handleStatusChange(record.key, checked)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (text, record) =>
        editingKey === record.key ? (
          <Space size="middle">
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
          </Space>
        ) : (
          <Space size="middle">
            <Button type="default" icon={<EditOutlined />} onClick={() => handleEdit(record.key)}>
              Edit
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <Card className="table-card">
      <Title level={4}>Employee Data</Title>
      <Table
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={(pagination) => setPagination(pagination)}
      />
    </Card>
  );
};

export default TableComponent;
