const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 7;
		this.inventoryProperties.description = "A very strong, silky hood pulled from a corpse. It sends chills down your spine.";
		this.inventoryProperties.helper = "Wearer appears to mortals as the image of an ancient demon...";
		this.inventoryProperties.findChance = 5000;
		this.inventoryProperties.characterOverride = "finalboss";
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Equip this hood in your inventory slots to receive a bonus."};}
		this.inventoryProperties.itemName = "Unholy Hood";
	}
}

module.exports = ItemClassifier;