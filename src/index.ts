import {
    Client,
    Events,
    GatewayIntentBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder, TextChannel, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder
} from "discord.js";

import { config } from "./config";

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration]});

client.once(Events.ClientReady, async readyClient => {
    if(!(await client.channels.fetch(config.STAFF_CHANNEL))) {
        console.error("Staff channel not found");
        // quit the bot
        process.exit(1);
    }
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    const channel: TextChannel = <TextChannel>(await client.channels.fetch(config.WELCOME_CHANNEL));
    if(channel) {

        const messages = await channel.messages.fetch({limit: 100});
        const existingMessage = messages.find(msg => msg.author.id === client.user!.id && msg.components.length > 0);
        if (!existingMessage) {

            const enterButton = new ButtonBuilder()
                .setCustomId("server_welcome")
                .setLabel("Enter the server")
                .setStyle(ButtonStyle.Primary);
            const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(enterButton);
            await channel.send({
                content: "Welcome! Please press the button to request access to the server!",
                components: [row]
            });
        }
    }
    else {
        console.error("Channel not found");
        // quit the bot
        process.exit(1);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        // Handle button interactions
        const parts = interaction.customId.split('_');
        const action = parts[0];
        const userId = parts[1];

        switch (action) {
            case "server":
            {
                // Create a modal
                const modal = new ModalBuilder()
                    .setCustomId('server_entrance')
                    .setTitle('Server Entrance');

                // Add components to the modal
                const textInput = new TextInputBuilder()
                    .setCustomId('accept')
                    .setLabel('Do you accept the server rules? :')
                    .setMaxLength(100)
                    .setStyle(TextInputStyle.Short);

                const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);

                modal.addComponents(row1);

                const textInput2 = new TextInputBuilder()
                    .setCustomId('howfound')
                    .setLabel('How did you find this server?:')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(1000);

                const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput2);

                modal.addComponents(row2);

                const textInput3 = new TextInputBuilder()
                    .setCustomId('anything')
                    .setLabel('Anything Else you want to tell us:')
                    .setMaxLength(1000)
                    .setStyle(TextInputStyle.Paragraph);

                const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput3);

                modal.addComponents(row3);

                // Show the modal
                await interaction.showModal(modal);
                break;
            }
            case "accept":
            {
                const member = interaction.guild!.members.cache.get(userId);
                if (member) {
                    try {
                        await member.roles.add(config.MEMBER_ROLE);
                        await interaction.reply({content: `User has been accepted into the server!`, ephemeral: true})
                    } catch (e) {
                        await interaction.reply({content: `Failed to accept user: ${e}`, ephemeral: true})
                    }
                }
                break;
            }
            case "kick":
            {
                const member = interaction.guild!.members.cache.get(userId);
                if (member) {
                    try {
                        await member.kick("I am sorry, but you have been denied access to the server.");
                        await interaction.reply({content: `User has been kicked from the server!`, ephemeral: true})
                    } catch (e) {
                        await interaction.reply({content: `Failed to kick user: ${e}`, ephemeral: true})
                    }
                }
                break;
            }
        }

    }
    if(interaction.isModalSubmit()) {
        if (interaction.customId === 'server_entrance') {
            const accept = interaction.fields.getTextInputValue('accept');
            const howFound = interaction.fields.getTextInputValue('howfound');
            const anythingElse = interaction.fields.getTextInputValue('anything');

            const staff_channel = <TextChannel>(await client.channels.fetch(config.STAFF_CHANNEL));
            if (staff_channel) {
                const fields = [
                    {name: 'Submitted By', value: `<@${interaction.user.id}>`, inline: false},
                    {name: 'Accepted Rules', value: accept, inline: false},
                    {name: 'How They Found Us', value: howFound, inline: false},
                    {name: 'Additional Info', value: anythingElse || 'N/A', inline: false},
                    {name: 'User age', value: interaction.user.createdAt.toString(), inline: false}
                ];
                const embed = new EmbedBuilder()
                    .setTitle(interaction.user.displayName + " Would like to enter the server")
                    .setImage(interaction.user.avatarURL({size: 64, extension: "png"}))
                    .setColor(0x00FF00)
                    .setTimestamp()
                    .setAuthor({
                        name: interaction.user.displayName,
                        iconURL: interaction.user.avatarURL({size: 16, extension: "png"})!
                    });

                let totalLength = fields.reduce((acc, field) => acc + field.name.length + field.value.length, 0);

                if (totalLength <= 6000) {
                    // If the total length is within the limit, add all fields to the embed
                    embed.addFields(fields);
                } else {
                    // Truncate fields and indicate that some data is in the fallback file
                    embed.addFields(
                        {name: 'Submitted By', value: `<@${interaction.user.id}>`, inline: false},
                        {
                            name: 'Note',
                            value: 'Some inputs were too long and are included in the attached file.',
                            inline: false
                        }
                    );
                }
                const inputFile = Buffer.from(
                    `Accepted Rules:\n${accept}\n\nHow They Found Us:\n${howFound}\n\nAdditional Info:\n${anythingElse || 'N/A'}\n\nUser age:\n${interaction.user.createdAt.toString()}`,
                );
                const attachment = {
                    attachment: inputFile,
                    name: 'application.txt',
                };


                const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`accept_${interaction.user.id}`) // Include user ID for context
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success), // Green button
                    new ButtonBuilder()
                        .setCustomId(`kick_${interaction.user.id}`) // Include user ID for context
                        .setLabel('Kick')
                        .setStyle(ButtonStyle.Danger) // Red button
                );
                if (totalLength <= 6000) {
                    await staff_channel.send({
                        content: "User wants into the server",
                        embeds: [embed],
                        components: [actionRow]
                    })
                } else {
                    await staff_channel.send({
                        content: "User wants into the server",
                        embeds: [embed],
                        components: [actionRow],
                        files: [attachment]
                    })
                }
                await interaction.reply({content: `Your request has been added to the server!`, ephemeral: true})
            }
        }
    }
});


client.login(config.DISCORD_TOKEN).then(r => {
});