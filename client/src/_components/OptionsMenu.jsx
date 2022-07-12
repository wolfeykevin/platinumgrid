import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../_context/AppProvider'
import { SheetContext } from '../_context/SheetProvider';
import toast from 'react-hot-toast';
import { ClickAwayListener } from '@mui/base';
import QrCodeGen from './QrCodeGen';
import { ReactComponent as Archive } from '../_assets/icons/archive.svg';
import { ReactComponent as Edit } from '../_assets/icons/menu-edit.svg';
import { ReactComponent as Duplicate } from '../_assets/icons/menu-duplicate.svg';
import { ReactComponent as Qr } from '../_assets/icons/menu-qr.svg';
import { Fix } from '../_styles/_global';

const OptionsMenu = () => {

  const { store } = useContext(GlobalContext)
  const { globalState } = store
  const { screenType } = globalState

  const { sheet } = useContext(SheetContext)
  const { entryMenu, setEntryMenu } = sheet
  const { entryDetails } = entryMenu
  const navigate = useNavigate();

  const [applyStyle, setApplyStyle] = useState(false)
  const [displayQR, setDisplayQR] = useState(false)
  const [menuLocation, setMenuLocation] = useState({
    visibility: 'hidden',
    top: 0,
    left: 0
  })

  const [menuTargetSheetId, setMenuTargetSheetId] = useState(null)

  useEffect(() => {
    // console.log('entryDetails', entryDetails)
    // console.log('entryMenu.event', entryMenu.event)
    if (Object.keys(entryMenu.event).length > 0 && Object.keys(entryDetails).length > 0) {
      openMenu(entryMenu.event, entryMenu.entryDetails)
    }
  }, [entryMenu])

  // open a menu next to the component clicked on
  const openMenu = (e, target) => {
    e.preventDefault()
    // console.log(sheet_id)
    // console.log(entry_id)
    setMenuTargetSheetId(target)
    setApplyStyle(true)
    const { top, left } = e.target.getBoundingClientRect()
    let bottomDist = window.innerHeight - e.target.offsetTop + e.target.offsetHeight
    if (bottomDist < 440) {
      setMenuLocation({
        visibility: 'visible',
        top: 'unset',
        bottom: 20,
        left: left - 148,
        // right: 20
      })
    } else if (screenType === 'mobile') {
      setMenuLocation({
        visibility: 'visible',
        top: top,
        left: 'unset',
        right: 20
      })
    } else {
      setMenuLocation({
        visibility: 'visible',
        top: top + 28,
        left: left - 124
      })
    }
  }
  
  // close the menu
  const closeMenu = () => {

    setMenuTargetSheetId(null)
    setApplyStyle(false)
    setEntryMenu({
      event: {},
      entryDetails: {}
    })
    setMenuLocation({
      visibility: "hidden",
      top: 0,
      left: 0
    })
  }

  return (
    <>
      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={() => {closeMenu();setDisplayQR(false)}}>
        <div className={`sheet-options-menu-container no-select`} style={menuLocation}>
          <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();navigate(`/sheet/${entryDetails.sheet_id}/${entryDetails.entry_id}`)}}><Edit/><span>Edit</span></div>
          <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();toast.error('Functionality not implemented yet')}}><Duplicate/><span>Duplicate</span></div>
          <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();setDisplayQR(!displayQR)}}><Qr/><span>QR Code</span></div>
          <div className={`sheet-options-menu-item break ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`}></div>
          <div className={`sheet-options-menu-item remove ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();toast.error('Functionality not implemented yet')}}><Archive/><span>Archive</span></div>
        </div>
      </ClickAwayListener>
      <Fix offsetBottom="-100rem" lower center className={`qr-code ${displayQR ? 'visible' : ''}`}>
        { displayQR ? 
          <QrCodeGen entry={entryDetails} fields={sheet.currentSheet.fields}/>
          : <></>
        }
      </Fix>
    </>
  )

}

export default OptionsMenu