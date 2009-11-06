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

function TeaViewAssistant(teas, item, edit) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	this.teas = teas;
	this.edit = edit;
	
	if (!this.edit) {
		this.item = {
			name: "",
			time: "",
			temp: "",
			amnt: "",
			wvol: "",
			note: ""
		};
	} else {
		this.item = item;
	}
}

TeaViewAssistant.prototype.done = function() {
	Mojo.Log.info("done: ");
	
	if (this.nameModel.value === "") {
		Mojo.Log.info("done: Invalid Tea name!");
		Mojo.Controller.errorDialog($L("Tea name required!"), this.controller.window);
		return;
	}
	
	var sec;
	if (this.timeModel.value === "") {
		Mojo.Log.info("done: Invalid Tea steep time!");
		Mojo.Controller.errorDialog($L("Steep time is required and must be less than 10:00."), this.controller.window);	
		return;
	} else {
		if (this.timeModel.value.search(/:[0-9]$/) >= 0 ||
			this.timeModel.value.search(/:$/) >= 0) {
			Mojo.Log.info("done: Invalid Tea steep time format!");
			Mojo.Controller.errorDialog($L("Invalid time format."), this.controller.window);	
			return;
		}
		
		if (this.timeModel.value.search(/:/) >= 0) {
			sec = str2sec(this.timeModel.value);
		} else {
			sec = parseInt(this.timeModel.value);
		}
		
		if (sec == 0 || sec > 600) {
			Mojo.Log.info("done: Invalid Tea steep time!");
			Mojo.Controller.errorDialog($L("Steep time must be greater than 0 and less than 10:00."), this.controller.window);	
			return;
		}
	}
	
	if (this.edit) {
		this.item.name = this.nameModel.value;
		this.item.time = sec;
		this.item.temp = this.tempModel.value;
		this.item.amnt = this.amntModel.value;
		this.item.wvol = this.wvolModel.value;
		this.item.note = this.noteModel.value;
	} else {
		this.teas.list.push({
			name: this.nameModel.value,
			time: sec,
			temp: this.tempModel.value,
			amnt: this.amntModel.value,
			wvol: this.wvolModel.value,
			note: this.noteModel.value
		});
	}
	
	if (Calesco.teaSort) {
		this.teas.sort();
	}
	
	this.teas.storeDB();
	
	Mojo.Log.info("done: %j", this.teas.list);
	
	if (!this.edit) {
		this.controller.stageController.popScene({});
	}
};


TeaViewAssistant.prototype.checkTimeChars = function(keyCode) {
	Mojo.Log.info("checkTimeChars: ", keyCode);
	
	// 0 = 48
	// 9 = 57
	// : = 58
		
	// Valid forms
	// 00:00, 0:00, 0:0, 00
	
	// max 15:00
	
	str = this.controller.get("txtTime").mojo.getValue();
	Mojo.Log.info("checkTimeChars: ", str);
	
	// digit 0-9
	if (keyCode >= 48 && keyCode <= 57) {
		if (str.length == 1) {
			if (str.search(/[6-9]/) >= 0) { return false; }
			//if (str.search(/[0-1]/) >= 0 && keyCode > 53) { return false; }
		}
		if (str.length == 2 && str.search(/^[0-9][0-9]$/) >= 0) {
			return false;
		}
		if (str.length == 4 && str.search(/[0-9][0-9]$/) >= 0) {
			return false;
		}
		if (keyCode > 53 && str.search(/:$/) >= 0) {
			return false;
		}
		if (str.search(/^10/) >= 0 && keyCode != 48) {
			return false;
		}
		return true;
	}
	
	// colon :	
	if (keyCode == 58) {
		if (str.length > 0 && parseInt(str.substr(0,2)) <= 10 && str.search(/:/) < 0) {
			return true;
		}
	}
	
	return false;
}

