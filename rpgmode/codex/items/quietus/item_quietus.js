// NAZI GUNS

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"You can use this item in battle."};}
		
		this.inventoryProperties.itemName = "Quietus";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.995;
		this.inventoryProperties.rarity = 4;
		this.inventoryProperties.sellPrice = 600;
		this.inventoryProperties.buyPrice = 1200;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.description = "A flaming green sword that releases energy blasts when swung.";
		this.inventoryProperties.helper = "400 base damage against enemy, leaves dying green flame";
		
		this.weaponProperties.baseDamage = 400;
		this.weaponProperties.strengthMultiply = true;
		this.weaponProperties.attackString = "swung the Quietus and tossed a barrage of green fire!"
		this.weaponProperties.attackSounds = ['SWORD2.wav']
		
		this.behavior.attack = function(account, sim, item, monster)
		{
			var DMG = item.behavior.calculateDamage(account,sim,item,monster);
			
			var indicator = {damage:DMG};
			var takeDam = monster.takeDamage(sim, account, indicator);
			
			indicator.damage = takeDam;
			
			monster.battle.addModifier(monster,item.greenFlameModifier,item,"w",true,account);
			
			return {indicator: indicator, msg:item.weaponProperties.attackString};
		}
		
		// --== B A T T L E   M O D I F I E R S ==--
		this.greenFlameModifier = 
		{
			buffIcon:'monsterbuff.png',
			buffName:"Quietus",
			maxTurns:3,
			currentTurn:0,		// Dynamically changed
			statBoosters:[],	
			canStack:false,
			
			// HAPPENS WHEN WE APPLY THE ITEM, JUST IN CASE
			// IN THIS CASE, "MEMBER" IS THE MONSTER WE'RE APPLYING IT TO
			applied: function(sim,item,slot,member,mod) {},
			
			// EVERY TIME THIS MODIFIER IS CALLED
			// NOTE: MEMBER IS THE MONSTER
			executor: function(sim,item,slot,member,mod) {
				// -- 5 FLAME DAMAGE PER STRENGTH
				var FLMD = 25 + (10*sim.accountManager.finalStat(sim,mod.creator,"strength"));
				
				member.information.health -= FLMD;
				
				return {allowed:true, msg:"-"+FLMD+" HP",color:"#00ff36"};
			},
			
			// WHEN THE MODIFIER WEARS OFF
			wearOff: function(sim,item,slot,member,mod) {
				member.battle.removeModifier(member,mod,true);
				return true;
			}
		}
	}
}

module.exports = ItemClassifier;