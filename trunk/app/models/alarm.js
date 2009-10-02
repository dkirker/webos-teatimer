/******************************************************************************
 * 
 * Copyright (C) 2009 by Richard Ferguson <fergus420@gmail.com>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 *****************************************************************************/

function CalescoAlarm(scene, id) {
		this.sceneController = scene;
		this.elementId = id;
		
		this.mediaConnected = 0;
		this.stopPlaying = 1;
		this.isPlaying = 0;
		
		var el = this.sceneController.get(this.elementId);
		this.audioObject = AudioTag.extendElement(el);
		
		this.mediaConnectHandler = this.mediaConnect.bind(this);
		this.mediaDisconnectHandler = this.mediaDisconnect.bind(this);

		this.audioObject.addEventListener(Media.Event.X_PALM_CONNECT, this.mediaConnectHandler);
		this.audioObject.addEventListener(Media.Event.X_PALM_DISCONNECT, this.mediaDisconnectHandler);
		this.audioObject.addEventListener(Media.Event.X_PALM_WATCHDOG , this.mediaDisconnectHandler);
};
	
CalescoAlarm.prototype.cleanup = function() {
		Mojo.Log.info("Alarm.cleanup");
		// stop audio if playing
		this.stop();
		
		// remove event listeners	
		this.audioObject.removeEventListener(Media.Event.X_PALM_CONNECT, this.mediaConnectHandler);
		this.audioObject.removeEventListener(Media.Event.X_PALM_DISCONNECT, this.mediaDisconnectHandler);
		this.audioObject.removeEventListener(Media.Event.X_PALM_WATCHDOG , this.mediaDisconnectHandler);
		
		// dereference
		this.audioObject = 0;
};
	
CalescoAlarm.prototype.mediaConnect = function(event) {
		Mojo.Log.info("Alarm.mediaConnect:");
		// media connected to server
		this.audioObject.palm.audioClass = Media.AudioClass.ALERT;
		this.mediaConnected = 1;
};
	
CalescoAlarm.prototype.mediaDisconnect = function(event) {
		Mojo.Log.warn("Alarm.mediaDisconnect:");
		
		// reset and reallocate audio object
		this.mediaConnected = 0;
		this.stopPlaying = 1;
		this.isPlaying = 0;
		
		// remove event listeners (Do I need this?)
		this.audioObject.removeEventListener(Media.Event.X_PALM_CONNECT, this.mediaConnectHandler);
		this.audioObject.removeEventListener(Media.Event.X_PALM_DISCONNECT, this.mediaDisconnectHandler);
		this.audioObject.removeEventListener(Media.Event.X_PALM_WATCHDOG , this.mediaDisconnectHandler);
		
		// remove element from dom
		var dom = this.sceneController.stageController.document;
		var el = this.sceneController.get(this.elementId);
		var par = el.parentNode;
		par.removeChild(el);
		
		// create new div element
		var div = dom.createElement('div');
		div.setAttribute('id',this.elementId);
		div.setAttribute('autoplay',false);
		par.appendChild(div);
		
		// setup audio object
		this.audioObject = AudioTag.extendElement(div);
		this.audioObject.addEventListener(Media.Event.X_PALM_CONNECT, this.mediaConnectHandler);
		this.audioObject.addEventListener(Media.Event.X_PALM_DISCONNECT, this.mediaDisconnectHandler);
		this.audioObject.addEventListener(Media.Event.X_PALM_WATCHDOG , this.mediaDisconnectHandler);
		
		appController = Mojo.Controller.getAppController();
		bannerParams = {
			messageText: "Media Disconnect",
			icon: "../images/icon_32x32.png"
		};
		appController.showBanner(bannerParams, {}, "timer");
};
	
CalescoAlarm.prototype.play = function() {
		Mojo.Log.info("Alarm.play:");
		if (Calesco.alarmVibrate) {
			this.vibrate();
		}
		
		if (!this.mediaConnected) {
			Mojo.Log.warn("Alarm.play: media is not connected!");
			return -1;
		}
		
		this.audioEndedHandler = this.audioEnded.bind(this);
		this.audioObject.addEventListener(Media.Event.ENDED, this.audioEndedHandler);
		
		if (Calesco.alarmRepeat) {
			this.repeatCount = Calesco.alarmRepeatCount - 1;
		}
			
		this.isPlaying = 1;
		this.stopPlaying = 0;
		
		this.audioObject.src = Calesco.alarmSoundPath;
		this.audioObject.play();
		
		return 0;
};
	
CalescoAlarm.prototype.stop = function() {
		Mojo.Log.info("Alarm.stop:");
		this.stopPlaying = 1;
		
		if (this.isPlaying) {
			try {
				this.audioObject.pause();
			} catch (e) {
				Mojo.Log.error("Alarm.stop: Error pausing: %j", e);
			}
		}
};
	
CalescoAlarm.prototype.audioEnded = function(event) {
		this.isPlaying = 0;
		
		if (Calesco.alarmRepeat && this.repeatCount && !this.stopPlaying) {
			this.sceneController.window.setTimeout(this.repeatAudio.bind(this), 1000 * Calesco.alarmRepeatDelay);
			this.repeatCount--;
		} else {
			// clean up
			this.audioObject.removeEventListener(Media.Event.ENDED, this.audioEndedHandler);
		}
};
	
CalescoAlarm.prototype.repeatAudio = function() {
		if (!this.stopPlaying) {
			if (Calesco.alarmVibrate) {
				this.vibrate();
			}
			
			this.isPlaying = 1;
			this.audioObject.play();
		}
};
	
CalescoAlarm.prototype.vibrate = function() {
		Mojo.Controller.getAppController().playSoundNotification("vibrate", "");
};