TeaViewAssistant.prototype.sendTea = function() {
	Mojo.Log.info("sendTea:");
	
	// FIXME: I10L 
	var subjStr = this.nameModel.value;
	var bodyStr = this.nameModel.value;
	bodyStr += "<br/>" + $L("Steep time: ") + this.timeModel.value;
	if (this.amntModel.value) {
		bodyStr += "<br/>" + $L("Amount of tea: ") + this.amntModel.value + Calesco.teaAmntUnit;
	}
	if (this.tempModel.value) {
		bodyStr += "<br/>" + $L("Water temperature: ") + this.tempModel.value + "'" + Calesco.teaTempUnit;
	}
	if (this.wvolModel.value) {
		bodyStr += "<br/>" + $L("Water volume: ") + this.wvolModel.value + Calesco.teaWvolUnit;
	}
	if (this.noteModel.value) {
		bodyStr += "<br/><br/>" + $L("Notes:") + "<br/>" + this.noteModel.value;
	}
	bodyStr += "<br/><br/>" + $L("Courtesy of TeaTimer for the Palm&reg; webOS&trade; platform");
	
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method: "open",
		parameters: {
			id: 'com.palm.app.email',
			params: {
				summary: subjStr,
				text: bodyStr
			}
		}
	});
}


TeaViewAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case "do-Done":
				Mojo.Log.info("do-Done");
				this.done();
				break;
			case "do-Send":
				Mojo.Log.info("do-Send");
				this.sendTea();
				break;
		}
	}
};

TeaViewAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.controller.setupWidget(Mojo.Menu.appMenu, Calesco.MenuAttr, Calesco.MenuModel);
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	if (this.edit) {
		this.cmdMenuModel = {
			visible: true,
			items: [{},{
				items: [{
					disabled: false,
					icon: "send",
					command: "do-Send"
				}]
			}]
		};
	} else {
		this.cmdMenuModel = {
			visible: true,
			items: [{
				items: [{
					disabled: false,
					label: $L("Done"),
					command: "do-Done"
				}]
			}]
		};
	}
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.cmdMenuModel);
	
	// update labels
	this.controller.get("lblTemp").innerHTML = "'" + Calesco.teaTempUnit;
	this.controller.get("lblAmnt").innerHTML = Calesco.teaAmntUnit;
	this.controller.get("lblWvol").innerHTML = Calesco.teaWvolUnit;
	
	/* setup widgets here */
	this.controller.setupWidget("txtName", {
		hintText : $L("Name..."),
		autoFocus: true,
		autoReplace: true
	}, this.nameModel = { value : this.item.name });
	
	var secstr = this.item.time;
	if (secstr != "") {
		secstr = sec2str(this.item.time);
	}
	this.controller.setupWidget("txtTime", {
		hintText : $L("Time (10:00 Max)..."),
		charsAllow: this.checkTimeChars.bind(this),
		maxLength: 5,
		focusMode: Mojo.Widget.focusAppendMode,
		modifierState: Mojo.Widget.numLock
	}, this.timeModel = { value : secstr });
	
	this.controller.setupWidget("txtTemp", {
		hintText : $L("Water temperature..."),
		modifierState: Mojo.Widget.numLock
	}, this.tempModel = { value : this.item.temp });
	
	this.controller.setupWidget("txtAmnt", {
		hintText : $L("Amount..."),
		modifierState: Mojo.Widget.numLock
	}, this.amntModel = { value : this.item.amnt });
	
	this.controller.setupWidget("txtWvol", {
		hintText : $L("Water volume..."),
		modifierState: Mojo.Widget.numLock
	}, this.wvolModel = { value : this.item.wvol });
	
	this.controller.setupWidget("txtNote", {
		hintText : $L("Notes..."),
		autoReplace: true,
		enterSubmits: false,
		multiline: true
	}, this.noteModel = { value : this.item.note });
		
	/* add event handlers to listen to events from widgets */
//	this.pasteHandler = this.namePaste.bind(this);
//	this.controller.get("txtName").addEventListener("paste", this.pasteHandler, false);
};

TeaViewAssistant.prototype.namePaste = function(event) {
	Mojo.Log.info("namePaste: %j", event);
	Mojo.Log.info("namePaste:", event.clipboardData.getData('text'));
	//event.preventDefault();
}

TeaViewAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	// update labels
	this.controller.get("lblTemp").innerHTML = "'" + Calesco.teaTempUnit;
	this.controller.get("lblAmnt").innerHTML = Calesco.teaAmntUnit;
	this.controller.get("lblWvol").innerHTML = Calesco.teaWvolUnit;
};


TeaViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

TeaViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	
	if (this.edit) {
		this.done()
	}
	
//	this.controller.get("txtName").removeEventListener("paste", this.pasteHandler, false);
};
