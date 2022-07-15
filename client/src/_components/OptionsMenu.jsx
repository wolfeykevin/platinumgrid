import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../_context/AppProvider'
import { SheetContext } from '../_context/SheetProvider';
import toast from 'react-hot-toast';
import { ClickAwayListener } from '@mui/base';
import QrCodeGen from './QrCodeGen';
import { ReactComponent as Archive } from '../_assets/icons/menu-archive.svg';
import { ReactComponent as Unarchive } from '../_assets/icons/menu-unarchive.svg';
import { ReactComponent as Edit } from '../_assets/icons/menu-edit.svg';
import { ReactComponent as Duplicate } from '../_assets/icons/menu-duplicate.svg';
import { ReactComponent as Dupe } from '../_assets/icons/menu-dupe.svg';
import { ReactComponent as Copy } from '../_assets/icons/menu-copy.svg';
import { ReactComponent as Qr } from '../_assets/icons/menu-qr.svg';
import { Fix } from '../_styles/_global';
import smartApi from '../_helpers/smartApi';

const OptionsMenu = (props) => {

  const { store } = useContext(GlobalContext)
  const { globalState, user } = store
  const { screenType } = globalState

  const { sheet } = useContext(SheetContext)
  const { entryMenu, setEntryMenu, triggerRefresh } = sheet
  const { entryDetails } = entryMenu
  const navigate = useNavigate();

  const [displayQR, setDisplayQR] = useState(false)
  const [QRdata, setQRData] = useState();
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
    // let bottomDist = window.innerHeight - e.target.offsetTop + e.target.offsetHeight
    let bottomDist = window.innerHeight - e.clientY
    // console.log(bottomDist)
    let rightDist = e.clientX
    // console.log(rightDist)
    // console.log(e.target.getBoundingClientRect().x)
    // console.log(window.innerWidth)
    if (screenType === 'mobile' && bottomDist < 320) {
      setMenuLocation({
        visibility: 'visible',
        top: 'unset',
        bottom: 72,
        right: 20,
        // right: 20
      })
    } else if (bottomDist <320) {
      setMenuLocation({
        visibility: 'visible',
        top: 'unset',
        bottom: 20,
        left: rightDist - 158
        // right: 20
      })
    } else if (screenType === 'mobile') {
      setMenuLocation({
        visibility: 'visible',
        top: top + 48,
        left: 'unset',
        right: 20
      })
    } else {
      setMenuLocation({
        visibility: 'visible',
        top: top + 48,
        left: rightDist - 158
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

  const refreshSheet = () => {
    smartApi(['GET', `get_sheet/${sheet.currentSheet.sheet_id}`], store.user.token)
    .then(result => {
      // console.log(result);
      if (result.name === undefined) {
        // fix for sheet name location
        result.name = result.sheet.name;
      }
      result.fields =  result.fields.sort((a, b) => (a.field_id > b.field_id) ? 1 : -1)
      // console.log(result);
      sheet.setCurrentSheet(result);
      sheet.setSheetLoading(false);
      triggerRefresh();
    })
    .catch(error => {
      navigate('/')
      sheet.setSheetLoading(false);
      console.log('error', error)});
  }

  const archiveEntry = (entry) => {
    // console.log('attempting to archive entry:', entry)
    smartApi(['PATCH', `archive_entry/${entry.entry_id}`], user.token)
    .then(result => {
      refreshSheet()
      toast.success(`Entry Archived`)
    })
    .catch(error => console.log('error', error));
  }

  const copyEntry = (entry, fields) => {  
    let data = []
    if (entry.values !== undefined) {
      fields.filter(field => field.archived !== true).map(field => {
        let index = entry.values.findIndex(value => value.field_id === field.field_id);
        index === -1 ? data.push(field.name + ": N/A") : data.push(field.name + ": " + entry.values[index].value)
      })
    }

    navigator.clipboard.writeText(data.join('\n'))
    toast.success('Copied Entry')
  }
  

  const duplicateEntry = (dupeEntry) => { //incoming entry

    let payload = {
      values: [],
    }

    dupeEntry.values.filter(field => field.archived !== true).forEach(field => {
      let data = {
        field_id: field.field_id,
      }
      data.value = field.checked.toString();
      data.value = field.value;
      payload.values.push(data);
    })

    // Add the duplicate entry to the sheet
    smartApi(['POST', `add_entry/${sheet.currentSheet.sheet_id}`, payload], store.user.token)
      .then(result => {
        toast.success('Entry Created')
        refreshSheet()
      })
      .catch(error => {
        toast.error('Something went wrong. Please try again.')
        console.log('error', error)
      });
  }

  return (
    <>
      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={() => {closeMenu()}}>
        <div className={`sheet-options-menu-container no-select`} style={menuLocation}>
          { props.authLevel === 'Viewer' ? <></>
            : <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();navigate(`/sheet/${entryDetails.sheet_id}/${entryDetails.entry_id}`)}}><Edit/><span>Edit</span></div>
          }
          <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();copyEntry(entryDetails, sheet.currentSheet.fields);}}><Copy/><span>Copy</span></div>
          <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();setDisplayQR(!displayQR);setQRData(entryDetails)}}><Qr/><span>QR Code</span></div>
          { props.authLevel === 'Viewer' ? <></>
            : <div className={`sheet-options-menu-item ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();duplicateEntry(entryDetails)}}><Dupe/><span>Duplicate</span></div>
          }
          { props.authLevel === 'Viewer' ? <></>
            : <div className={`sheet-options-menu-item break ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`}></div>
          }
          { props.authLevel === 'Viewer' ? <></>
            : <div className={`sheet-options-menu-item ${entryDetails.archived ? 'add' : 'remove'} ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={()=>{closeMenu();archiveEntry(entryDetails)}}>{entryDetails.archived ? <Unarchive/> : <Archive/>}<span>{entryDetails.archived ? 'Unarchive' : 'Archive'}</span></div>
          }
        </div>
      </ClickAwayListener>
      <Fix offsetBottom="-100rem" lower center className={`qr-code ${displayQR ? 'visible' : ''}`} onClick={() => 
        {closeMenu();setDisplayQR(false)}}>
        { displayQR ? 
          <QrCodeGen entry={QRdata} fields={sheet.currentSheet.fields}/>
          : <></>
        }
      </Fix>
    </>
  )

}

export default OptionsMenu