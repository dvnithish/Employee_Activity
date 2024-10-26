import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Upload, message, Progress, Space, Table, Card, Input, Row, Col, Modal, Form, Input as AntInput } from 'antd';
import { UploadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import Highlighter from 'react-highlight-words';
import Addemp from './Addemp';
import filtersdb from './Filtersdb';
import Filtersdb from './Filtersdb';

const Page2 = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [percent, setPercent] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
  });
  const [uniqueValues, setUniqueValues] = useState({});
const [selectedFilters, setSelectedFilters] = useState({
  ACTIVE_YN: [],
  DEPARTMENT: [],
  EMPID: [],
  EMPNAME: [],
  PROJECT: [],
  ROLE: [],
  SYS_USER_NAME: [],
  TEAM: [],
});


const fetchTableData = async () => {
  try {
    const response = await axios.get('http://3.110.23.123/api/fetch_data1.php');
    const { columns: fetchedColumns, data: fetchedData, uniqueValues: fetchedUniqueValues } = response.data;

    // Set unique values
    setUniqueValues(fetchedUniqueValues);

    // Create dynamic columns
    const dynamicColumns = fetchedColumns.map(col => ({
      title: col,
      dataIndex: col,
      key: col,
      ...getColumnSearchProps(col)
    }));

    dynamicColumns.push({
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ margin: '0 4px' }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ margin: '0 4px' }}
            danger
          >
            Delete
          </Button>
        </>
      ),
    });

    setTableData(fetchedData);
    setColumns(dynamicColumns);

    const total = fetchedData.length;
    const active = fetchedData.filter(item => item.ACTIVE_YN === 'Y').length;
    setSummary({
      totalEmployees: total,
      activeEmployees: active,
      inactiveEmployees: total - active,
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    message.error('Failed to fetch table data.');
  }
};


  useEffect(() => {
    fetchTableData();
  }, []);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      const formattedData = jsonData.map(row => {
        const allotBreak = row['ALLOTED_BREAK'];
        const formattedAllotBreak = typeof allotBreak === 'number'
          ? formatExcelTime(allotBreak)
          : allotBreak || '';
  
        return {
          EMPID: row['EMPID'] || '',
          EMPNAME: row['EMPNAME'] || '',
          EMAIL: row['EMAIL'] || '',
          Sys_user_name: row['sys_user_name'] || '',
          ROLE: row['ROLE'] || '',
          REPORTING_1: row['REPORTING_1'] || '',
          REPORTING_2: row['REPORTING_2'] || '',
          DEPARTMENT: row['DEPARTMENT'] || '',
          TEAM: row['TEAM'] || '',
          PROJECT: row['PROJECT'] || '',
          SHIFT: row['SHIFT'] || '',
          ALLOTED_BREAK: formattedAllotBreak,
          ACTIVE_YN: row['ACTIVE_YN'] || '',
          HOLIDAY_COUNTRY: row['HOLIDAY_COUNTRY'] || '',
          REGION: row['REGION'] || '',  // Added REGION field
          UPDATED_BY: row['UPDATED_BY'] || '' // Added UPDATED_BY field
        };
      });
  
      console.log(formattedData);
  
      setData(formattedData);
      setFileName(file.name);
    };
    reader.readAsBinaryString(file);
    return false;
  };
  
  // Helper function to format Excel time values
  const formatExcelTime = (excelTime) => {
    const totalMinutes = Math.floor(excelTime * 1440); // 1440 minutes in a day
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };
  
  const handleSubmit = async () => {
    if (!Array.isArray(data) || data.length === 0) {
      message.error('Invalid data format!');
      return;
    }

    setProcessing(true);
    setPercent(0);
    setDisabled(true);

    try {
      const interval = setInterval(() => {
        setPercent(prev => (prev >= 100 ? 100 : prev + 20));
        if (percent >= 100) clearInterval(interval);
      }, 1000);

      await axios.post('http://3.110.23.123/api/upload_data1.php', data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      message.success('Data uploaded successfully!');
      setFileName('');
      setData([]);
    } catch (error) {
      message.error(`Error uploading data: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessing(false);
      setPercent(100);
      setDisabled(false);
    }
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
      <div
        style={{ padding: 8 }}
        onKeyDown={(e) => e.stopPropagation()}
      >
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
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => confirm({ closeDropdown: false })}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => close()}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : text
  });

  const handleEdit = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue(record);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      await axios.post('http://3.110.23.123/api/update_data1.php', { ...currentRecord, ...values }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      message.success('Data updated successfully!');
      setEditModalVisible(false);
      fetchTableData(); // Refetch data after update
    } catch (error) {
      message.error(`Error updating data: ${error.message}`);
    }
  };
  const handleDelete = async (record) => {
    try {
      // Destructure the record object to get individual properties
      const { EMPID, EMPNAME, SYS_USER_NAME, SHIFT_START_TIME, SHIFT_END_TIME } = record;
  
      // Create the data object to be sent in the request body
      const dataToSend = {
        EMPID,
        EMPNAME,
        SYS_USER_NAME,
        SHIFT_START_TIME,
        SHIFT_END_TIME
      };
  
      // Make the POST request to the server
      const response = await axios.post('http://3.110.23.123/api/delete.php', dataToSend, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
  
      // Check if the response is successful
      if (response.status === 200) {
        // Notify the user of successful deletion
        message.success('Data deleted successfully!');
        
        // Refetch data after deletion to update the UI
        fetchTableData();
      } else {
        // Handle unexpected response status
        message.error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      // Check if the error response is available
      const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred';
      
      // Notify the user of any errors that occur
      message.error(`Error deleting data: ${errorMessage}`);
    }
  };
  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => ({ ...prev, [category]: value }));
  };
  
  
  

  return (
    <div style={{ padding: 24, maxWidth: '100%' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Upload and Submit" style={{ padding: '16px', marginBottom: 16 }}>
            
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Upload
                customRequest={({ file, onSuccess }) => {
                  handleFileUpload(file);
                  onSuccess();
                }}
                showUploadList={false}
                beforeUpload={(file) => {
                  handleFileUpload(file);
                  return false;
                }}
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Upload Excel (Max: 1)</Button>
              </Upload>
              {fileName && <div style={{ marginTop: 8 }}>File: {fileName}</div>}
              <Button
                onClick={handleSubmit}
                type="primary"
                style={{ marginTop: 16 }}
                disabled={disabled}
              >
                Submit
              </Button>
              
              {processing && (
                <div style={{ marginTop: 16 }}>
                  <Progress percent={percent} />
                  {percent < 100 && <div>Processing... {percent}%</div>}
                </div>
              )}
              
            </Space>
            
              
           
            
          </Card>
        </Col>
        <Col span={12}>
          <Card className="summary-upload-card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignContent: "start",gap:"20%" }}>
            <div className="summary-content">
              <h2>Summary</h2>
              <h4>Total Employees: {summary.totalEmployees}</h4>
              <h4>Active Employees: {summary.activeEmployees}</h4>
              <h4>Inactive Employees: {summary.inactiveEmployees}</h4>
            </div>
            <div> <Addemp /></div>
            </div>
           
          </Card>
        </Col>
      </Row>
      {/*{tableData.length > 0 && (
        <Card title="Employee Data" style={{ marginTop: 16 }}>
          <Table
            dataSource={tableData}
            columns={columns}
            rowKey="EMPID"
            pagination={false}
            scroll={{ x: 'max-content' }}
            style={{ width: '100%' }}
          />
        </Card>
      )}*/}
      <Modal
        title="Edit Employee"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        style={{ top: '5%' }}
      >
        <Form
          form={form}
          onFinish={handleEditSubmit}
          initialValues={currentRecord}
        >
          {columns
            .filter(col => col.dataIndex && col.dataIndex !== 'action')
            .map(col => (
              <Form.Item
                key={col.dataIndex}
                name={col.dataIndex}
                label={col.title}
                rules={[
                  { required: true, message: `Please input ${col.title}!` },
                  ...(col.dataIndex === 'SHIFT_START_TIME' || col.dataIndex === 'SHIFT_END_TIME' || col.dataIndex === 'ALLOTED_BREAK'
                    ? [{ pattern: /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, message: 'Please enter a valid time in HH:MM:SS format' }]
                    : []),
                ]}
              >
                <AntInput />
              </Form.Item>
            ))}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      <Filtersdb />
    
    </div>
    
  );
};

export default Page2;
