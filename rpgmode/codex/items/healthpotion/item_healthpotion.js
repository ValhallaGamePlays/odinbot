const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Health Flask";
		this.inventoryProperties.description = "A hefty red health flask.";
		this.inventoryProperties.rarity = 1;
		this.inventoryProperties.helper = "+50 health to consumer, +20 per rarity";
		this.inventoryProperties.findChance = 0.5;
		this.inventoryProperties.sellPrice = 50;
		this.inventoryProperties.buyPrice = 100;
		
		this.inventoryProperties.tags.push("potion");
		this.inventoryProperties.tags.push("consumable");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var RARE = sim.inventoryManager.slotRarity(slot, account);
			var finalHealth = sim.inventoryManager.healthByRarity(50,20,RARE,2);

			var GH = sim.accountManager.giveHealth(account,finalHealth,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "drank an HP flask, +"+finalHealth+" HP!";}
				else{return "You drink from the large red flask, and you receive "+finalHealth+" health!";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;