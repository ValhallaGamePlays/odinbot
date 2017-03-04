// JOSHY'S GONNA GET MAGIC MUSHROOMS

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 2;
		this.inventoryProperties.description = "A simple yet magical silver ring, blessed with mystic power.";
		this.inventoryProperties.helper = "+20 max HP when worn in an equipment slot";
		this.inventoryProperties.findChance = 0.9;
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Equip this ring in your inventory slots to receive a bonus."};}
		this.inventoryProperties.itemName = "Silver Ring";
		
		this.behavior.statModifier = function(initial, type, sim, item, slot)
		{
			if (type == "maxhp") {return initial+20;}
			
			return initial;
		}
	}
}

module.exports = ItemClassifier;