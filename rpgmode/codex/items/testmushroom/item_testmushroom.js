// JOSHY'S GONNA GET MAGIC MUSHROOMS

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 8;
		this.inventoryProperties.description = "This is a debug item!";
		this.inventoryProperties.helper = "This is the helper";
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"That mushroom looks too gross to eat."};}
		this.inventoryProperties.itemName = "Magic Mushroom";
	}
}

module.exports = ItemClassifier;