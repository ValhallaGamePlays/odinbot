const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Health Potion";
		this.inventoryProperties.description = "A medium-sized red healing potion.";
		this.inventoryProperties.helper = "+25 health to consumer";
		this.inventoryProperties.findChance = 0.4;
		this.inventoryProperties.sellPrice = 25;
		this.inventoryProperties.buyPrice = 50;
		
		this.inventoryProperties.tags.push("potion");
		this.inventoryProperties.tags.push("consumable");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var GH = sim.accountManager.giveHealth(account,25,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "drank an HP potion, +25 HP!";}
				else{return "You drink from the red potion, and you receive 25 health.";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;