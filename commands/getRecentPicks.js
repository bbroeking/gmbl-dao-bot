const { SlashCommandBuilder } = require('@discordjs/builders');
const { Formatters } = require('discord.js');
const { Picks } = require('../dbObjects.js');

module.exports = {
        data: new SlashCommandBuilder()
            .setName('getrecentpicks')
            .setDescription('Get the most recent 25 picks'),
        async execute(interaction) {
            await interaction.deferReply('fetching results');
            const lockedPicks = await Picks.findAll({
                where: {
                    user: interaction.user.id,
                },
                include: ["preGameOdd"],
                limit: 25
            });
            if (!lockedPicks)
                return interaction.editReply('Could not find any recent picks');

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
                        const result = `${wins.includes(win => win.hash === i.hash) ? '💰' : '❌'}`;
                        if (i.side === 'home' || i.side === 'away') {
                            const moneylinePosition = `${i.side == 'home' ? i?.preGameOdd?.homeTeamName : i?.preGameOdd?.awayTeamName} ${i.side == 'home' ? `${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd.homeTeamScore}) vs ${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd.awayTeamScore})` : `${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd.awayTeamScore})@${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd.homeTeamScore})`}`;
                            return `${gameId} ${moneylinePosition} ${result}`
                        } else {
                            const overUnderPosition = `${i.side == 'over' ? `O${i?.preGameOdd?.overUnder}` : `U${i?.preGameOdd?.overUnder}`} ${i?.preGameOdd?.awayTeamName}(${i?.preGameOdd?.awayTeamScore})@${i?.preGameOdd?.homeTeamName}(${i?.preGameOdd?.homeTeamScore})`
                            return `${gameId} ${overUnderPosition} ${result}`
                        }
                    }).join('\n');

        return interaction.editReply(Formatters.codeBlock(picks));
    }
};