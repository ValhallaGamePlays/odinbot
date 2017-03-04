// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// -- D I S C O R D   B A T T L E   S I M U L A T O R --
// Coded by Zedek the Plague Doctor, simple turn-based "battle" simulator
// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

const httpreq = require('httpreq');
const Image = require('purified-image');
const mainBot = require('./odin.js');
const fs = require('fs');

const pureimage = require('pureimage');

class BattleSimulator
{
	constructor()
	{
		this.BSoptions = require('./BattleSimOptions');
		this.currentMonster = -1;
		this.currentMonsterHealth = -1;		
		this.battleChannel = undefined;
		this.battlePlayers = [];
		this.battleGuild = undefined;
		this.battleState = this.BSoptions.BS_NOTHING;
		this.backpackCounter = 0;
		this.lobbyMessage = undefined;
		this.statusMessage = undefined;
		this.battleStartMessage = "";
		this.statusContent = "";
		this.statusPic = undefined;
		this.downloadCounter = 0;
		this.turnImage = undefined;
		this.pendingSound = undefined;
		this.fightCounter = 0;
		this.bot = mainBot;
		this.thePlayer = this.thePlayer;
		this.avatarCounter = 0;
		
		var fnt = pureimage.registerFont('fonts/pixel_maz.ttf','PixelMaz');
		fnt.load(function() {console.log("Font loaded!");});
		
		console.log("THE BOT IS: "+this.bot);
		console.log("PLAYER: "+this.thePlayer);
	}
	
	setPlayer(pp) {console.log("PLAYER SET TO "+pp); this.thePlayer = pp;}
	
	randomFrom(thelength) {return Math.floor(Math.random() * thelength);}
	getOptions(){return this.BSoptions;}
	
	// -- DID WE EXECUTE ANY FIGHT COMMANDS?
	checkCommands(message)
	{
		var msg = message.content.toLowerCase();
		
		for (var l=0; l<this.BSoptions.fightCommands.length; l++)
		{
			if (msg.indexOf(this.BSoptions.fightCommands[l].id) != -1)
			{
				this.BSoptions.fightCommands[l].process(message,this);
				return;
			}
		}
	}
	
	// -- EXPERIENCE SHIT
	addFightXP()
	{
		if (this.battlePlayers[this.fightCounter] != undefined)
		{
			if (this.battlePlayers[this.fightCounter].user != undefined){this.bot.changeUserXP(this.battlePlayers[this.fightCounter].user,this.battlePlayers[this.fightCounter].XP,this.battleChannel);}
		}
		
		this.fightCounter ++;
		if (this.fightCounter < this.battlePlayers.length) {setTimeout(this.addFightXP,1000);}
	}
	
	// -- PICTURE-BASED TURN MESSAGES --
	
	// When a game starts, download avatars for all of the players involved
	saveTheAvatars()
	{
		console.log("SAVING AVATARS...");
		this.downloadCounter = 0;
		
		// Loop through all of the players that are in the game and save their avatars
		for (var l=0; l<this.battlePlayers.length; l++)
		{
			var par = this;
			
			console.log("DOWNLOADING AVATAR "+this.downloadCounter.toString()+": "+this.battlePlayers[l].user.avatarURL);
			httpreq.download(this.battlePlayers[l].user.avatarURL,__dirname + "/avatars/"+this.battlePlayers[l].user.id+".jpg", function (err, progress){}, (function (err, res){
				console.log("Saved avatar: "+this.downloadCounter.toString());
				this.downloadCounter ++;
				if (this.downloadCounter >= this.battlePlayers.length) {this.avatarFinish();}
			}).bind(this),function(err, res){console.log(err);});
		}
	}

	// We finished downloading the avatars!
	avatarFinish()
	{
		console.log("Downloaded avatars, check the folder");
		
		if (this.battleState != this.BSoptions.BS_NOTHING){this.giveBackpacks();}
		else{this.drawTurnMessage();}
	}

