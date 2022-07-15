# Edit Entry
## Detail
does what it says on the tin. Edit a single entry to a given sheet.
## Path
###### Token Required Path.
```js
PATCH api/edit_entry/:entry_id
```
## Body Format
```json
{
 "values": [{
  "value_id": id
  "field_id": id
  "value": String
 }, ...]
}
```