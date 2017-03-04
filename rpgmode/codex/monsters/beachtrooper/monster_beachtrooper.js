const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		var assault = require('../assaulttrooper/monster_assaulttrooper.js');
		assault.setupAssault(this);
		
		var beachSetup = require('../shortcutBeach.js')(this);
		
		// OVERRIDE WITH BEACH STUFF
		this.information.names = ["Beach Trooper"];

		this.images = {
			hover: ['beachtrooper_hover.png'],
			shoot: ['beachtrooper_fire.png'],
			snapshot: ['beachtrooper_snapshot.png'],
			hovershoot: ['beachtrooper_hovershot.png'],
			death: ['beachtrooper_die.png'],
			gib: ['beachtrooper_gib.png'],
			choke: ['beachtrooper_choke.png'],
			idle: ['beachtrooper_idle.png'],
			sight: ['beachtrooper_sight.png']
		}
	
		this.information.codexBio = "When stealing Earth's babes becomes too much, the average alien assault trooper might get a little stressed. What better way to relax than kicking back in the Poknos?\n\nThe beach troopers possess a jetpack which is somehow hidden underneath their Miami suits. While hovering, they can dodge attacks easily. Watch out for their accurate snap shots."
	}
}

module.exports = MonsterClassifier;