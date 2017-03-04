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
		this.inventoryProperties.description = "A set of futuristic night-vision goggles for dark areas.";
		this.inventoryProperties.helper = "+2 awareness when worn in an equipment slot";
		this.inventoryProperties.findChance = 0.9;
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Equip these goggles in your inventory slots to receive a bonus."};}
		this.inventoryProperties.itemName = "Night-Vision Goggles";
		
		this.behavior.statModifier = function(initial, type, sim, item, slot)
		{
			if (type == "awareness") {return initial+2;}
			
			return initial;
		}
	}
}

module.exports = ItemClassifier;