const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('preGameOdd', {
        gameId: {
            type: Sequelize.NUMBER,
        },
        day: Sequelize.STRING,
        dateTime: Sequelize.STRING,
        status: Sequelize.STRING,
        season: Sequelize.STRING,
        seasonType: Sequelize.NUMBER,
        homeTeamScore: Sequelize.NUMBER,
        awayTeamScore: Sequelize.NUMBER,
        totalScore: Sequelize.NUMBER,
        awayTeamName: Sequelize.STRING,
        homeTeamName: Sequelize.STRING,
        awayMoneyLine: Sequelize.NUMBER,
        homeMoneyLine: Sequelize.NUMBER,
        overUnder: Sequelize.STRING,
        overPayout: Sequelize.NUMBER,
        underPayout: Sequelize.NUMBER
    });
}