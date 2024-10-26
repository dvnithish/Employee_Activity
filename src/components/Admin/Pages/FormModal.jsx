import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, Row, Col, DatePicker, TimePicker } from 'antd';
import moment from 'moment';

const FormModal = ({ isVisible, onClose, onSave, initialValues, disabledFields = [] }) => {
  const [form] = Form.useForm();
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedWeekOff, setSelectedWeekOff] = useState([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        EMPID: initialValues.EMPID,
        EMPNAME: initialValues.EMPNAME,
        SYS_USER_NAME: initialValues.SYS_USER_NAME,
        SHIFTTYPE: initialValues.SHIFTTYPE || '',
        SHIFT_START_TIME: initialValues.SHIFT_START_TIME ? moment(initialValues.SHIFT_START_TIME, 'HH:mm:ss') : null,
        SHIFT_END_TIME: initialValues.SHIFT_END_TIME ? moment(initialValues.SHIFT_END_TIME, 'HH:mm:ss') : null,
        SHIFTSTART_DT: initialValues.SHIFTSTART_DT ? moment(initialValues.SHIFTSTART_DT, 'YYYY-MM-DD') : null,
        SHIFTEND_DT: initialValues.SHIFTEND_DT ? moment(initialValues.SHIFTEND_DT, 'YYYY-MM-DD') : null,
        TIME_ZONE: initialValues.TIME_ZONE || 'Asia/Kolkata', // Default to "Asia/Kolkata"
        WEEKOFF: initialValues.WEEKOFF ? initialValues.WEEKOFF.split(',') : [],
        COMMENTS: initialValues.COMMENTS
      });
      setSelectedShift(initialValues.SHIFTTYPE || '');
      setSelectedWeekOff(initialValues.WEEKOFF ? initialValues.WEEKOFF.split(',') : []);
    }
  }, [initialValues, form]);

  const handleWeekOffChange = (value) => {
    setSelectedWeekOff(value);
    form.setFieldsValue({ WEEKOFF: value });
  };

  const handleSave = () => {
    form.validateFields()
      .then(values => {
        // Convert DateTime objects to strings for backend
        if (values.SHIFT_START_TIME) {
          values.SHIFT_START_TIME = values.SHIFT_START_TIME.format('HH:mm:ss');
        }
        if (values.SHIFT_END_TIME) {
          values.SHIFT_END_TIME = values.SHIFT_END_TIME.format('HH:mm:ss');
        }
        if (values.SHIFTSTART_DT) {
          values.SHIFTSTART_DT = values.SHIFTSTART_DT.format('YYYY-MM-DD');
        }
        if (values.SHIFTEND_DT) {
          values.SHIFTEND_DT = values.SHIFTEND_DT.format('YYYY-MM-DD');
        }

        // Convert WEEKOFF array to a string
        values.WEEKOFF = values.WEEKOFF ? values.WEEKOFF.join(',') : '';

        console.log('Saved:', values);
        onSave(values);
        onClose();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title="Edit Employee"
      visible={isVisible}
      onOk={handleSave}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
      style={{ top: 20 }}
      width="50%"  // Adjust modal width to fit the screen size
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="EMPID" name="EMPID" rules={[{ required: true, message: 'EMPID Required' }]}>
              <Input disabled={disabledFields.includes('EMPID')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="EMPNAME" name="EMPNAME" rules={[{ required: true, message: 'Please enter the employee name!' }]}>
              <Input disabled={disabledFields.includes('EMPNAME')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="SYS_USER_NAME" name="SYS_USER_NAME" rules={[{ required: true, message: 'SYS_USER_NAME Required' }]}>
              <Input disabled={disabledFields.includes('SYS_USER_NAME')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="SHIFTTYPE" name="SHIFTTYPE" rules={[{ required: true, message: 'SHIFTTYPE Required' }]}>
              <Select
                value={selectedShift}
                onChange={(value) => setSelectedShift(value)}
              >
                <Select.Option value="DAY">DAY</Select.Option>
                <Select.Option value="NIGHT">NIGHT</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="SHIFT_START_TIME" name="SHIFT_START_TIME" rules={[{ required: true, message: 'SHIFT_START_TIME Required' }]}>
              <TimePicker
                format="HH:mm"
                minuteStep={30}
                use12Hours={false}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="SHIFT_END_TIME" name="SHIFT_END_TIME" rules={[{ required: true, message: 'SHIFT_END_TIME Required' }]}>
              <TimePicker
                format="HH:mm"
                minuteStep={30}
                use12Hours={false}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="SHIFTSTART_DT" name="SHIFTSTART_DT" rules={[{ required: true, message: 'SHIFTSTART_DT Required' }]}>
              <DatePicker
                format="YYYY-MM-DD"
                value={form.getFieldValue('SHIFTSTART_DT')}
                onChange={(date) => form.setFieldsValue({ SHIFTSTART_DT: date ? date : null })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="SHIFTEND_DT" name="SHIFTEND_DT" rules={[{ required: true, message: 'SHIFTEND_DT Required' }]}>
              <DatePicker
                format="YYYY-MM-DD"
                value={form.getFieldValue('SHIFTEND_DT')}
                onChange={(date) => form.setFieldsValue({ SHIFTEND_DT: date ? date : null })}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="TIME_ZONE" name="TIME_ZONE" rules={[{ required: true, message: 'TIME_ZONE Required' }]}>
              <Input defaultValue="Asia/Kolkata" disabled={true} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="WEEKOFF" name="WEEKOFF" rules={[{ required: true, message: 'WEEKOFF Required' }]}>
              <Select
                mode="multiple"
                placeholder="Select Week Off Days"
                value={selectedWeekOff}
                onChange={handleWeekOffChange}
              >
                <Select.Option value="Sunday">Sunday</Select.Option>
                <Select.Option value="Monday">Monday</Select.Option>
                <Select.Option value="Tuesday">Tuesday</Select.Option>
                <Select.Option value="Wednesday">Wednesday</Select.Option>
                <Select.Option value="Thursday">Thursday</Select.Option>
                <Select.Option value="Friday">Friday</Select.Option>
                <Select.Option value="Saturday">Saturday</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="COMMENTS" name="COMMENTS" rules={[{ required: true, message: 'COMMENTS Required' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormModal;
