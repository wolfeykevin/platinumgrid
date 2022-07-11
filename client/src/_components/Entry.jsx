import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SheetContext } from '../_context/SheetProvider';
import { GlobalContext } from '../_context/AppProvider';
import OptionsMenu from './OptionsMenu';

const Entry = (props) => {
  const { sheet } = useContext(SheetContext);
  const { setEntryMenu } = sheet
  let entry = props.data;
  const { entryId } = useParams();
  const navigate = useNavigate();

  const onClickHandler = (e) => {
    let threshold = 150 // milliseconds
    let clickDuration = new Date() - sheet.clickTime.current

    if (clickDuration < threshold) {
      navigate(`/sheet/${sheet.currentSheet.sheet_id}/${entry.entry_id}`)
    }
  }

  //TODO: Clean up these onClicks
  return (
    <>
      <tr className={`entry-row ${entry.entry_id === parseInt(entryId) ? 'entry-highlighted' : ''}`} key={entry.entry_id} id={entry.entry_id}>
        {sheet.currentSheet.fields.filter(field => field.favorite === true).map((field, i) => {
          let index = entry.values.findIndex(value => value.field_id === field.field_id)
          if (field.type === 'checkbox') {
            return index === -1 ? 
              <td key={i} className="sheet-display-cell" onClick={(e) => onClickHandler(e)}>
                {console.log('no checkbox')}
                <input className="sheet-checkbox" type="checkbox" disabled/>
              </td>
              :
              <td key={i} className="sheet-display-cell" onClick={(e) => onClickHandler(e)}>
                <input className="sheet-checkbox" type="checkbox" checked={entry.values[index].value === 'true'} disabled/>
              </td>
          } else {
            return index === -1 ? <td key={i} className="sheet-display-cell" 
            onClick={(e) => onClickHandler(e)}></td>
            :
            <td key={i} className="sheet-display-cell" 
            onClick={(e) => onClickHandler(e)}>{entry.values[index].value}</td>
          }
        })}
        <td className="entry-row-option no-select" onClick={(e) => {setEntryMenu({event: e, entryDetails: entry})}}>⋮</td>
      </tr>
    </>
  )
}

export default Entry;