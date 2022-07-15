# Sheet API
## [Change base sheet data](./sheet_man/edit_sheet.md)
```js
PATCH api/edit_sheet/:sheet_id
```
***
## [Add a new sheet](./sheet_man/add_sheet.md)
```js
POST api/add_sheet
```
***
## [Get all sheets current user is part of](./sheet_man/get_sheets.md)
```js
GET api/get_sheets
```
***
## [Get all sheet data](./sheet_man/get_sheet.md)
##### Next upgrade is to add pagination, so the front end doen't need to do it.
```js
GET api/get_sheet/:sheet_id
```
***