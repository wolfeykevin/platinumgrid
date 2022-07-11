import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../_context/AppProvider'
import { SheetContext } from '../_context/SheetProvider';
import toast from 'react-hot-toast';
import { ClickAwayListener } from '@mui/base';

const OptionsMenu = () => {

  const { sheet } = useContext(SheetContext)
  const { entryMenu, setEntryMenu } = sheet
  const { entryDetails } = entryMenu

  const navigate = useNavigate();

  const [applyStyle, setApplyStyle] = useState(false)
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
    if (screen === 'mobile') {
      setMenuLocation({
        visibility: 'visible',
        top: top,
        left: 'unset',
        right: 20
      })
    } else {
      setMenuLocation({
        visibility: 'visible',
        top: top + 20,
        left: left
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

  <ClickAwayListener
    mouseEvent="onMouseDown"
    touchEvent="onTouchStart"
    onClickAway={closeMenu}>
    <div className={`sheet-options-menu-container`} style={menuLocation}>
      <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();navigate(`/sheet/${entryDetails}/edit`)}}>Edit</div>
      <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();toast.error('Functionality not implemented yet')}}>Duplicate</div>
      <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();toast.error('Functionality not implemented yet')}}>QR Code</div>
      <div className={`sheet-options-menu-item break ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`}></div>
      <div className={`sheet-options-menu-item remove ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();toast.error('Functionality not implemented yet')}}>Archive</div>
    </div>
  </ClickAwayListener>

  )

}

export default OptionsMenu