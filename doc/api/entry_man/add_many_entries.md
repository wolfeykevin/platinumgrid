# Add Many Entry
## Detail
This end point is manily just use in our import csv file. 
A sheet id is needed along side it's fields.
## Path
###### Token Required Path.
```js
POST api/add_many_entries/:sheet_id
```
## Body Format
```json
{
  "entries" : [{
    "entry_id": id | "new",
    "value" : [{
        "field_id" : id,
        "value" : String,
      }, ...]
  },...],
}
```