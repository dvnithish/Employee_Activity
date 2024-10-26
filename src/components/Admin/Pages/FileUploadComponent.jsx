import React, { useState } from 'react';
import { Button, Card, Upload, Progress, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../Css/Page1.css'; // Import the CSS file

const FileUploadComponent = ({ fetchData }) => {
  const [tempData, setTempData] = useState([]); // State for temporarily storing uploaded data
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [percent, setPercent] = useState(0);
  const [disabled, setDisabled] = useState(false); // State to manage button disabled state

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setTempData(jsonData);
      setFileName(file.name);
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const handleSubmit = async () => {
    if (tempData.length === 0) {
      message.error('No data to submit!');
      return;
    }

    setProcessing(true);
    setPercent(0);

    try {
      await axios.post('http://localhost/insert_data.php', tempData, {
        headers: {
          'Content-Type': 'application/json',
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          setPercent(percentCompleted);
        },
        withCredentials: true,
      });

      message.success('Data submitted successfully!');
      fetchData(); // Fetch the updated data
      setTempData([]); // Clear the temporary data
      setFileName(''); // Clear the file name
    } catch (error) {
      console.error('Error submitting data:', error.response ? error.response.data : error.message);
      message.error('Error submitting data!');
    } finally {
      setProcessing(false);
      setDisabled(true); // Disable the submit button after submission
    }
  };

  return (
    <Card className="upload-card">
      <Upload beforeUpload={handleFileUpload} showUploadList={false} multiple={false}>
        <Button icon={<UploadOutlined />} disabled={disabled}>Upload</Button>
      </Upload>
      <span>{fileName}</span>
      <Button type="primary" onClick={handleSubmit} disabled={processing || disabled} style={{ marginLeft: 10 }}>
        Submit
      </Button>
      {processing && <Progress percent={percent} status="active" />}
    </Card>
  );
};

export default FileUploadComponent;
