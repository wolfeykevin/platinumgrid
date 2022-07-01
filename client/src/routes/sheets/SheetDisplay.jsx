import React, { useEffect, useContext } from 'react';
import { SheetContext } from '../../_context/SheetProvider';
import dummyData from '../../_dummy/sheet.json';
import { Div } from '../../_styles/_global'
import Entry from './Entry';
import EntryDetails from './EntryDetails';

const SheetDisplay = () => {
  const { sheet } = useContext(SheetContext);

  return (
    <div className='sheet-display-container'>
      {/* <SheetHeader> */}
      <div>{sheet.currentSheet.name}</div>
      <table className='sheet-display-table'>
        {/* <SheetFields> */}
        <thead>
          <tr>
            {sheet.currentSheet.fields.map((field, i) => 
              <td className="sheet-display-cell" key={i}>{field.name}</td>
            )}
          </tr>
        </thead>
        {/* <SheetEntries> */}
        <tbody>
          {sheet.currentSheet.entries.map((entry, i) => 
            <Entry data={entry} key={i}/>
          )}
        </tbody>
      </table>
      <EntryDetails />
    </div>
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