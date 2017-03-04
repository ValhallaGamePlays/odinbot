const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.information.names = ["Revenant"];
		this.information.baseMaxHealth = 75;
		this.information.baseXP = 75;
		
		this.audios.sight = ['DSSKESIT.wav'];
		
		this.information.codexBio = "Like other demonic creatures found in the dungeon, the Revenant is a macabre combination of organic matter and mechanics. It is currently unknown how the Revenant is able to move with so little muscular matter.\n\nThe Revenant is equipped with two shoulder mounted rocket launchers, and a mean slap despite its thin, bony appearance. Exercise caution."
		
		// -- DAMAGES
		this.baseDamage_rocket = 10;
		this.baseDamage_smack = 5;
		
		this.images = {
			rocket: ['revranged.png'],
			smack: ['revmelee.png'],
			death: ['revdie.png'],
			idle: ['revidle.png'],
			sight: ['revsight.png']
		}
		
		this.sound_rocket = 'DSSKEATK.wav';
		this.sound_melee = 'DSSKEPCH.wav';
		this.sound_death = 'DSSKEDTH.wav';
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			// -- MISSILE ATTACK --
			{
				name: "Rocket Launch",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER shot missiles at PLAYER...";
					var MSG2 = "and blew their chest open for DAMAGE damage!";
					var DMG = monster.baseDamage_rocket;
					var IMG = monster.randomized(monster.images.rocket);
					var SND = monster.sound_rocket;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			//-- SMACK --
			{
				name: "Smack",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER bitchslapped PLAYER...";
					var MSG2 = "and did a smack worth DAMAGE damage!";
					var DMG = monster.baseDamage_smack;
					var IMG = monster.randomized(monster.images.smack);
					var SND = monster.sound_melee;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return true;}
			}
		]
		
		this.behavior.onDeath = function(monster, sim)
		{
			monster.setImage(sim,monster.randomized(monster.images.death));
			return {allowed:true, msg:["The revenant collapses into bones!"], sound:monster.sound_death};
		}
	}
}

module.exports = MonsterClassifier;