// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// ALL AVAILABLE CHARACTERS FOR THE RPG SIMULATOR
// CREATED BY ZEDEK THE PLAGUE DOCTOR
// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

const fs = require('fs');
const jsonfile = require('jsonfile');

class CConstruct {
	
	constructor() 
	{
		this.mainDirectory = './rpgmode/codex/characters/';
		this.characters = [];
	}

	// GET A LIST OF ALL THE CHARACTER DIRECTORIES
	listCharacters() {
	  return fs.readdirSync(this.mainDirectory).filter(function (file) {
		return fs.statSync(this.mainDirectory+file).isDirectory();
	  }.bind(this));
	}
	
	// ACTUALLY SETUP ALL OF THE CHARACTERS
	setupCharacters()
	{
		var CL = this.listCharacters();
		if (CL.length <= 0) {return;}
		
		for (var l=0; l<CL.length; l++)
		{
			var CO = {
				previewIcon: this.mainDirectory+CL[l]+'/'+'preview.png',
				tinyIcon: this.mainDirectory+CL[l]+'/'+'icon.png'
			};
			
			// READ THE JSON
			var JSONT = jsonfile.readFileSync(this.mainDirectory+CL[l]+'/charinfo.json');
			
			CO.characterName = JSONT.characterName;
			CO.characterBio = JSONT.characterBio;
			
			CO.cheat = JSONT.cheat;
			CO.damageMultiplier = JSONT.damageMultiplier;
			
			CO.characterStatBoost = [];
			CO.characterStatBoost.push(JSONT.characterStatBoost.vitality);
			CO.characterStatBoost.push(JSONT.characterStatBoost.strength);
			CO.characterStatBoost.push(JSONT.characterStatBoost.dexterity);
			CO.characterStatBoost.push(JSONT.characterStatBoost.intimidate);
			CO.characterStatBoost.push(JSONT.characterStatBoost.awareness);
			CO.characterStatBoost.push(JSONT.characterStatBoost.wisdom);
			CO.characterStatBoost.push(JSONT.characterStatBoost.empathy);
			CO.characterStatBoost.push(JSONT.characterStatBoost.precision);
			CO.startingItems = JSONT.startingItems;
			
			CO.id = CL[l];
			
			this.characters.push(CO);
		}
	}
}

module.exports = CConstruct;