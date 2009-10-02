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

function PreferencesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

PreferencesAssistant.prototype.handleTimerAutostart = function(event) {
	Calesco.timerAutostart = this.timerAutostartModel.value;
};

PreferencesAssistant.prototype.handleTeaTempUnit = function(event) {
	Calesco.teaTempUnit = this.teaTempUnitModel.value;
};

PreferencesAssistant.prototype.selectAlarmSound = function(result) {
	//Mojo.Log.info("selectAlarmSound: %j", result);
	
	lidx = result.fullPath.lastIndexOf("/");
	Calesco.alarmSoundName = result.fullPath.slice(lidx+1);
	Calesco.alarmSoundPath = result.fullPath;
	
	this.controller.get("alarmSoundName").innerHTML = Calesco.alarmSoundName;
};

PreferencesAssistant.prototype.handleAlarmSound = function(event) {
	Mojo.FilePicker.pickFile(
	{
		kinds: ["audio"],
		onSelect: this.selectAlarmSound.bind(this)
	}, this.controller.stageController);
};

PreferencesAssistant.prototype.handleAlarmVibrate = function (event) {
	Calesco.alarmVibrate = this.alarmVibrateModel.value;
};

PreferencesAssistant.prototype.handleAlarmRepeat = function (event) {
	Calesco.alarmRepeat = this.alarmRepeatModel.value;
};

PreferencesAssistant.prototype.handleAlarmRepeatCount = function (event) {
	Calesco.alarmRepeatCount = this.alarmRepeatCountModel.value;
};

PreferencesAssistant.prototype.handleAlarmRepeatDelay = function (event) {
	Calesco.alarmRepeatDelay = this.alarmRepeatDelayModel.value;
};

PreferencesAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch(event.command){
			case "do-Defaults":
				Calesco.Prefs.setDefaults();
				Calesco.Prefs.store();
				
				this.teaTempUnitModel.value = Calesco.teaTempUnit;
				this.timerAutostartModel.value = Calesco.timerAutostart;
				this.alarmVibrateModel.value = Calesco.alarmVibrate;
				this.alarmRepeatModel.value = Calesco.alarmRepeat;
				this.alarmRepeatCountModel.value = Calesco.alarmRepeatCount;
				this.alarmRepeatDelayModel.value = Calesco.alarmRepeatDelay;
								
				this.controller.get("alarmSoundName").innerHTML = Calesco.alarmSoundName;
				this.controller.modelChanged(this.teaTempUnitModel);
				this.controller.modelChanged(this.timerAutostartModel);
				this.controller.modelChanged(this.alarmVibrateModel);
				this.controller.modelChanged(this.alarmRepeatModel);
				this.controller.modelChanged(this.alarmRepeatCountModel);
				this.controller.modelChanged(this.alarmRepeatDelayModel);
			break;
		}
	}
};

PreferencesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.MenuAttr = { omitDefaultItems: true};
	this.MenuModel = {
		visible : true,
		items: [
			Mojo.Menu.editItem,
			{label: "Restore Defaults", command: "do-Defaults"},
			{label: "Help", command: "do-Help"}
		]
	};

	this.controller.setupWidget(Mojo.Menu.appMenu, this.MenuAttr, this.MenuModel);
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	this.controller.get("alarmSoundName").innerHTML = Calesco.alarmSoundName;
	
	/* setup widgets here */
	this.controller.setupWidget("selTempUnit",
		{
			label: "Temperature",
			choices : [ 
				{label: "Fahrenheit", value: "F"},
				{label: "Celcius", value: "C"}
			]
		},
		this.teaTempUnitModel = { value : Calesco.teaTempUnit }
	);
	
	this.controller.setupWidget("togAutostart",
    	{
			trueValue: 1,
			falseValue: 0
		},
    	this.timerAutostartModel = {
    		value: Calesco.timerAutostart,
    		disabled: false
		}
	);
	
	this.controller.setupWidget("togAlarmVibrate",
    	{
			trueValue: 1,
			falseValue: 0
		},
		this.alarmVibrateModel = {
    		value: Calesco.alarmVibrate,
    		disabled: false
		}
	);
	
	this.controller.setupWidget("togAlarmRepeat",
    	{
			trueValue: 1,
			falseValue: 0
		},
		this.alarmRepeatModel = {
    		value: Calesco.alarmRepeat,
    		disabled: false
		}
	);
	
	this.controller.setupWidget("intRepeatCount",
		{
			label: "Count",
			min: 1,
			max: 20
		},
		this.alarmRepeatCountModel = { value: Calesco.alarmRepeatCount }
	);
	
	this.controller.setupWidget("intRepeatDelay",
		{
			label: "Delay (s)",
			min: 0,
			max: 60
		},
		this.alarmRepeatDelayModel = { value: Calesco.alarmRepeatDelay }
	 );
	
	/* add event handlers to listen to events from widgets */
	this.timerAutostartHandler = this.handleTimerAutostart.bind(this);
	this.teaTempUnitHandler = this.handleTeaTempUnit.bind(this);
	this.alarmSoundHandler = this.handleAlarmSound.bind(this);
	this.alarmVibrateHandler = this.handleAlarmVibrate.bind(this);
	this.alarmRepeatHandler = this.handleAlarmRepeat.bind(this);
	this.alarmRepeatCountHandler = this.handleAlarmRepeatCount.bind(this);
	this.alarmRepeatDelayHandler = this.handleAlarmRepeatDelay.bind(this);
	
	this.controller.listen("togAutostart", Mojo.Event.propertyChange, this.timerAutostartHandler);
	this.controller.listen('selTempUnit', Mojo.Event.propertyChange, this.teaTempUnitHandler);
	this.controller.listen('alarmSoundRow', Mojo.Event.tap, this.alarmSoundHandler);
	this.controller.listen('togAlarmVibrate', Mojo.Event.propertyChange, this.alarmVibrateHandler);
	this.controller.listen('togAlarmRepeat', Mojo.Event.propertyChange, this.alarmRepeatHandler);
	this.controller.listen('intRepeatCount', Mojo.Event.propertyChange, this.alarmRepeatCountHandler);
	this.controller.listen('intRepeatDelay', Mojo.Event.propertyChange, this.alarmRepeatDelayHandler);
};

PreferencesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


PreferencesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

PreferencesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening("togAutostart", Mojo.Event.propertyChange, this.timerAutostartHandler);
	this.controller.stopListening('selTempUnit', Mojo.Event.propertyChange, this.teaTempUnitHandler);
	this.controller.stopListening('alarmSoundRow', Mojo.Event.tap, this.alarmSoundHandler);
	this.controller.stopListening('togAlarmVibrate', Mojo.Event.propertyChange, this.alarmVibrateHandler);
	this.controller.stopListening('togAlarmRepeat', Mojo.Event.propertyChange, this.alarmRepeatHandler);
	this.controller.stopListening('intRepeatCount', Mojo.Event.propertyChange, this.alarmRepeatCountHandler);
	this.controller.stopListening('intRepeatDelay', Mojo.Event.propertyChange, this.alarmRepeatDelayHandler);

	Calesco.Prefs.store();
};
