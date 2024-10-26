// Page6.js
import React, { useState } from 'react';
import FormModal from './FormModal';
import axios from 'axios';
import { Button, Upload, message, Progress, Space, Table, Card, Input, Row, Col, Modal, Form,Tooltip,Popconfirm, Input as AntInput } from 'antd';
import { UploadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const Page6 = ({ data, onSave }) => {
  const [editingRow, setEditingRow] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  console.log('Record to be ed:', editingRow);


  const handleEditClick = (record) => {
    console.log('Record to be edited:', record); // Print record details to console
    setEditingRow(record);
    setIsModalVisible(true);
  };

  const handleSave = (values) => {
    console.log('Saved:', values);
    onSave(values);
    setEditingRow(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRow(null);
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
      const response = await axios.post('http://3.110.23.123/api/deleteshifts.php', dataToSend, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
  
      // Check if the response is successful
      if (response.status === 200) {
        // Notify the user of successful deletion
        message.success('Data deleted successfully!');
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

  const columns = [
    { title: 'EMPID', dataIndex: 'EMPID', key: 'EMPID' },
    { title: 'EMPNAME', dataIndex: 'EMPNAME', key: 'EMPNAME' },
    { title: 'SYS_USER_NAME', dataIndex: 'SYS_USER_NAME', key: 'SYS_USER_NAME' },
    { title: 'SHIFTTYPE', dataIndex: 'SHIFTTYPE', key: 'SHIFTTYPE' },
    { title: 'SHIFT_START_TIME', dataIndex: 'SHIFT_START_TIME', key: 'SHIFT_START_TIME' },
    { title: 'SHIFT_END_TIME', dataIndex: 'SHIFT_END_TIME', key: 'SHIFT_END_TIME' },
    { title: 'SHIFTSTART_DT', dataIndex: 'SHIFTSTART_DT', key: 'SHIFTSTART_DT' },
    { title: 'SHIFTEND_DT', dataIndex: 'SHIFTEND_DT', key: 'SHIFTEND_DT' },
    { title: 'TIME_ZONE', dataIndex: 'TIME_ZONE', key: 'TIME_ZONE' },
    { title: 'WEEKOFF', dataIndex: 'WEEKOFF', key: 'WEEKOFF' },
    { title: 'COMMENTS', dataIndex: 'COMMENTS', key: 'COMMENTS' },
    {
      title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space size="middle">
        <Tooltip title="Edit">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              handleEditClick(record)
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
  }];
      
  

  return (
    <div>
      <h2></h2>
      <Table
        dataSource={data}
        columns={columns}
        scroll={{ x: 'max-content' }}
      />

      {/* Modal for editing */}
      <FormModal
        isVisible={isModalVisible}
        onClose={handleCancel}
        onSave={handleSave}
        initialValues={editingRow}
        disabledFields={['EMPID', 'EMPNAME', 'SYS_USER_NAME']} // Disable these fields

      />
    </div>
  );
};

export default Page6;
