// Page7.js
import React, { useState } from 'react';
import { Button } from 'antd';
import FormModal from './FormModal';

const Page7 = ({onSave}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAddFormClick = () => {
    setIsModalVisible(true);
  };

  const handleSave = (values) => {
    console.log('Saved from Page7:', values);
    // Handle the saved data as needed
    onSave(values); // Call the passed callback with the form values
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Button type="primary" size="small" onClick={handleAddFormClick}>
        Add Form
      </Button>
      
      <FormModal
        isVisible={isModalVisible}
        onClose={handleCancel}
        onSave={handleSave}
        initialValues={{}} // Provide initial values if needed
        disabledFields={[]} // Empty array means all fields are enabled
      />
    </div>
  );
};

export default Page7;
