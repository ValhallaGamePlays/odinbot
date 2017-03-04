// -- MANAGES ACCOUNTS FOR THE RPG SYSTEM
//--====================================================================--

// Required modules
const fileExists = require('file-exists');
const jsonfile = require('jsonfile');
const fs = require('fs');
const util = require('util');
const path = require('path');
//----------------------------------------------------
// States of account creation
const STATE_NULL = -1;
const STATE_NAME = 0;
const STATE_DESCRIPTION = 1;
const STATE_CHARACTER = 2;

const StateDelayTime = 1000;
//----------------------------------------------------
// How many skill points do we get when we level up?
const SPperLevel = 4;

class AManager {
	
	constructor() 
	{
		this.core = undefined;
		this.characters = undefined;
		this.accounts = [];												// ALL of the accounts
		this.parties = [];
		this.mainDirectory = path.join(__dirname, 'accounts/');						// Main directory where the accounts are stored
		this.currentCreator = undefined;								// Is someone creating an account?
		this.STRING_accountMissing = "**You don't have an account! Feel free to make one with** `!register`.";
		
		this.updateAccountList();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET THE PLAYER'S ACTUAL CHARACTER
	// --==--==--==--==--==--==--==--==--==
	finalCharacter(sim,account)
	{
		var CHR = account.template.information.character;
		
		// CHECK SLOTS A AND B
		var slotItemA = sim.inventoryManager.itemInSlot("a",account,false,false);
		if (slotItemA != undefined) {if (slotItemA.item.inventoryProperties.characterOverride != ""){CHR = slotItemA.item.inventoryProperties.characterOverride;}}
		
		var slotItemB = sim.inventoryManager.itemInSlot("b",account,false,false);
		if (slotItemB != undefined) {if (slotItemB.item.inventoryProperties.characterOverride != ""){CHR = slotItemB.item.inventoryProperties.characterOverride;}}
		
		return CHR;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET A STAT VALUE
	// --==--==--==--==--==--==--==--==--==
	finalStat(sim,account,type,justNum = true)
	{
		var starter = sim.accountManager.statByString(account,type,0,false);
		var startNum = starter.num;

		// CHECK SLOTS A AND B
		var slotItemA = sim.inventoryManager.itemInSlot("a",account,false,false);
		if (slotItemA != undefined) {startNum = slotItemA.item.behavior.statModifier(startNum,type,sim,slotItemA,"a");}
		
		var slotItemB = sim.inventoryManager.itemInSlot("b",account,false,false);
		if (slotItemB != undefined) {startNum = slotItemB.item.behavior.statModifier(startNum,type,sim,slotItemA,"b");}
		
		// CAP HEALTH OFF AT MAX HEALTH
		if (type == "hp")
		{
			var MHP = sim.accountManager.finalStat(sim,account,"maxhp");
			if (startNum > MHP) {startNum = MHP;}
		}
		
		// NOW FIND THE BATTLE THAT THIS PLAYER IS IN
		var BTL = sim.monsterManager.inBattleByID(account.id);
		if (BTL != undefined)
		{
			// Loop through the members
			for (var l=0; l<BTL.battleMembers.length; l++)
			{
				// Found this member, check its modifiers
				if (BTL.battleMembers[l].account.id == account.id)
				{
					var MEM = BTL.battleMembers[l];
					// Loop through modifiers
					for (var m=0; m<MEM.modifiers.length; m++)
					{
						if (MEM.modifiers[m].statBoosters != undefined)
						{
							// DO YET ANOTHER LOOP THROUGH THE STAT MODIFIERS
							for (var n=0; n<MEM.modifiers[m].statBoosters.length; n++)
							{
								if (MEM.modifiers[m].statBoosters[n].stat == type) {startNum += MEM.modifiers[m].statBoosters[n].amount;}
							}
						}
					}
					
					break;
				}
			}
		}
		
		if (justNum) {return startNum;}
		else {return {num:startNum,msg:starter.msg};}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DOES THIS USER OWN ANY PARTIES?
	// --==--==--==--==--==--==--==--==--==
	userOwnedParty(ID)
	{
		for (var l=0; l<this.parties.length; l++)
		{
			if (this.parties[l].creator == ID) {return this.parties[l];}
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FIND A PARTY BY ITS NAME
	// --==--==--==--==--==--==--==--==--==
	partyByName(ID)
	{
		for (var l=0; l<this.parties.length; l++)
		{
			if (this.parties[l].name.toLowerCase() == ID.toLowerCase()) {return this.parties[l];}
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CREATE A NEW PARTY
	// --==--==--==--==--==--==--==--==--==
	newParty(nprt)
	{
		this.parties.push(nprt);
		this.writeParties();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SAVE PARTIES
	// --==--==--==--==--==--==--==--==--==
	writeParties(update = true)
	{
		jsonfile.writeFile('./rpgmode/parties.json', {parties:this.parties}, function (err) 
		{
			if (err != undefined){console.error(err)}
			if (update){this.updateAccountList();}
		}.bind(this));
	}
	
	// --==--==--==--==--==--==--==--==--==
	// ADD A MEMBER TO A PARTY
	// --==--==--==--==--==--==--==--==--==
	addPartyMember(message,party,account)
	{
		party.members.push(account.id);
		account.template.information.party = party.name;

		this.saveAccount(account.id);
		this.writeParties();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// REMOVE A MEMBER FROM A PARTY
	// --==--==--==--==--==--==--==--==--==
	removePartyMember(party,mem)
	{
		if (party != undefined)
		{
			for (var l=0; l<party.members.length; l++)
			{
				if (party.members[l] == mem.id) {party.members.splice(l,1); break;}
			}
		}

		mem.template.information.party = "";
		this.saveAccount(mem.id);
		this.writeParties();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DESTROY A PARTY
	// --==--==--==--==--==--==--==--==--==
	destroyParty(message, pname)
	{
		var PN = this.partyByName(pname);
		if (PN == undefined) {message.reply("That party does not exist!"); return;}
		
		if (PN.creator != message.author.id) {message.reply("That isn't your party!"); return;}
		
		for (var l=0; l<PN.members.length; l++)
		{
			var ACC = this.fetchListAccount(PN.members[l]);
			ACC.template.information.party = "";
			this.saveAccount(PN.members[l]);
		}
		
		this.parties.splice(this.parties.indexOf(PN),1);
		this.writeParties();
		
		message.reply("Party deleted.");
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FIND THIS USER'S ACCOUNT
	// --==--==--==--==--==--==--==--==--==
	fetchAccount(ID)
	{
		var FC = this.mainDirectory+ID+'.json';
		if (fileExists(FC)) {return jsonfile.readFileSync(FC);}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// TAKE A USER'S HEALTH
	// --==--==--==--==--==--==--==--==--==
	takeHealth(account,amount,monster = false,save = true,theMonster = undefined)
	{
		var finale = amount;
		
		var IS_W = this.core.inventoryManager.itemInSlot("w", account, false,false,false);
		if (IS_W != undefined) {finale = IS_W.item.behavior.damageModifier(finale, this.core, IS_W.item, "w", monster, account);}
		
		var IS_A = this.core.inventoryManager.itemInSlot("a", account, false,false,false);
		if (IS_A != undefined) {finale = IS_A.item.behavior.damageModifier(finale, this.core, IS_A.item, "a", monster, account);}
		
		var IS_B = this.core.inventoryManager.itemInSlot("b", account, false,false,false);
		if (IS_B != undefined) {finale = IS_B.item.behavior.damageModifier(finale, this.core, IS_B.item, "b", monster, account);}
		
		// -- FIGURE OUT A FINALE --
		for (var l=0; l<this.core.characters.characters.length; l++)
		{
			if (this.core.characters.characters[l].id == account.template.information.character)
			{
				finale *= this.core.characters.characters[l].damageMultiplier
			}
		}
		
		finale = Math.floor(finale);
		
		account.template.stats.health -= finale;
		
		if (save){this.saveAccount(account.id);}
		
		return finale;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FIND THIS USER'S ACCOUNT IN THE LIST
	// --==--==--==--==--==--==--==--==--==
fetchListAccount(ID)
{
	for (var l=0; l<this.accounts.length; l++)
	{
		console.log("."+this.accounts[l].id+". VS ."+ID+". - MATCHES: "+(this.accounts[l].id === ID));
		if (this.accounts[l].id == ID) 
		{
			console.log("RETURNING ACCOUNT WITH ID "+this.accounts[l].id);
			return this.accounts[l];
		}
	}
	
	console.log("MADE IT PAST, WHAT?");
	
	return undefined;
}
	
	// --==--==--==--==--==--==--==--==--==
	// UPDATE ALL OF THE ACCOUNTS IN THE LIST
	// --==--==--==--==--==--==--==--==--==
	updateAccountList()
	{
		this.accounts.length = 0;
		
		fs.readdir(this.mainDirectory, function(err, items) {
			for (var i=0; i<items.length; i++) {
				if (items[i] == "default.json") {continue;}
				
				var PUSHER = {};
				PUSHER.template = jsonfile.readFileSync(this.mainDirectory+items[i]);
				PUSHER.id = items[i].replace(".json","");
				PUSHER.finalStat = this.finalStat;
				
				this.accounts.push(PUSHER);
			}
			
			console.log("[RPG] Updated account list.");
			this.updatePartyList();
		}.bind(this));
	}
	
	// --==--==--==--==--==--==--==--==--==
	// UPDATE PARTY LIST
	// --==--==--==--==--==--==--==--==--==
	updatePartyList()
	{
		this.parties.length = 0;
		var PRT = jsonfile.readFileSync('./rpgmode/parties.json');
		
		this.parties = PRT.parties;
		
		console.log("[RPG] Updated parties: "+this.parties.length+" parties exist.")
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SAVE AN ACCOUNT TO THE DRIVE
	// --==--==--==--==--==--==--==--==--==
	saveAccount(ID)
	{
		var AC = this.fetchListAccount(ID);
		if (AC == undefined) {return;}
		
		console.log("Saved account "+ID+".");
		
		jsonfile.writeFile(this.mainDirectory+ID+'.json', AC.template, function (err) {if (err != null){console.error(err)}});
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FIND AN ACCOUNT BY WHAT WE ENTERED
	// --==--==--==--==--==--==--==--==--==
	userByText(txt)
	{
		for (var l=0; l<this.accounts.length; l++)
		{
			if (this.accounts[l].id == txt) {return this.accounts[l];}
			if (this.accounts[l].template.information.username.toLowerCase().indexOf(txt) != -1) {return this.accounts[l];}
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// IS A USER DEAD?
	// --==--==--==--==--==--==--==--==--==
	isDead(ID)
	{
		var AC = this.fetchListAccount(ID);
		if (AC == undefined) {return -1;}
		
		if (AC.template.stats.health > 0) {return false;}
		return true;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GIVE A USER EXPERIENCE
	// --==--==--==--==--==--==--==--==--==
	giveUserXP(account, xp)
	{
		// We can subtract this as needed
		var XPTG = xp;
		
		var LVL = false;
		var ATS = account.template.stats;
		
		do {
			ATS.experience += XPTG;
			
			// DID WE LEVEL UP?
			if (ATS.experience >= ATS.experienceGoal)
			{
				ATS.level ++;
				ATS.skillPoints += SPperLevel;
				XPTG -= ATS.experienceGoal;
				if (XPTG < 0) {XPTG = 0;}
				ATS.experience = XPTG;
				ATS.experienceGoal = this.core.calculator.newExperienceGoal(ATS.experienceGoal,ATS.level);
				LVL = true;
			}
			else {XPTG -= xp;}
		} while (XPTG > 0)
		
		this.saveAccount(account.id);
		return {msg:"You gained "+xp+" experience", levelUp: LVL};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DELETE AN ACCOUNT
	// --==--==--==--==--==--==--==--==--==
	deleteAccount(message)
	{
		var FL = path.join(this.mainDirectory,message.author.id+'.json');
		
		if (fileExists.sync(FL))
		{
			message.channel.sendFile(FL).then(function(){
			fs.unlink(FL,function(err){
				if(err) return console.log(err);
				message.reply("**Sorry to see you go!** Your account has been deleted, but here's a copy of it. If you ever want it back, tell a tech wizard.")
				
				this.updateAccountList();
			}.bind(this));
			}.bind(this),function(){});
		}
		else 
		{
			console.log("WARNING: ACCOUNT MISSING");
			message.reply(this.STRING_accountMissing);
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// ADD AN ACCOUNT FOR A USER
	// --==--==--==--==--==--==--==--==--==
	addAccount(message)
	{
		// Do we already have an account?
		if (this.fetchAccount(message.author.id) != undefined) {message.reply("**You already have an account created!**"); return; }
		
		// Start registering for an account
		var TT = jsonfile.readFileSync(this.mainDirectory+'default.json');
		this.currentCreator = {user: message.author, state: STATE_NAME, JSONtemplate:TT};
		
		// Set some baseline things
		this.currentCreator.JSONtemplate.information.username = message.author.username;
		
		// Start handling states and such
		this.handleStates(message,false,"");
		
	}
	
	// --==--==--==--==--==--==--==--==--==
	// PARSE WHAT WE ENTERED, ASIDE FROM THE PREFIX
	// --==--==--==--==--==--==--==--==--==
	parseEntered(stringy) 
	{
		var IND = stringy.toLowerCase().indexOf("!submit");
		
		if (IND != -1) {return stringy.slice(IND + 8, stringy.length);}
		else {return "";}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET A STAT THING BY A STRING
	// --==--==--==--==--==--==--==--==--==
	statByString(account,stringy,val,setting)
	{
		switch (stringy.toLowerCase())
		{
			case "vitality":
				if (!setting){return {num:account.template.stats.vitality,msg:"**Vitality** affects your maximum health value."}}
				else
				{
					account.template.stats.vitality = val;
					account.template.stats.maxHealth = this.core.calculator.getMaxHealth(val);
					this.saveAccount(account.id);
				}
			break;
			
			case "strength":
				if (!setting){return {num:account.template.stats.strength,msg:"**Strength** affects how much damage you do with close-range weapons."}}
				else
				{
					account.template.stats.strength = val;
					this.saveAccount(account.id);
				}
			break;
			
			case "dexterity":
				if (!setting){return {num:account.template.stats.dexterity,msg:"**Dexterity** affects your chance to dodge a monster's attacks."}}
				else
				{
					account.template.stats.dexterity = val;
					this.saveAccount(account.id);
				}
			break;
			
			case "intimidate":
				if (!setting){return {num:account.template.stats.intimidate,msg:"**Intimidate** affects your chance to intimidate a monster and cause them to flee."}}
				else
				{
					account.template.stats.intimidate = val;
					this.saveAccount(account.id);
				}
			break;
			
			case "awareness":
				if (!setting){return {num:account.template.stats.awareness,msg:"**Awareness** affects your chance to find items in loot and when searching."}}
				else
				{
					account.template.stats.awareness = val;
					this.saveAccount(account.id);
				}
			break;
			
			case "wisdom":
				if (!setting){return {num:account.template.stats.wisdom,msg:"**Wisdom** affects your efficiency with magic weapons and spells."}}
				else
				{
					account.template.stats.wisdom = val;
					this.saveAccount(account.id);
				}
			break;
			
			case "empathy":
				if (!setting){return {num:account.template.stats.empathy,msg:"**Empathy** affects how well you can positively affect other members."}}
				else
				{
					account.template.stats.empathy = val;
					this.saveAccount(account.id);
				}
			break;
			
			case "precision":
				if (!setting){return {num:account.template.stats.precision,msg:"**Precision** affects your critical strike chance, and ranged damage."}}
				else
				{
					account.template.stats.precision = val;
					this.saveAccount(account.id);
				}
			break;
			
			case "hp":
				if (!setting){return {num:account.template.stats.health,msg:"**Health** is how alive your character is."}}
				else
				{
					account.template.stats.health = val;
					this.saveAccount(account.id);
				}
			break;
			
			case "maxhp":
				if (!setting){return {num:account.template.stats.maxHealth,msg:"**Max HP** is how much health your character can have at any given time."}}
				else
				{
					account.template.stats.maxHealth = val;
					this.saveAccount(account.id);
				}
			break;
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CONVERT A TEMPLATE TO BADGE INFO
	// --==--==--==--==--==--==--==--==--==
	toBadgeInfo(temp, tid)
	{
		var badgeInfo = {
			name: temp.information.displayname,
			bio: temp.information.description,
			character: this.finalCharacter(this.core,this.fetchListAccount(tid)),
			
			xp:temp.stats.experience,
			xpgoal:temp.stats.experienceGoal,
			level:temp.stats.level,
			
			wepItem:temp.inventory[0],
			eqItemA:temp.inventory[1],
			eqItemB:temp.inventory[2],
			
			gold:temp.stats.gold,
			
			points:temp.stats.skillPoints,
			
			statBars:[
				{val:temp.stats.vitality},
				{val:temp.stats.strength},
				{val:temp.stats.dexterity},
				{val:temp.stats.intimidate},
				{val:temp.stats.awareness},
				{val:temp.stats.wisdom},
				{val:temp.stats.empathy},
				{val:temp.stats.precision}
			],
			
			party: temp.information.party,
			owner: false
		}
		
		if (this.userOwnedParty(tid) != undefined) {badgeInfo.owner = true;}
		
		return badgeInfo;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DO THINGS DEPENDING ON WHICH STATE WE'RE IN
	// --==--==--==--==--==--==--==--==--==
	
	handleStates(message,stateEnd,stringpass)
	{
		var PE = this.parseEntered(message.content);
		
		switch (this.currentCreator.state)
		{
			// STATE 1: DISPLAY NAME
			case STATE_NAME:
				if (!stateEnd){message.reply("\n\n**Enter a name for your character**\n*(Prefix your message with !submit)*");}
				else if (PE != "")
				{
					message.reply("\n:white_check_mark: Your character's name is: `"+PE+"`.");
					this.currentCreator.state = STATE_DESCRIPTION;
					this.currentCreator.JSONtemplate.information.displayname = PE;
					setTimeout(function(){this.handleStates(message,false,"");}.bind(this),StateDelayTime);
				}
			break;
			
			// STATE 2: DESCRIPTION
			case STATE_DESCRIPTION:
				if (!stateEnd){message.reply("\n\n**Enter a bio for your character**\n*(Prefix your message with !submit)*");}
				else if (PE != "")
				{
					message.reply("\n:white_check_mark: Okay, your character's description is:\n\n `"+PE+"`\n\nWait a moment for a list characters to select...");
					this.currentCreator.state = STATE_CHARACTER;
					this.currentCreator.JSONtemplate.information.description = PE;
					setTimeout(function(){this.handleStates(message,false,"");}.bind(this),StateDelayTime);
				}
			break;
			
			// STATE 3: CHARACTER
			case STATE_CHARACTER:
				if (!stateEnd)
				{
					this.core.printCharPage(message.channel,0);
				}
				else
				{
					var CHR = undefined;
					for (var l=0; l<this.characters.characters.length; l++)
					{
						if (this.characters.characters[l].id == stringpass) {CHR = this.characters.characters[l]; break;}
					}
					
					if (CHR == undefined) {return;}
					
					var JSONT = this.currentCreator.JSONtemplate;
					message.reply(":white_check_mark: You've selected: **"+CHR.characterName+"**.");
					JSONT.information.character = stringpass;
					
					// PUSH THE STATS
					JSONT.stats.vitality = CHR.characterStatBoost[0];
					JSONT.stats.strength = CHR.characterStatBoost[1];
					JSONT.stats.dexterity = CHR.characterStatBoost[2];
					JSONT.stats.intimidate = CHR.characterStatBoost[3];
					JSONT.stats.awareness = CHR.characterStatBoost[4];
					JSONT.stats.wisdom = CHR.characterStatBoost[5];
					JSONT.stats.empathy = CHR.characterStatBoost[6];
					JSONT.stats.precision = CHR.characterStatBoost[7];
					
					JSONT.stats.maxHealth = this.core.calculator.getMaxHealth(CHR.characterStatBoost[0]);
					JSONT.stats.health = JSONT.stats.maxHealth;
					
					JSONT.backpack = [];
					
					for (var l=0; l<this.core.inventoryWidth * this.core.inventoryHeight; l++)
					{
						JSONT.backpack.push({id:"",rarity:0,prefixes:[],suffixes:[]});
					}
					
					// GIVE ALL OF THE ITEMS
					for (var l=0; l<CHR.startingItems.length; l++)
					{
						JSONT.backpack[l].id = CHR.startingItems[l];
					}
					
					setTimeout(function(){
						
					// WRITE THE FILE
					jsonfile.writeFile(this.mainDirectory+message.author.id+'.json', this.currentCreator.JSONtemplate, function (err) 
					{
						if (err != undefined){console.error(err)}
						this.updateAccountList();
					}.bind(this));
					this.currentCreator = undefined;
					message.reply("**You have an account now, congrats!** You can use `!character` to view your information.");}.bind(this),StateDelayTime);
				}
			break;
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GIVE HEALTH TO A USER
	// --==--==--==--==--==--==--==--==--==
	giveHealth(account,amount,forceful)
	{
		var HLTH = this.finalStat(this.core,account,"hp");
		var MHLT = this.finalStat(this.core,account,"maxhp");
		// AT MAX HEALTH?
		if (HLTH >= MHLT) {return {allowed:false, msg:"You're already at full health."};}
		// DEAD
		if (HLTH <= 0 && !forceful) {return {allowed:false, msg:"**You can't heal when you're dead!**"};}
		
		var HLT = HLTH + amount;
		
		// Clamp it at our maximum health
		if (HLT > MHLT)
			HLT = MHLT;
		
		account.template.stats.health = HLT;
		return {allowed:true, msg:""};
	}
}

module.exports = AManager;