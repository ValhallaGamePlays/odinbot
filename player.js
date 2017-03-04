// -- VOICE PLAYER AND SHIT, GOOD FOR PLAYING AND OTHER JUNK --
//--====================================================================--

// const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
const YoutubeParser = require('youtube-parser');
const Request = require('request');
const cheerio = require('cheerio');
const playlists = require('./playlists.js');
const radio = require("radio-stream");
const botParent = require('./odin.js');
const util = require('util')

// const NPemote = {text:":cd:",lookup:false}
const NPemote = {text:"wl4disc",lookup:true}

class ThePlayer {
	
	constructor() 
	{
		this.defaultVolume = 0.5;
		this.playVolume = this.defaultVolume;
		this.playlist = [];
		this.isPlaying = false;
		this.isStreaming = false;
		this.targetChannel = undefined;
		
		this.retryCounter = 0;
		
		// -- Variables for voice connection
		this.voiceConnection = undefined;
		this.voiceStream = undefined;
	}
	
	inPlaylist() {return this.isPlaying;}
	
	findEmoji(theguild, eid) {return theguild.emojis.find("name", eid.toString());}	
	
	// -- Initializes the bot and sets the channel to send shit to
	initialize(guild,connection)
	{
		this.targetChannel = guild.defaultChannel;
		this.voiceConnection = connection;
		this.voiceConnection.on("error", function (err) {console.log("ERROR WITH STREAM: "+err);});
		console.log("**VOICE CONNECTION INITIALIZED**");
	}
	
	// -- PLAY A YOUTUBE VIDEO --
	playYoutube(TS)
	{
		this.voiceStream = this.voiceConnection.playStream( TS, {seek:0,volume:this.playVolume} );
				
		// -- FIND THE EMOTE
		var emt = NPemote.text;
		if (NPemote.lookup){emt = this.findEmoji(this.targetChannel.guild,NPemote.text);}
		
		if (botParent.getMC() != undefined){botParent.getMC().sendMessage(emt+" **Now playing:** *"+this.playlist[0].title+"*. `"+this.playlist[0].url+"`");}
		
		this.voiceStream.on("end",(function(){
			console.log("Stream ended!");
			this.playlist.shift();
			if (this.playlist.length > 0){this.playlistPlay();}
			else{this.targetChannel.sendMessage("The playlist has ended."); this.isPlaying = false; botParent.swapStatus();}
		}).bind(this));
	}
	
	// -- FORCEFULLY PLAY A LOCAL SOUND
	playLocalForced(sound,vol)
	{
		if (this.playlist.length <= 0){this.voiceStream = this.voiceConnection.playFile( "./sounds/"+sound, {seek:0,volume:vol} );}
	}
	
	// -- PLAY A LOCAL TRACK --
	playLocal()
	{
		this.voiceStream = this.voiceConnection.playFile( "./sounds/music/"+this.playlist[0].url, {seek:0,volume:this.playVolume} );
				
		// -- FIND THE EMOTE
		var emt = NPemote.text;
		if (NPemote.lookup){emt = this.findEmoji(this.targetChannel.guild,NPemote.text);}
		
		if (botParent.getMC() != undefined){botParent.getMC().sendMessage(emt+" **Now playing:** *"+this.playlist[0].title+"*. `"+this.playlist[0].url+"`");}
		
		this.voiceStream.on("end",(function(){
			console.log("Stream ended!");
			this.playlist.shift();
			if (this.playlist.length > 0){this.playlistPlay();}
			else{this.targetChannel.sendMessage("The playlist has ended."); this.isPlaying = false; botParent.swapStatus();}
		}).bind(this));
	}
	
