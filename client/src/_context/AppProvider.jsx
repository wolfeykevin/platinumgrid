import React, { createContext } from 'react'

import useGlobalState from './states/useGlobalState'
import useUser from './states/useUser'
import useRefresh from './effects/useRefresh'
import usePageView from './states/usePageView'
import useCheckAuth from './effects/useCheckAuth'

const GlobalContext = createContext()

const AppProvider = ({ children }) => {

  const { globalState, setGlobalState, toggleTheme, setTheme, setScreen } = useGlobalState();
  const { user, setUser, resetUser, setIsAuth, setUid, setName, setEmail, setProfileImg, setSheetAccess, addSheetAccess, removeSheetAccess } = useUser();
  const { refresh } = useRefresh();
  const { pageView, setPageView } = usePageView();
  const { checkAuth } = useCheckAuth(user.sheetAccess);

  const store = {

    /* STATES */
    globalState,
    user,
    pageView,

    /* SETTERS */
    setGlobalState,
    setUser,
    setIsAuth,
    setUid,
    setName,
    setEmail,
    setProfileImg,
    setTheme,
    setSheetAccess,
    setPageView,
    setScreen,
    
    /* EFFECTS */
    resetUser,
    refresh,
    toggleTheme,
    addSheetAccess,
    removeSheetAccess,
    checkAuth,
  }

  return (
    <GlobalContext.Provider value={{ store }}>
      { children }
    </GlobalContext.Provider>
  )
}

export { GlobalContext, AppProvider };