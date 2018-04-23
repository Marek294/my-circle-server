
exports.up = function(knex, Promise) {
  return knex.schema.createTable('circle_users', function(table) {
    table.increments();
    table.integer('circle_id').notNullable();
    table.integer('user_id').notNullable();
    table.boolean('is_admin').notNullable();
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('circle_users');
};
