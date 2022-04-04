const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const PreGameOdds = require('./sports-data-io/models/preGameOdd.js')(sequelize);
const Picks = require('./sports-data-io/models/pick')(sequelize);
const Leaderboards = require('./sports-data-io/models/leaderboard')(sequelize);
const Users = require('./sports-data-io/models/user')(sequelize);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async() => {
    console.log('Database synced');
    sequelize.close();
}).catch(console.error);