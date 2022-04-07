const { SlashCommandBuilder } = require('@discordjs/builders');
const { Formatters } = require('discord.js');
const { Picks } = require('../dbObjects.js');
const _ = require('lodash');

module.exports = {
        data: new SlashCommandBuilder()
            .setName('recentpicks')
            .setDescription('Get the most recent 25 picks'),
        async execute(interaction) {
            await interaction.deferReply('fetching your recent picks...');
            try {
                const lockedPicks = await Picks.findAll({
                    where: {
                        userId: interaction.user.id,
                    },
                    include: ["preGameOdd", "score"],
                    limit: 25
                });

                const completedPicks = lockedPicks.filter(pick => pick.score.completed);

                console.log(completedPicks[0].score);

                if (!completedPicks)
                    return interaction.editReply('Could not find any recent picks');

                const wins = completedPicks.filter((pick) => {
                    if (!pick.preGameOdd) return false;
                    const homeWin = pick.score.homeTeamScore > pick.score.awayTeamScore && pick.side === 'home';
                    const roadWin = pick.score.awayTeamScore > pick.score.homeTeamScore && pick.side === 'away';
                    const overWin = pick.score.totalScore > pick.score.overUnder && pick.side === 'over';
                    const underWin = pick.score.totalScore < pick.score.overUnder && pick.side === 'under';
                    return homeWin || roadWin || overWin || underWin;
                });

                const picks = completedPicks.map(i => {
                            const gameId = `[${i?.preGameOdd?.gameId}]`;
                            const result = `${_.find(wins, { hash: i.hash }) ? '💰' : '❌'}`;
                            if (i.side === 'home' || i.side === 'away') {
                                const moneylinePosition = `Pick: ${i.side == 'home' ? i?.preGameOdd?.homeTeamName : i?.preGameOdd?.awayTeamName}\n ${i.side == 'home' ? `${i?.preGameOdd?.homeTeamName}(${i?.score.homeTeamScore}) vs ${i?.preGameOdd?.awayTeamName}(${i?.score.awayTeamScore})` : `${i?.preGameOdd?.awayTeamName}(${i?.score.awayTeamScore})@${i?.preGameOdd?.homeTeamName}(${i?.score.homeTeamScore})`}`;
                                return `${gameId} ${moneylinePosition}${result}`
                            } else {
                                const overUnderPosition = `Pick: ${i.side == 'over' ? `O ${i?.preGameOdd?.total}` : `U ${i?.preGameOdd?.total}`}\n ${i?.preGameOdd?.awayTeamName}(${i?.score?.awayTeamScore})@${i?.preGameOdd?.homeTeamName}(${i?.score?.homeTeamScore})`
                                return `${gameId} ${overUnderPosition}${result}`
                            }
            }).join('\n');

            return interaction.editReply(Formatters.codeBlock(picks));
        } catch (e) {
            console.log(e);
            return interaction.editReply('An error occurred, please try again');
        }
    }
};