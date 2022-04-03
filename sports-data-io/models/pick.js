const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('pick', {
        hash: {
            type: Sequelize.STRING,
            unique: true,
        },
        user: Sequelize.STRING,
        side: Sequelize.STRING,
        odds: Sequelize.STRING
    });
}