	// -- DRAW THE STATUS CARD --
	drawTurnMessage()
	{
		this.downloadCounter = 0;
		// -- EVERY PLAYER HAS A SIZE OF 42 PIXELS
		// -- THE HEADER IS 24 PIXELS
		var ySize = 24 + (42*this.battlePlayers.length) + 24;
		// -- 400 IS THE MAXIMUM SIZE FOR UNSCALED IMAGES
		
		//this.turnImage = this.bot.images(400,ySize);
		//var HDR = this.bot.images("./battle/playerturn.png");
		//this.turnImage.draw(HDR,0,0);
		
		this.turnCard();
	}
	
	turnCard()
	{
		// -- THIS IS THE TEXT IMAGE
		var HT = 24 + (42*this.battlePlayers.length) + 24;
		//var img = this.bot.pureimage.make(400,24+(42*this.battlePlayers.length)+24);
		
		var pct = this.currentMonsterHealth / this.BSoptions.monsters[this.currentMonster].health;
		
		pct = 1.0 - pct;
		
		console.log("CMH: "+this.currentMonsterHealth.toString());
		console.log("MH: "+this.BSoptions.monsters[this.currentMonster].health.toString());
		console.log("PCT: "+pct.toString());
		
		var WW = Math.floor(pct*399);
		if (WW > 399) {WW = 399;}
		
		console.log("BAR WIDTH: "+(WW).toString());
		
		var HIMG = new Image("./battle/images/health_bar.png","auto");//
		//HIMG.resize(WW-1,13);
		console.log("WW: "+WW.toString());
		
		var img = new Image("./battle/playerturn.png","auto").loadFont('./fonts/pixel_maz.ttf','PixelMaz').resize(400,HT).draw(ctx => {
			
			/*
		console.log("DRAWING ON IMAGE! HT IS "+HT);
		ctx.fillStyle = '#000000';
		ctx.fillRect(0,24,400,HT);
		
		for (var l=0; l<this.battlePlayers.length; l++)
		{
			var startY = 24 + (42*l);
			
			// -- RECTANGLES
			ctx.fillStyle = '#4d3232';
			ctx.fillRect(0,startY,400,28);
			
			// -- THIS IS THE TOP BAR
			ctx.fillStyle = '#282b2f';
			ctx.fillRect(0,startY,400,14);
			
			// -- WHILE WE'RE HERE, DRAW THE HEALTH FOR THE PLAYER
			var HClamp = this.battlePlayers[l].health;
			if (HClamp > 100){HClamp = 100;}
			
			var pct = this.battlePlayers[l].health / 100;
			
			ctx.fillStyle = '#157f33';
			ctx.fillRect(0,startY,Math.floor(pct*400),14);
			
			ctx.setFont('PixelMaz',13);
			
			// -- TEXT
			ctx.fillStyle = '#ffffff';
			ctx.fillText(this.battlePlayers[l].header,30,startY+23);
			ctx.fillText(this.battlePlayers[l].sub,3,startY+38);
			
			ctx.fillStyle = '#ffffcc';
			ctx.fillText(this.battlePlayers[l].user.username,30,startY+11);
		}
		
		// -- DRAW THE MONSTER RECTANGLE ON THE BOTTOM
		ctx.fillStyle = '#150000';
		ctx.fillRect(0,HT-14,400,14);
		
		// -- CALCULATE THE BAR LENGTH
		//ctx.fillStyle = '#c78404';
		//ctx.fillRect(0,HT-14,Math.floor(pct*400),14);
		
		HIMG.ready(function(bmpp){
			ctx.drawImage(bmpp,0,HT-14);
			
			ctx.fillStyle = '#000000';
			ctx.fillRect(400-WW,HT-15,WW,15);
			
			// -- NOW DRAW THE MONSTER'S NAME
			ctx.setFont('PixelMaz',13);
			ctx.fillStyle = '#000000';
			ctx.fillText(this.BSoptions.monsters[this.currentMonster].name,4,HT-2);
			ctx.fillStyle = '#ffffff';
			ctx.fillText(this.BSoptions.monsters[this.currentMonster].name,3,HT-3);
		}.bind(this));
		
		ctx.fillStyle = '#000000';
		
		// LINES LEFT AND RIGHT
		ctx.fillRect(0,0,400,1);
		ctx.fillRect(0,HT-1,400,1);
		
		// LINES UP AND DOWN
		ctx.fillRect(399,0,1,HT);
		ctx.fillRect(0,0,1,HT);
		*/
		
		}).save("output.png").then(function(err)
		{
			this.avatarCounter = 0;
			this.drawAnAvatar()
		}.bind(this),function(){});
	}
	
