const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 2;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.buyPrice = 1000;
		this.inventoryProperties.sellPrice = 500;
		this.inventoryProperties.findChance = 1.10;
		this.inventoryProperties.description = "A box of deadly 40mm incendiary grenades. Very flammable.";
		this.inventoryProperties.helper = "Makes the M79 \"Thumper\" GL fire flame rounds when equipped";
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.tags.push("ammo");
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"With this in your inventory, the M79 will fire incendiary rounds."};}
		this.inventoryProperties.itemName = "40mm Box (Incendiary)";
	}
}

module.exports = ItemClassifier;