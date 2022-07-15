# Check Field
## Detail
Internally the database hold both a string based data & a bool based data for all entries. this end point flips check field bool so that the front end can determent which data to display a checkbox with the bool or a text box with the string. but as most bool flips in our code it doen't rely on the fields state to filp it, it will just filp it once called.  
###### Note : Handle field is poorly named and maybe renamed in the future (DS: July/15/22)
## Path
###### Token Required Path.
```js
PATCH api/check_field/:field_id
```
## Body Format
```
{}
```