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
		this.inventoryProperties.description = "Simple damage tester";
		this.inventoryProperties.helper = "Sets all damage done by monsters to 1";
		this.inventoryProperties.findChance = 5000;
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Equip this ring in your inventory slots to receive a bonus."};}
		this.inventoryProperties.itemName = "Protection Ring";
		
		this.behavior.damageModifier = function(initial, sim, item, slot, isMonster, monster, account)
		{
			if (isMonster) {return 1;}
			
			return initial
		}
	}
}

module.exports = ItemClassifier;