const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 7;
		this.inventoryProperties.findChance = 5000;
		this.inventoryProperties.description = "The strangest and most mysterious artifact known to mortal beings.";
		this.inventoryProperties.helper = "+250 damage per config for the shrunken head";
		this.inventoryProperties.tags.push("traderomit");
		this.inventoryProperties.buyPrice = -1;
		this.inventoryProperties.sellPrice = 10000;
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"*The scourge configuration is the magic user's best source of power. Use it in harsh times.*"};}
		this.inventoryProperties.itemName = "Scourge Configuration";
	}
}

module.exports = ItemClassifier;