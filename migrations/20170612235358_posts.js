
exports.up = function(knex, Promise) {
  return knex.schema.createTable('posts', function(table) {
    table.increments();
    table.integer('circle_id').notNullable();
    table.integer('user_id').notNullable();
    table.string('content').notNullable();
    table.string('title');
    table.integer('vote_summary').defaultTo(0);
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('posts');
};
