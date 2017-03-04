const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"You can use this spell in battle."};}
		
		this.inventoryProperties.itemName = "Serpent Staff";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.9;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.description = "A long staff with a strange green eyeball in the middle.";
		this.inventoryProperties.helper = "20-30 base damage against enemy, able to drain life";
		
		this.vampire = false;
		
		this.weaponProperties.baseDamage = 30;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.wisdomMultiply = false;
		this.weaponProperties.attackString = "fired two magical green serpent fireballs at the enemy..."
		this.weaponProperties.attackSounds = ['CONE3.wav']
		
		this.behavior.getAttackSound = function(account, sim, item, slot, battle)
		{
			if (item.vampire) {return 'VAMP5.wav';}
			return 'SPELL1.wav';
		}
		
		this.behavior.attack = function(account, sim, item, monster) {
			var dmgPick = item.weaponProperties.baseDamage;
			item.vampire = false;
			
			// 50% chance to use melee
			if (Math.random(1) >= 0.5)
			{
				item.vampire = true;
				dmgPick = 20;
				
				sim.accountManager.giveHealth(account,5,false);
			}
			
			var DMG = item.behavior.calculateDamage(account,sim,item,monster,dmgPick,dmgPick);
			
			var indicator = {damage:DMG};
			var takeDam = monster.takeDamage(sim, account, indicator);
			
			indicator.damage = takeDam;
			
			var MSG = item.weaponProperties.attackString;
			if (item.vampire) {MSG = "got up close and personal, draining the enemy's life force...";}
			
			return {indicator: indicator, msg:MSG};
		}
	}
}

module.exports = ItemClassifier;