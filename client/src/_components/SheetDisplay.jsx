import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GlobalContext } from '../_context/AppProvider'
import { SheetContext } from '../_context/SheetProvider';
import { Div } from '../_styles/_global'
import Entry from './Entry';
import EntryDetails from './EntryDetails';
import logo from '../_assets/img/logo-dark.png';
import dummyData from '../_dummy/sheet.json';
import dummyData2 from '../_dummy/sheet2.json'
import edit from '../_assets/icons/edit-purple.png'
import useScrollHandler from '../_helpers/useScrollHandler';
import smartApi from '../_helpers/smartApi';
import OptionsMenu from './OptionsMenu';

const SheetDisplay = () => {
  const navigate = useNavigate();
  const entryId = useParams.entryId;
  const location = useLocation();
  const mouseDownHandler = useScrollHandler('scroll-container');

  const { store } = useContext(GlobalContext)
  const { theme, isAuth, setIsAuth } = store

  const { sheet } = useContext(SheetContext);

  const { sheetId } = useParams();

  const { sheetPageView, setSheetPageView, setSelectedEntry, selectedEntry, newEntry, setCurrentSheet } = sheet;

  const { user, setSheetAccess, refresh } = store;

  const [ searchString, setSearchString ] = useState('');
  const [ searchField, setSearchField ] = useState('');

  useEffect(() => {
    if (selectedEntry.entry_id > 0) {
      setSheetPageView('edit-entry');
    } else if (newEntry === true) {
      setSheetPageView('new-entry');
    } else if (selectedEntry.entry_id === undefined) {
      setSheetPageView('sheet');
    }
  }, [selectedEntry, newEntry])



  const [ localRefresh, setLocalRefresh ] = useState(false)
   // use useEffect and useState to trigger a rerender every 2 seconds
   useEffect(() => {
    const interval = setInterval(() => {
      setLocalRefresh(!localRefresh)
      // console.log('refreshing sheet')
    }, 2000);
    return () => clearInterval(interval);
  }, [localRefresh])

  useEffect(() => {
    // get user's sheets here
    sheet.setSheetLoading(true)
    
    if (isNaN(sheetId)) {
      navigate('/')
    } else {

      smartApi(['GET', `get_sheet/${sheetId}`], user.token)
        .then(result => {
          // console.log(result);
          if (result.name === undefined) {
            // fix for sheet name location
            result.name = result.sheet.name;
          }
          // order fields by id
          result.fields =  result.fields.sort((a, b) => (a.field_id > b.field_id) ? 1 : -1)
          sheet.setCurrentSheet(result);
          sheet.setSheetLoading(false);
        })
        .catch(error => {
          navigate('/')
          sheet.setSheetLoading(false);
          console.log('error', error)});
    }
  }, [sheetId, localRefresh])

  const filterEntries = () => {
    let entries = sheet.currentSheet.entries
    let fieldIndex = sheet.currentSheet.fields.findIndex(field => field.name === searchField)

    let fieldId = sheet.currentSheet.fields[fieldIndex].field_id;

    console.log(fieldId)
    // filter out entries that don't have a corresponding value
    // entries = entries.filter(entry => entry.values.findIndex(value => value.field_id === fieldId) !== -1)

    // entries.map(entry => 
    //   console.log(entry.values[entry.values.findIndex(value => value.field_id === fieldId)].value))

    return entries.filter(entry => entry.values[entry.values.findIndex(value => value.field_id === fieldId)].value.match(new RegExp(searchString,'i','g')))
  }

  return (
    <>
      <div className={`sheet-display-container ${(sheetPageView === 'edit-entry' || sheetPageView === 'new-entry') ? 'shrink' : ''}`}>
        {/* <SheetHeader> */}
        <div className='sheet-display-header'>
          <div className="sheet-header-meta">
            <img className="sheet-header-icon no-select" src={logo} />
            <span className="nowrap">
              {sheet.currentSheet.name === '' ? 'Loading...' : sheet.currentSheet.name}
            </span>
          </div>
          <div className="sheet-search no-select">
            <div className="search-element">
              <input className="search-element-input" placeholder='Search' 
                onChange={(e) => {setSearchString(e.target.value)}}/>
              <select className="search-element-field-select" defaultValue='Choose Field'
                onChange={(e) => {setSearchField(e.target.value)}}>
                <option disabled hidden defaultValue>Choose Field</option>
                {sheet.currentSheet.fields.filter(field => field.archived === false).map((field, i) => {
                  if (field.type !== 'checkbox') {
                    return <option key={i}>{field.name}</option>
                  }
                }
                )}
              </select>
            </div>
            <button className='filter-button'>Filter</button>
          </div>
        </div>
        <div id='scroll-container' className='sheet-display-body' onMouseDown={(e) => {
          sheet.clickTime.current = new Date();
          mouseDownHandler(e);
          }}>
          <table className='sheet-display-table'>
            {/* <SheetFields> */}
            <thead className='no-select'>
              <tr>
                {sheet.currentSheet.fields.length === 0 ? 
                  <td className='sheet-display-cell'>Loading fields...</td> : <></>}
                {sheet.currentSheet.fields.filter(field => field.favorite === true).map((field, i) =>
                  <td className="sheet-display-cell" key={i}>{field.name}</td>
                )}
                <td className="sheet-display-cell" key='option'></td>
              </tr>
            </thead>
            {/* <SheetEntries> */}
            <tbody>
              {(searchString !== '' && searchField !== '') ? 
                filterEntries().map((entry, i) => {
                  return <Entry data={entry} key={i}/>})
                :
                sheet.currentSheet.entries.map((entry, i) => {
                  return <Entry data={entry} key={i}/>})
              }
            </tbody>
          </table>
        </div>
        {/* <button className="dummy-users-button" onClick={
          () => navigate(`/sheet/${sheet.currentSheet.sheet_id}/users`)}><img alt='edit-icon'/></button> */}
        <button className="new-entry no-select" onClick={() => sheet.setNewEntry(true)}><img alt='edit-icon'/></button>
        {/* <button className="dummy-filter" onClick={filterEntries}>%</button> */}
      </div>
      <EntryDetails entryId={entryId}/>
      <OptionsMenu/>
    </>
  );
}

