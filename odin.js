//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// -- ODIN THE OVERSEER
// Coded by Zedek the Plague Doctor specifically for VGP
//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

var Discord = require("discord.js");
var bot = new Discord.Client();
var mainServer = "Valhalla Game Plays";
var mainVoice = "DOOM BATTLE";
var mainGuild = undefined;
var voiceConnect = undefined;
var voiceDis = undefined;
var PlayerFile = require("./player.js");
var thePlayer = new PlayerFile();
var options = thePlayer.options;
var musicChannel = undefined;					// Music info channel

const streamOptions = {seek: 0, volume: 0.5};

// First, let's log in
bot.login("noirsuccubus@yahoo.com","homebrew").then(function(token){}).catch(function(err){console.log(err);})

//---------------------------------------------------------------------
//-- DISCORD RPG SIMULATOR --
// Big-ass fucking RPG simulator

var RPG = require('./rpgmode/RPGModeCore.js');
var RPGMode = new RPG();
var RPGenabled = true;
var RPGLocalTest = false;

//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// -- THINGS FOR VOICE CHAT --

//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// -- ALL THE POSSIBLE COMMANDS THAT THE BOT CAN DO --

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

var commands = [

	// -- PING COMMAND, PRINTS PONG
	{
		display:"!ping",id:"!ping",description:"Prints a simple pong message back to the user.",process:function(message){
			message.reply("pong");
		}
	},
	
	// -- SOUND COMMAND
	{
		display:"!snd",id:"!snd",description:"Plays a sound in the sounds folder.",process:function(message){
			var A = message.content.slice(message.content.indexOf("!snd")+5,message.content.length);
			message.reply("Playing **"+A+".wav** in voice chat");
			playSoundClip(A+".wav",1.0);
		}
	},
	
	// -- ADD YOUTUBE VID
	{
		display:"!yt",id:"!yt",description:"Plays a youtube video.",process:function(message){
			var A = message.content.slice(message.content.indexOf("!yt")+4,message.content.length);
			thePlayer.addTrack(A,message.channel);
		}
	},
	
	// -- CHANGES THE VOLUME
	{
		display:"!v",id:"!v",description:"Sets the volume of the music.",process:function(message){
			var A = parseFloat( message.content.slice(message.content.indexOf("!v")+3,message.content.length) );
			thePlayer.setVolume(A,message);
		}
	},
	
	// -- ADD A PLAYLIST
	{
		display:"!instant",id:"!instant",description:"Shows all of the available playlists.",process:function(message){
			// var A = message.content.slice(message.content.indexOf("!instant")+9,message.content.length);
			// thePlayer.addPlaylist(A,message);
			
			message.reply("\n**Here are the playlists that you can choose from:**\n\n"+thePlayer.printPlaylists()+"\n**Type the ID with a ! in front to play it.**");
		}
	},
	
	// -- SKIP VID
	{
		display:"!skip",id:"!skip",description:"Skips a youtube video.",process:function(message){
			thePlayer.skipTrack();
		}
	},
	
	// -- TERMINATE PLAYLIST
	{
		display:"!terminate",id:"!terminate",description:"Stops the current playlist automatically.",process:function(message){
			thePlayer.terminatePlaylist(message);
		}
	},
	
	// -- PLAYLIST COMMAND, SHOWS THE PLAYLIST
	{
		display:"!plist",id:"!plist",description:"Shows the video playlist.",process:function(message){
			message.reply("\n**Here is the current video playlist:**\n\n"+thePlayer.getTrackList());
		}
	},
	
	// -- CUCK COMMAND FOR THE FUN OF IT
	{
		display:"!cuck X",id:"!cuck",description:"Cuck another user.",process:function(message){
			var msg = message.content.toLowerCase();
			var RS = msg.slice(msg.indexOf("!cuck") + 6,msg.length);
			
			// -- FIND THE USER IN THE CHANNEL WITH THIS NAME
			var CM = message.channel.members.array();
			var USR = undefined;
			for (var l=0; l<CM.length; l++)
			{
				if (CM[l].user.username.toLowerCase().indexOf(RS) != -1) {USR = CM[l].user; break;}
			}
			
			if (USR == undefined){message.reply("You cucked nobody.");}
			else {message.channel.sendMessage(CM[l].toString()+" has been **CUCKED** by "+message.author.toString()+".")}
		}
	}
];

