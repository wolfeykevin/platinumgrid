import knex from "../db/db.js";

const requestCurrentUser = async (id) => {
  let returnData = await knex("users")
    .select("*")
    .where({ firebase_uuid: id })
    .then((data) => data);
     return returnData
}

const checkAuthLevel = (level, sheet, id) => {
  knex('user_roles')
    .select('*')
    .where({user_id: id, sheet_id: sheet})
    .then(data => {
      // console.log('hey', data);
      // console.log(id)
      if (data[0].role_name.toLowerCase() !== level.toLowerCase() ) {
        return false;
      } else {
        return true;
      }
    })
}



export {requestCurrentUser, checkAuthLevel}