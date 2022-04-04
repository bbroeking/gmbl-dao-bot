const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const PreGameOdds = require('./sports-data-io/models/preGameOdd')(sequelize);
const Picks = require('./sports-data-io/models/pick')(sequelize);
const Leaderboards = require('./sports-data-io/models/leaderboard')(sequelize);
const User = require('./sports-data-io/models/user')(sequelize);

// PreGameOdds used in many Picks
PreGameOdds.hasMany(Picks, {
    foreignKey: 'odds',
    sourceKey: 'gameId'
});

Picks.belongsTo(PreGameOdds, {
    foreignKey: 'odds',
    targetKey: 'gameId'
});

// User has many Picks
User.hasMany(Picks, {
    foreignKey: 'userId',
    sourceKey: 'discordId'
});

Picks.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'discordId'
});

// Leaderboard has many Users
User.hasMany(Leaderboards, {
    foreignKey: 'discordId',
    sourceKey: 'discordId'
});

Leaderboards.belongsTo(User, {
    foreignKey: 'discordId',
    targetKey: 'discordId'
})

module.exports = {
    PreGameOdds,
    Picks,
    Leaderboards,
    User
}