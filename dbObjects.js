const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const PreGameOdds = require('./sports-data-io/models/preGameOdd')(sequelize);
const Picks = require('./sports-data-io/models/pick')(sequelize);

PreGameOdds.hasMany(Picks, {
    foreignKey: 'odds',
    sourceKey: 'gameId'
});

Picks.belongsTo(PreGameOdds, {
    foreignKey: 'odds',
    targetKey: 'gameId'
});

module.exports = {
    PreGameOdds,
    Picks
}