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
		this.inventoryProperties.buyPrice = 1000;
		this.inventoryProperties.sellPrice = 500;
		this.inventoryProperties.findChance = 1.10;
		this.inventoryProperties.description = "A big box of incendiary dragon's breath rounds, fit for a 12-gauge shotgun.";
		this.inventoryProperties.helper = "Makes shotgun-based firearms use incendiary rounds when in an equip slot.";
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.tags.push("ammo");
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"With this in your inventory, shotguns will fire dragon's breath rounds."};}
		this.inventoryProperties.itemName = "Shell Box (Dragon's Breath)";
	}
}

module.exports = ItemClassifier;