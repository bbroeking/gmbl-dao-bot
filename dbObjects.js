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
const Scores = require('./sports-data-io/models/score')(sequelize);

// PreGameOdds used in many Picks
PreGameOdds.hasMany(Picks, {
    foreignKey: 'odds',
    sourceKey: 'gameId'
});

Picks.belongsTo(PreGameOdds, {
    foreignKey: 'odds',
    targetKey: 'gameId'
});

// Picks have scores
Scores.hasMany(Picks, {
    foreignKey: 'scoring',
    sourceKey: 'gameId'
});

Picks.belongsTo(Scores, {
    foreignKey: 'scoring',
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
});

// odds and scores are 1:1 correlated
PreGameOdds.hasOne(Scores, {
    foreignKey: 'gameId',
    sourceKey: 'gameId'
});

Scores.belongsTo(PreGameOdds, {
    foreignKey: 'gameId',
    targetKey: 'gameId'
});


module.exports = {
    PreGameOdds,
    Picks,
    Leaderboards,
    User,
    Scores
}