	// -- DRAW AN AVATAR ONTO THE TURN CARD
	drawAnAvatar()
	{
		var l = this.avatarCounter;

		var startY = 24+(42*l);
		
		var MIMG = new Image("./output.png");
		var pic = new Image("./battle/gibbed.png");
		var iconPic = new Image("./battle/"+this.battlePlayers[l].icon+".png");
		
		
		if (this.battlePlayers[l].health > 0)
		{
			//pic = new Image("./avatars/"+this.battlePlayers[l].user.id+".jpg");
			pic = new Image("./battle/smiles.png");
		}
		
		
		//pic.toBuffer("png").then(function(buff)
		fs.readFile("./battle/gibbed.png", function(err,buff)
		{
			MIMG.draw(ctx => {
			console.log(buff);
			//ctx.drawImage(buff,2,startY+2)
				pic.ready(function(bmp){ctx.drawImage(bmp,2,startY+2);});
				iconPic.ready(function(bmp){ctx.drawImage(bmp,400-24,startY+2);});
			}).save("output.png").then(function(){
		
			console.log("output.png saved");
			/*
			if (this.battlePlayers[l].icon != "")
			{
				var icon = this.bot.images("./battle/"+this.battlePlayers[l].icon+".png");
				this.turnImage.draw(icon,400-24,startY+2);
			}
			
			var PT = this.bot.images("./battle/playerturn.png");
			this.turnImage.draw(PT,0,0);
			
			this.turnImage.save("output.png", {quality:100});
			*/
			
			this.avatarCounter ++;
			
			if (this.avatarCounter >= this.battlePlayers.length)
			{
				this.battleChannel.sendFile("output.png").then((function(themess){
					// -- ACTUALLY SEND THE FILE
					if (this.pendingSound != ""){this.thePlayer.playLocalForced(this.pendingSound,0.5);}
					
					this.statusMessage = themess;
					setTimeout(this.monsterTurn.bind(this),this.BSoptions.attackEndTime*1000);
				}).bind(this),function(themess){});
			}
			else {this.drawAnAvatar();}
			
			}.bind(this));//,function(){});
			
		}.bind(this));//,function(){});
	}
	
	// ========================================
	
	// -- JOINS THE BATTLE
	joinFight(message)
	{
		var inList = false;
				
		for (var l=0; l<this.battlePlayers.length; l++){if (this.battlePlayers[l].user == message.author){inList=true;}}
		
		if (!inList)
		{
			var pusher = {user:message.author,health:100,ready:false,weapon:-1,action:this.BSoptions.ACT_NONE,dead:false,XP:0,header:"",sub:"",icon:""}
			this.battlePlayers.push(pusher);
			this.lobbyMessage.edit(this.battleStartMessage+"\n\n**"+message.author.username+"** has joined the battle! Use *!ready* to be ready.\n\n"+this.printBattleLobby(true));
			message.delete();
		}
		else{message.reply("You can only join once!");}
	}
	
	// -- START THE BATTLE IF WE'RE READY --
	startIfReady()
	{
		console.log("STARTING IF READY...");
		
		var isReady = true;
		for (var l=0; l<this.battlePlayers.length; l++)
		{
			if (!this.battlePlayers[l].ready){isReady=false;}
		}
		
		if (isReady){this.saveTheAvatars();}
	}

	// Is this user in the lobby?
	inLobby(user)
	{
		for (var l=0; l<this.battlePlayers.length; l++){if (this.battlePlayers[l].user == user){return true;}}
		return false;
	}

	endFight(){this.battleState = this.BSoptions.BS_NOTHING; this.fightCounter = 0; /*this.addFightXP();*/}

