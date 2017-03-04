const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.information.names = ["Chaingun Commando"];
		this.information.baseMaxHealth = 100;
		this.information.baseXP = 65;
		
		this.information.codexBio = "The chaingun commando is one of the most annoying bullet-based enemies you'll ever find in the dungeon. With its fast-rotating barrel, the chaingunner is capable of delivering a spray of bullets into its target. \n\nAlone, a chaingunner may not pose much of a threat. In a group, they become devastating to the unskilled adventurer. Do be sure to take one out quickly if you see it."
		
		this.audios.sight = ['DSPOSIT1.wav', 'DSPOSIT2.wav', 'DSPOSIT3.wav'];
		this.sound_idle = 'DSPOSACT.wav'
		
		// -- DAMAGES
		this.baseDamage_single = 15;
		this.baseDamage_spray = 45;
		
		this.images = {
			shoot: ['cgun_fire.png'],
			death: ['cgun_die.png'],
			gib: ['cgun_gib.png'],
			idle: ['cgun_idle.png'],
			sight: ['cgun_sight.png']
		}
		
		this.sound_single = 'DSPISTOL.wav';
		this.sound_gib = 'DSSLOP.wav';
		this.sound_spray = 'DSSPRAY.wav';
		this.audios.death = ['DSPODTH1.wav', 'DSPODTH2.wav', 'DSPODTH3.wav'];
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			//-- SINGLE SHOT --
			{
				name: "Single",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER took aim at PLAYER...";
					var MSG2 = "and shot a bullet for DAMAGE damage!";
					var DMG = monster.baseDamage_single;
					var IMG = monster.randomized(monster.images.shoot);
					var SND = monster.sound_single;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			//-- SPRAY --
			{
				name: "Spray",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER took aim at PLAYER...";
					var MSG2 = "and sprayed them for DAMAGE damage!";
					var DMG = monster.baseDamage_spray;
					var IMG = monster.randomized(monster.images.shoot);
					var SND = monster.sound_spray;
					
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
					var SND = monster.sound_idle;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.5}
			}
		]
		
		this.behavior.onDeath = function(monster, sim)
		{
			if (monster.information.health <= -100)
			{
				monster.setImage(sim,monster.randomized(monster.images.gib));
				return {allowed:true, msg:["The chaingunner explodes into bloody giblets!"], sound:monster.sound_gib};
			}
			else
			{
				monster.setImage(sim,monster.randomized(monster.images.death));
				return {allowed:true, msg:["The chaingunner explodes into pieces, deceased!"], sound:monster.randomized(monster.audios.death)};
			}
		}
	}
}

module.exports = MonsterClassifier;