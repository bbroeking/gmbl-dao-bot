const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { Picks, PreGameOdds, User } = require('../dbObjects.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('makepick')
        .setDescription('Lock-in a pick')
        .addStringOption(option =>
            option.setName('gameid')
            .setDescription('Enter the gameid you would like to select')
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('side')
            .setDescription('Enter the gameid you would like to select')
            .setRequired(true)
            .addChoice('Away Team', 'away')
            .addChoice('Home Team', 'home')
            .addChoice('Over', 'over')
            .addChoice('Under', 'under')
        ),
    async execute(interaction) {
        await interaction.deferReply('locking pick... ');

        try {
            const gameid = interaction.options.getString('gameid');
            const side = interaction.options.getString('side');
            const hash = crypto.createHash('md5').update(`${gameid}${side}`).digest('hex');

            // create user if it doesn't exist
            const discordId = interaction.user.id;
            const user = await User.findOne({ where: { discordId } });
            if (!user) {
                console.log(`creating discordId for ${interaction.user.tag}`);
                await User.create({
                    discordId,
                    tag: interaction.user.tag
                });
            }
            // avoid duplicate locks
            const existing = await Picks.findOne({ where: { hash } });
            if (existing)
                return interaction.editReply('you have already registered this lock');

            const preGameOdd = await PreGameOdds.findOne({ where: { gameId: gameid } });

            if (!preGameOdd || !preGameOdd.gameId)
                return interaction.editReply('could not find provided gameId');

            await Picks.create({
                hash,
                userId: discordId,
                side,
                odds: preGameOdd.gameId,
                scoring: preGameOdd.gameId // score should be same game id
            });
            console.log(preGameOdd);
            const line = side == 'home' ? preGameOdd.homeMoneyLine : side === 'away' ? preGameOdd.awayMoneyLine : side === 'over' ? preGameOdd.overPayout : preGameOdd.underPayout;
            const embed = new MessageEmbed()
                .setColor('#EFFF00')
                .setTitle('Lock 🔒')
                .setAuthor({ name: 'MLB Locks Challenge', iconURL: 'https://m.media-amazon.com/images/I/71+qr9FmOBL._AC_SL1200_.jpg', url: 'https://gmbldao.io' })
                .addFields({ name: 'GameId', value: gameid, inline: true }, { name: 'Matchup', value: `${preGameOdd.awayTeamName}@${preGameOdd.homeTeamName} | ${preGameOdd.total} O/U` }, { name: 'Line', value: `${line}`, inline: true }, { name: 'Side', value: side, inline: true }, )
                .setThumbnail('https://static01.nyt.com/images/2015/05/30/sports/30dior-2-obit/30dior-2-obit-jumbo.jpg')
                .setTimestamp()
            return interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log(e);
            interaction.editReply('An error occurred please try again later');
        }

    }
};