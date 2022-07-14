import { useState } from 'react';

const useSearchString = () => {

  const [ searchString, setSearchStringValue ] = useState('');

  const setSearchString = (newState) => {
    setSearchStringValue(newState);
  }

  return { searchString, setSearchString };
}

export default useSearchString;