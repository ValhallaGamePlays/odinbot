const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.information.names = ["Forest Imp"];
		this.information.baseMaxHealth = 50;
		this.information.baseXP = 25;
		this.information.tags = ["forest"];
		
		this.audios.sight = ['DSBGSIT1.wav', 'DSBGSIT2.wav'];
		
		// -- DAMAGES
		this.baseDamage_scratch = 15;
		this.baseDamage_fireball = 25;
		
		this.images = {
			scratch: ['forestimp_melee.png'],
			attack: ['forestimp_attack.png'],
			death: ['forestimp_death.png'],
			idle: ['forestimp_melee.png'],
			sight: ['forestimp_attack.png']
		}
		
		this.sound_scratch = 'DSCLAW.wav';
		this.sound_ranged = 'DSFIRSHT.wav';
		this.sound_death = 'DSBGDTH1.wav';
		
		this.information.floorOverride = {img:'forestfloor.png',onBoss:true};
		this.information.backgroundOverride = {img:'forest.png',onBoss:true};
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			//-- SMACK --
			{
				name: "Scratch",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER scratched PLAYER...";
					var MSG2 = "and scarred their skin for DAMAGE damage!";
					var DMG = monster.baseDamage_scratch;
					var IMG = monster.randomized(monster.images.scratch);
					var SND = monster.sound_scratch;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			//-- Fireball --
			{
				name: "Fireball",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER threw a fireball at PLAYER...";
					var MSG2 = "and burnt their skin for DAMAGE damage!";
					var DMG = monster.baseDamage_fireball;
					var IMG = monster.randomized(monster.images.attack);
					var SND = monster.sound_ranged;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			//-- IDLE --
			{
				name: "Idling",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER stood still for a moment";
					var MSG2 = "and did nothing.";
					var IMG = monster.randomized(monster.images.idle);
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,undefined);
				},
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.5}
			}
		]
		
		this.behavior.onDeath = function(monster, sim)
		{
			monster.setImage(sim,monster.randomized(monster.images.death));
			return {allowed:true, msg:["The forest imp falls onto the leaves and dies!"], sound:monster.sound_death};
		}
	}
}

module.exports = MonsterClassifier;