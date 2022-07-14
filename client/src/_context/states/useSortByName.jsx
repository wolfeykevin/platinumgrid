import { useState } from 'react';

const useSortByName = () => {

  const [ sortByName, setSortByNameString ] = useState('');

  const setSortByName = (newState) => {
    setSortByNameString(newState);
  }

  return { sortByName, setSortByName };
}

export default useSortByName;