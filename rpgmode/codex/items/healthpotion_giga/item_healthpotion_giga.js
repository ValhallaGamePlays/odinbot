const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Health Jug";
		this.inventoryProperties.description = "A gigantic pitcher of red health fluid. Fit for a king.";
		this.inventoryProperties.rarity = 3;
		this.inventoryProperties.helper = "+250 health to consumer, +50 per rarity";
		this.inventoryProperties.findChance = 1.10;
		this.inventoryProperties.sellPrice = 250;
		this.inventoryProperties.buyPrice = 500;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var RARE = sim.inventoryManager.slotRarity(slot, account);
			var finalHealth = sim.inventoryManager.healthByRarity(250,50,RARE,3);

			var GH = sim.accountManager.giveHealth(account,finalHealth,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "drank a huge jug of HP, +"+finalHealth+" HP!";}
				else{return "You drink from the large jug, and you receive "+finalHealth+" health!";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;