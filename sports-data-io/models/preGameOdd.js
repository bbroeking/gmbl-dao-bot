const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('preGameOdd', {
        gameId: {
            type: Sequelize.NUMBER,
        },
        dateTime: Sequelize.NUMBER,
        awayTeamName: Sequelize.STRING,
        homeTeamName: Sequelize.STRING,
        awayMoneyLine: Sequelize.NUMBER,
        homeMoneyLine: Sequelize.NUMBER,
        total: Sequelize.NUMBER,
        overPayout: Sequelize.NUMBER,
        underPayout: Sequelize.NUMBER
    });
}