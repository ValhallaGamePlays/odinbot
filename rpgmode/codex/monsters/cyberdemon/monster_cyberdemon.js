const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.information.names = ["Cyberdemon"];
		this.information.baseMaxHealth = 1000;
		this.information.baseXP = 500;
		this.information.bossMonster = true;
		this.information.baseLevel = 5;
		this.information.codexBio = "A hulking behemoth of man and machine, the cyberdemon is one of the most feared creatures in the dungeon. Without a  the cyberdemon is sure to turn you into mince meat.\n\nKilling the cyberdemon, however, may leave you with a prize or two.\n\nPROTIP: To defeat the cyberdemon, shoot it until it dies."
		
		// If you're lucky, you can get two horns, a head, and the rocket launcher
		this.information.lootTable = [
			{item:"randomized", chance:0.0},
			{item:"randomized", chance:0.0},
			{item:"godpotion", chance:0.75},
			{item:"cyberdemonhorn", chance:0.75},
			{item:"cyberdemonhorn", chance:0.75},
			{item:"cyberdemonhead", chance:0.80},
			{item:"cyberdemonlauncher", chance:0.95}
		]
		
		this.audios.sight = ['DSCYBSIT.wav'];
		
		// -- DAMAGES
		this.baseDamage_rocket = 40;
		
		this.images = {
			rocket: ['cyber_shoot.png'],
			death: ['cyber_death.png'],
			idle: ['cyber_idle.png'],
			sight: ['cyber_sight.png']
		}
		
		this.sound_rocket = 'DSRLAUNC.wav';
		this.sound_death = 'DSCYBDTH.wav';
		this.sound_idle = 'DSHOOF.wav';
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			// -- MISSILE ATTACK --
			{
				name: "Rocket Launch",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER shot a missile at PLAYER...";
					var MSG2 = "and blew them open for DAMAGE damage!";
					var DMG = monster.baseDamage_rocket;
					var IMG = monster.randomized(monster.images.rocket);
					var SND = monster.sound_rocket;
					
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
			monster.setImage(sim,monster.randomized(monster.images.death));
			return {allowed:true, msg:["The behemoth explodes into giblets!"], sound:monster.sound_death};
		}
	}
}

module.exports = MonsterClassifier;