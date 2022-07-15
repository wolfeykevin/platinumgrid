import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom";
import { QRCodeCanvas } from 'qrcode.react';
import { Cover } from '../_styles/_global';

const QrCodeGen = ({ entry, fields }) => {  
  const [ output, setOutput ] = useState('');

  useEffect(() => {
    let currentTime = new Date().toLocaleString("en-US", {timeZone: "UTC", hour12: false})
    let data = [`QR Code Created on ${currentTime.split(',')[0]}, at ${currentTime.split(',')[1]}Z`]

    if (entry.values !== undefined) {
      fields.filter(field => field.archived !== true).map(field => {
        let index = entry.values.findIndex(value => value.field_id === field.field_id);
        index === -1 ? data.push(field.name + ": N/A") : data.push(field.name + ": " + entry.values[index].value)
      })
    }

    setOutput(data.join('\n'))
  }, [])

  const printQRCode = (target) => {
    // get image data from target element
    var image = new Image();
    image.src = target.toDataURL();

    // set up iframe and append it to the document
    var frame1 = document.createElement('iframe');
    frame1.name = "frame1";
    frame1.style.position = "absolute";
    frame1.style.top = "-1000000px";
    document.body.appendChild(frame1);

    // get iframe document
    var frameDoc = frame1.contentWindow ? 
                   frame1.contentWindow : frame1.contentDocument.document ? 
                   frame1.contentDocument.document : frame1.contentDocument;

    frameDoc.document.open();

    // set up content to be written to the iframe document
    var content = "<html>";
    content += "<body onload=\"window.print(); window.close();\">";
    content += image.outerHTML;
    content += "</body>";
    content += "</html>";

    frameDoc.document.write(content);
    frameDoc.document.close();
  }

  return (
    <>
      <QRCodeCanvas className="entry-qr-code" level='H' value={output}  size={300}
        onClick={(e) => {printQRCode(e.target)}}/>
      { createPortal(
        <Cover className="portal-cover"/>
        , document.getElementById('page'))
      }
    </>
  );
}

export default QrCodeGen 