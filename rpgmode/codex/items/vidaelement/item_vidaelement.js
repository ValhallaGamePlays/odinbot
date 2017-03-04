// JOSHY'S GONNA GET MAGIC MUSHROOMS

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 5;
		this.inventoryProperties.description = "One of the most mysterious artifacts known to mankind.";
		this.inventoryProperties.helper = "+5 wisdom when worn in an equipment slot";
		this.inventoryProperties.findChance = 0.975;
		this.inventoryProperties.tags.push("magical");
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Equip this sacred cube in your inventory slots to receive a bonus."};}
		this.inventoryProperties.itemName = "Vida Element";
		
		this.behavior.statModifier = function(initial, type, sim, item, slot)
		{
			if (type == "wisdom") {return initial+5;}
			
			return initial;
		}
	}
}

module.exports = ItemClassifier;