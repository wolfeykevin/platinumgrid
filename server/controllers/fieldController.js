import knex from "../db/db.js";
import { checkAuthLevel } from "./helpers.js";

const request = (req, res) => {
  knex("fields")
    .select("*")
    .then((data) => {
      res.status(200).json(data);
    });
};

const handleField = async (req, res) => {
  const targetId = req.params.sheet_id;
  let { fields } = req.body;

  if (!await checkAuthLevel('sheetManage', targetId, req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  
  Promise.all(
    fields.map(async (field, i) =>{
      if (field.field_id !== 'new') {
        console.log("Updated field:", field.field_id)
        return knex('fields')
          .select('*')
          .where({id: field.field_id})
          .update({name: field.name, id: field.field_id, favorite: field.favorite, type: field.type, archived: field.archived})
          .catch(err => console.log(err))
          .then()
      } else {
        return knex('fields')
          .insert({sheet_id: targetId, name: field.name, favorite: field.favorite, type: field.type, archived: field.archived})
          .returning('id')
          .then(returned => {
            fields[i].field_id = returned[0].id
          })
          .catch(err => console.log(err))
          .then()
      }
    })
  ).then(data => res.status(200).json(fields))

  // await new Promise(resolve => setTimeout(resolve, 1000)); // fix this
  // test.then((res) => {
  //   knex('fields')
  //     .select('*')
  //     .where({sheet_id: targetId})
  //     .returning('*')
  //     .then(data => res.status(200).json(data))

  // })
};

const flipChecked = async (req, res) => {
  const targetId = req.params.field_id;

  if (!await checkAuthLevel('sheetManage', targetId, req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  knex('values')
    .where({field_id: targetId}).update({
      checked: knex.raw('NOT ??', ['checked'])
    }).returning('*')
      .then(data => res.status(200).send("field checked has flipped."))
}

const favorite = async (req, res) => {
  const targetId = req.params.field_id

  if (!await checkAuthLevel('sheetManage', targetId, req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  knex('fields').where({id: targetId}).update({
    favorite: knex.raw('NOT ??', ['favorite'])
  }).returning('*')
    .then(data => res.status(200).send("field favorite has flipped."))
};

const archive = async (req, res) => {
  const targetId = req.params.field_id

  if (!await checkAuthLevel('sheetManage', targetId, req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  knex('fields').where({id: targetId}).update({
    archived: knex.raw('NOT ??', ['archived'])
  }).returning('*')
    .then(data => res.status(200).send("field archived has flipped."))
};

export { request, handleField, favorite, archive, flipChecked };
