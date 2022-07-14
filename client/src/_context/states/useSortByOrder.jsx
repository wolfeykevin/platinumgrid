import { useState } from 'react';

const useSortByOrder = () => {

  const [ sortByOrder, setSortByOrderString ] = useState('ascending');

  const setSortByOrder = (newState) => {
    setSortByOrderString(newState);
  }

  return { sortByOrder, setSortByOrder };
}

export default useSortByOrder;