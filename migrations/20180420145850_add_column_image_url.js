
exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.string('image_url');
      });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('image_url');
    });
};
