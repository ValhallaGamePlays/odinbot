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
		
		this.inventoryProperties.itemName = "Stalker Head";
		this.inventoryProperties.description = "A stalker's head, ready to mount.";
		this.inventoryProperties.helper = "From a killed stalker";
		this.inventoryProperties.rarity = 1;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"The stalker head's still-glowing eyes stare into your soul."};}
	}
}

module.exports = ItemClassifier;