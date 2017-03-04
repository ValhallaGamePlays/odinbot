const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Health Vial";
		this.inventoryProperties.description = "A small, refreshing red vial.";
		this.inventoryProperties.helper = "+10 health to consumer";
		this.inventoryProperties.sellPrice = 5;
		this.inventoryProperties.buyPrice = 10;
		
		this.inventoryProperties.tags.push("potion");
		this.inventoryProperties.tags.push("consumable");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var GH = sim.accountManager.giveHealth(account,10,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "drank an HP vial, +10 HP!";}
				else{return "You drink from the red vial, and you receive 10 health.";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;