	// This user becomes ready
	becomeReady(user)
	{
		for (var l=0; l<this.battlePlayers.length; l++){if (this.battlePlayers[l].user == user){this.battlePlayers[l].ready = true; break;}}
		
		var par = this;
		this.lobbyMessage.edit(this.battleStartMessage+"\n\n:white_check_mark: **"+user.username+"** is ready to go!\n\n"+this.printBattleLobby(true)).then(function(){par.startIfReady();},function(){console.log("FAILED YO");})
	}

	setAction(mess,act)
	{
		if (this.battleState != this.BSoptions.BS_PLAYERTURN) {return;}
		
		var BP = this.findBattlePlayer(mess.author);
		
		if (BP != -1)
		{
			this.findBattlePlayer(mess.author).action = act; 
			mess.delete(); 
			
			var allActions = true;
			for (var l=0; l<this.battlePlayers.length; l++){if (this.battlePlayers[l].action == this.BSoptions.ACT_NONE && this.battlePlayers[l].health > 0){allActions=false;}}
			
			if (!allActions){this.statusMessage.edit(this.statusContent+this.printBattleLobby(false));}
			else{this.doAttack();}
		}
		else {mess.reply("You need to be in battle!");}
	}

	// Find the battle player that corresponds to this user
	findBattlePlayer(user)
	{
		var BP = -1;
		for (var l=0; l<this.battlePlayers.length; l++){if (this.battlePlayers[l].user == user){BP = l; break;}}
		return this.battlePlayers[BP];
	}

	// -- PRINT THE LOBBY INFO, ALL PLAYERS AND SUCH --
	printBattleLobby(usetitle)
	{
		var BS = "";
		
		if (usetitle){BS += "**Players in lobby:**\n"};
		for (var l=0; l<this.battlePlayers.length; l++)
		{
			var RB = ":x:";
			
			if (this.battlePlayers[l].health <= 0)
			{
				if (this.battlePlayers[l].health >= -20){RB = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_DEAD);}
				else{RB = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_GIBBED);}
			}
			else{if (this.battlePlayers[l].ready) {RB = ":white_check_mark:";}}
			
			BS += RB+" `"+l.toString()+"` "+this.battlePlayers[l].user.username+" - *"+this.battlePlayers[l].health.toString()+" HP*";
			
			if (this.battleState == this.BSoptions.BS_PLAYERTURN && this.battlePlayers[l].action != this.BSoptions.ACT_NONE){BS += "- `"+this.BSoptions.actionStrings[this.battlePlayers[l].action]+"`";}
			
