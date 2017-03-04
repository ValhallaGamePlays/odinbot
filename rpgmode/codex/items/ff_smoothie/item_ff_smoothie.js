const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Strawberry Smoothie";
		this.inventoryProperties.description = "A well-blended strawberry smoothie, tasty!";
		this.inventoryProperties.helper = "+25 health to consumer";
		this.inventoryProperties.sellPrice = 10;
		this.inventoryProperties.buyPrice = 25;
		this.inventoryProperties.findChance = 5000;
		
		this.inventoryProperties.tags.push("fastfood");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var GH = sim.accountManager.giveHealth(account,25,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "slurped down a strawberry smoothie, +25 HP!";}
				else{return "You slowly drink the strawberry smoothie and get brainfreeze. 25 health!";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;