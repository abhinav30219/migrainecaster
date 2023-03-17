import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';

const DatePickerComponent = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [predictedDates, setPredictedDates] = useState([]);

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
  };

  const handleSubmit = async () => {
    const past_dates = selectedDates.map((date) => date.toISOString().split('T')[0]);
    const response = await axios.post('http://localhost:3001/api/predict', { past_dates });
    setPredictedDates(response.data);
  };

  return (
    <div>
      <DatePicker
        selected={selectedDates}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        isMulti
        inline
      />
      <button onClick={handleSubmit}>Predict Headache Dates</button>
      <div>
        <h3>Predicted Headache Dates</h3>
        <ul>
          {predictedDates.map((date, index) => (
            <li key={index}>{date}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DatePickerComponent;
