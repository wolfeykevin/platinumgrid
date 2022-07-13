import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom";
import { QRCodeCanvas } from 'qrcode.react';
import { Cover } from '../_styles/_global';

const QrCodeGen = ({ entry, fields }) => {  
  // console.log(data);
  let data = []
  const [ output, setOutput ] = useState('');

  useEffect(() => {

    // console.log(entry, fields)
    if (entry.values !== undefined) {
      fields.filter(field => field.archived !== true).map(field => {
        let index = entry.values.findIndex(value => value.field_id === field.field_id);
        index === -1 ? data.push(field.name + " = ") : data.push(field.name + ": " + entry.values[index].value)
      })
    }

    // console.log(data)

    setOutput(data.join('\n'))
  }, [])

  // console.log(output);

  return (
    <>
      <QRCodeCanvas className="entry-qr-code" level='H' value={output} onClick={(e) => {
        // var link = document.createElement('a');

        // link.download = 'QRcode.png';
        // link.href = e.target.toDataURL()
        // link.href = window.print();
        // window.print();
        // link.click(window.print());
        // var win = window.open('','','left=0,top=0,width=0,height=0,toolbar=0,scrollbars=0,status=0');

        // console.log(e);

        var image = new Image();
        image.src = e.target.toDataURL();

        var frame1 = document.createElement('iframe');
        frame1.name = "frame1";
        frame1.style.position = "absolute";
        frame1.style.top = "-1000000px";
        document.body.appendChild(frame1);
        var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
        frameDoc.document.open();
                var content = "<html>";
        content += "<body onload=\"window.print(); window.close();\">";
        content += image.outerHTML;
        content += "</body>";
        content += "</html>";

        frameDoc.document.write(content);
        frameDoc.document.close();

      }} size={400} imageSettings={{
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