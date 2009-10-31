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

function PreferencesAssistant(teas) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	this.teas = teas;
}

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

PreferencesAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch(event.command){
			case "do-Defaults":
				Calesco.Prefs.setDefaults();
				Calesco.Prefs.store();
				
				this.teaSortModel.value = Calesco.teaSort;
				this.teaTempUnitModel.value = Calesco.teaTempUnit;
				this.teaAmntUnitModel.value = Calesco.teaAmntUnit;
				this.teaWvolUnitModel.value = Calesco.teaWvolUnit;
				this.timerAutostartModel.value = Calesco.timerAutostart;
				this.alarmVibrateModel.value = Calesco.alarmVibrate;
				this.alarmRepeatModel.value = Calesco.alarmRepeat;
				this.alarmRepeatCountModel.value = Calesco.alarmRepeatCount;
				this.alarmRepeatDelayModel.value = Calesco.alarmRepeatDelay;
								
				this.controller.get("alarmSoundName").innerHTML = Calesco.alarmSoundName;
				this.controller.modelChanged(this.teaSortModel);
				this.controller.modelChanged(this.teaTempUnitModel);
				this.controller.modelChanged(this.teaAmntUnitModel);
				this.controller.modelChanged(this.teaWvolUnitModel);
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
			{label: $L("Restore Defaults"), command: "do-Defaults"},
			{label: $L("Help"), command: "do-Help"}
		]
	};

	this.controller.setupWidget(Mojo.Menu.appMenu, this.MenuAttr, this.MenuModel);
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	this.controller.get("alarmSoundName").innerHTML = Calesco.alarmSoundName;
	
	/* setup widgets here */
	this.controller.setupWidget("selSort",
		{
			label: $L("Sort"),
			choices : [ 
				{label: $L("Alphabetical"), value: 1},
				{label: $L("Custom"), value: 0}
			]
		},
		this.teaSortModel = { value : Calesco.teaSort }
	);
	
	this.controller.setupWidget("selTempUnit",
		{
			label: $L("Temperature"),
			choices : [ 
				{label: $L("Fahrenheit"), value: "F"},
				{label: $L("Celcius"), value: "C"}
			]
		},
		this.teaTempUnitModel = { value : Calesco.teaTempUnit }
	);
	
	this.controller.setupWidget("selAmntUnit",
		{
			label: $L("Amount"),
			choices : [ 
				{label: $L("Teaspoons"), value: " tsp"},
				{label: $L("Grams"), value: "g"}
			]
		},
		this.teaAmntUnitModel = { value : Calesco.teaAmntUnit }
	);
	
	this.controller.setupWidget("selWvolUnit",
		{
			label: $L("Water Volume"),
			choices : [ 
				{label: $L("Ounces"), value: "oz"},
				{label: $L("Milliliters"), value: "ml"}
			]
		},
		this.teaWvolUnitModel = { value : Calesco.teaWvolUnit }
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
			label: $L("Count"),
			min: 1,
			max: 20,
			autoFocus: false
		},
		this.alarmRepeatCountModel = { value: Calesco.alarmRepeatCount }
	);
	
	this.controller.setupWidget("intRepeatDelay",
		{
			label: $L("Delay (s)"),
			min: 0,
			max: 60
		},
		this.alarmRepeatDelayModel = { value: Calesco.alarmRepeatDelay }
	 );
	
	this.controller.setInitialFocusedElement('selSort');
	
	/* add event handlers to listen to events from widgets */
	this.alarmSoundHandler = this.handleAlarmSound.bind(this);
	this.controller.listen('alarmSoundRow', Mojo.Event.tap, this.alarmSoundHandler);
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
	
	this.controller.stopListening('alarmSoundRow', Mojo.Event.tap, this.alarmSoundHandler);

	Calesco.teaSort = Number(this.teaSortModel.value);
	if (Calesco.teaSort) {
		this.teas.sort();
	}
	Calesco.teaTempUnit = this.teaTempUnitModel.value;
	Calesco.teaAmntUnit = this.teaAmntUnitModel.value;
	Calesco.teaWvolUnit = this.teaWvolUnitModel.value;
	Calesco.timerAutostart = this.timerAutostartModel.value;
	Calesco.alarmVibrate = this.alarmVibrateModel.value;
	Calesco.alarmRepeat = this.alarmRepeatModel.value;
	Calesco.alarmRepeatCount = this.alarmRepeatCountModel.value;
	Calesco.alarmRepeatDelay = this.alarmRepeatDelayModel.value;

	Calesco.Prefs.store();
};
