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
		this.inventoryProperties.findChance = 1.10;
		this.inventoryProperties.description = "A box of 40mm \"beehive\" rounds, grenades that contain dozens of piercing needles.";
		this.inventoryProperties.helper = "Makes the M79 \"Thumper\" GL fire flechette rounds when equipped";
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.tags.push("ammo");
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"With this in your inventory, the M79 will fire flechette rounds."};}
		this.inventoryProperties.itemName = "40mm Box (Beehive)";
	}
}

module.exports = ItemClassifier;