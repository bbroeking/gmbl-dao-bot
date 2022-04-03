const { SlashCommandBuilder } = require('@discordjs/builders');
const { Formatters } = require('discord.js');
const { PreGameOdds } = require('../dbObjects.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slate')
        .setDescription('Get the MLB slate for the day')
        .addStringOption(option => option.setName('date').setDescription('Enter a date other than today in the format- YYYY-mm-dd')),
    async execute(interaction) {
        await interaction.deferReply();
        const date = interaction.options.getString('date');
        if (!date) {
            // grab todays lines
            const items = await PreGameOdds.findAll({
                where: {
                    day: moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
                }
            });
            const reply = replyBuilder(items);
            return interaction.editReply(reply);
        }

        const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
        const regexDate = date.match(regex);
        if (!regexDate)
            return interaction.editReply('date was in the wrong format, please try again with YYYY-mm-dd');
        const items = await PreGameOdds.findAll({
            where: {
                day: moment(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss')
            }
        });

        const reply = replyBuilder(items, date);
        return interaction.editReply(reply);
    }
};

const replyBuilder = (items, date) => {
    let dateString;
    if (date)
        dateString = moment(date).startOf('day').toLocaleString();
    else
        dateString = moment().startOf('day').toLocaleString();

    let lines = items.map(i => `[${i.gameId}] ${i.awayTeamName}(${i.awayMoneyLine}) @ ${i.homeTeamName}(${i.homeMoneyLine}) | Over/Under ${i.overUnder}`);
    lines.push(dateString + '\n');
    lines = lines.join('\n');
    return Formatters.codeBlock(lines);
}