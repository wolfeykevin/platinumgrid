import React, { useContext, useEffect } from 'react';
import { GlobalContext } from '../_context/AppProvider';
import Index from '../routes/Index'
import Sidebar from '../_components/Sidebar';
import { Toaster } from 'react-hot-toast'
import { useLocation } from 'react-router-dom';
import { Div } from '../_styles/_global'
import useLogin from '../_context/effects/useLogin';

function App() {
  
  const { store } = useContext(GlobalContext)
  const { user } = store
  const { isAuth } = user

  const location = useLocation();
  const { pathname } = location;

  const { handleSignOut } = useLogin()

  return (
    <>
      {

      // isAuth && ['levi', 'kyle', 'dayan', 'danny', 'daniel', 'kevin'].filter(name => user.name.first.toLowerCase() === name).length === 0 ? <Div flex column fills centerchildren className="pointer" onClick={handleSignOut}>Access Denied</Div> : // comment this out to remove basic access restriction
      
      isAuth ? (
          <>
            <Sidebar index={false}/>
            <Toaster
              position="bottom-center"
              reverseOrder={true}
              gutter={8}
              containerClassName="toaster"
              toastOptions={{
                // Define default options
                className: 'toast',
                duration: 2600,
                iconTheme: {
                  primary: '#35405d',
                  secondary: '#fff',
                  padding: '2rem',
                },
                success: {
                  style: {
                    background: 'var(--color-green)',
                    color: 'var(--color-green-toast)',
                    fontWeight: 'var(--bold)'
                  },
                  iconTheme: {
                    primary: 'var(--color-green-toast-icon-primary)',
                    secondary: 'var(--color-green-toast-icon-secondary)',
                    padding: '2rem',
                  },
                },
                error: {
                  style: {
                    background: 'var(--color-red)',
                    color: 'var(--color-red-toast)',
                    fontWeight: 'var(--bold)'
                  },
                  iconTheme: {
                    primary: 'var(--color-red-toast-icon-primary)',
                    secondary: 'var(--color-red-toast-icon-secondary)',
                    padding: '2rem',
                  },
                },
              }}
            />
            <div id="page">
              <Index />
            </div>
          </>
        )
        : <Index />
      }
    </>
  );
}

export default App;
