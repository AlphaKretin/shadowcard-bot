"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const auth_json_1 = require("./auth.json");
const commands = [
    new builders_1.SlashCommandBuilder()
        .setName("card")
        .setDescription("Search for a Shadowverse Evolve card.")
        .addStringOption(option => option.setName("name").setDescription("The name of the card.").setRequired(true))
        .addBooleanOption(option => option.setName("ephemeral").setDescription("Whether to send the result message only to you.").setRequired(false)),
    new builders_1.SlashCommandBuilder()
        .setName("deck")
        .setDescription("Search for a deck on ShadowCard.io.")
        .addStringOption(option => option.setName("name").setDescription("The name of the deck.").setRequired(false))
        .addStringOption(option => option.setName("card").setDescription("The name of a card in the deck").setRequired(false))
        .addBooleanOption(option => option.setName("ephemeral").setDescription("Whether to send the result message only to you.").setRequired(false))
].map(command => command.toJSON());
const rest = new rest_1.REST({ version: "9" }).setToken(auth_json_1.token);
rest
    .put(v9_1.Routes.applicationGuildCommands(auth_json_1.clientId, auth_json_1.guildId), { body: commands })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);
//# sourceMappingURL=command.js.map