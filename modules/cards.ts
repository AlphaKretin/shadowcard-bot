import fetch from "make-fetch-happen";
import fuse from "fuse.js";
import { MessageEmbed } from "discord.js";
import { messageCapSlice } from "./util";
import { apisource, embed, picsource, picext, dbsource } from "../config.json";

const fuseOptions: fuse.FuseOptions<APICard> = {
	shouldSort: true,
	threshold: 0.6,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 1,
	keys: ["name"]
};

let allCards: APICard[] = [];
export let cardFuzzy: fuse<APICard, typeof fuseOptions>;

export async function updateCardNames(): Promise<void> {
	const rawResponse = await fetch(apisource);
	allCards = (await rawResponse.json()) as APICard[];
	cardFuzzy = new fuse<APICard, typeof fuseOptions>(allCards, fuseOptions);
}

interface APICard {
	id: string;
	name: string;
	class: string;
	type: string;
	cost: number | null;
	stats: string | null;
	trait: string | null;
	flavour: string | null;
	ability: string | null;
	pretty_url: string;
}

function generateCardStats(card: APICard): string {
	let stats = `**Type**: ${card.type}`;
	stats += ` **Class**: ${card.class}`;
	if (card.trait) {
		stats += ` **Trait**: ${card.trait}`;
	}
	stats += "\n";
	if (card.cost) {
		stats += `**Cost**: ${card.cost} `;
	}
	if (card.stats) {
		stats += `**Stats**: ${card.stats}`;
	}
	stats += "\n";
	return stats;
}

function parseCardInfo(card: APICard): MessageEmbed {
	const stats = generateCardStats(card);

	const cardURL = dbsource + encodeURIComponent(card.pretty_url);

	let outEmbed = new MessageEmbed()
		.setColor(embed)
		.setDescription(stats)
		.setThumbnail(picsource + card.id + picext)
		.setTitle(card.name)
		.setURL(cardURL);

	outEmbed = outEmbed.setFooter({ text: `ID: ${card.id}` });

	const descs = messageCapSlice(card.ability || "");
	outEmbed = outEmbed.addField("Card Ability", descs[0].length > 0 ? descs[0] : "No Ability");
	for (let i = 1; i < descs.length; i++) {
		outEmbed = outEmbed.addField("Continued", descs[i]);
	}

	const deckURL = `https://shadowcard.io/deck-search/?&cardcode=${encodeURIComponent(card.id)}&offset=0`;

	const URLs = `[ShadowCard.io](${cardURL}) | [Decks With ${card.name}](${deckURL})`;
	outEmbed = outEmbed.addField("Card Resources", URLs);

	return outEmbed;
}

export function searchCard(query: string): MessageEmbed | undefined {
	const fuzzyResult = cardFuzzy.search(query);
	if (fuzzyResult.length > 0) {
		const card = "name" in fuzzyResult[0] ? fuzzyResult[0] : fuzzyResult[0].item;
		return parseCardInfo(card);
	}
	return;
}
