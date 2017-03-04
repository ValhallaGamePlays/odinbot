const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Glazed Doughnuts";
		this.inventoryProperties.description = "Two tasty and very sticky glazed doughnuts.";
		this.inventoryProperties.helper = "+10 health to consumer";
		this.inventoryProperties.sellPrice = 5;
		this.inventoryProperties.buyPrice = 10;
		this.inventoryProperties.findChance = 5000;
		
		this.inventoryProperties.tags.push("fastfood");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var GH = sim.accountManager.giveHealth(account,10,false);
			if (GH.allowed) 
			{
				sim.inventoryManager.itemInSlot(slot,account,true); 
				
				if (inBattle){return "chowed down on some doughnuts, +10 HP!";}
				else{return "You eat the tasty doughnuts and you receive 10 health.";}
			}
			else {return GH.msg;}
		}
	}
}

module.exports = ItemClassifier;