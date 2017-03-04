const IC = require('../ItemCore.js');
const randomFrom = function(thelength){return Math.floor(Math.random() * thelength);}

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Gift Box";
		this.inventoryProperties.description = "A strange box filled with mystery.";
		this.inventoryProperties.helper = "Gives joy to children";
		this.inventoryProperties.rarity = 1;
		this.inventoryProperties.findChance = 0.75;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			if (inBattle) {return"You can't open presents in battle."};
			
			var FS = sim.inventoryManager.findFreeSpot(account);
			if (FS == -1) {return "You don't have any free inventory space.";}
			
			sim.inventoryManager.itemInSlot(slot,account,true); 
			
			var possibleItems = [
				{id:"healthpotion",name:"Health Flask"},
				{id:"healthpotion_mega",name:"Health Container"},
				{id:"healthpotion_small",name:"Health Potion"},
				{id:"healthpotion_tiny",name:"Health Vial"},
				{id:"tea",name:"Tea"},
				{id:"godpotion",name:"God's Potion"}
			];
			
			var PI = possibleItems[randomFrom(possibleItems.length)];
			// 1% chance of giving a scourge cube
			if (Math.random(1) > 0.99) {PI = {id:"scourgecube",name:"Scourge Cube"};}
			
			sim.inventoryManager.giveItem(account,PI.id);
			
			return "\n:package: **You open the vividly colored present, and inside you find...** `"+PI.name+"`";
		}
	}
}

module.exports = ItemClassifier;