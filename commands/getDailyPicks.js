const { SlashCommandBuilder } = require('@discordjs/builders');
const { Picks } = require('../dbObjects.js');
const { Formatters } = require('discord.js');
const { Op } = require('sequelize');
const _ = require('lodash');

module.exports = {
        data: new SlashCommandBuilder()
            .setName('dailypicks')
            .setDescription('Get your picks from the last day'),
        async execute(interaction) {
            await interaction.deferReply('fetching your daily picks...');
            try {
                const lockedPicks = await Picks.findAll({
                    where: {
                        userId: interaction.user.id,
                        createdAt: {
                            [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    },
                    include: ["preGameOdd"],
                    limit: 3
                });

                const wins = lockedPicks.filter((pick) => {
                    if (!pick.preGameOdd) return false;
                    const homeWin = pick.preGameOdd.homeTeamScore > pick.preGameOdd.awayTeamScore && pick.side === 'home';
                    const roadWin = pick.preGameOdd.awayTeamScore > pick.preGameOdd.homeTeamScore && pick.side === 'away';
                    const overWin = pick.preGameOdd.totalScore > pick.preGameOdd.overUnder && pick.side === 'over';
                    const underWin = pick.preGameOdd.totalScore < pick.preGameOdd.overUnder && pick.side === 'under';
                    return homeWin || roadWin || overWin || underWin;
                });

                const picks = lockedPicks.map(i => {
                            const gameId = `[${i?.preGameOdd?.gameId}]`;
                            const result = `${_.find(wins, { hash: i.hash }) ? '💰' : '❌'}`;
                            if (i.side === 'home' || i.side === 'away') {
                                const moneylinePosition = `${i.side == 'home' ? i?.preGameOdd?.homeTeamName : i?.preGameOdd?.awayTeamName} ${i.side == 'home' ? `${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd.homeTeamScore}) vs ${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd.awayTeamScore})` : `${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd.awayTeamScore})@${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd.homeTeamScore})`}`;
                                return `${gameId} ${moneylinePosition} ${result}`
                            } else {
                                const overUnderPosition = `${i.side == 'over' ? `O${i?.preGameOdd?.overUnder}` : `U${i?.preGameOdd?.overUnder}`} ${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd?.awayTeamScore})@${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd?.homeTeamScore})`
                                return `${gameId} ${overUnderPosition} ${result}`
                            }
                        }).join('\n');

            return interaction.editReply(Formatters.codeBlock(picks));
        } catch (e) {
            console.log(e);
            return interaction.editReply('An error occurred, please try again');
        }
    }
};