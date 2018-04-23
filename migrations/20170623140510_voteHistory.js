
exports.up = function(knex, Promise) {
  return knex.schema.createTable('vote_history', function(table) {
    table.increments();
    table.integer('user_id').notNullable();
    table.integer('post_id').notNullable();
    table.string('type').notNullable();
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('vote_history');
};
