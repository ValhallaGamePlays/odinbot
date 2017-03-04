const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.information.names = ["Piggy"];
		this.information.baseMaxHealth = 25;
		this.information.baseXP = 10;
		this.information.codexBio = "Dungeon pigs appear to be no different from those found aboveground on land, although there are no known natural occurrences. The only known observed dungeon pigs have been transformed by the use of a Porkalator.\n\nPigs are often small in size, and can do nothing but roam around. If a larger monster has been morphed into a pig, however, the piggy may be significantly harder to kill."
		
		this.audios.sight = ['pig_squeal.wav'];
		
		this.images = {
			death: ['pigdie.png'],
			idle: ['pigidle.png'],
			sight: ['pigidle.png']
		}
		
		this.sound_death = 'pig_death.wav';
		this.sound_grunt = 'pig_grunt.wav';
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			//-- SMACK --
			{
				name: "Snort",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER snorted like a pig...";
					var MSG2 = "...and rolled around in mud.";
					
					var MSG = [];
					MSG.push(monster.replaceIt(MSG1,sim,monster,target,0));
					MSG.push(monster.replaceIt(MSG2,sim,monster,target,0));
					var SND = monster.sound_grunt;
					
					monster.setImage(sim,monster.images.idle[0]);
					
					return {allowed:true, msg:MSG, damage:0, sound:SND};
				},
				allowed: function(monster,sim,members,target,battle) {return true;}
			}
		]
		
		this.behavior.onDeath = function(monster, sim)
		{
			monster.setImage(sim,monster.randomized(monster.images.death));
			return {allowed:true, msg:["The pig explodes into pig guts!"], sound:monster.sound_death};
		}
	}
}

module.exports = MonsterClassifier;