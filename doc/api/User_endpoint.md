# User API
## [Adds current user](./user_man/add_user.md)
``` js
POST api/add_user 
```
***
## [Gets current user's info](./user_man/get_user_id.md)
##### This path is miss leading, as it really returns all the current users info no just the id.
```js
GET api/get_user_id
```
***
## [Gets all users within the applications](./user_man/get_all_users.md)
##### There might be some ground to refactor to limit the exposed data here.
```js
GET api/get_all_users
```
***
## [Gets all users on given sheet](./user_man/get_sheet_users.md)
```js
GET api/get_sheet_users/:sheet_id
```
***
## [Add a user to a to given sheet](./user_man/add_user_roles.md)
```js
POST api/add_user_roles/:sheet_id
```
***
## [Change users roles on a given sheet](./user_man/edit_user_roles.md)
```js
PATCH api/edit_user_roles/:sheet_id
```
***
## [Delete role from user on given sheet](./user_man/remove_roles.md)
```js
DELETE api/remove_roles/:sheet_id
```
***
## [Get current users Authorization level](./user_man/authCeck.md)
```js
GET api/authCheck/:sheet_id
```
***
