import { useState } from 'react';

const useEntryMenu = () => {

  const [entryMenu, setEntryMenuState] = useState({
    event: {},
    entryDetails: {}
  })

  const setEntryMenu = (newState) => {
    setEntryMenuState(newState);
  }

  return { entryMenu, setEntryMenu};
}

export default useEntryMenu;