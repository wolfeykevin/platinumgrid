import { useState } from 'react';

const useCurrentPage = () => {

  const [ currentPage, setCurrentPageInteger ] = useState(0);

  const setCurrentPage = (newState) => {
    setCurrentPageInteger(newState);
  }

  return { currentPage, setCurrentPage };
}

export default useCurrentPage;