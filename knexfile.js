// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host: 'horton.elephantsql.com',
      database: 'lmvzoghr',
      user:     'lmvzoghr',
      password: 'g-SJgjmVA9yRAf-3HyIb9d9uXg-UFfwp',
      ssl: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: 'horton.elephantsql.com',
      database: 'lmvzoghr',
      user:     'lmvzoghr',
      password: 'g-SJgjmVA9yRAf-3HyIb9d9uXg-UFfwp',
      ssl: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};