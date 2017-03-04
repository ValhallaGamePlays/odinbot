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
		this.inventoryProperties.description = "A shiny silver ring, with a vivid green emerald.";
		this.inventoryProperties.helper = "+2 precision when worn in an equipment slot";
		this.inventoryProperties.findChance = 0.9;
		this.inventoryProperties.sellPrice = 100;
		this.inventoryProperties.buyPrice = 250;
		this.inventoryProperties.tags.push("ring");
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Equip this ring in your inventory slots to receive a bonus."};}
		this.inventoryProperties.itemName = "Emerald Ring";
		
		this.behavior.statModifier = function(initial, type, sim, item, slot)
		{
			if (type == "precision") {return initial+2;}
			
			return initial;
		}
	}
}

module.exports = ItemClassifier;