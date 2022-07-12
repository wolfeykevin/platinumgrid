import React from 'react';
import { CSVDownload } from "react-csv";
import smartApi from "./smartApi";
import toast from "react-hot-toast";

const generateCSV = (sheetId, token) => {
  smartApi(['GET', `get_sheet/${sheetId}`], token)
  .then(result => {
    // console.log(result);
    if (result.name === undefined) {
      // fix for sheet name location
      result.name = result.sheet.name;
    }
    // order fields by id
    result.fields =  result.fields.sort((a, b) => (a.field_id > b.field_id) ? 1 : -1)

    return result
  })
  .then(result => {
    console.log(result);
    let data = []
    data.push(result.fields.filter(field => field.archived !== true).map(field => field.name).join(","));
    console.log(data[0])
    result.entries.map(entry => {
      let entryData = []
      result.fields.filter(field => field.archived !== true).map(field => {
        let index = entry.values.findIndex(value => value.field_id === field.field_id);
        index === -1 ? entryData.push('') : entryData.push(entry.values[index].value.replaceAll(',', ' '))
      })
      
      data.push(entryData.join(','))
    })
    data = data.join("\n")
    data = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    var downloadLink = document.createElement("a");
    var url = URL.createObjectURL(data);
    downloadLink.href = url;
    downloadLink.download = `${result.name}.csv`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  })
  .catch(error => {
    toast.error(error);
    console.log('error', error)});
}

export default generateCSV;