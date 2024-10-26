import React, { useState } from 'react';
import { Modal, Form, Input, Select, TimePicker, Checkbox} from 'antd';
import { Button, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

function Addemp() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values) => {
    try {
      // Convert moment objects to strings if necessary
      const formattedValues = {
        ...values,
        ALLOTED_BREAK:values.ALLOTED_BREAK.format('HH:mm'),
      };

      // Send data to the server
      const response = await axios.post('http://3.110.23.123/api/addemp.php', formattedValues);
      
      // Handle success response
      console.log(response.data.success)
      if (response.data.success) {
        message.success('Employee added successfully!');
        setIsModalVisible(false); // Close the modal on success
      } else {
        message.error('Failed to add employee.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('An error occurred while adding employee.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button type="primary" onClick={showModal}>
        Add Employee
      </Button>
      <Modal
        title="Add Employee"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            SHIFT_START_TIME: moment('09:00', 'HH:mm'),
            SHIFT_END_TIME: moment('17:00', 'HH:mm'),
          }}
        >
          <Form.Item
            label="Employee ID"
            name="EMPID"
            rules={[{ required: true, message: 'Please enter employee ID!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Employee Name"
            name="EMPNAME"
            rules={[{ required: true, message: 'Please enter employee name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
  label="Email"
  name="EMAIL"
  rules={[{ required: true, message: 'Please enter your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
>
  <Input type="email" />
</Form.Item>


          <Form.Item
            label="System User Name"
            name="SYS_USER_NAME"
            rules={[{ required: true, message: 'Please enter system user name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Role"
            name="ROLE"
            rules={[{ required: true, message: 'Please enter role!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Reporting 1"
            name="REPORTING_1"
            rules={[{ required: true, message: 'Please enter reporting 1!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Reporting 2"
            name="REPORTING_2"
            rules={[{ required: true, message: 'Please enter reporting 2!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Department"
            name="DEPARTMENT"
            rules={[{ required: true, message: 'Please enter department!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Team"
            name="TEAM"
            rules={[{ required: true, message: 'Please enter team!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Project"
            name="PROJECT"
            rules={[{ required: true, message: 'Please enter project!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Alloted Break"
            name="ALLOTED_BREAK"
            rules={[{ required: true, message: 'Please enter allotted break!' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="Active"
            name="ACTIVE_YN"
            valuePropName="checked"
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>

          <Form.Item
            label="Holiday Country"
            name="HOLIDAY_COUNTRY"
            rules={[{ required: true, message: 'Please enter holiday country!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Region"
            name="REGION"
            rules={[{ required: true, message: 'Please enter region!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Updated By"
            name="UPDATED_BY"
            rules={[{ required: true, message: 'Please enter updated by!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Addemp;
