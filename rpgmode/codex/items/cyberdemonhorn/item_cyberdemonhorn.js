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
		
		this.inventoryProperties.itemName = "Cyberdemon Horn";
		this.inventoryProperties.description = "A large, firm horn pulled from the head.";
		this.inventoryProperties.helper = "From a killed cyberdemon";
		this.inventoryProperties.rarity = 2;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"**The horn looks very sharp, strong enough to poke your eye out.** This horn may be worth a lot of money."};}
	}
}

module.exports = ItemClassifier;