
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.string('role').notNullable().defaultTo('user');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('role');
  });
};
