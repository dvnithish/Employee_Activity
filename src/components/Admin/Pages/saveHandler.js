import axios from 'axios';
import { message } from 'antd';

export const saveData = async (editingData) => {
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

    return response.data;
  } catch (error) {
    console.error('Error updating data:', error.response ? error.response.data : error.message);
    message.error('Error updating data!');
    throw error;
  }
};
