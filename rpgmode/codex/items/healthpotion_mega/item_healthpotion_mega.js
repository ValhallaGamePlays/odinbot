const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Health Canister";
		this.inventoryProperties.description = "A massive canister of red health fluid. Very heavy.";
		this.inventoryProperties.rarity = 2;
		this.inventoryProperties.helper = "+150 health to consumer, +20 per rarity";
		this.inventoryProperties.findChance = 0.95;
		this.inventoryProperties.sellPrice = 100;
		this.inventoryProperties.buyPrice = 200;
		
		this.inventoryProperties.tags.push("potion");
		this.inventoryProperties.tags.push("consumable");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var RARE = sim.inventoryManager.slotRarity(slot, account);
			var finalHealth = sim.inventoryManager.healthByRarity(150,20,RARE,1);

			var GH = sim.accountManager.giveHealth(account,finalHealth,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "drank a huge red HP container, +"+finalHealth+" HP!";}
				else{return "You drink from the large container, and you receive "+finalHealth+" health!";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;