	// -- PLAYS THE APPROPRIATE PLAYLIST TRACK --
	playlistPlay()
	{
		if (this.playlist[0] == undefined){console.log("Playlist 0 was undefined!"); return;}
		console.log("PlaylistPlay() "+this.playlist[0].url+", length is "+this.playlist.length.toString()+".");
		
		if (this.playlist[0].title != undefined){botParent.setStatus(this.playlist[0].title);}
		else {botParent.swapStatus();}
		
		if (this.playlist[0].url != undefined)
		{
			var parpar = this;
			var par = this;
			
			// -- NOT LOCAL, PLAY A YOUTUBE VIDEO --
			if (!this.playlist[0].local)
			{
				var thestream = ytdl(this.playlist[0].url, {filter: 'audioonly'}, this.targetChannel);
							
				var TS = thestream;
				thestream.on("error",function(error){
					if (error.toString().indexOf("Code 150") != -1){parpar.targetChannel.sendMessage(":x: **parpar video is fucking censored, wow:** `"+parpar.playlist[0].title+"`");}
					else {parpar.targetChannel.sendMessage("There was an error with the video, oh no\n```"+error+"```"); console.log(error);}
					
					parpar.playlist.shift();
					if (parpar.playlist.length > 0){parpar.playlistPlay();}
					else{parpar.targetChannel.sendMessage("The playlist has ended."); parpar.isPlaying = false; botParent.swapStatus();}
				}.bind(par));
				
				thestream.on("response",(function(){
					if (TS != undefined)
					{
						console.log("RESPONSE YO!");
						parpar.playYoutube(TS);
					}
				}).bind(par));
			}
			
			// -- LOCAL, PLAY A SOUND CLIP --
			else
				parpar.playLocal();
		}
		else{this.targetChannel.sendMessage("URL was undefined."); this.isPlaying = false; this.playlist.length = 0;}
	}
	
	// -- DO WE WANT TO PLAY A PLAYLIST?
	checkForPlaylist(message)
	{
		for (var l=0; l<playlists.length; l++) 
		{ 
			if (message.content.toLowerCase().indexOf("!"+playlists[l].id) != -1) 
			{
				message.reply("*Now playing the playlist* `"+playlists[l].id+"`*, one moment...*");
				this.addPlaylist(playlists[l].id,message);
			} 
		}
	}
	
	// -- RETURNS A STRING WITH ALL OF THE AVAILABLE PLAYLISTS
	printPlaylists()
	{
		var PLS = "";
		for (var l=0; l<playlists.length; l++) { PLS += "`"+l.toString()+"` **"+playlists[l].id+"** - *"+playlists[l].desc+"*\n"; }
		return PLS;
	}
	
	// -- SHUFFLE FUNCTIONS --
	shuffle(inn) 
	{
		var out = [];
		while (inn.length > 0) {out.push(inn.splice(Math.floor(Math.random() * inn.length), 1)[0]);}
		return out;
	}
	
	// -- PAUSE THE SONG --
	pauseSong(message)
	{
		if (this.voiceStream != undefined)
		{
			message.reply("**Paused.** - Use `!resume` to resume.");
			this.voiceStream.pause();
		}
		else
			message.reply("**You can't pause without anything playing!**");
	}
	
	// -- RESUME SONG --
	resumeSong(message)
	{
		if (this.voiceStream != undefined)
		{
			message.reply("**Resumed.**");
			this.voiceStream.resume();
		}
		else
			message.reply("**You can't resume without anything playing!**");
	}
	
	safeShuffle(inn) {return this.shuffle(inn.slice(0));}
	
	shuffleWithoutFirst(inn)
	{
		var safe = inn.slice(0);
		var firsty = safe[0];
		var spliced = this.safeShuffle( safe.splice(1,safe.length-1) );
		
		spliced.unshift(firsty);
		
		return spliced;
	}
	
	// -- SHUFFLES THE PLAYLIST WHILE IT'S PLAYING
	shufflePlaylist(message)
	{
		// Make sure we're in a playlist
		if (!this.isPlaying){message.reply("You have to be in a playlist to shuffle it."); return;}
		
		this.playlist = this.shuffleWithoutFirst(this.playlist);
		message.reply("**Playlist has been shuffled.**");
	}
	
	// -- TERMINATES THE WHOLE PLAYLIST --
	terminatePlaylist(message)
	{
		// Make sure we're in a playlist
		if (!this.isPlaying){message.reply("You have to be in a playlist to shuffle it."); return;}
		
		this.playlist.length = 0;
		this.isPlaying = false;
		
		if (this.voiceStream != undefined){this.voiceStream.end();}
		
		message.reply("**Terminated the playlist.**");
		botParent.swapStatus();
	}
	
