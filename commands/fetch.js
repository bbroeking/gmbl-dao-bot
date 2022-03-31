const fetch = require('node-fetch');

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fetch')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.deferReply();
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        interaction.editReply({ files: [file] });
    },
};