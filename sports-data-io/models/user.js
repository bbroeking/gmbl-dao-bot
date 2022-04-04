const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('user', {
        discordId: Sequelize.STRING,
        tag: Sequelize.STRING
    });
}