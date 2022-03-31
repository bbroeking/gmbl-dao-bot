const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('preGameOdds', {
        gameId: {
            type: Sequelize.NUMBER,
            unique: true,
        },
        season: Sequelize.TEXT,
        seasonType: Sequelize.NUMBER,
        awayTeamName: Sequelize.STRING,
        homeTeamName: Sequelize.STRING,
        awayMonyLine: Sequelize.NUMBER,
        homeMoneyLine: Sequelize.NUMBER


        // username: Sequelize.STRING,
        // usage_count: {
        //     type: Sequelize.INTEGER,
        //     defaultValue: 0,
        //     allowNull: false,
        // },
    });
}