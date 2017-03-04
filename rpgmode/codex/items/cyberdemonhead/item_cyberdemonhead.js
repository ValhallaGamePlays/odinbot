// Look, a trophy

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// Impossible to naturally find, only given though loot
		this.inventoryProperties.findChance = 5000;
		
		this.inventoryProperties.itemName = "Cyberdemon Head";
		this.inventoryProperties.description = "A massive head, from the cyberdemon himself.";
		this.inventoryProperties.helper = "From a killed cyberdemon";
		this.inventoryProperties.rarity = 2;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"**You catch glimpses of Hell from the Cyberdemon's red eyes.** This head may be worth a lot of money."};}
	}
}

module.exports = ItemClassifier;