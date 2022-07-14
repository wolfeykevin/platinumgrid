import { useState } from 'react';

const useCheckboxFilter = () => {

  const [ checkboxFilter, setCheckboxFilterArray ] = useState([]);

  const setCheckboxFilter = (newState) => {
    setCheckboxFilterArray(newState);
  }

  return { checkboxFilter, setCheckboxFilter };
}

export default useCheckboxFilter;