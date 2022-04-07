const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('score', {
        gameId: {
            type: Sequelize.NUMBER,
        },
        dateTime: Sequelize.NUMBER,
        completed: Sequelize.STRING,
        homeTeamScore: Sequelize.NUMBER,
        awayTeamScore: Sequelize.NUMBER,
        totalScore: Sequelize.NUMBER,
        awayTeamName: Sequelize.STRING,
        homeTeamName: Sequelize.STRING,
        lastUpdated: Sequelize.STRING
    });
}