//---------------------------------------------------------------------
//-- DISCORD BATTLE SIMULATOR --
// RPG-ish battle sim for Discord, uses external files

var PlayerFile = require('./player.js');
var thePlayer = new PlayerFile();

var BS = require('./BattleSim');
var BattleSim = new BS.BattleSimulator();
var BSOptions = BattleSim.getOptions();
BattleSim.setPlayer(thePlayer);

//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// -- VARIOUS STRINGS AND THINGS --

var welcomeStrings = [
	"Welcome to VGP, USER.",
	"Hey, USER. Welcome to the hell of VGP, don't mess anything up.",
	"Hello hello, USER. Welcome to VGP.",
	"Welcome to the official VGP discord, USER."
];

var leaveStrings = [
	"Are you sure you want to quit this great channel, USER?",
	"Please don't leave USER, there's more demons to toast!",
	"Let's beat it USER, this is turning into a bloodbath!",
	"I wouldn't leave if I were you USER, DOS is much worse.",
	"USER, you're trying to say you like DOS better than me, right?",
	"Don't leave yet USER, there's a demon around that corner!",
	"You know USER, next time you come in here I'm gonna toast ya.",
	"Go ahead and leave USER, see if I care.",
	"You want to quit, USER? Then, thou hast lost an eighth!",
	"Don't go now USER, there's a dimensional shambler waiting at the DOS prompt!",
	"Get outta here and go back to your boring programs, USER.",
	"If I were your boss USER, I'd deathmatch ya in a minute!",
	"Ok, USER. You leave now and you forfeit your body count!",
	"Just leave, USER. When you come back, I'll be waiting with a bat.",
	"You're lucky I don't smack you for thinking about leaving, USER."
];

//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

function randomFrom(thelength) {
    return Math.floor(Math.random() * thelength);
}

function findEmoji(theguild, eid) {
    return theguild.emojis.find("name", eid.toString());
}

function playSoundClip(clip, vol) {
	var SO = {seek:0, volume:vol};
    var theC = bot.voiceConnections.first();
	if (theC != undefined) {voiceDis = theC.playFile("./sounds/"+clip, SO); voiceDis.setVolume(vol);};
}

function randomRange(themin,themax){return (themin + Math.floor( Math.random() * (themax - themin)));}

var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

function toRegional(tt)
{
	var STR = tt.toLowerCase();
	var cnt = 0;
	var fSTR = "";
	var inAlphabet = false;
	
	while (cnt < STR.length)
	{
		inAlphabet = false;
		for (var l=0; l<alphabet.length; l++)
		{
			if (STR.charAt(cnt) == alphabet[l]) {inAlphabet = true; fSTR += ":regional_indicator_"+alphabet[l]+":"; break;}
		}
		
		if (!inAlphabet) 
		{
			if (STR.charAt(cnt) == " "){fSTR += "    ";}
			else{fSTR += STR.charAt(cnt);}
		}
		cnt ++;
	}
	
	return fSTR;
}

//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

// Bot is ready!
bot.on("ready", function(){
	console.log("BOT IS READY TO GO!");
	mainGuild = bot.guilds.find("name",mainServer);
	console.log("Main guild is "+mainGuild.name+".");
	joinVoiceChat();
})