			BS += "\n"
		}
		
		return BS;
	}
	
	// -- PRINT EXPERIENCE INFO
	printBattleXP()
	{
		var BS = "";
		
		BS += "**Player experience:**\n";
		for (var l=0; l<this.battlePlayers.length; l++){BS += "`"+l.toString()+"` "+this.battlePlayers[l].user.username+" - *"+this.battlePlayers[l].XP.toString()+" XP*\n";}
		
		return BS;
	}

	// -- ACTUALLY STARTS A FIGHT --
	startFight(message)
	{
		this.battlePlayers.length = 0;
		this.battlePlayers = [];
		this.battleChannel = message.channel;
		this.battleGuild = message.channel.guild;
		this.battleState = this.BSoptions.BS_WAITING;
		
		var DI = this.bot.findEmoji(message.channel.guild,this.BSoptions.EMT_BANNERLEFT);
		var DZ = this.bot.findEmoji(message.channel.guild,this.BSoptions.EMT_BANNERRIGHT);
		
		this.battleStartMessage = DI+" "+this.bot.toRegional(this.BSoptions.GAMENAME)+" "+DZ+"\n\n**A GAME HAS STARTED, USE** !play **TO JOIN**\n**USE** !ready **TO BECOME READY AND FIGHT**";
		
		this.battleChannel.sendMessage(this.battleStartMessage+"\n\n"+this.printBattleLobby(true)).then(msgd => this.lobbyMessage = msgd);
	}

	giveBackpacks()
	{
		var par = this;
		this.lobbyMessage.delete().then(function(){
			
		par.battleState == par.BSoptions.BS_BACKPACKS;
		var BPS = "";
		var BE = par.bot.findEmoji(par.battleGuild,par.BSoptions.EMT_PACKICON);
		
		for (var l=0; l<par.battlePlayers.length; l++){BPS += BE+" ";}
		BPS += "\n**Giving "+par.BSoptions.STR_PACKS+" to all of the players, please wait...**\n\n";

		par.battleChannel.sendMessage(BPS);
		setTimeout(par.backpackFinish.bind(par),par.BSoptions.backpackTime*1000);
		
		},function(){});
	}

	backpackFinish()
	{
		var BS = "";
		
		console.log("backpackFinish()");
		
		this.thePlayer.playLocalForced(this.BSoptions.SND_BACKPACKS,0.5);
		
		for (var l=0; l<this.battlePlayers.length; l++)
		{
			var theWep = this.randomFrom(this.BSoptions.weapons.length);
			this.battlePlayers[l].weapon = theWep;
			
			BS += this.bot.findEmoji(this.battleGuild,this.BSoptions.weapons[theWep].icon)+" A **"+this.BSoptions.weapons[theWep].name+"** was given to **"+this.battlePlayers[l].user.username+"**!\n";
		}

		this.battleChannel.sendMessage(BS);
		setTimeout(this.spawnCube.bind(this),1000);
		
		console.log("backpackFinishEnd()");
	}
		
	// -- SPAWN A CUBE WHICH THEN SPAWNS A MONSTER --
	spawnCube()
	{
		this.battleState = this.BSoptions.BS_SPAWNING;
		
		var par = this;
		
		console.log("spawnCub()");
		
		this.battleChannel.sendFile(this.BSoptions.monsterURL+this.BSoptions.spawnImage).then(function(){
			// console.log("Sent cube image");
			// par.battleChannel.sendMessage("**A "+par.BSoptions.STR_CUBELONG+" appears out of nowhere...**");
			setTimeout((function(){par.spawnMonster();}).bind(par),par.BSoptions.spawnTime*1000);
			par.thePlayer.playLocalForced(par.BSoptions.SND_CUBESPAWN,0.5);
		},function(){});
		
		console.log("spawnCubEnd()");
	}

	// -- SPAWN A MONSTER --
	spawnMonster()
	{
		this.currentMonster = this.randomFrom(this.BSoptions.monsters.length);
		this.currentMonsterHealth = this.BSoptions.monsters[this.currentMonster].health;
		this.thePlayer.playLocalForced(this.BSoptions.monsters[this.currentMonster].soundsight[this.randomFrom(this.BSoptions.monsters[this.currentMonster].soundsight.length)]+".wav",1.0);
		
		console.log("SpawnMonster()");
		
		// battleChannel.sendFile(monsterURL+this.BSoptions.monsters[currentMonster].sightsprite+".png").then(picd => firstPlayerTurnPre(picd));
		var par = this;
		par.battleChannel.sendFile(this.BSoptions.monsterURL+this.BSoptions.monsters[this.currentMonster].sightsprite+".png").then(function(thepic) {
			par.statusPic = thepic;
			par.battleChannel.sendMessage("**A "+par.BSoptions.monsters[par.currentMonster].name.toUpperCase()+" APPEARED FROM THE "+par.BSoptions.STR_CUBE+"!**\nIt has **"+par.currentMonsterHealth.toString()+" health and is worth "+par.BSoptions.monsters[par.currentMonster].XP.toString()+" XP**!").then((function(msgd){
			this.statusMessage = msgd;
			
			var FNC = (function(){this.playerTurn();}).bind(this);
			FNC();
				
			}).bind(par),function(msgd){});
		},function(thepic){});
	}

	// -- LET THE PLAYERS TAKE A TURN --
	playerTurn()
	{
		console.log("playerTurn");
		var everyoneDead = true;
		for (var l=0; l<this.battlePlayers.length; l++){this.battlePlayers[l].dodging=false; this.battlePlayers[l].action=this.BSoptions.ACT_NONE; if (this.battlePlayers[l].health > 0){everyoneDead = false;}}
		
		if (!everyoneDead)
		{
			this.battleState = this.BSoptions.BS_PLAYERTURN;
			var ME = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_TURNP);
			this.statusContent = this.statusMessage.content+"\n\n"+ME+" *It is now the players' turn to make a move.*\n**Possible actions:** `!attack, !dodge, !search, !suicide`\n\n";
			this.statusMessage.edit(this.statusContent+this.printBattleLobby(false));
		}
		else
		{
			var GB = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_ALLDIED);
			this.battleChannel.sendMessage(GB+" **YOU ALL DIED, THE BATTLE HAS ENDED.** "+GB+"\n\n"+this.printBattleLobby()+"\n\n"+this.printBattleXP());
			this.endFight();
		}
	}

	monsterTurn()
	{
		var everyoneDead = true;
		for (var l=0; l<this.battlePlayers.length; l++){this.battlePlayers[l].dodging=false; this.battlePlayers[l].action=this.BSoptions.ACT_NONE; if (this.battlePlayers[l].health > 0){everyoneDead = false;}}
		
		if (!everyoneDead)
		{
			// -- SEE IF THE MONSTER IS DEAD FIRST
			if (this.currentMonsterHealth > 0)
			{
				var ME = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_TURNM);
				this.battleChannel.sendMessage(ME+" *It is the monster's turn. "+this.BSoptions.monsters[this.currentMonster].name+" is thinking...*");
				setTimeout(this.monsterAttack.bind(this),this.BSoptions.attackEndTime*1000);
			}
			else
			{
				var gibbed=false;
				var DS = this.BSoptions.monsters[this.currentMonster].deathsprite;
				if (this.currentMonsterHealth <= this.BSoptions.monsters[this.currentMonster].gibhealth){gibbed=true; DS = this.BSoptions.monsters[this.currentMonster].gibsprite;}

				this.battleChannel.sendFile(this.BSoptions.monsterURL+DS+".png").then( (function() {
					
					var SND = this.BSoptions.monsters[this.currentMonster].sounddeath[this.randomFrom(this.BSoptions.monsters[this.currentMonster].sounddeath.length)]+".wav";
					if (gibbed){SND = this.BSoptions.monsters[this.currentMonster].soundgib[this.randomFrom(this.BSoptions.monsters[this.currentMonster].soundgib.length)]+".wav";}
					
					this.thePlayer.playLocalForced(SND,1.0);
					
					for (var l=0; l<this.battlePlayers.length; l++)
					{
						this.battlePlayers[l].action = this.BSoptions.ACT_NONE;
						if (this.battlePlayers[l].health > 0){this.battlePlayers[l].XP += this.BSoptions.monsters[this.currentMonster].XP;}
					}
				
					this.battleChannel.sendMessage("**"+this.BSoptions.monsters[this.currentMonster].name.toUpperCase()+" WAS DEFEATED IN BATTLE, WELL DONE!**\n\n"+this.printBattleLobby()+"\n\n"+this.printBattleXP());
					
					setTimeout(this.spawnCube.bind(this),2000);
					
				}).bind(this),function(){});
			}
		}
		else
		{
			var GB = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_ALLDIED);
			this.battleChannel.sendMessage(GB+" **YOU ALL DIED, THE BATTLE HAS ENDED.** "+GB+"\n\n"+this.printBattleLobby(false)+"\n\n"+this.printBattleXP());
			this.endFight();
		}
	}
	
	randomRange(themin,themax){return (themin + Math.floor( Math.random() * (themax - themin)));}

	// THE MONSTER ATTACKS
	monsterAttack()
	{
		console.log("monsterAttack");
		
		var img = "";
		var dmg = -1;
		var shouldAttack = true;
		var victim = undefined;
		var missed = false;
		var mon = this.BSoptions.monsters[this.currentMonster];
		var msg = mon.name;
		
		var snd = mon.soundidle[this.randomFrom(mon.soundidle.length)]+".wav";
		var dMin = -1;
		var dMax = -1;
		
		if (Math.random() >= 1.0-this.BSoptions.idleChance){shouldAttack=false;}
		
		if (shouldAttack)
		{
			// First, find a random player and target him
			var finalVictims = [];
			for (var l=0; l<this.battlePlayers.length; l++) {if (this.battlePlayers[l].health > 0){finalVictims.push(this.battlePlayers[l])}}
			victim = finalVictims[this.randomFrom(finalVictims.length)];
			
			// Did we miss?
			if (Math.random() >= 1.0-this.missChance && victim.action == this.BSoptions.ACT_DODGE){missed=true;}
			
			// SHOULD WE USE MELEE OR NOT?
			var useMelee = false;
			
			if (!mon.hasRanged) {useMelee = true;}
			else if (mon.hasMelee && mon.hasRanged)
			{
				if (Math.random() >= 0.5){useMelee = false;}
				else{useMelee = true;}
			}
			
			// Now we know which attack we're going to use, find the damage
			if (useMelee)
			{
				dMin = mon.meleeMin;
				dMax = mon.meleeMax;
				img = mon.meleesprite;
				msg = mon.meleeString;
				snd = mon.soundmelee[this.randomFrom(mon.soundmelee.length)]+".wav";
			}
			else
			{
				dMin = mon.rangedMin;
				dMax = mon.rangedMax;
				img = mon.rangedsprite;
				msg = mon.rangedString;
				snd = mon.soundranged[this.randomFrom(mon.soundranged.length)]+".wav";
			}
			
			dmg = dMin + Math.floor( Math.random() * (dMax - dMin));

			// We know the damage and the player, now let's actually damage it
			if (!missed){victim.health -= dmg;}
		}
		
		this.pendingSound = snd;
		
		// -- DECIDE THE MESSAGE TO USE FOR THIS SITUATION --
		if (shouldAttack)
		{
			msg = msg.replace("PLAYER","**"+victim.user.username+"**");
			if (missed){msg += " but missed because they dodged!";}
			else{msg += " and did **"+dmg.toString()+" damage!**"; }
		}
		else {msg = "decided to roam around and do nothing."; img = mon.idlesprite;}
		
		// Actually send the image
		this.battleChannel.sendFile(this.BSoptions.monsterURL+img+".png").then( (function(picd){
			
			this.statusPic = picd;
			var SM = msg;

			// Obituaries
			SM += "\n"
			
			if (victim != undefined)
			{
				if (victim.health <= 0 && !victim.dead)
				{
					victim.dead = true; 
					SM += "\n**"+victim.user.username+"** was killed in battle!";
					if (victim.health <= -20){this.pendingSound = "DSPDIEHI.wav";}
					else{this.pendingSound = "DSPLDETH.wav";}
				}
			}
			
			if (this.pendingSound != ""){this.thePlayer.playLocalForced(this.pendingSound,1.0);}
			
			this.battleChannel.sendMessage(SM).then((function(themess){
				this.statusMessage = themess;
				setTimeout(this.playerTurn.bind(this),this.BSoptions.attackEndTime*1000);
			}).bind(this),function(themess){});
			
		}).bind(this),function(picd){});
	}

	// -- PLAYER TRIES TO ATTACK
	doAttack()
	{
		console.log("doAttack");
		
		var PAR = this;
		this.statusMessage.delete().then((function(){
		
			console.log("Status message deleted, FE is "+this.bot.findEmoji);
			
			var SM = "";
			var attackUsers = [];
			var searchUsers = [];
			var atString = "";
			var dmgAdd = -1;
			var BP = undefined;
			var snd = "";
			
			console.log("Initial turn stuff");
			
			var emtAtk = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_ATTACK);
			var emtSearch = "";
			var emtDodge = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_DODGE);
			
			for (var l=0; l<this.battlePlayers.length; l++)
			{
				if (this.battlePlayers[l].action == this.BSoptions.ACT_ATTACK){attackUsers.push(this.battlePlayers[l]);}
				else if (this.battlePlayers[l].action == this.BSoptions.ACT_SEARCH){searchUsers.push(this.battlePlayers[l]);}
				else if (this.battlePlayers[l].action == this.BSoptions.ACT_SUICIDE)
				{
					this.battlePlayers[l].health = 0;
					this.battlePlayers[l].dead = true;
					this.battlePlayers[l].header = "pussied out and killed themselves";
					this.battlePlayers[l].sub = "(Good job faggot, you're useless)";
					this.battlePlayers[l].icon = "gibbed";
					snd = "DSPLDETH.wav";
				}
				else if (this.battlePlayers[l].action == this.BSoptions.ACT_DODGE)
				{
					this.battlePlayers[l].icon = "chikkin";
					this.battlePlayers[l].header = "tries to dodge the next attack.";
					this.battlePlayers[l].sub = "";
				}
				else if (this.battlePlayers[l].health <= 0)
				{
					this.battlePlayers[l].icon = "gibbed";
					this.battlePlayers[l].header = "rots away as a corpse";
					this.battlePlayers[l].sub = "";
				}
			}
			
			console.log("Attack users");
			console.log(attackUsers);
			
			// So now we conveniently know which players are attacking and searching, start with attack users
			for (var l=0; l<attackUsers.length; l++)
			{
				BP = attackUsers[l];
				atString = this.BSoptions.weapons[BP.weapon].message.replace("MONSTER",this.BSoptions.monsters[this.currentMonster].name);
				dmgAdd = this.randomRange(this.BSoptions.weapons[BP.weapon].damageMin,this.BSoptions.weapons[BP.weapon].damageMax);
				this.currentMonsterHealth -= dmgAdd;
				
				BP.header = atString;
				BP.sub = "The attack did "+dmgAdd.toString()+" damage!";
				BP.icon = this.BSoptions.weapons[BP.weapon].icon;

				snd = this.BSoptions.weapons[BP.weapon].sound+".wav";
			}
			
			console.log("Search users");
			
			// Next, we go through the search users
			for (var l=0; l<searchUsers.length; l++)
			{
				emtSearch = this.bot.findEmoji(this.battleGuild,this.BSoptions.EMT_SEARCH);
				var foundWep = false;
				var lowerWep = false;
				
				searchUsers[l].header = "searched around and...";
				searchUsers[l].icon = this.BSoptions.EMT_SEARCH;
				
				if (Math.random() >= 1.0-this.BSoptions.findChance) 
				{
					var fName = "";
					
					// -- WE FOUND SOMETHING, BUT DID WE FIND A WEAPON?
					if (Math.random() >= 1.0-this.BSoptions.wepChance)
					{
						foundWep = true;
						var WN = this.randomFrom(this.BSoptions.weapons.length);
						var fWep = this.BSoptions.weapons[WN];
						fName = fWep.name;
						
						searchUsers[l].icon = fWep.icon;
						
						// IS THIS WEAPON LOWER THAN THE ONE WE HAVE?
						if (WN < searchUsers[l].weapon){lowerWep = true;}
						else{searchUsers[l].weapon = WN;}
					}
					
					// -- WE DIDN'T FIND A WEAPON, DON'T WORRY ABOUT IT
					else
					{
						var findItem = this.randomFrom(this.BSoptions.items.length);
						fName = this.BSoptions.items[findItem].name;
						
						searchUsers[l].icon = this.BSoptions.items[findItem].icon;

						var HA = this.BSoptions.items[findItem].health;
						if (searchUsers[l].health+HA > 100){if (!this.BSoptions.items[findItem].special){HA = searchUsers[l].health-100; if (HA<=0){HA=0;}}}

						searchUsers[l].health += HA;
					}
					
					searchUsers[l].sub = "found a "+fName;
					
					if (!foundWep){searchUsers[l].sub += "! +"+this.BSoptions.items[findItem].health.toString()+" HP";}
					else
					{
						if (lowerWep){searchUsers[l].sub += ", useless.";}
						else{searchUsers[l].sub += "!";}
					}
				}
				else{searchUsers[l].sub = "they didn't find anything.";}
			}
			
			console.log("Setting pending sound");

			this.pendingSound = snd;
			
			console.log("Drawing turn message...");
			this.drawTurnMessage();
			
		}).bind(PAR),function(){});
	
	};
}

module.exports = BattleSimulator;