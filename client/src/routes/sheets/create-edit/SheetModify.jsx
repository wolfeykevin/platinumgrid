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

const SheetModify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { store } = useContext(GlobalContext);
  const { sheet } = useContext(SheetContext);

  const { user, theme, isAuth, setIsAuth } = store;

  const [ newSheet, setNewSheet ] = useState(true);
  const [ sheetFields, setSheetFields ] = useState([]);

  const [ sheetName, setSheetName ] = useState('');
  const [ shortName, setShortName ] = useState('');

  useEffect(() => {
    if (location.pathname.split('/')[1] === 'create') {
      setNewSheet(true);
    } else {
      setNewSheet(false);
      // fetch and parse sheet info here
    }
  }, [])

  const addField = () => {
    //initialize empty field
    const blankField = {
      field_id: 'new',
      name: '',
      type: 'text',
      favorited: true,
    }

    //add new field to the array
    setSheetFields([...sheetFields, blankField])
  }

  const deleteField = (index) => {
    let newFieldArray = [...sheetFields];
    newFieldArray.splice(index, 1);
    setSheetFields(newFieldArray);
  }

  const updateFieldType = (index, value) => {
    let newFieldArray = [...sheetFields];

    newFieldArray[index].type = value;
    setSheetFields(newFieldArray);
  }

  const updateFieldName = (index, value) => {
    let newFieldArray = [...sheetFields];

    newFieldArray[index].name = value;
    setSheetFields(newFieldArray);
  }

  const toggleFieldFavorited = (index) => {
    let newFieldArray = [...sheetFields];

    newFieldArray[index].favorited = !newFieldArray[index].favorited;
    setSheetFields(newFieldArray);
  }

  const handleFields = (sheetId) => {
    let payload = {fields: sheetFields}

    smartApi(['PATCH', `/handle_field/${sheetId}`, payload], user.token)
      .then(result => {
        console.log(result); 
      })
      .catch(error => console.log('error', error));
  }

  const submitData = () => {
    let payload = {
      name: sheetName,
      short_name: shortName,
      // fields : sheetFields,
    }

    smartApi(['POST', `add_sheet`, payload], user.token)
      .then(result => {
        console.log(result); 
        let newSheetId = result.split(' ')[result.split(' ').length-1]

        handleFields(newSheetId);
      })
      .catch(error => console.log('error', error));
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
          {/* <div className="sheet-search no-select">
            <input placeholder='Search'/>
            <button>Filter</button>
          </div> */}
        </div>
        <div className='sheet-modify-body'>
          <div className='column meta'>
            <div className='section name'>
              <span className='column-title'>Sheet Name</span>
              <input onChange={(e) => {setSheetName(e.target.value)}} />
              <span className='column-title'>Short Name</span>
              <input onChange={(e) => {setShortName(e.target.value.toUpperCase())}} maxLength={3} className='input-short'/>
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
                      <input placeholder={'Name'} onChange={(e) => {updateFieldName(i, e.target.value)}} />
                      <select key={i} defaultValue='text' onChange={(e) => {updateFieldType(i, e.target.value)}}>
                        <option value='text'>Text</option>
                        <option value='number'>Number</option>
                        <option value='checkbox'>Checkbox</option>
                      </select>
                      <img className='favorite-field' src={field.favorited === true ? edit : editPurple} onClick={() => toggleFieldFavorited(i)}/>
                      <img className='delete-field' onClick={() => deleteField(i)}/>
                    </div>)
                })}
              </div>
              <button className='add-field' onClick={addField}>+</button>
            </div>
          </div>
          <div className='column options'>
            <div className='section field'>
              <span className='column-title'>Options</span>
            </div>
          </div>
        </div>
      </div>
      <button className='create-sheet' onClick={submitData}>+</button>
      {/* <button className='handle-fields' onClick={handleFields}>$</button> */}
      <div className='debug-container'>
          <span className='debug-title'>New Sheet: {newSheet.toString()}</span>
          <div className='debug-fields'>
            <div className='field-label'>Fields:</div>
            {sheetFields.map((field,i) => {
              return (
                <div key={i} className='debug-row'>
                  <span>Name: {field.name}</span>
                  <span>Type: {field.type}</span>
                  <span>Favorited: {field.favorited.toString()}</span>
                </div>
              )
            })}
          </div>
      </div>
    </>
  );
}

export default SheetModify;
