const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Happy Meal";
		this.inventoryProperties.description = "This meal is very happy, not sad at all.";
		this.inventoryProperties.helper = "+35 health to consumer";
		this.inventoryProperties.sellPrice = 45;
		this.inventoryProperties.buyPrice = 50;
		this.inventoryProperties.findChance = 5000;
		
		this.inventoryProperties.tags.push("fastfood");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var GH = sim.accountManager.giveHealth(account,35,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "ate an entire Happy Meal, +35 HP!";}
				else{return "You stuff the Happy Meal down your fat cakehole for 35 health!";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;