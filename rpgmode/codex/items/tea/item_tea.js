// SLURP SLURP SLURPIN IT UP

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Tea";
		this.inventoryProperties.description = "A refreshing beverage made from leaves.";
		this.inventoryProperties.helper = "+15 health to consumer";
		this.inventoryProperties.sellPrice = -1;
		
		this.inventoryProperties.tags.push("consumable");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var GH = sim.accountManager.giveHealth(account,15,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "drank some tea, +15 HP!";}
				else{return "You drank some tea, and you got 15 health.";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;