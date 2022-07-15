import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GlobalContext } from '../_context/AppProvider'
import { SheetContext } from '../_context/SheetProvider';
import { Div, Fix } from '../_styles/_global'
import Entry from './Entry';
import EntryDetails from './EntryDetails';
import logo from '../_assets/img/logo.png';
import dummyData from '../_dummy/sheet.json';
import dummyData2 from '../_dummy/sheet2.json'
import edit from '../_assets/icons/edit-purple.png'
import useScrollHandler from '../_helpers/useScrollHandler';
import smartApi from '../_helpers/smartApi';
import OptionsMenu from './OptionsMenu';
import { ReactComponent as Left } from '../_assets/icons/left.svg';
import { ClickAwayListener } from '@mui/base';
import { applyActionCode } from 'firebase/auth';
import { ReactComponent as Up } from '../_assets/icons/sort-up.svg';
import { ReactComponent as Down } from '../_assets/icons/sort-down.svg';

const SheetDisplay = () => {
  const navigate = useNavigate();
  const entryId = useParams.entryId;
  const location = useLocation();
  const mouseDownHandler = useScrollHandler('scroll-container');

  const { store } = useContext(GlobalContext)
  const { theme, isAuth, setIsAuth, globalState } = store
  const { screenType } = globalState

  const { sheet } = useContext(SheetContext);

  const { sheetId } = useParams();

  const { sheetPageView, setSheetPageView, setSelectedEntry, selectedEntry, newEntry, setCurrentSheet } = sheet;
  const { masterRefresh, triggerRefresh } = sheet;

  const { user, setSheetAccess, refresh, setPageView } = store;

  const [ searchString, setSearchString ] = useState('');
  const [ searchField, setSearchField ] = useState('');
  const [ authLevel, setAuthLevel ] = useState();
  const [ localRefresh, setLocalRefresh ] = useState(false);

  useEffect(() => {
    setPageView('sheet')
  }, [])

  useEffect(() => {
    if (selectedEntry.entry_id > 0) {
      setSheetPageView('edit-entry');
    } else if (newEntry === true) {
      setSheetPageView('new-entry');
    } else if (selectedEntry.entry_id === undefined) {
      setSheetPageView('sheet');
    }
  }, [selectedEntry, newEntry])

  const [ authRefresh, setAuthRefresh ] = useState(false)
    
  // use useEffect and useState to trigger a rerender every 2 seconds
   useEffect(() => {
    const interval = setInterval(() => {
      setAuthRefresh(!authRefresh)
      // console.log('refreshing sheet')
    }, 5000); // had to increase because it triggered ~40 renders per second
    // refresh auth level as well
    smartApi(['GET', `authCheck/${sheetId}`], user.token)
    .then(result => {
      console.log(result);
      setAuthLevel(result);
    })
    .catch(error => console.log('error', error));
    return () => clearInterval(interval);
  }, [authRefresh])

  useEffect(() => {
    let previousPath = sheet.prevPath.current.split('/').length;
    let currentPath = location.pathname.split('/').length;
    if (previousPath === currentPath) {
      sheet.setCurrentPage(0)
      sheet.setDisplayEntries(paginateEntries(
        sortEntries(
          filterCheckbox(
            filterArchived(
              searchEntries(sheet.currentSheet.entries))))))
    }
  }, [sheet.searchString, sheet.searchField, sheet.sortByOrder, sheet.sortById, sheet.archiveFilter, sheet.checkboxFilter.length, masterRefresh, sheet.currentSheet])

  // useEffect(() => {
  //   sheet.setDisplayEntries(paginateEntries(sheet.currentSheet.entries))
  // }, [])

  useEffect(() => {
    // get user's sheets here
    sheet.setSheetLoading(true)
    
    if (isNaN(sheetId)) {
      navigate('/')
    } else {

      smartApi(['GET', `get_sheet/${sheetId}`], user.token)
        .then(result => {
          if (result.ErrorMessage) {
            window.location.reload();
            // console.log('error:', result.ErrorMessage)
          } else if (result.sheet.name !== undefined) {
            // fix for sheet name location
            result.name = result.sheet.name;
            // order fields by id
            result.fields =  result.fields.sort((a, b) => (a.field_id > b.field_id) ? 1 : -1)
            // console.log(result.fields)
            // console.log('Sheet Refreshed')
            // console.log("Previous Sheet Id:", sheet.currentSheet.sheet_id)
            // console.log("New Sheet Id:", result.sheet_id)
            // console.log(sheet.currentSheet.sheet_id === result.sheet_id)
            sheet.setCurrentSheet(result);
            sheet.setSheetLoading(false);
            if (sheet.currentSheet.sheet_id !== result.sheet_id){
              // console.log('Display Entries Initialized')
              sheet.setDisplayEntries(paginateEntries(result.entries.filter(entry => 
                entry.archived === false)))
            }

          }
        })
        .catch(error => {
          navigate('/')
          sheet.setSheetLoading(false);
          // console.log('error', error)
        });
    }
  }, [sheetId, authRefresh])

  useEffect(() => {
    // handle scroll position
    let previousSheetId = sheet.prevPath.current.split('/')[2];
    let currentSheetId = location.pathname.split('/')[2]

    // only maintain scroll position if the sheet id is the same
    if (previousSheetId === currentSheetId) {
      document.getElementById('scroll-container').scroll({
        top: sheet.sheetScroll.current,
      })
    } else {
      document.getElementById('scroll-container').scroll({
        top: 0,
      })
    }
    
    if (previousSheetId !== currentSheetId) {
      // console.log('reset search string')
      sheet.setSearchString(''); // handle search string
      sheet.setArchiveFilter([false]); // handle archive filter
      sheet.setCheckboxFilter([]); // handle checkbox filter
      sheet.setDisplayEntries([]); // handle entry display
      sheet.setCurrentPage(0);
    }

    // refresh auth
    smartApi(['GET', `authCheck/${sheetId}`], user.token)
    .then(result => {
      // console.log(result);
      setAuthLevel(result);
    })
    .catch(error => console.log('error', error));

    // update prevPath for use later
    sheet.prevPath.current = location.pathname;
  },[location.pathname])

  const sortHandler = (fieldId) => {
    if (fieldId !== sheet.sortById) {
      sheet.setSortByOrder('ascending')
    } else {
      sheet.setSortByOrder(sheet.sortByOrder === 'ascending' ? 'descending' : 'ascending')
    }

    sheet.setSortById(fieldId);
  }

  const sortEntries = (entries) => {
    if (sheet.sortById !== 0 && entries !== undefined) {
      let fieldId = sheet.sortById;
  
      // separate entries with and without values
      let entriesWithValues = entries.filter(
        entry => entry.values.findIndex(value => value.field_id === fieldId) !== -1)

      let entriesWithEmptyValues = entriesWithValues.filter(entry => entry.values[entry.values.findIndex(value => value.field_id === fieldId)].value === '')

      entriesWithValues = entriesWithValues.filter(entry => entry.values[entry.values.findIndex(value => value.field_id === fieldId)].value !== '')

      let entriesWithoutValues = entries.filter(
        entry => entry.values.findIndex(value => value.field_id === fieldId) === -1)  
  
      // only sort entries with values
      if (sheet.sortByOrder === 'ascending') {
        entriesWithValues.sort((a, b) => 
          (a.values[a.values.findIndex(value => value.field_id === fieldId)].value.localeCompare(b.values[b.values.findIndex(value => value.field_id === fieldId)].value)))
      } else {
        entriesWithValues.sort((a, b) => 
          (a.values[a.values.findIndex(value => value.field_id === fieldId)].value.localeCompare(b.values[b.values.findIndex(value => value.field_id === fieldId)].value))).reverse()
      }
  
      // concat and return arrays
      return entriesWithValues.concat(entriesWithEmptyValues).concat(entriesWithoutValues)
    } 

    return entries;
  }

  const searchEntries = (entries) => {
    // let entries = sheet.currentSheet.entries
    // console.log((sheet.searchString !== undefined || sheet.searchString !== ''))
    // console.log((sheet.searchField !== ''))
    // commented out the below code to use filter which matches any field, feel free to change it back!
    if (sheet.searchString !== '' && sheet.searchField !== '') {
      // console.log('searching by one field')
      let fieldIndex = sheet.currentSheet.fields.findIndex(field => field.name === sheet.searchField)
      if (fieldIndex !== -1) {
        let fieldId = sheet.currentSheet.fields[fieldIndex].field_id;
        return entries.filter(entry => entry.values[entry.values.findIndex(value => value.field_id === fieldId)].value.match(new RegExp(sheet.searchString,'i','g')))
      }
    } 
    // else 
    if (sheet.searchString !== undefined || sheet.searchString !== '') {
      // console.log('searching by all fields')
      return entries.filter(entry => {
        let entryValues = entry.values
        for (let i = 0; i < entryValues.length; i++) {
          if (entryValues[i].value.toLowerCase().includes(sheet.searchString.toLowerCase())) {
            return entry
          }
        }
      })
    }
    
    // return entries where the entry value matches the search string -- no longer have to define which field you want to search for
    return entries;
  }

  const filteredEntries = sheet.currentSheet.entries.filter(entry => entry.archived === false)

  const [menuTargetSheetId, setMenuTargetSheetId] = useState(null)
  const [applyStyle, setApplyStyle] = useState(false)
  const [menuLocation, setMenuLocation] = useState({
    visibility: 'hidden',
    top: 0,
    left: 0
  })

  const openMenu = (e, target) => {
    e.preventDefault()
    // console.log(sheet_id)
    // console.log(entry_id)
    setMenuTargetSheetId(target)
    setApplyStyle(true)
    const { top, left } = e.target.getBoundingClientRect()
    // let bottomDist = window.innerHeight - e.target.offsetTop + e.target.offsetHeight
    let bottomDist = window.innerHeight - e.clientY
    let rightDist = e.clientX
    if (screenType === 'mobile' && bottomDist < 320) {
      setMenuLocation({
        visibility: 'visible',
        top: 54,
        right: '1rem'
        // right: 20
      })
    } else if (bottomDist <320) {
      setMenuLocation({
        visibility: 'visible',
        top: 54,
        left: left - e.target.offsetWidth + 8
        // right: 20
      })
    } else if (screenType === 'mobile') {
      setMenuLocation({
        visibility: 'visible',
        top: top + 54,
        right: '1rem'
      })
    } else {
      setMenuLocation({
        visibility: 'visible',
        top: top + 54,
        // right: e.target.offsetWidth - '4rem',
        left: left - e.target.offsetWidth + 8
      })
    }
    // console.log('thing: ', e)
  }
  
  // close the menu
  const closeMenu = () => {
    setMenuTargetSheetId(null)
    setApplyStyle(false)
    setMenuLocation({
      visibility: "hidden",
      top: 0,
      left: 0
    })
  }

  const toggleArchiveFilters = (value) => {
    if (sheet.archiveFilter.includes(false) && sheet.archiveFilter.includes(true)) {
      sheet.setArchiveFilter([false])
    } else if (sheet.archiveFilter.includes(false) && !sheet.archiveFilter.includes(true)) {
      sheet.setArchiveFilter([true])
    } else {
      sheet.setArchiveFilter([false, true])
    }
    // if (sheet.archiveFilter.includes(value)) {
    //   let tempArray = sheet.archiveFilter;
    //   let index = sheet.archiveFilter.indexOf(value);
    //   tempArray.splice(index, 1);
    //   sheet.setArchiveFilter(tempArray)
    // } else {
    //   let tempArray = sheet.archiveFilter;
    //   tempArray.push(value);
    //   sheet.setArchiveFilter(tempArray)
    // }
    setLocalRefresh(!localRefresh);
  }

  const checkCheckboxFilter = (fieldData, value) => {
    if (sheet.checkboxFilter === undefined || sheet.checkboxFilter.length === 0) {
      return -1;
    }

    return sheet.checkboxFilter.findIndex(field => field.field_id === fieldData.field_id && field.filter === value);
  }

  const handleCheckboxFilters = (fieldData, value) => {
    let index = sheet.checkboxFilter.findIndex(field => 
      field.field_id === fieldData.field_id && field.filter === value)
    if (index !== -1) {
      let tempArray = sheet.checkboxFilter;
      tempArray.splice(index, 1);
      sheet.setCheckboxFilter(tempArray)
    } else {
      let tempData = {...fieldData}
      tempData.filter = value;
      let tempArray = sheet.checkboxFilter;
      tempArray.push(tempData);
      sheet.setCheckboxFilter(tempArray)
    }

    setLocalRefresh(!localRefresh);
  }

  const filterCheckbox = (entries) => {
    // let entries = sheet.currentSheet.entries;
    if (entries !== undefined && sheet.checkboxFilter !== undefined) {
      return entries.filter(entry => {
        for (let field of sheet.checkboxFilter) {
          let index = entry.values.findIndex(value => value.field_id === field.field_id)
          if (index === -1 || entry.values[index].value === field.filter) {
            return false;
          }
        }
        return true;
      })
    }

    return entries;
  }

  const filterArchived = (entries) => {
    // let entries = sheet.currentSheet.entries;
    if (entries !== undefined && sheet.archiveFilter !== undefined) {
      return entries.filter(entry => {
        for (let value of sheet.archiveFilter) {
          if (entry.archived === value) {
            return true;
          }
        }
        return false;
      })
    }
    return entries
  }

  const pageNavigationHandler = (page) => {
    if (sheet.currentPage !== sheet.displayEntries.length - 1 && sheet.currentPage !== 0) {
      document.getElementById('scroll-container').scroll({
        top: 0,
      })
    }
    if (page < 0) {
      sheet.setCurrentPage(0)
    } else if (page >= sheet.displayEntries.length - 1) {
      sheet.setCurrentPage(sheet.displayEntries.length - 1)
    } else {
      sheet.setCurrentPage(page);
    }
  }

  const paginateEntries = (entries) => {
    let entriesPerPage = 25;
    // let entries = sheet.currentSheet.entries;
    let index = 0;
    let paginatedEntries = [];
    while (index < entries.length) {
      // check remaining entries
      if (entries.length - index > entriesPerPage) {
        paginatedEntries.push(entries.slice(index, index+entriesPerPage))
      } else {
        paginatedEntries.push(entries.slice(index))
      }
      index += entriesPerPage;
    }

    // sheet.setPaginatedEntries(paginatedEntries);
    return paginatedEntries
  }
  
  // console.log(sheet.archiveFilter)
  // console.log(sheet.checkboxFilter)

  return (
    <>
      {/* {paginateEntries()} */}
      <div className={`sheet-display-container ${(sheetPageView === 'edit-entry' || sheetPageView === 'new-entry') ? 'shrink' : ''}`}>
        {/* <SheetHeader> */}
        <div className='sheet-display-header'>
          <div className="sheet-header-meta">
            {/* {console.log('render')} */}
            <img className="sheet-header-icon no-select" src={logo} />
            <div id="sheet-page" className="sheet-modify-icon no-select">
              {sheet.currentSheet.sheet.short_name}
            </div>
            <span className="sheet-title">
              {sheet.currentSheet.name === '' ? '' : sheet.currentSheet.name}
            </span>
          </div>
          <div className="sheet-search no-select">
            <div className="search-element">
              <input className="search-element-input" value={sheet.searchString} placeholder='Search' 
                onChange={(e) => {sheet.setSearchString(e.target.value)}}/>
            </div>
            <button className={`filter-button pointer ${applyStyle ? 'filter-selected' : ''}
              ${
                sheet.checkboxFilter.length > 0 ? 'filter-on' :
                sheet.archiveFilter.length === 1 && sheet.archiveFilter[0] === false ? 'filter-off' : 'filter-on'
              }`} onClick={(e)=>{
              applyStyle ? closeMenu() : openMenu(e, sheet.sheet_id)
            }}>Filter</button>
              {/* <select className="search-element-field-select" defaultValue='All Fields'
                onChange={(e) => {
                  if (e.target.value === 'All Fields') {
                    sheet.setSearchField('')
                  } else {
                    sheet.setSearchField(e.target.value)
                  }
                  // setLocalRefresh(!localRefresh);
                  }}>
                <option defaultValue>All Fields</option>
                {sheet.currentSheet.fields.filter(field => field.archived === false).map((field, i) => {
                  if (field.type !== 'checkbox') {
                    return <option key={i}>{field.name}</option>
                  }
                }
                )}
              </select> */}
          </div>
        </div>
        <div id='scroll-container' className='sheet-display-body no-select pointer' 
          onScroll={(e) => {
            sheet.sheetScroll.current = e.target.scrollTop;
          }}
          onMouseDown={(e) => {
            store.clickTime.current = new Date();
            mouseDownHandler(e);
          }}>
          <table className='sheet-display-table'>
            {/* <SheetFields> */}
            <thead className='no-select'>
              <tr>
                {sheet.currentSheet.fields.length === 0 ? 
                  <td className='sheet-display-cell'>Loading fields...</td> : <></>}
                {sheet.currentSheet.fields.filter(field => field.favorite === true).map((field, i) =>
                  <td id={`${field.name}-${field.id}`} className="sheet-display-cell" key={i} onClick={(e) => {
                    sortHandler(field.field_id);
                  }}
                  >
                    {field.name}
                    {field.field_id !== sheet.sortById ? " " : 
                     sheet.sortByOrder === 'ascending' ?
                     <span className="sort-arrow-down"/>
                     : <span className="sort-arrow-up"/> }
                  </td>
                )}
                <td className="sheet-display-cell" key='option'></td>
              </tr>
            </thead>
            {/* <SheetEntries> */}
            <tbody>
              {/* //comented out below to use new filter algorithm, feel free to change back! */}
              {/* {(searchString !== '' && searchField !== '') ?   */}
              {sheet.displayEntries === undefined ? <></> :
                sheet.displayEntries.length === 0 ? <></> :
                  sheet.displayEntries[sheet.currentPage].map((entry, i) => {
                  return <Entry data={entry} key={i}/>})}
              {/* {(sheet.searchString !== '') ? 
                sortEntries(filterCheckbox(filterArchived(searchEntries()))).filter(entry => entry.archived === false).map((entry, i) => {
                  return <Entry data={entry} key={i}/>})
                :
                sortEntries(filterCheckbox(filterArchived(sheet.currentSheet.entries))).map((entry, i) => {
                  return <Entry data={entry} key={i}/>})
              } */}
            </tbody>
          </table>
        </div>
        {/* <button className="dummy-users-button" onClick={
          () => navigate(`/sheet/${sheet.currentSheet.sheet_id}/users`)}><img alt='edit-icon'/></button> */}
        {authLevel === 'Viewer' ? <></>:<button className="new-entry no-select" onClick={() => sheet.setNewEntry(true)}><span>New Entry</span><img alt='edit-icon'/></button>}
        {/* <button className="dummy-filter" onClick={filterEntries}>%</button> */}
        {sheet.displayEntries.length === undefined || sheet.displayEntries.length <= 1 ? <></> :
      <div className={`page-navigation no-select ${(sheetPageView === 'edit-entry' || sheetPageView === 'new-entry') ? 'shrink' : ''}`}>
        <button className='page-down' onClick={() => pageNavigationHandler(sheet.currentPage - 5)}>&lt;&lt;</button>
        <button className='page-down' onClick={() => pageNavigationHandler(sheet.currentPage - 1)}>&lt;</button>
        <span>Page {sheet.currentPage + 1} of {sheet.displayEntries.length}</span>
        <button className='page-up' onClick={() => pageNavigationHandler(sheet.currentPage + 1)}>&gt;</button>
        <button className='page-down' onClick={() => pageNavigationHandler(sheet.currentPage + 5)}>&gt;&gt;</button>
      </div>
      }
      </div>
      <EntryDetails entryId={entryId}/>
      <OptionsMenu authLevel={authLevel}/>
      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={() => {closeMenu()}}>
        <div onMouseLeave={() => {closeMenu()}} className={`sheet-options-menu-container no-select`} style={menuLocation}>
        <div className="menu-filter-options">
          <div id={`archive-true`} className={`sheet-options-menu-item ${sheet.archiveFilter.includes(true) ? "filter-item-selected" : ""} ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} 
          onClick={(e)=>{toggleArchiveFilters()}}>
            <span className="check-option">{sheet.archiveFilter.includes(true) ? sheet.archiveFilter.includes(false) ? "Show: All" : "Show: Archived" : "Show: Default"}</span> {sheet.archiveFilter.includes(true) ? 
            <span alt="checked" className="check"/> : <span alt="unchecked" className="no-check"/>}
          </div>
        </div>
          {sheet.currentSheet.fields.filter(field => field.type === "checkbox").map((field, i) => {
            return (
              <div className="menu-filter-options" key={i}>
                <div key={`${field.name}-Yes`} id={`archive-true`} 
                className={`sheet-options-menu-item ${checkCheckboxFilter(field, "true") !== -1 ? "filter-item-selected" : ""} ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={(e)=>{handleCheckboxFilters(field, "true")}}>
                  <span className="check-option" key={`${field.name}-text`}>{field.name}</span> {checkCheckboxFilter(field, "true") === -1 ? <span alt="unchecked" className="no-check"/> : <span alt="checked" className="check"/>}
                </div>
                <div key={`${field.name}-No`} id={`archive-true`} className={`sheet-options-menu-item ${checkCheckboxFilter(field, "false") !== -1 ? "filter-item-selected" : ""} ${applyStyle ? 'options-menu-show' : 'options-menu-hidden'}`} onClick={(e)=>{handleCheckboxFilters(field, "false")}}>
                  <span className="check-option" key={`${field.name}-text`}>Not {field.name}</span> {checkCheckboxFilter(field, "false") === -1 ? <span alt="unchecked" className="no-check"/> : <span alt="checked" className="check"/>}
                </div>
              </div>
              
            )
          })}
        </div>
      </ClickAwayListener>
      <Fix className={`entry-tooltip ${filteredEntries.length > 0 ? 'hide' : ''}`} offset="2rem" lower right>
        <span>Create a new entry</span><Left className="flip-horizontal"/>
      </Fix>
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