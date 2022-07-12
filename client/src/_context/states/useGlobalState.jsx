import { useState } from 'react'

const useGlobalState = () => {

  let defaultTheme = localStorage.getItem('smartsheets-theme') || 'lite'

  const [globalState, setGlobalStateObj] = useState({
    language: "en",
    loading: false,
    screenType: 'desktop',
    theme: defaultTheme,
  })

  const setGlobalState = (updates) => {
    setGlobalStateObj({
      ...globalState,
      ...updates
    })
  }

  const toggleTheme = () => {
    if (defaultTheme === null) {
      defaultTheme = 'lite'
    }
    setGlobalState({
      ...globalState,
      theme: globalState.theme === "lite" ? "dark" : "lite",
    })
    
    localStorage.setItem('smartsheets-theme', globalState.theme === "lite" ? "dark" : "lite")
  }

  const setTheme = (newTheme) => {
    if (newTheme === null) {
      newTheme = 'lite'
    }
    setGlobalState({
      ...globalState,
      theme: newTheme,
    })

    localStorage.setItem('smartsheets-theme', newTheme)
  }

  const setScreen = (screenType) => {
    if (screenType === null) {
      screenType = 'desktop'
    }
    setGlobalState({
      ...globalState,
      screenType: screenType,
    })

  }

  return { globalState, setGlobalState, toggleTheme, setTheme, setScreen }

}

export default useGlobalState