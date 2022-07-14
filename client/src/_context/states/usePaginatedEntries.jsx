import { useState } from 'react';

const usePaginatedEntries = () => {

  const [ paginatedEntries, setPaginatedEntriesArray ] = useState([]);

  const setPaginatedEntries = (newState) => {
    setPaginatedEntriesArray(newState);
  }

  return { paginatedEntries, setPaginatedEntries };
}

export default usePaginatedEntries;