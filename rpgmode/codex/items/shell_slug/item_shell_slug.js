const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 1;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.buyPrice = 500;
		this.inventoryProperties.sellPrice = 250;
		this.inventoryProperties.findChance = 1.00;
		this.inventoryProperties.description = "A decently-sized box of slug rounds, fit for a 12-gauge shotgun.";
		this.inventoryProperties.helper = "Makes shotgun-based firearms use powerful slug rounds when in an equip slot.";
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.tags.push("ammo");
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"With this in your inventory, shotguns will fire slug rounds."};}
		this.inventoryProperties.itemName = "Shell Box (Slug)";
	}
}

module.exports = ItemClassifier;