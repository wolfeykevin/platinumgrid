import { useState } from 'react';

const useDisplayEntries = () => {

  const [ displayEntries, setDisplayEntriesArray ] = useState([]);

  const setDisplayEntries = (newState) => {
    setDisplayEntriesArray(newState);
  }

  return { displayEntries, setDisplayEntries };
}

export default useDisplayEntries;