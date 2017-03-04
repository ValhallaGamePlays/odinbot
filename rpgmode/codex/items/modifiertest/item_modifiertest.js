const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Modifier Test";
		this.inventoryProperties.description = "Temporary health bonus";
		this.inventoryProperties.helper = "+50 health for 5 turns";
		this.inventoryProperties.rarity = 8;
		this.inventoryProperties.findChance = 5000;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			if (!inBattle) {return "You can only drink this in the middle of a battle.";}
			var GH = sim.accountManager.giveHealth(account,10,false);

			sim.inventoryManager.itemInSlot(slot,account,true); 
			
			var PRT = sim.accountManager.partyByName(account.template.information.party);
			var BTL = sim.monsterManager.getBattle(PRT);
			
			BTL.addModifier(account.id,item.item.inventoryProperties.battleModifiers[0],item,slot);
			
			return "drank a health modifier";
		}
		
		// --== B A T T L E   M O D I F I E R S ==--
		this.inventoryProperties.battleModifiers = [

			//--==--==--==--==--==--==--==--==--==--==--==
			// 50 health for 5 turns
			//--==--==--==--==--==--==--==--==--==--==--==
			{
				buffIcon:undefined,
				buffName:"Test Modifier",
				maxTurns:2,
				currentTurn:0,		// Dynamically changed
				statBoosters:[
					{stat:"strength",amount:10}
				],
				
				// TRUE: Executor happens right after you use the item and the player card shows up
				// FALSE: Executor appens after the monster ends his turn and the player turn BEGINS
				executeOnCard:true,			
				
				// HAPPENS WHEN WE APPLY THE ITEM, JUST IN CASE
				applied: function(sim,item,slot,member,mod) {
					console.log("Strength raised by 10 - Amount is "+mod.statBoosters[0].amount);
				},
				
				// EVERY TIME THIS MODIFIER IS CALLED
				executor: function(sim,item,slot,member,mod) {
					console.log("Strength raised by another 5 - it's now "+(mod.statBoosters[0].amount+5).toString());
					mod.statBoosters[0].amount += 5;
				},
				
				// WHEN THE MODIFIER WEARS OFF
				wearOff: function(sim,item,slot,member,mod) {
					console.log("Modifier wore off");
					member.battle.removeModifier(member,mod);
					
					return true;
				}
			}
			
		]
	}
}

module.exports = ItemClassifier;