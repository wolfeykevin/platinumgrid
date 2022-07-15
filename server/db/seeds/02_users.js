/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex("users").insert([
    { name: "CJ Riazzi", man_number: 76565, firebase_uuid: 222, email:"cj.riazzi@gmail.com", picture: "https://camo.githubusercontent.com/06b39fc6b7e1ab60119bb11626220535f002634fe5e4bada9362ac26978ab6e1/68747470733a2f2f7261772e6769746875622e636f6d2f656c61646e6176612f6d6174657269616c2d6c65747465722d69636f6e732f6d61737465722f646973742f706e672f522e706e67" },
  ]);
}
