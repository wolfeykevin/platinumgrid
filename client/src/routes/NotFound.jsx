import React, { useEffect, useContext } from 'react'
import { Div } from '../_styles/_global'
import { GlobalContext } from '../_context/AppProvider'

const NotFound = () => {

  const { store } = useContext(GlobalContext);
  const { setPageView } = store;

  useEffect(() => {
    setPageView('sheet')
  }, [])

  return (
    <Div flex fills centerchildren className="not-found">
      404
    </Div>
  )
  
}

export default NotFound;
