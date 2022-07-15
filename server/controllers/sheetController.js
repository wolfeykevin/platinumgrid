import knex from "../db/db.js";
import { requestCurrentUser, checkAuthLevel } from "./helpers.js"

const requestSheetData = async (req, res) => {
  const reqId = req.params.sheet_id
  let currentUser = await requestCurrentUser(req.user.user_id, res)

  if(!reqId || isNaN(reqId)) {
    res.status(400).send('User Request Error: Not a number and/or No request')
    return
  }

  if (currentUser.length === 0 || undefined) {
    res.status(404).send('Not Found: No user found, please re-login')
    return
  }
  
  const { id } = currentUser[0];
  
  if (!await checkAuthLevel('read', reqId, req)) {
    res.status(401).send("Unauthorized");
    return;
  }
  
  const returning = {};

  returning.sheet_id = reqId;
  returning.sheet = await knex.raw(`select name, short_name, templates from sheets where id = ${reqId}`).then(data => data.rows[0])

  returning.fields = [];
  returning.entries = [];

  // All fields for the sheet asked for
  returning.fields = await knex.raw(`select json_agg(fields) as fields from ( select * from fields where sheet_id = ${reqId}) as fields`).then(data => {
    if (data.rows[0].fields !== null) {
      // console.log(data.rows[0].fields)
      return data.rows[0].fields.map(field => {
        field.field_id = field.id
        delete field.id
        return field
      })
    } else {
      return [];
    }
  }
  )

  // All values for the sheet asked for
  const values = await knex.raw(`select json_agg(values) as values from ( select * from values where entry_id in (select id from entries where sheet_id = ${reqId})) as values`).then(data => {
    if (data.rows[0].values !== null) {
      return data.rows[0].values.map(value => {
        value.value_id = value.id
        delete value.id
        return value
      })
    } else {
      return null;
    }
  }
  )

  // All entries for requested sheet
  returning.entries = await knex.raw(`select json_agg(entries) as entries from (select * from entries where sheet_id = ${reqId}) as entries`).then(data => {
    if (data.rows[0].entries === null) {
      // res.status(400).send(`there is no data here in entries for ${reqId}`)
      // return null
      return [];
    }

    return data.rows[0].entries.map(entry => {
      entry.values = []
      entry.entry_id = entry.id
      delete entry.id
      return entry
    })
  })

  if (returning.entries.length !== 0) {
    values.forEach(value => {
      returning.entries.map((entry) => {
        if (value.entry_id === entry.entry_id) {
          entry.values.push(value)
        }
      })

    });
  }

  res.status(200).json(returning);
};

// const requestAllSheet = (req, res) => {
//   knex("sheets")
//     .select("id as sheet_id", "name", "short_name", "templates")
//     .then((data) => {
//       res.status(200).json(data);
//     });
// }

const requestUserSheets = async (req, res) => {
  let currentUser = await requestCurrentUser(req.user.user_id, res)
  if (currentUser.length !== 0) {
    let { id } = currentUser[0]

    knex('user_roles')
      .join('sheets', 'user_roles.sheet_id', 'sheets.id')
      .select('user_roles.sheet_id', 'sheets.name', 'sheets.short_name', 'user_roles.role_name')
      .where({ user_id: id })
      .then(data => {
        res.status(200).send(data)
      })
  } else {
    res.status(404).send(`No user`)
  }
}

const add = async (req, res) => {
  let newSheet = req.body;
  let currentUser = await requestCurrentUser(req.user.user_id, res)
  if (currentUser.length !== 0) {
    let { id } = currentUser[0]

    knex('sheets')
      .insert(newSheet)
      .returning('id')
      .then((newSheetId) => {
        return knex('user_roles')
          .insert({ user_id: parseInt(id), role_name: "Owner", sheet_id: newSheetId[0].id })
          .then(() => res.status(200).send(`New sheet has been added: ${newSheetId[0].id}`))
      })
  } else {
    res.status(404).send(`No user`)
  }

};

const edit = async (req, res) => {
  const targetId = req.params.sheet_id

  const { name, short_name } = req.body
  let flag = false

  if (!await checkAuthLevel('sheetManage', targetId, req)) {
    res.status(401).send("Unauthorized");
    return;
  }


  if (name) {
    await knex('sheets')
      .select('*')
      .where({ id: targetId })
      .update({ name: name })
      .then(() => flag = true)

  }

  if (short_name) {
    await knex('sheets')
      .select('*')
      .where({ id: targetId })
      .update({ short_name: short_name })
      .then(() => flag = true)
  }

  await knex('sheets')
    .select('id')
    .where({ id: targetId })
    .then((data) => {
      if (data.length === 0) {
        flag = false;
      }
    })

  if (flag) {
    res.status(200).json('Sheet has been updated')
  } else {
    res.status(400).send('error')
  }

};

export {  requestSheetData, requestUserSheets, add, edit };