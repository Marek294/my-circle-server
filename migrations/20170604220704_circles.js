
exports.up = function(knex, Promise) {
  return knex.schema.createTable('circles', function(table) {
    table.increments();
    table.integer('owner_id').notNullable();
    table.string('name').notNullable();
    table.boolean('is_public').notNullable();
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('circles');
};