function joinVoiceChat() {
	var AR = mainGuild.channels.array();
	var VC = undefined;
	
	for (var l=0; l<AR.length; l++)
	{
		if (AR[l].type == "voice" && AR[l].name == mainVoice){VC = AR[l]; break;}
	}
	
	musicChannel = mainGuild.channels.find("name", "musicinfo");

	// Be sure to catch the connect error
    VC.join().then(connection => {
		voiceConnect = connection; 
		console.log("Connected to voice!");
		voiceConnect.on("error",function(error){console.log(error)});
		thePlayer.initialize(mainGuild,connection);
	}).catch(console.log);
}

// -- A NEW USER JOINED
/*
bot.on("presenceUpdate", function (OU, NU) {
	var VGP = bot.guilds.find("name", "Valhalla Game Plays");
    var chn = VGP.defaultChannel;
	var GM = VGP.members.array();
	var inServer = false;
	
	for (var l=0; l<GM.length; l++){if (GM[l].user == NU) {inServer = true; break;}}

    if (chn != undefined && inServer) 
	{
		if (OU.status === "offline" && NU.status === "online" && OU.game == null && NU.game == null) 
		{
			var men = NU.username;
			var IE = findEmoji(VGP,"imp");

			var PN = Math.floor(Math.random() * welcomeStrings.length);
			var S = welcomeStrings[PN].replace("USER", "`"+men+"`");
			
			chn.sendMessage(IE+" "+S);
		}
		
		else if (OU.status === "online" && NU.status === "offline" && NU.game == null) 
		{
			var DE = findEmoji(VGP,"deadzimba");
			var S = leaveStrings[randomFrom(leaveStrings.length)].replace("USER", "`"+NU.username+"`");
			chn.sendMessage(DE+" "+S);
		}
    }
});
*/

bot.on("message",function(message){
	var msg = message.content.toLowerCase();
	
	if (message.author == bot.user) {return;}
	
	BattleSim.checkCommands(message);
	
	if (RPGenabled) {RPGMode.parseCommands(message);}
	if (RPGLocalTest) {return;}
	
	// Never reply to our own commands
	if (message.author == bot.user) {return;}
	if (message.channel.guild.name != mainServer) {return;}
	
	// GET HELP
	if (msg.indexOf("!help") != -1)
	{
		var HS = "\n**Here are all of the commands:**\n\n";
		
		for (var l=0; l<commands.length; l++){HS += "`"+commands[l].display+"` - *"+commands[l].description+"*\n";}
		
		message.reply(HS);
		
		return;
	}
	
	// Otherwise check the normal commands
	for (var l=0; l<commands.length; l++) { if (msg.indexOf(commands[l].id) != -1) {commands[l].process(message); return;} }
	// Check if we can play a playlist
	thePlayer.checkForPlaylist(message);
})

function getMC(){return musicChannel;}

// Set the status
function setStatus(newStatus){bot.user.setStatus("online",newStatus,"");}
// Assigns a random status ex. (Playing with her tits)
function swapStatus(){bot.user.setStatus("online", "Idling");}

function findEmoji(theguild, eid) {
    return theguild.emojis.find("name", eid.toString());
}

function toRegional(text) 
{
	var TR = text.replace(/[a-zA-Z]/g, ':regional_indicator_$&:'.toLowerCase());
	TR = TR.replace(/ /g, ":large_blue_diamond:");
	TR = TR.replace(/\?/g, ":question:");
	
	// -- NUMBERS
	TR = TR.replace(/1/g, ":one:");
	TR = TR.replace(/2/g, ":two:");
	TR = TR.replace(/3/g, ":three:");
	TR = TR.replace(/4/g, ":four:");
	TR = TR.replace(/5/g, ":five:");
	TR = TR.replace(/6/g, ":six:");
	TR = TR.replace(/7/g, ":seven:");
	TR = TR.replace(/8/g, ":eight:");
	TR = TR.replace(/9/g, ":nine:");
	
	return TR.toLowerCase();
}

module.exports.player = thePlayer;
module.exports.findEmoji = findEmoji;
module.exports.toRegional = toRegional;
module.exports.getMC = getMC;
module.exports.bot = bot;
module.exports.setStatus = setStatus;