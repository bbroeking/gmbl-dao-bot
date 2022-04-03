const { SlashCommandBuilder } = require('@discordjs/builders');
const { Formatters } = require('discord.js');
const { Picks } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
        data: new SlashCommandBuilder()
            .setName('getdailypicks')
            .setDescription('Get your picks from the last day'),
        async execute(interaction) {
            await interaction.deferReply('fetching results');
            const lockedPicks = await Picks.findAll({
                where: {
                    user: interaction.user.id,
                    createdAt: {
                        [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    },
                    limit: 3
                }
            });

            const picks = lockedPicks.map(i => {
                        const gameId = `[${i?.preGameOdd?.gameId}]`;
                        const result = `${wins.includes(win => win.hash === i.hash) ? '💰' : '❌'}`;
                        if (i.side === 'home' || i.side === 'away') {
                            const moneylinePosition = `${i.side == 'home' ? i?.preGameOdd?.homeTeamName : i?.preGameOdd?.awayTeamName} ${i.side == 'home' ? `${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd.homeTeamScore}) vs ${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd.awayTeamScore})` : `${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd.awayTeamScore})@${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd.homeTeamScore})`}`;
                            return `${gameId} ${moneylinePosition} ${result}`
                        } else {
                            const overUnderPosition = `${i.side == 'over' ? `O${i?.preGameOdd?.overUnder}` : `U${i?.preGameOdd?.overUnder}`} ${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd?.awayTeamScore})@${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd?.homeTeamScore})`
                            return `${gameId} ${overUnderPosition} ${result}`
                        }
                    }).join('\n');
        
        return interaction.editReply(picks);
    }
};