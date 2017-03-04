const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Regeneration Vial";
		this.inventoryProperties.description = "Temporary regeneration";
		this.inventoryProperties.helper = "+20 health for 5 turns";
		this.inventoryProperties.rarity = 1;
		this.inventoryProperties.findChance = 0.8;
		
		this.inventoryProperties.tags.push("potion");
		this.inventoryProperties.tags.push("consumable");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			if (!inBattle) {return "You can only drink this in the middle of a battle.";}

			sim.inventoryManager.itemInSlot(slot,account,true); 
			
			var PRT = sim.accountManager.partyByName(account.template.information.party);
			var BTL = sim.monsterManager.getBattle(PRT);
			
			BTL.addModifier(account.id,item.item.inventoryProperties.battleModifiers[0],item,slot);
			
			return "drank a regeneration vial! (+20 HP for 5 turns)";
		}
		
		// --== B A T T L E   M O D I F I E R S ==--
		this.inventoryProperties.battleModifiers = [

			//--==--==--==--==--==--==--==--==--==--==--==
			// 50 health for 5 turns
			//--==--==--==--==--==--==--==--==--==--==--==
			{
				buffIcon:'regenbuff.png',
				buffName:"Minor Regeneration",
				maxTurns:5,
				currentTurn:0,		// Dynamically changed
				
				// TRUE: Executor happens right after you use the item and the player card shows up
				// FALSE: Executor appens after the monster ends his turn and the player turn BEGINS
				executeOnCard:false,			
				
				// HAPPENS WHEN WE APPLY THE ITEM, JUST IN CASE
				applied: function(sim,item,slot,member,mod) {
					console.log("Minor regeneration applied for the first time");
				},
				
				// EVERY TIME THIS MODIFIER IS CALLED
				executor: function(sim,item,slot,member,mod) {
					console.log("Minor regeneration executed");
					sim.accountManager.giveHealth(member.account,20,false);
				},
				
				// WHEN THE MODIFIER WEARS OFF
				wearOff: function(sim,item,slot,member,mod) {
					console.log("Regen wore off");
					member.battle.removeModifier(member,mod);
					
					return true;
				}
			}
			
		]
	}
}

module.exports = ItemClassifier;