import React, { useEffect } from "react"
import { createPortal } from "react-dom";
import { QRCodeCanvas } from 'qrcode.react';
import { Cover } from '../_styles/_global';

const QrCodeGen = ({ entry, fields }) => {  
  // console.log(data);
  let data = []
  let output = 'test';

  if (entry.values !== undefined) {
    fields.filter(field => field.archived !== true).map(field => {
      let index = entry.values.findIndex(value => value.field_id === field.field_id);
      index === -1 ? data.push(field.name + " = ") : data.push(field.name + " = " + entry.values[index].value)
    })
  }

  output = data.join('\n')


  // console.log(entry, fields)
  // console.log(value)
  return (
    <>
      <QRCodeCanvas className="entry-qr-code" value={output} onClick={(e) => {
        var link = document.createElement('a');
        link.download = 'QRcode.png';
        link.href = e.target.toDataURL()
        link.click();
      }} size={256} imageSettings={{
        x: 500,
        // height: 100,
        // width: 100,
      }}/>
      { createPortal(
        <Cover className="portal-cover"/>
        , document.getElementById('page'))
      }
    </>
  );
}

export default QrCodeGen 