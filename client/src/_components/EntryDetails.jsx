import React, { useState, useEffect, useContext, useRef } from 'react';
import { SheetContext } from '../_context/SheetProvider';
import edit from '../_assets/icons/edit-purple.png'
import Loader from './Loader';
import '../_styles/entry-details.css';
import { Div } from '../_styles/_global'
import { ReactComponent as Check } from '../_assets/icons/checkmark.svg';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'
import smartApi from '../_helpers/smartApi';
import { GlobalContext } from '../_context/AppProvider'

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const EntryDetails = () => {
  const { store } = useContext(GlobalContext);
  const { sheet } = useContext(SheetContext);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const entryId = useParams().entryId;
  const { sheetPageView, setSheetPageView, setSelectedEntry } = sheet;

  const navigate = useNavigate();
  
  const refreshSheet = () => {
    smartApi(['GET', `get_sheet/${sheet.currentSheet.sheet_id}`], store.user.token)
    .then(result => {
      // console.log(result);
      if (result.name === undefined) {
        // fix for sheet name location
        result.name = result.sheet.name;
      }
      // console.log(result);
      sheet.setCurrentSheet(result);
      sheet.setSheetLoading(false);
    })
    .catch(error => {
      navigate('/')
      sheet.setSheetLoading(false);
      console.log('error', error)});
  }

  const submitData = () => {
    //TODO: Build json to send to server
    const sheetFields = sheet.currentSheet.fields
    let payload = {
      sheet_id: sheet.currentSheet.sheet_id,
      values: [],
      entry_id: sheet.selectedEntry.entry_id === undefined ? 'new' : sheet.selectedEntry.entry_id
    }

    sheetFields.filter(field => field.archived !== true).map(field => {
      let data = {
        field_id: field.field_id,
      }

      const fieldElement = document.getElementById(`field-${field.field_id}`)
      const inputElement = fieldElement.querySelector('input')

      if (field.type === 'checkbox') {
        data.value = inputElement.checked.toString();
      } else {
        data.value = inputElement.value;
      }

      if (inputElement.id.split('_')[1] !== 'new'){
        data.value_id = parseInt(inputElement.id.split('_')[1])
      }

      payload.values.push(data);
      // console.log(fieldElement, inputElement)
    })

  
    if (sheet.newEntry === true) {
      // add new entry
      smartApi(['POST', `add_entry/${sheet.currentSheet.sheet_id}`, payload], store.user.token)
        .then(result => {
          console.log(result); 
          sheet.setSelectedEntry({})
          sheet.setNewEntry(false)
          toast.success('Entry Created')
          
          refreshSheet()
          navigate(`/sheet/${location.pathname.split('/')[2]}`)
        })
        .catch(error => {
          toast.error('Something went wrong. Please try again.')
          console.log('error', error)
        });
    } else {
      // update entry
      smartApi(['PATCH', `edit_entry/${sheet.selectedEntry.entry_id}`, payload], store.user.token)
      .then(result => {
        // console.log(result); 
        sheet.setSelectedEntry({})
        sheet.setNewEntry(false)
        toast.success('Entry Updated')
        
        refreshSheet();
        
        navigate(`/sheet/${location.pathname.split('/')[2]}`)
      })
      .catch(error => {
        toast.error('Something went wrong. Please try again.')
        console.log('error', error)
      });
    }

    // new Promise(resolve => setTimeout(resolve, 500)).then(() => {
    //   // setIsLoading(false) // commented out, assuming pane will immediately close and toast will display whether there was success or not
    //   let rand = Math.floor(Math.random() * 5) + 1; // generate random number between 1 and 5 to simulate success or failure
    //   if (rand === 4) {
    //     toast.error('Something went wrong. Please try again.')
    //     console.log('Simulated failed request, this functionality still needs to be implemented.')
    //   } else {
    //     toast.success('Entry Saved')
    //   }
    // })
  }

  useEffect(() => {

    //TODO: Move some of this to SheetDisplay
    if (entryId !== undefined) {
      let index = sheet.currentSheet.entries.findIndex(entry => entry.entry_id === parseInt(entryId))

      if (index !== -1) {
        
        sheet.setSelectedEntry(sheet.currentSheet.entries[index])

        var topPos = document.getElementById(entryId).offsetTop
        var containerHeight = document.getElementsByClassName('sheet-display-body')[0].offsetHeight
        // console.log("Offset Top:", topPos)
        if (topPos > containerHeight-200) {
          document.getElementsByClassName('sheet-display-body')[0].scroll({
            top: topPos-400,
            behavior: 'smooth'
          })
        } 
      } else {
        if (sheet.currentSheet.sheet_id !== 0 && sheet.sheetLoading === false) {
          // setSheetPageView('sheet')
          setSelectedEntry({})
          navigate(`/sheet/${location.pathname.split('/')[2]}`)
        }
      }
    } else {
      setSelectedEntry({})
    }
  }, [location, sheet.currentSheet, sheet.sheetLoading])


  return (
    (Object.keys(sheet.selectedEntry).length === 0 && sheet.newEntry === false) ?
    <div className="entry-details-container hidden"></div>
    :
    <>
      <div className="entry-details-container">

        <div className="entry-details-header no-select">
          <span>{sheet.newEntry === true ? 'New Entry' : 'Update Entry'}</span>
          <button className="entry-details-cancel cancel-desktop" onClick={() => {
            navigate(`/sheet/${location.pathname.split('/')[2]}`)
            sheet.setSelectedEntry({})
            sheet.setNewEntry(false)
          }}>&gt;</button>
          <button className="entry-details-cancel cancel-mobile" onClick={() => {
            navigate(`/sheet/${location.pathname.split('/')[2]}`)
            sheet.setSelectedEntry({})
            sheet.setNewEntry(false)
          }}>x</button>
          {/* <img alt='edit icon'/> */}
        </div>

        <form id={sheet.selectedEntry.entry_id === undefined ? 'new' : sheet.selectedEntry.entry_id}
          className='entry-details-form'>
          {sheet.currentSheet.fields.filter(field => field.archived !== true).map((field, i) => {
            // map through each field of the sheet and try to get the corresponding value from the selected entry
            let index;
            if (sheet.newEntry === false) {
              index = sheet.selectedEntry.values.findIndex(value => value.field_id === field.field_id)
            } else {
              index = -1; // values won't exist for a new entry
            }
            return (
              <div id={`field-${field.field_id}`} key={i} className='entry-details-field' onClick={(e)=> {
                  const el = e.currentTarget.getElementsByClassName('entry-details-input')[0];
                  el.focus()
                }}
                onFocus={(e)=>{
                  for (let element of document.getElementsByClassName('entry-details-field')) {
                    element.classList.remove('field-selected')
                  }
                  e.target.closest('.entry-details-field').classList.add('field-selected');
                }}>
                <div>
                  <span className="field-name">{field.name}</span>
                  <span className="field-type">{capitalize(field.type)}</span>
                </div>
                <hr />
                {field.type === 'checkbox' ? 
                  <div className='entry-details-checkbox-row'>
                    <input id={`${field.field_id}_${index === -1 ? 'new' : sheet.selectedEntry.values[index].value_id}`}
                      key={index === -1 ? 'new' : sheet.selectedEntry.values[index].value_id}
                      className='entry-details-input checkbox'
                      type="checkbox" defaultChecked={index === -1 ? false : sheet.selectedEntry.values[index].value === 'true'}
                      onChange={(e) => {
                        let element = e.target.nextSibling;
                        element.innerText = element.innerText === 'Yes' ? 'No' : 'Yes';
                      }}
                    />
                    <div className='entry-details-checkbox-text'>
                      {index === -1 ? 'No' : (sheet.selectedEntry.values[index].value === 'true' ? 'Yes' : 'No')}
                    </div>
                  </div>
                  :
                  <input id={`${field.field_id}_${index === -1 ? 'new' : sheet.selectedEntry.values[index].value_id}`}
                    key={index === -1 ? 'new' : sheet.selectedEntry.values[index].value_id}
                    className='entry-details-input'
                    defaultValue={index === -1 ? '': sheet.selectedEntry.values[index].value} />
                }
                <div className='entry-field-line' />
              </div>
              )
            }
          )}
        </form>

        <button className='entry-details-update no-select' onClick={async (e) => {
          e.preventDefault()
          submitData();
        }}>Submit</button>

        {/* Covers the entire component after data is submitted. */}
        {isLoading === true ? <div className="entry-details-loader">Please Wait...</div> : <></>}
      </div>
      <div className="entry-details-underlay" onClick={
        () => {
            navigate(`/sheet/${location.pathname.split('/')[2]}`)
            sheet.setSelectedEntry({})
            sheet.setNewEntry(false)
          }}>
      </div>
      <div className="entry-details-underlay-sidebar" onClick={
        () => {
            navigate(`/sheet/${location.pathname.split('/')[2]}`)
            sheet.setSelectedEntry({})
            sheet.setNewEntry(false)
          }}>
      </div>
    </>
  )
}

export default EntryDetails;