const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 5;
		this.inventoryProperties.findChance = 0.95;
		this.inventoryProperties.description = "A strange and mystical black cube...";
		this.inventoryProperties.helper = "better potency of some magic items";
		this.inventoryProperties.tags.push("magical");
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"*The scourge cube is not useful as one, although there is safety in numbers...*"};}
		this.inventoryProperties.itemName = "Scourge Cube";
	}
}

module.exports = ItemClassifier;