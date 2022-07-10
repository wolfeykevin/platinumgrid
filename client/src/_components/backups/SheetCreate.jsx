import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GlobalContext } from '../../_context/AppProvider'
import { SheetContext } from '../../_context/SheetProvider';
import { Div } from '../../_styles/_global'
import Entry from '../Entry';
import EntryDetails from '../EntryDetails';
import logo from '../../_assets/img/logo-dark.png';
import dummyData from '../../_dummy/sheet.json';
import dummyData2 from '../../_dummy/sheet2.json'
import edit from '../../_assets/icons/edit-purple.png'
import useScrollHandler from '../../_helpers/useScrollHandler';
import smartApi from '../../_helpers/smartApi';

const SheetCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { store } = useContext(GlobalContext)
  const { sheet } = useContext(SheetContext);

  const { theme, isAuth, setIsAuth } = store

  const { sheetId } = useParams();

  const { sheetPageView, setSheetPageView, setSelectedEntry, selectedEntry, newEntry, setCurrentSheet } = sheet;

  const { user, setSheetAccess, refresh } = store;

  console.log('i am here')
  return (
    <>
      <div className={`sheet-edit-container`}>
        <div className='sheet-edit-header'>
          <div className="sheet-edit-meta">
            <img className="sheet-edit-icon no-select" src={logo} />
            <span className="nowrap">Create Sheet</span>
          </div>
          {/* <div className="sheet-search no-select">
            <input placeholder='Search'/>
            <button>Filter</button>
          </div> */}
        </div>
        <div id='scroll-container' className='sheet-edit-body'>
        </div>
      </div>
    </>
  );
}

export default SheetCreate;
