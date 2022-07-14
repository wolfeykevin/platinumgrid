import { useState } from 'react';

const useArchiveFilter = () => {

  const [ archiveFilter, setArchiveFilterArray ] = useState([false]);

  const setArchiveFilter = (newState) => {
    setArchiveFilterArray(newState);
  }

  return { archiveFilter, setArchiveFilter };
}

export default useArchiveFilter;