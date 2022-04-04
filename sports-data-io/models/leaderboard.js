const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('leaderboard', {
        discordId: Sequelize.STRING,
        wins: Sequelize.NUMBER,
        losses: Sequelize.NUMBER,
        ratio: Sequelize.NUMBER,
        timestamp: Sequelize.NUMBER
    });
}