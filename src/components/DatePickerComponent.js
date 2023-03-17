// DatePickerComponent.js
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { predict } from './LogisticRegression';


const DatePickerComponent = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [predictedDates, setPredictedDates] = useState([]);
  const [message, setMessage] = useState('');

  const handleDateSelect = (date) => {
    if (selectedDates.some((selected) => selected.getTime() === date.getTime())) {
      setSelectedDates(selectedDates.filter((selected) => selected.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDates || selectedDates.length === 0) {
      alert("Please select dates before clicking the 'Predict Headache Dates' button.");
      return;
    }
  
    const formattedDates = selectedDates.map((date) => format(date, 'yyyy-MM-dd'));
    try {
      const predictedDates = await predict(formattedDates);
      if (predictedDates.length === 0) {
        setMessage("It seems like you are not likely to have weather-induced headaches in the following month. This result could have been caused by a lack of sufficient data for the algorithm to make proper prediction or because you aren't sensitive to weather induced migraines. Furthermore, only over a third-of-people experience weather-induced migraines, so it is possible that weather changes don't affect your migraine frequencies. You can read more about the relationship between weather and migraine at https://headachejournal.onlinelibrary.wiley.com/doi/10.1111/head.14482");
      } else {
        setMessage('')
      }
      setPredictedDates(predictedDates);
    } catch (error) {
      console.error("Error during prediction:", error);
      alert("An error occurred while processing your request. Please try again.");
    }
  };
  

  return (
    <div>
      <DatePicker
        selected={null}
        onSelect={handleDateSelect}
        dateFormat="yyyy-MM-dd"
        isMulti
        inline
        highlightDates={selectedDates}
      />
      <button onClick={handleSubmit}>Predict Headache Dates</button>
      <div>
        <h3>Past Migraine Onset Days</h3>
        <ul>
          {selectedDates && selectedDates.map((date, index) => (
            <li key={index}>{format(date, 'yyyy-MM-dd')}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Predicted Migraine Onset Days</h3>
        <p>{message}</p>
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
