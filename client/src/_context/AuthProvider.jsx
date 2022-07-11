import React, { useContext, useEffect } from 'react'
import { GlobalContext } from './AppProvider'
import { useAuthState } from 'react-firebase-hooks/auth';
import auth from '../_config/firebase_config.js';
import PageLoader from '../_components/PageLoader';
import { useNavigate, useLocation } from 'react-router-dom';
import useLogin from './effects/useLogin';

const useAuthProvider = ({children}) => {
  
  const { store } = useContext(GlobalContext)
  const { setUser, setGlobalState, resetUser } = store
  
  // the magic that checks local storage to see if if a user is already authenticated
  const [user, loading, error] = useAuthState(auth)
  const { handleSignOut } = useLogin()
  
  const prevLocation = useLocation().pathname
  const navigate = useNavigate();

  useEffect(()=>{
    
    if (user) {
      // console.log('setting user details')
      setUser({
        isAuth: true,
        uid: user.uid,
        token: user.accessToken,
        name: {
          full: user.displayName,
          first: user.displayName.split(' ')[0],
          last: user.displayName.split(' ')[1]
        },
        email: user.email,
        profileImg: user.photoURL,
      })
    }
    
    if (loading) {
      // console.log('auth loading')
      setGlobalState({loading: true})
    }
    
    if (!loading) {
      // console.log('auth loaded')
      setGlobalState({loading: false})
      navigate(prevLocation)
    }
    
    if (error) {
      // console.log('auth error')
      setGlobalState({loading: false})
      console.log('firebase 403, unauthenticated')
      console.log('logging you out')
      handleSignOut()
      resetUser()
      navigate('/')
    }

  }, [user, loading])

  return (
    <>
      { loading ? <PageLoader /> : children }
    </>
  )

}

export default useAuthProvider