export default SheetDisplay;
//sidebar

//header
//fields
//entries

//detailed

{/* <tr key={entry.id} onClick={() => {console.log('test')}}>
{sheet.currentSheet.fields.map(field => {
  let index = entry.values.findIndex(value => value.field_id === field.field_id)
  return index === -1 ? <td></td>:<td>{entry.values[index].value}</td>
})}
</tr> */}
{/* <div className="sheet-display-container">
  <div className="sheet-display">
    <div className="sheet-header">{sheet.currentSheet.name}</div>
    {sheet.currentSheet.fields.map(field => {
      let count = 0;
      return (<div className="sheet-column" key={field.field_id}>
        <div className='field'>{field.name}</div>
        {sheet.currentSheet.entries.map(entry => {
          let index = entry.values.findIndex(value => value.field_id === field.field_id)
          let item = entry.values[index];
          count += 1;
          return <div className={`value ${count % 2 === 0 ? 'even':'odd'}`} key={item.value_id}>{item.value}</div>
        })}
      </div>
      )
    }
    )}
  </div>
</div>  */}

{/* <>
<Div flex column className="sheet-display-container">
  <Div flex row className="sheet-header">{sheet.currentSheet.name}</Div>
  <Div flex row className="sheet-fields">
    {sheet.currentSheet.fields.map(field =>
      <span className="field" key={field.id}>{field.name}</span>
    )}
  </Div>
  <Div flex column className="sheet-entries" >
    {sheet.currentSheet.entries.map(entry =>
      <Div flex row className="entry" key={entry.id}>
        {entry.values.map(value =>
          <span className="value" key={value.id}>{value.value}</span>
        )}
      </Div>
    )}
  </Div>
</Div>
</> */}