	// -- SKIPS A TRACK IN THE PLAYLIST --
	skipTrack()
	{
		if (this.voiceStream != undefined)
		{
			if (this.isStreaming)
			{
				this.isStreaming = false;
				this.voiceStream.end();
				
				if (this.targetChannel != undefined){this.targetChannel.sendMessage("Ended the stream.");}
				return;
			}
		
			if (this.playlist.length > 1){this.targetChannel.sendMessage("Playing next video.");}
			this.voiceStream.end();
		}
	}
	
	// -- CHANGES THE VOLUME OF THE MUSIC
	setVolume(vol,message)
	{
		if (this.voiceStream == undefined){message.reply("Be patient, wait for something to start playing"); return;}
		
		if (!this.isPlaying && !this.isStreaming){message.reply("No music is playing right now."); return;}
		
		this.targetChannel = message.channel;
		this.voiceStream.setVolume(vol);
		this.playVolume = vol;
		message.reply("Volume set to **"+(vol*100).toString()+"%**.");
	}
	
	// -- STARTS STREAMING FROM A CERTAIN URL
	startStreaming(streamurl,message)
	{
		this.isStreaming = true;
		this.targetChannel = message.channel;
		this.voiceStream = this.voiceConnection.playStream( streamurl, {seek:0,volume:this.playVolume} );
	}
	
	// -- ADDS A PREMADE ARRAY OF TRACKS TO THE PLAYLIST 
	addPlaylist(id,message)
	{
		this.targetChannel = message.channel;
		
		if (this.isStreaming)
		{
			message.reply("You can't add playlists while a stream is playing!");
			return;
		}
		
		// -- FIND THE ACTUAL PLAYLIST WE'RE GOING TO USE --
		var PLN = -1;
		for (var l=0; l<playlists.length; l++){if (playlists[l].id == id){PLN = l; break;}}
		if (PLN == -1){message.reply("That playlist didn't exist."); return;}
		
		var TA = this.safeShuffle(playlists[PLN].tracks);
		
		if (this.isPlaying){message.reply("A playlist is already going, hold up");}
		else
		{
			// Push all of the tracks
			for (var l=0; l<TA.length; l++){this.playlist.push(TA[l]);}
			this.playlistPlay();
			this.isPlaying = true;
		}
	}
	
	// -- ADD A TRACK TO THE PLAYLIST --
	addTrack(URL,channel,resetit)
	{
		var that = this;
		this.targetChannel = channel;
		
		if (this.isStreaming)
		{
			channel.sendMessage("You can't add tracks when you're streaming!");
			return;
		}
		
		if (URL.indexOf("://") == -1) {URL = "http://www.youtube.com/watch?v=" + URL;}
		
		Request(URL, function (error, response, body) 
		{
			var tit = "";
			if (!error && response.statusCode == 200) 
			{
				var $ = cheerio.load(body);
				tit = $("title").text();
				console.log("TIT IS "+tit);
				tit = tit.replace(" - YouTube","");
			}
			
			if (!resetit)
			{
				if (that.playlist.length > 0){that.targetChannel.sendMessage("Added video **"+tit+"**.");}
				that.playlist.push( {url:URL,title:tit} );
			}
			else
			{
				that.playlist.length = 0;
				that.playlist.push( {url:URL,title:tit} );
				that.isPlaying = false;
				if (this.voiceStream != undefined){this.voiceStream.end();}
			}
			
			console.log("Playing the actual vid");
			
			if (!that.isPlaying)
			{
				that.playlistPlay();
				that.isPlaying = true;
			}
		})
	}
	
	// -- RECEIVE A LIST OF ALL THE TRACKS
	getTrackList()
	{
		var TL = ":cd: ";
		var clampString = "";
		
		var LN = this.playlist.length;
		if (this.playlist.length >= 15){LN = 15; clampString="\n*(Showing next 15 songs only)*"}
		
		for (var l=0; l<LN; l++){TL += "• `"+(l+1).toString()+"` "+this.playlist[l].title+"\n";}
		
		return "\n**Here is the current video playlist:**"+clampString+"\n\n"+TL;
	}
}

module.exports = ThePlayer;