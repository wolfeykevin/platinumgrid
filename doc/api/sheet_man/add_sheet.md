# Add sheet
## Detail
This Path simple generates a new sheet makes the requisting user the Owner of the sheet and returns the sheet id.
## Path
###### Token Required Path.
```js
POST api/add_sheet
```
## Body Format
``` json
{
    "name": String,
    "short_name": VarChar(3),
    "templates": String
}
```