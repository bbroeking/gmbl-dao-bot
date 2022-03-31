const { SlashCommandBuilder } = require('@discordjs/builders');
const { Formatters, MessageEmbed } = require('discord.js');
const { Op } = require('sequelize');
const { PreGameOdds } = require('../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slate')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.deferReply();
        const items = await PreGameOdds.findAll();
        console.log(items)
            // const embed = new MessageEmbed()
            //     .setColor('#EFFF00')
            //     .setTitle('Slate')
            //     .addFields({ name: 'Definition', value: trim(answer.definition, 1024) }, { name: 'Example', value: trim(answer.example, 1024) }, { name: 'Rating', value: `${answer.thumbs_up} thumbs up. ${answer.thumbs_down} thumbs down.` }, );
            // interaction.editReply({ embeds: [embed] });
        return interaction.editReply(Formatters.codeBlock(items.map(i => `${i.awayTeamName}(${i.awayMonyLine}) @ ${i.homeTeamName}(${i.homeMoneyLine}) 💰`).join('\n')));
    }
};