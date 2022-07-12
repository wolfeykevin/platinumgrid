import React, { useContext, lazy, Suspense, useState } from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import { GlobalContext } from '../_context/AppProvider'
import { Div, Img, Fix } from '../_styles/_global'
import PageLoader from '../_components/PageLoader'
import Loader from '../_components/Loader'
import { SignInBtn } from '../_components/SignInOutBtns';
import p1login from '../_assets/img/p1login.png';
import p1loginmobile from '../_assets/img/p1loginmobile.png';
import home from '../_assets/img/home-images.png';
import homeDark from '../_assets/img/home-images-dark.png';
import logoBlue from '../_assets/img/logo-blue.png';
import pentagon from '../_assets/img/pentagon.png';
import dod from '../_assets/img/dod-seal.png';
import { SheetProvider } from '../_context/SheetProvider'
import Sheets from './sheets/Sheets';
import SheetModify from './sheets/create-edit/SheetModify';
import menu from '../_assets/icons/grip.png';
import { ClickAwayListener } from '@mui/base';
import Sidebar from '../_components/Sidebar';

const Index = () => {

  const { store } = useContext(GlobalContext)
  const { user } = store
  const { isAuth } = user


  // const Sheets = lazy(() => import('./sheets/Sheets'));
  const Account = lazy(() => import('./account/Account'));
  const NotFound = lazy(() => import('./NotFound'));

  return (
    <Routes>
      <Route path='/' element={ <Page/> } />
        <Route path='/create/*' element={ <Suspense fallback={<Loader/>}><div className='sheet-page'><SheetModify/></div></Suspense> } />
        <Route path='/sheet/:sheetId/*' element={ isAuth ? <Suspense fallback={<Loader/>}><Sheets/></Suspense> : <Navigate to="/" replace={true} /> }/>
        <Route path='/account/*' element={ isAuth ? <Suspense fallback={<Loader/>}><Account/></Suspense> : <Navigate to="/" replace={true} /> }/>
      <Route path="/*" element={ isAuth ? <Suspense fallback={<Loader/>}><NotFound/></Suspense> : <Navigate to="/" replace={true} /> }/>
    </Routes>
  );
}

const Page = () => {

  const { store } = useContext(GlobalContext)
  const { globalState, user } = store
  const { loading, screenType } = globalState
  const { isAuth, name, sheetAccess } = user


  const [applyStyle, setApplyStyle] = useState(false)
  const [menuLocation, setMenuLocation] = useState({
    visibility: 'hidden',
    top: 0,
    left: 0
  })

  // open a menu next to the component clicked on
  const openMenu = (e) => {
    const { top, left } = e.target.getBoundingClientRect()
    setApplyStyle(true)
    setMenuLocation({
      visibility: 'visible',
      top: top + 20,
      left: left
    })
  }
  
  // close the menu
  const closeMenu = () => {
    // log('close menu')
    setApplyStyle(false)
    setMenuLocation({
      visibility: "hidden",
      top: 0,
      left: 0
    })
  }

  return (

    loading ? <PageLoader/>
    
    : !isAuth ? (
      
      <Div centerchildren flex fills className='login-screen'>
        <Div className="p1login">
          <Img className="mainimg" alt="login" src={p1login} />
          <Img className="mainimg-mobile" alt="login" src={p1loginmobile} />
          <SignInBtn />
        </Div>
      </Div>
    )
    
    : (screenType === 'mobile') ? (
      <>
        <Sidebar index={true}/>
      </>
    )
    
    : (
      <Div centerchildren flex fills>
        <Fix offset="2.5rem" lower right className="dod-img">
          {/* <Img alt="home" style={{width: '5rem', borderRadius: '2rem', marginBottom: '0rem'}} src={dod} /> */}
          <Img alt="home" style={{width: '8rem', borderRadius: '2rem', marginBottom: '0rem'}} src={pentagon} />
        </Fix>
        <Div flex column centertext fills centerchildren>
          {/* <Img alt="home" className="home-lite" style={{width: '22rem', borderRadius: '2rem', marginBottom: '0rem'}} src={home} /> */}
          {/* <Img alt="home" className="home-dark" style={{width: '22rem', borderRadius: '2rem', marginBottom: '0rem'}} src={homeDark} /> */}
          {/* <Img alt="home" style={{width: '18em', borderRadius: '2rem', marginBottom: '0.5rem'}} src={pentagon} /> */}
          <div className="index-app">
            <Img alt="home" className="prime-logo" style={{width: '4rem',borderRadius: '0rem', marginBottom: '-.5rem', marginRight: '1rem'}} src={logoBlue} />
            SmartSheets
          </div>
        </Div>
        <Fix className="index-welcome-container" offsetBottom="3rem" offsetLeft="10rem" lower left>
          <div className="index-welcome">
            Welcome,
          </div>
          <div className="index-name">
            {name.first} {name.last}
          </div>
        </Fix>
      </Div>
    )

  )




  // return (
  //   <>
  //     loading ? <>dfdfsh</>
  //       : isAuth ? (
  //         <Div centerchildren flex fills>
  //           <Fix offset="2rem" lower right className="dod-img">
  //             <Img alt="home" style={{width: '7rem', borderRadius: '2rem', marginBottom: '0rem'}} src={dod} />
  //           </Fix>
  //           <Div flex column centertext>
  //             <Img alt="home" style={{width: '22rem', borderRadius: '2rem', marginBottom: '2rem'}} src={home} />
  //             <div className="index-welcome">
  //               Welcome to
  //             </div>
  //             <div className="index-app">
  //               SmartSheets
  //             </div>
  //             <div className="index-name">
  //               {name.first} {name.last}
  //             </div>
  //           </Div>
  //         </Div>
  //       ) : (
  //         <Div centerchildren flex fills className='login-screen'>
  //           <Div className="p1login">
  //             <Img className="mainimg" alt="login" src={p1login} />
  //             <Img className="mainimg-mobile" alt="login" src={p1loginmobile} />
  //             <SignInBtn />
  //           </Div>
  //         </Div>
  //       )
  //     }
  //   </>
  // )

}

export default Index;