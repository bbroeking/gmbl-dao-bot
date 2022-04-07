const { SlashCommandBuilder } = require('@discordjs/builders');
const { Picks, Leaderboards } = require('../dbObjects.js');
const { Formatters } = require('discord.js');
const { Op } = require('sequelize');
const _ = require('lodash');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboards')
        .setDescription('Get top players'),
    async execute(interaction) {
        await interaction.deferReply('fetching leaderboard... ');
        try {
            // grab the latest leaderboards 
            const recentLeaderboards = await Leaderboards.findAll({
                order: [
                    ['timestamp', 'desc'],
                    ['ratio', 'desc']
                ],
                include: ["user"],
                limit: 10
            });

            if (recentLeaderboards.length > 0) {
                const timestampNow = Math.round(new Date().getTime() / 1000);
                const difference = timestampNow - recentLeaderboards[0].timestamp;
                console.log(recentLeaderboards);
                if (difference < 15 * 60) {
                    const filteredLeaderboard = recentLeaderboards.filter((result) => {
                        result.timestamp === recentLeaderboards[0].timestamp
                    });
                    console.log(filteredLeaderboard);
                    const reply = _.map(recentLeaderboards, result => {
                        return `${result.user.tag} W: ${result.wins} L: ${result.losses} Ratio: ${result.ratio}`
                    }).join('\n');
                    return interaction.editReply(Formatters.codeBlock(reply));
                }
            }

            console.log(recentLeaderboards);
            // calculation to update the leaderboard (should only happen every ~15 min or so)
            const pastWeek = await Picks.findAll({
                where: {
                    createdAt: {
                        [Op.gt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    },
                },
                include: ["preGameOdd", "user", "score"],
            });

            const groupedPastWeek = _.groupBy(pastWeek, "user");
            const arrayOfPastWeek = Object.keys(groupedPastWeek).map((key) => groupedPastWeek[key]);
            const timestamp = Math.round(new Date().getTime() / 1000);
            const resultPastWeek = await Promise.all(_.map(arrayOfPastWeek, async(user) => {
                // filter picks for W/L
                const winningPicks = _.filter(user, (pick) => {
                    if (!pick.preGameOdd) return false;

                    const homeWin = pick.score.homeTeamScore > pick.score.awayTeamScore && pick.side === 'home';
                    const roadWin = pick.score.awayTeamScore > pick.score.homeTeamScore && pick.side === 'away';
                    const overWin = pick.score.totalScore > pick.score.overUnder && pick.side === 'over';
                    const underWin = pick.score.totalScore < pick.score.overUnder && pick.side === 'under';
                    return homeWin || roadWin || overWin || underWin;
                });

                const wins = winningPicks.length
                const losses = user.length - wins;
                const ratio = losses > 0 ? _.divide(wins, losses) : wins > 0 ? 1.000 : 0.000;
                const leaderboardEntry = { discordId: user[0].user.discordId, wins: wins, losses: losses, ratio: ratio, timestamp: timestamp };
                await Leaderboards.create(leaderboardEntry);
                return leaderboardEntry;
            }));


            const orderedResults = _.orderBy(resultPastWeek, ['ratio'], ['desc']);
            const reply = _.map(orderedResults, result => {
                console.log(result);
                return `${result.user.tag} W: ${result.wins} L: ${result.losses} Ratio: ${result.ratio}`
            }).join('\n');
            return interaction.editReply(Formatters.codeBlock(reply));

        } catch (e) {
            console.log(e);
            return interaction.editReply('An error occurred, please try again');
        }
    }
};