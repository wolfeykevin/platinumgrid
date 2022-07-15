import { useState } from 'react';

const useSearchField = () => {

  const [ searchField, setSearchFieldString ] = useState('');

  const setSearchField = (newState) => {
    setSearchFieldString(newState);
  }

  return { searchField, setSearchField };
}

export default useSearchField;