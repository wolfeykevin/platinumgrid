import { useState } from 'react';

const useSortById = () => {

  const [ sortById, setSortByIdInteger ] = useState(0);

  const setSortById = (newState) => {
    setSortByIdInteger(newState);
  }

  return { sortById, setSortById };
}

export default useSortById;