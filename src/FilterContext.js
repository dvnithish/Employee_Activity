// src/FilterContext.js
import React, { createContext, useContext, useState } from 'react';
import moment from 'moment';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [selectedValues, setSelectedValues] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [data, setData] = useState([]);

  const resetFilters = () => {
    setSelectedValues({});
    setSelectedDate(moment().format('YYYY-MM-DD'));
    setSelectedEmployees([]);
    setData([]); // Reset data on filter reset
  };

  return (
    <FilterContext.Provider
      value={{
        selectedValues,
        setSelectedValues,
        selectedDate,
        setSelectedDate,
        selectedEmployees,
        setSelectedEmployees,
        data,
        setData,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => useContext(FilterContext);
