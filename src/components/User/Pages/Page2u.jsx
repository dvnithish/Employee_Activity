import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Upload, message, Progress, Space, Table, Card, Input, Row, Col, Modal, Form, Input as AntInput } from 'antd';
import { UploadOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import Highlighter from 'react-highlight-words';

const Page3 = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [percent, setPercent] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [tableData, setTableData] = useState([]);

  // Summary states
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [inactiveEmployees, setInactiveEmployees] = useState(0);

  // Edit form state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const fetchTableData = async () => {
    try {
      const response = await axios.get('http://3.110.23.123/api/fetch_data1.php');
      const { columns, data: fetchedData } = response.data;

      // Create column definitions for Ant Design Table
      const dynamicColumns = columns.map(col => ({
        title: col,
        dataIndex: col,
        key: col,
        ...getColumnSearchProps(col)
      }));

      // Add the "Edit" column as the last column
      dynamicColumns.push({
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ margin: '0 4px' }}
          >
            Edit
          </Button>
        ),
      });

      setTableData(fetchedData);
      setColumns(dynamicColumns);
      
      // Calculate summary data
      const total = fetchedData.length;
      const active = fetchedData.filter(item => item.ACTIVE_YN === 'Y').length;
      const inactive = total - active;

      setTotalEmployees(total);
      setActiveEmployees(active);
      setInactiveEmployees(inactive);

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
      let jsonData = XLSX.utils.sheet_to_json(worksheet);

      jsonData = jsonData.map((row) => ({
        CREATE_DT: row['CREATE DT'] || '',
        UPDATED_DT: row['UPDATED DT'] || '',
        DB_ID: row['DB ID'] || '',
        SL_NO: row['SL NO'] || '',
        EMPID: row['EMPID'] || '',
        EMPNAME: row['EMPNAME'] || '',
        EMAIL: row['EMAIL'] || '',
        Sys_user_name: row['SYS USER NAME'] || '',
        ROLE: row['ROLE'] || '',
        REPORTING_1: row['REPORTING 1'] || '',
        REPORTING_2: row['REPORTING 2'] || '',
        DEPARTMENT: row['DEPARTMENT'] || '',
        TEAM: row['TEAM'] || '',
        PROJECT: row['PROJECT'] || '',
        SHIFT: row['SHIFT'] || '',
        SHIFT_START_TIME: row['SHIFT START TIME'] || '',
        SHIFT_END_TIME: row['SHIFT END TIME'] || '',
        ALLOTED_BREAK: row['ALLOTED BREAK'] || '',
        ACTIVE_YN: row['ACTIVE YN'] || '',
        HOLIDAY_COUNTRY: row['HOLIDAY COUNTRY'] || '',
        REGION: row['REGION'] || ''
      }));

      setData(jsonData);
      setFileName(file.name);
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const validateData = (data) => {
    return Array.isArray(data) && data.length > 0;
  };

  const handleSubmit = async () => {
    if (!validateData(data)) {
      message.error('Invalid data format!');
      return;
    }

    setProcessing(true);
    setPercent(0);
    setDisabled(true);

    try {
      const interval = setInterval(() => {
        setPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 1000);

      const response = await axios.post('http://3.110.23.123/api/upload_data1.php', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      console.log('Server response:', response);
      message.success('Data uploaded successfully!');
      setFileName('');
      setData([]);
    } catch (error) {
      console.error('Error uploading data:', error.response ? error.response.data : error.message);
      message.error(`Error uploading data: ${error.response ? error.response.data.message : error.message}`);
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
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleEdit = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue(record);
    setEditModalVisible(true);
  };
  
  const handleEditSubmit = async (values) => {
    try {
      const response = await axios.post('http://3.110.23.123/api/update_data1.php', { ...currentRecord, ...values }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
  
      message.success('Data updated successfully!');
      setEditModalVisible(false);
      fetchTableData(); // Refetch data after update
    } catch (error) {
      console.error('Error updating data:', error);
      message.error(`Error updating data: ${error.message}`);
    }
  };
  

  const handleDelete = async (empId) => {
    try {
      const response = await axios.post('http://3.110.23.123/api/delete_data1.php', { EMPID: empId }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      message.success('Data deleted successfully!');
      fetchTableData(); // Refetch data after deletion
    } catch (error) {
      console.error('Error deleting data:', error);
      message.error(`Error deleting data: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: '100%' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Upload and Submit" style={{ padding:"16PX",marginBottom: 16 }}>
            <Space
              direction="vertical"
              style={{
                width: '100%',
              }}
              size="large"
            >
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
            <div className="summary-content ">
              <h2>Summary</h2>
              <h4>Total Employees: {totalEmployees}</h4>
              <h4>Active Employees: {activeEmployees}</h4>
              <h4>Inactive Employees: {inactiveEmployees}</h4>
            </div>
          </Card>
        </Col>
      </Row>
      {tableData.length > 0 && (
        <Card title="Employee Data" style={{ marginTop: 16 }}>
          <Table
            dataSource={tableData}
            columns={columns}
            rowKey={(record) => record.EMPID}
            pagination={false}
            scroll={{ x: 'max-content' }} // Enable horizontal scroll for long tables
            style={{ width: '100%' }} // Ensure table uses full width
          />
        </Card>
      )}

      <Modal
        title="Edit Employee"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleEditSubmit}
          initialValues={currentRecord}
        >
          {columns
            .filter(col => col.dataIndex && col.dataIndex !== 'action') // Exclude action column and undefined dataIndex columns
            .map(col => (
              <Form.Item
                key={col.dataIndex}
                name={col.dataIndex}
                label={col.title}
                rules={[{ required: true, message: `Please input ${col.title}!` }]}
              >
                <AntInput />
              </Form.Item>
            ))
          }
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

export default Page3;
