import knex from "../db/db.js";
import { checkAuthLevel, checkAuth, valiDataField } from "./helpers.js";

const addEntry = async (req, res) => {
  const sheet_id = req.params.sheet_id
  const { values } = req.body

  if (!await checkAuthLevel('write', sheet_id, req)) {
    res.status(401).send("Unauthorized");
    return;
  } 

  knex('sheets')
    .select('id')
    .where({id: sheet_id})
    .then(data => {
      if (data.length) {
        if (values.every((elm) => valiDataField(elm.field_id))) {
          knex('entries')
            .insert({sheet_id})
            .returning('id')
            .then((entry_id) => {
              values.forEach(value => {
                value.entry_id = entry_id[0].id
              })
              return knex('values')
                .insert(values)
                .then(() => res.status(201).json(`entry added to sheet ${sheet_id}.`))
            })
       } else {
        res.status(400).send("User Error, Check body and please try again.")
       }
      } else {
        res.status(400).send("User Error, Check body and please try again.")
       }
    })
   
};

const addManyEntry = async (req, res) => {
  const sheet_id = req.params.sheet_id
  const { entries } = req.body

  if (!await checkAuthLevel('write', sheet_id, req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  entries.forEach(async entry => {
    let values = entry.values;
    await knex('sheets')
      .select('id')
      .where({id: sheet_id})
      .then(data => {
        if (data.length) {
          if (values.every((elm) => valiDataField(elm.field_id))) {
            knex('entries')
              .insert({sheet_id})
              .returning('id')
              .then((entry_id) => {
                values.forEach(value => {
                  value.entry_id = entry_id[0].id
                })
                return knex('values')
                  .insert(values)
                  .then()
              })
          }
        }
      })
    }
  )
  res.status(201).json(`Entries added.`)
};


const archiveEntry = (req, res) => {
  const targetId = req.params.entry_id
  knex('entries')
    .select('id')
    .where({id: targetId})
    .then(data => {
      if (data.length) {
        knex('entries').where({id: targetId}).update({
          archived: knex.raw('NOT ??', ['archived'])
        }).returning('*')
          .then(data => res.status(200).send("entry archived has flipped."))
      } else {
        res.status(402).send("invalid entry.")
      }
    })
};

const editEntry = async (req, res) => {
  const targetId = req.params.entry_id;
  let { values, sheet_id } = req.body;

  if (!await checkAuthLevel('write', sheet_id, req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  values.forEach(value => {
    if (value.value_id !== undefined) {
      knex('values')
      .select('*')
      .where({id: value.value_id})
      .update({ value: value.value })
      .then()
    } else {
      knex('values')
      .insert({ value: value.value, field_id: value.field_id, entry_id: targetId})
      .then()
    }
  })

  res.status(201).send("entery edit")
};


export { addEntry, addManyEntry, editEntry, archiveEntry };
