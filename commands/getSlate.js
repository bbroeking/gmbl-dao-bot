const { SlashCommandBuilder } = require('@discordjs/builders');
const { Formatters } = require('discord.js');
const { PreGameOdds } = require('../dbObjects.js');
const { Op } = require("sequelize");
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slate')
        .setDescription('Get the MLB slate for the day')
        .addStringOption(option => option.setName('date').setDescription('Enter a date other than today in the format- YYYY-mm-dd')),
    async execute(interaction) {
        await interaction.deferReply('fetching slate... ');
        try {
            const date = interaction.options.getString('date');
            if (!date) {
                // grab todays lines
                const items = await PreGameOdds.findAll({
                    where: {
                        dateTime: {
                            // [Op.lt]: moment().endOf('day').unix(),
                            [Op.gt]: moment().startOf('day').unix()
                        }
                    }
                });
                const reply = replyBuilder(items);
                return interaction.editReply(reply);
            }

            const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
            const regexDate = date.match(regex);

            console.log(moment(date).startOf('day').unix());
            console.log(moment(date).endOf('day').unix());

            if (!regexDate)
                return interaction.editReply('date was in the wrong format, please try again with YYYY-mm-dd');
            const items = await PreGameOdds.findAll({
                where: {
                    dateTime: {
                        // [Op.lt]: moment(date).endOf('day').unix(),
                        [Op.gt]: moment(date).startOf('day').unix()
                    }
                }
            });

            const reply = replyBuilder(items, date);
            return interaction.editReply(reply);

        } catch (e) {
            console.log(e);
            return interaction.editReply('An error occurred, please try again');
        }
    }
};

const replyBuilder = (items, date) => {
    let dateString;
    if (date)
        dateString = moment(date).startOf('day').toLocaleString();
    else
        dateString = moment().startOf('day').toLocaleString();

    const sliced = items.slice(0, 10);
    let lines = sliced.map(i => `Game No.[${i.gameId}] \n${i.awayTeamName} (${i.awayMoneyLine}) @ ${i.homeTeamName} (${i.homeMoneyLine}) \nOver/Under ${i.total}\n`);
    lines.push(dateString + '\n');
    lines.push('use the Game No. to make picks');
    lines = lines.join('\n');
    return Formatters.codeBlock(lines);
}