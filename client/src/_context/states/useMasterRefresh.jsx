import { useState } from 'react';

const useMasterRefresh = () => {

  const [masterRefresh, setMasterRefreshState] = useState(false);

  const triggerRefresh= () => {
    setMasterRefreshState(prev=>!prev);
  }

  return { masterRefresh, triggerRefresh };
}

export default useMasterRefresh;