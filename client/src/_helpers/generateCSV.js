import React from 'react';
import { CSVDownload } from "react-csv";
import smartApi from "./smartApi";
import toast from "react-hot-toast";

const generateCSV = (sheetId, token, includeArchived) => {
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
      // console.log(result);
      let data = []
      let archiveSetting = 'both'

      if (includeArchived !== undefined && includeArchived.length > 0) {
        if (includeArchived.length < 2 && includeArchived[0] === false) {
          archiveSetting = 'unarchived'
        } else if (includeArchived.length < 2 && includeArchived[0] === true) {
          archiveSetting = 'archived'
        } else {
          archiveSetting = 'both'
        }
      }

      // sets headers
      data.push(result.fields.filter(field => field.archived !== true).map(field => field.name).join(","));

      if (archiveSetting === 'both' || archiveSetting === 'archived') {
        // data[0] = "Archived," + data[0] // adds archived to the front of the headers
        data[0] = data[0].replace(/\d+/, "0") + "," + "Archived" // adds archived to the end of the headers
      }

      console.log(archiveSetting)
      
      if (archiveSetting === 'both') {
        result.entries.map((entry, i) => {
          let entryData = []
          result.fields.filter(field => field.archived !== true)
          .map(field => {
            let index = entry.values.findIndex(value => value.field_id === field.field_id);
            index === -1 ? entryData.push('') : entryData.push(entry.values[index].value.replaceAll(',', ' '))
          })
          entry.archived ? entryData.push('TRUE') : entryData.push('FALSE')
          data.push(entryData.join(','))
        })
      } else if (archiveSetting === 'archived') {
        result.entries.filter(entry => entry.archived === true).map((entry, i) => {
          let entryData = []
          result.fields.filter(field => field.archived !== true)
          .map(field => {
            let index = entry.values.findIndex(value => value.field_id === field.field_id);
            index === -1 ? entryData.push('') : entryData.push(entry.values[index].value.replaceAll(',', ' '))
          })
          entry.archived ? entryData.push('TRUE') : entryData.push('FALSE')
          data.push(entryData.join(','))
        })
      } else {
        result.entries.filter(entry => entry.archived !== true).map((entry, i) => {
          let entryData = []
          result.fields.filter(field => field.archived !== true)
          .map(field => {
            let index = entry.values.findIndex(value => value.field_id === field.field_id);
            index === -1 ? entryData.push('') : entryData.push(entry.values[index].value.replaceAll(',', ' '))
          })
          data.push(entryData.join(','))
        })
      }
      

      data = data.join("\n")
      data = new Blob([data], { type: 'text/csv;charset=utf-8;' });

      // Create temporary element to prompt user for download
      var downloadLink = document.createElement("a");
      var url = URL.createObjectURL(data);
      downloadLink.href = url;
      downloadLink.download = `${result.name}.csv`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success(`CSV created for ${result.name}`)
    })
    .catch(error => {
      toast.error(error);
      console.log('error', error)});
}

export default generateCSV;