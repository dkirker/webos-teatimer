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

function TeaListImportViewAssistant(teas, model) {
	this.teas = teas
	this.model = model
};

TeaListImportViewAssistant.prototype.pushArray = function(teaObj) {
	for (var i=0; i<teaObj.length; i++) {
		if (teaObj[i].name === null || teaObj[i].name === "") {
			continue;
		}
		if (teaObj[i].time === null || teaObj[i].time < 1 || teaObj[i].time > 600) {
			continue;
		}
		this.teas.list.push(teaObj[i]);		
	}
};

TeaListImportViewAssistant.prototype.importTeaList = function() {
	
	emailStr = this.textModel.value;
	if (emailStr === "") {
		Mojo.Controller.errorDialog($L("No text to import!"), this.controller.window);
		this.importButton.mojo.deactivate();	
		return;
	}
	
	// remove extra text
	nosigStr = emailStr.replace(/.*(\[.*\]).*/, "$1");
	Mojo.Log.info(nosigStr);
	
	try {
		teaObj = JSON.parse(nosigStr);
	} catch (e) {
		Mojo.Controller.errorDialog($L("Invalid tea list format!"), this.controller.window);
		this.importButton.mojo.deactivate();	
		return;
	}
	
	this.importButton.mojo.deactivate();	
	Mojo.Log.info("%j", teaObj);
	this.pushArray(teaObj)
	
	this.controller.stageController.popScene({});
};

TeaListImportViewAssistant.prototype.setup = function() {
	this.controller.get("headerlabel").innerHTML = $L("Import Tea List");
	
	this.controller.setupWidget("importText", {
		hintText: $L("Paste email text here..."),
		multiline: true
		}, this.textModel = {value: ""}
	)
	
	this.controller.setupWidget("importButton", {
			type: Mojo.Widget.activityButton
		}, this.buttonModel = {label: $L("Import"), disabled: false}
	)
	
	this.importButton = this.controller.get("importButton");
	this.importHandler = this.importTeaList.bind(this);
	this.controller.listen("importButton", Mojo.Event.tap, this.importHandler);
};

TeaListImportViewAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening("importButton", Mojo.Event.tap, this.importHandler);
};
