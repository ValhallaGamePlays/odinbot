const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 5;
		this.inventoryProperties.description = "A very unique yet mystic ring, carved from a strange stone.";
		this.inventoryProperties.helper = "User becomes a werewolf when worn. +10 Strength, 25% protection";
		this.inventoryProperties.findChance = 1.2;
		this.inventoryProperties.characterOverride = "werewolf";
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Equip this ring in your inventory slots to receive a bonus."};}
		this.inventoryProperties.itemName = "Ring of the Moon";
		
		this.behavior.damageModifier = function(initial, sim, item, slot, isMonster, monster, account)
		{
			if (isMonster) {return Math.floor(initial*0.75);}
			return initial;
		}
		
		this.behavior.statModifier = function(initial, type, sim, item, slot)
		{
			if (type == "strength") {return initial+10;}
			return initial;
		}
	}
}

module.exports = ItemClassifier;