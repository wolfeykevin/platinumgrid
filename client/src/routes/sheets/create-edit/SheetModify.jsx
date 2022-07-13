import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GlobalContext } from '../../../_context/AppProvider'
import { SheetContext } from '../../../_context/SheetProvider';
import { Div } from '../../../_styles/_global'
import Entry from '../../../_components/Entry';
import EntryDetails from '../../../_components/EntryDetails';
import dummyData from '../../../_dummy/sheet.json';
import dummyData2 from '../../../_dummy/sheet2.json'
import editPurple from '../../../_assets/icons/edit-purple.png'
import edit from '../../../_assets/icons/edit.png'
import useScrollHandler from '../../../_helpers/useScrollHandler';
import smartApi from '../../../_helpers/smartApi';
import '../../../_styles/sheet-modify.css'
import toast from 'react-hot-toast';
import { ReactComponent as Favorited } from '../../../_assets/icons/favorite.svg';
import { ReactComponent as NotFavorited } from '../../../_assets/icons/unfavorite.svg';
import { ReactComponent as Archived } from '../../../_assets/icons/unarchive.svg';
import { ReactComponent as NotArchived } from '../../../_assets/icons/archive.svg';

const SheetModify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { store } = useContext(GlobalContext);
  const { sheet } = useContext(SheetContext);

  const { user, theme, checkAuth, isAuth, setIsAuth } = store;
  
  const [ newSheet, setNewSheet ] = useState(true);
  const [ isLoading, setIsLoading ] = useState(true);
  
  const [ importedData, setImportedData ] = useState('');

  const [ sheetId, setSheetId ] = useState(0);
  const [ sheetName, setSheetName ] = useState('');
  const [ shortName, setShortName ] = useState('');
  const [ sheetFields, setSheetFields ] = useState([]);
  const [ sheetFieldsNew, setSheetFieldsNew ] = useState([]);
  const [ sheetFieldsArchived, setSheetFieldsArchived ] = useState([]);
  const [ authLevel, setAuthLevel ] = useState();

  const setSheetFieldsOrdered = (data) => {
    setSheetFields(data.sort((a, b) => (a.field_id > b.field_id) ? 1 : -1))
  };

  const setSheetFieldsArchivedOrdered = (data) => {
    setSheetFieldsArchived(data.sort((a, b) => (a.field_id > b.field_id) ? 1 : -1))
  };

  const importFromCSV = () => {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept=".csv";
    input.onchange = (e) => { 
       var file = e.target.files[0]; 
    
       var reader = new FileReader();
       reader.readAsText(file,'UTF-8');
    
       reader.onload = readerEvent => {
          var content = readerEvent.target.result.replaceAll("\r","").split('\n').map(row => row.split(','));
          
          let headers = content.splice(0, 1);

          console.log("Name:", file.name.replace(/\.csv/g, ''))
          console.log("Shortname:", file.name.replace(/\.csv/g, '').substring(0, 3))
          console.log("Headers:", headers)
          // console.log("Content:", content)

          addMultipleFields(headers)

          let headerLength = headers[0].length;
          console.log(headerLength)
          //TODO: Implement the rest
          let data = {
            sheet_id: 'new',
            entries: [],
          }

          content.forEach(row => {
            let entry = {
              entry_id: 'new',
              values: []
            }
            row.forEach((value, i) => {
                entry.values.push({
                  field_id: 'new',
                  importedId: i,
                  value: value,
                })
            })

            entry.values = entry.values.slice(0, headerLength)
            data.entries.push(entry);
          })
          console.log(data.entries);
          setSheetName(file.name.replace(/\.csv/g, ''))
          setShortName(file.name.replace(/\.csv/g, '').substring(0, 3))

          setImportedData(data);
          // console.log(data);
       }
    }
    
    input.click();
  }

  useEffect(() => {
    if (location.pathname.split('/')[1] === 'create') {
      setNewSheet(true);
      setIsLoading(false);
      sheet.setCurrentSheet({
        name: "",
        sheet_id: 0,
        fields: [],
        entries: [],
        sheet: {
          name: "",
          short_name: ""
        }
      });
    } else {
      const sheetId = location.pathname.split('/')[2]

      setNewSheet(false);
      setIsLoading(true);
      // fetch and parse sheet info here
      if (isNaN(sheetId)) {
        console.log('Sheet ID is NaN')
        navigate('/')
      } else {
        smartApi(['GET', `get_sheet/${sheetId}`], user.token)
          .then(result => {
            if (result.name === undefined) {
              // fix for sheet name location
              result.name = result.sheet.name;
            }
            
            sheet.setCurrentSheet(result);
            setIsLoading(false);
          })
          .catch(error => {
            console.log('error', error)});
      }

    }
  }, [location.pathname])

  useEffect(() => {
    setAuthLevel(checkAuth(user.sheetAccess, sheet.currentSheet.sheet_id)) // broken, had to disable to continue working
    setSheetName(sheet.currentSheet.sheet.name)
    setShortName(sheet.currentSheet.sheet.short_name)
    setSheetFieldsOrdered(sheet.currentSheet.fields.filter(field => field.archived === false))
    setSheetFieldsArchivedOrdered(sheet.currentSheet.fields.filter(field => field.archived === true))
  }, [sheet.currentSheet])

  const addField = () => {
    //initialize empty field
    const blankField = {
      field_id: 'new',
      name: '',
      type: 'text',
      favorite: true,
      archived: false,
    }

    //add new field to the array
    setSheetFieldsNew([...sheetFieldsNew, blankField])
  }

  const addMultipleFields = (data) => {
    let newFields = []

    data[0].forEach((element, i) => {
      newFields.push({
        field_id: 'new',
        name: element,
        type: 'text',
        favorite: true,
        archived: false,
        importedId: i,
      })
    })

    setSheetFieldsNew([...sheetFieldsNew, ...newFields])
  }

  const deleteField = (index) => {
    let newFieldArray = [...sheetFieldsNew];
    newFieldArray.splice(index, 1);
    setSheetFieldsNew(newFieldArray);
  }

  const updateFieldType = (index, value, target, setTarget) => {
    let newFieldArray = [...target];

    newFieldArray[index].type = value;
    setTarget(newFieldArray);
  }

  const updateFieldName = (index, value, target, setTarget) => {
    let newFieldArray = [...target];

    newFieldArray[index].name = value;
    setTarget(newFieldArray);
  }
  
  const toggleFieldFavorite = (index, target, setTarget) => {
    let newFieldArray = [...target];
    
    newFieldArray[index].favorite = !newFieldArray[index].favorite;
    setTarget(newFieldArray);
  }

  const updateArchivedFieldType = (index, value) => {
    let newFieldArray = [...sheetFieldsArchived];

    newFieldArray[index].type = value;
    setSheetFieldsArchived(newFieldArray);
  }

  const updateArchivedFieldName = (index, value) => {
    let newFieldArray = [...sheetFieldsArchived];

    newFieldArray[index].name = value;
    setSheetFieldsArchived(newFieldArray);
  }

  const archiveField = (index) => {
    let newFieldArray = [...sheetFields];
    let newFieldArchivedArray = [...sheetFieldsArchived];

    let element = newFieldArray.splice(index, 1)[0];
    element.archived = true;
    element.favorite = false;
    newFieldArchivedArray.push(element);

    setSheetFields(newFieldArray);
    setSheetFieldsArchived(newFieldArchivedArray);
  }

  const unarchiveField = (index) => {
    let newFieldArray = [...sheetFields];
    let newFieldArchivedArray = [...sheetFieldsArchived];

    let element = newFieldArchivedArray.splice(index, 1)[0];
    element.archived = false;
    newFieldArray.push(element);

    setSheetFields(newFieldArray);
    setSheetFieldsArchived(newFieldArchivedArray);
  }


  const handleFields = (sheetId) => {
    let payload = {fields: sheetFields.concat(sheetFieldsNew).concat(sheetFieldsArchived)}
    // let payload = {fields: sheetFields}

    console.log(payload);

    smartApi(['PATCH', `/handle_field/${sheetId}`, payload], user.token)
      .then(async result => {
        console.log(result); 

        if (importedData !== '') {
          importedData.entries.forEach(entry => {
            result.forEach(field => {
              // console.log(entry.values);
              // console.log(field.importedIndex)
              let index = entry.values.findIndex(value => value.importedId === field.importedId)
              if (index !== -1) {
                entry.values[index].field_id = field.field_id
              }
              // console.log(index)
              // console.log(entry)
              delete entry.values[index].importedId;
            })
          })
          console.log(importedData)
          await smartApi(['POST', `/add_many_entries/${sheetId}`, importedData], user.token)
            .then(result => console.log(result))
            .catch(err => console.log(err))
        }

        if (newSheet === true) {
          toast.success("Sheet Created")
        } else {
          toast.success("Sheet Updated")
        }
        navigate(`/sheet/${sheetId}`)
      })
      .catch(error => console.log('error', error));
  }

  const submitData = () => {
    const errorMessages = [];

    if (sheetName === '') {
      errorMessages.push('Please enter a sheet name.')
    }

    if (shortName === '') {
      errorMessages.push('Please enter a short name.')
    }

    if (sheetFields.length <= 0 && sheetFieldsNew.length <= 0) {
      errorMessages.push('Please create at least one field.')
    }

    if (sheetFieldsNew.filter(field => field.name === '').length > 0) {
      errorMessages.push('One or more fields is missing a name.')
    }

    if (errorMessages.length > 0) {
      errorMessages.map(message => toast.error(message))
      return;
    }

    let payload = {
      name: sheetName,
      short_name: shortName,
      // fields : sheetFields,
    }

    if (newSheet === true) {
      smartApi(['POST', `add_sheet`, payload], user.token)
        .then(result => {
          console.log(result); 
          let newSheetId = result.split(' ')[result.split(' ').length-1]
          
          handleFields(newSheetId);
        })
        .catch(error => console.log('error', error));
    } else {
      smartApi(['PATCH', `edit_sheet/${sheet.currentSheet.sheet_id}`, payload], user.token)
      .then(result => {
        console.log(result); 

        handleFields(sheet.currentSheet.sheet_id);
      })
      .catch(error => console.log('error', error));
    }
  }

  const moveUp = (index) => {
    if (index > 0) {
      let newFieldArray = [...sheetFieldsNew];
  
      let temp = newFieldArray[index - 1];
      newFieldArray[index - 1] = newFieldArray[index]
      newFieldArray[index] = temp;
  
      setSheetFieldsNew(newFieldArray);
    }
  }

  const moveDown = (index) => {
    if (index < sheetFieldsNew.length - 1) {
      let newFieldArray = [...sheetFieldsNew];
  
      let temp = newFieldArray[index + 1];
      newFieldArray[index + 1] = newFieldArray[index]
      newFieldArray[index] = temp;
  
      setSheetFieldsNew(newFieldArray);
    }
  }

  return (
    <>
      <div className={`sheet-modify-container`}>
        <div className='sheet-modify-header'>
          <div className="sheet-modify-meta">
            <div className="sheet-modify-icon">
              <img />
            </div>
            <div className='sheet-modify-title'>
              <span className="page-name nowrap">{newSheet ? 'Create Sheet' : 'Edit Sheet'}</span>
              <span className={`sheet-name nowrap`}>
                {sheetName !== '' ? sheetName : 'Enter a sheet name'}{shortName !== '' ? ' - ' + shortName : ' '}
              </span>
            </div>
          </div>
        </div>
        <div className='sheet-modify-body'>
          <div className='column meta'>
            <div className='section name'>
              <span className='column-title'>Sheet Name</span>
              <input defaultValue={sheetName} onChange={(e) => {setSheetName(e.target.value)}} />
              <span className='column-title'>Short Name</span>
              <input defaultValue={shortName} onChange={(e) => {setShortName(e.target.value.toUpperCase())}} maxLength={3} className='input-short'/>
            </div>
            <div className='section template'>
              <span className='column-title'>Templates</span>
            </div>
          </div>
          <div className='column fields'>
            <div className='section field'>
              <span className='column-title'>Fields</span>
              <div className='field-list'>
                {sheetFields.map((field, i) => {
                  return (
                    <div key={i} className='field-item'>
                      <input key={`input-${i}`} value={field.name} placeholder={'Name'} onChange={(e) => {updateFieldName(i, e.target.value, sheetFields, setSheetFields)}} />
                      <select key={`select-${i}`} defaultValue='text' onChange={(e) => {updateFieldType(i, e.target.value, sheetFields, setSheetFields)}}>
                        <option value='text'>Text</option>
                        <option value='number'>Number</option>
                        <option value='checkbox'>Checkbox</option>
                      </select>
                      {field.favorite === true ? 
                        <Favorited className="favorite-field" alt='' onClick={()=>{toggleFieldFavorite(i, sheetFields, setSheetFields)}} />
                        :
                        <NotFavorited className="favorite-field" alt='' onClick={()=>{toggleFieldFavorite(i, sheetFields, setSheetFields)}} />
                      }
                      {newSheet === true ? <img className='delete-field' onClick={() => deleteField(i)}/> : <></>}
                      {newSheet === false && field.archived === true ?
                        <Archived className="archive-field" alt='' onClick={()=>{unarchiveField(i)}} />
                        :
                        <></>
                      }
                      {newSheet === false && field.archived === false ?
                        <NotArchived className="archive-field" alt='' onClick={()=>{archiveField(i)}} />
                        :
                        <></>
                      }
                    </div>)
                })}
                {sheetFieldsNew.map((field, i) => {
                  return (
                    <div key={i} className='field-item'>
                      <input key={`input-${i}`} value={field.name} placeholder={'Name'} onChange={(e) => {updateFieldName(i, e.target.value, sheetFieldsNew, setSheetFieldsNew)}} />
                      <select key={`select-${i}`} defaultValue='text' onChange={(e) => {updateFieldType(i, e.target.value, sheetFieldsNew, setSheetFieldsNew)}}>
                        <option value='text'>Text</option>
                        <option value='number'>Number</option>
                        <option value='checkbox'>Checkbox</option>
                      </select>
                      {field.favorite === true ? 
                        <Favorited className="favorite-field" alt='' onClick={()=>{toggleFieldFavorite(i, sheetFieldsNew, setSheetFieldsNew)}} />
                        :
                        <NotFavorited className="favorite-field" alt='' onClick={()=>{toggleFieldFavorite(i, sheetFieldsNew, setSheetFieldsNew)}} />
                      }
                      <img className='delete-field' onClick={() => deleteField(i)}/>
                      <button onClick={() => moveUp(i)}>^</button>
                      <button onClick={() => moveDown(i)}>V</button>
                    </div>)
                })}
              </div>
              <button className='add-field' onClick={addField}>+</button>
            </div>
          </div>
          <div className='column archived'>
            <div className='section archived'>
              <span className='column-title'>Archived</span>
              <div className='field-list'>
                {sheetFieldsArchived.map((field, i) => {
                  return (
                    <div key={`archived-${i}`} className='field-item'>
                      <input key={`input-disabled-${i}`} value={field.name} placeholder={'Name'} disabled/>
                      {newSheet === false && field.archived === true ?
                        <Archived className="archive-field" alt='' onClick={()=>{unarchiveField(i)}} />
                        :
                        <></>
                      }
                      {newSheet === false && field.archived === false ?
                        <NotArchived className="archive-field" alt='' onClick={()=>{archiveField(i)}} />
                        :
                        <></>
                      }
                    </div>)
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {newSheet === true ? <button className='import-data' onClick={importFromCSV}>?</button> : <></>}
      <button className='create-sheet' onClick={submitData}>+</button>
      
      <div className='debug-container'>
          <span className='debug-title'>New Sheet: {newSheet.toString()}</span>
          <div className='debug-fields'>
            <div className='field-label'>Fields:</div>
            {sheetFields.map((field,i) => {
              return (
                <div key={i} className='debug-row'>
                  <span>Name: {field.name}</span>
                  <span>Type: {field.type}</span>
                  <span>Favorite: {field.favorite.toString()}</span>
                  <span>Archived: {field.archived.toString()}</span>
                  <span>Field ID: {field.field_id}</span>
                </div>
              )
            })}
          </div>
          <div className='debug-fields'>
            <div className='field-label'>New Fields:</div>
            {sheetFieldsNew.map((field,i) => {
              return (
                <div key={i} className='debug-row'>
                  <span>Name: {field.name}</span>
                  <span>Type: {field.type}</span>
                  <span>Favorite: {field.favorite.toString()}</span>
                  <span>Archived: {field.archived.toString()}</span>
                  <span>Field ID: {field.field_id}</span>
                </div>
              )
            })}
          </div>
          <div className='debug-fields'>
            <div className='field-label'>Archived Fields:</div>
            {sheetFieldsArchived.map((field,i) => {
              return (
                <div key={i} className='debug-row'>
                  <span>Name: {field.name}</span>
                  <span>Type: {field.type}</span>
                  <span>Favorite: {field.favorite.toString()}</span>
                  <span>Archived: {field.archived.toString()}</span>
                  <span>Field ID: {field.field_id}</span>
                </div>
              )
            })}
          </div>
      </div>
    </>
  );
}

export default SheetModify;
