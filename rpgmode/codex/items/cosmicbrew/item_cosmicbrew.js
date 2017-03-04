const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Cosmic Brew";
		this.inventoryProperties.description = "A very strange concoction of very mystical herbs and juices.";
		this.inventoryProperties.helper = "Increases Wisdom skill by 10 for 10 turns";
		this.inventoryProperties.rarity = 6;
		this.inventoryProperties.findChance = 1.25;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			if (!inBattle) {return "You can only drink this in the middle of a battle.";}

			sim.inventoryManager.itemInSlot(slot,account,true); 
			
			var PRT = sim.accountManager.partyByName(account.template.information.party);
			var BTL = sim.monsterManager.getBattle(PRT);
			
			BTL.addModifier(account.id,item.item.inventoryProperties.battleModifiers[0],item,slot);
			
			return "ingested a bottle of cosmic brew. +10 wisdom for 10 turns!";
		}
		
		// --== B A T T L E   M O D I F I E R S ==--
		this.inventoryProperties.battleModifiers = [

			//--==--==--==--==--==--==--==--==--==--==--==
			// 50 health for 5 turns
			//--==--==--==--==--==--==--==--==--==--==--==
			{
				buffIcon:'cosmicbuff.png',
				buffName:"Cosmic Buff",
				maxTurns:2,
				currentTurn:0,		// Dynamically changed
				statBoosters:[
					{stat:"wisdom",amount:10}
				],
				
				// TRUE: Executor happens right after you use the item and the player card shows up
				// FALSE: Executor appens after the monster ends his turn and the player turn BEGINS
				executeOnCard:true,			
				
				// HAPPENS WHEN WE APPLY THE ITEM, JUST IN CASE
				applied: function(sim,item,slot,member,mod) {
					console.log("MAGIC RAISED BY 10");
				},
				
				// EVERY TIME THIS MODIFIER IS CALLED
				executor: function(sim,item,slot,member,mod) {},
				
				// WHEN THE MODIFIER WEARS OFF
				wearOff: function(sim,item,slot,member,mod) {
					member.battle.removeModifier(member,mod);
					return true;
				}
			}
			
		]
	}
}

module.exports = ItemClassifier;