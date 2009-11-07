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


function CalescoPower(scene) {
		this.sceneController = scene;
		this.inc = 0;
}
	
CalescoPower.prototype.inhibit = function(seconds) {
		Mojo.Log.info("Power.inhibit:");
		var duration = seconds * 1000;
		
		this.inc++;
		this.sceneController.serviceRequest("palm://com.palm.power/com/palm/power", {
			method: "activityStart",
			parameters: {
				id: Calesco.appId + this.inc.toString(),
				duration_ms: duration
			},
			onSuccess: this.success.bind(this),
			onFailure: this.failure.bind(this)
		});
};
	
CalescoPower.prototype.uninhibit = function() {
		Mojo.Log.info("Power.uninhibit:");
		
		this.sceneController.serviceRequest("palm://com.palm.power/com/palm/power", {
			method: "activityEnd",
			parameters: {
				id: Calesco.appId + this.inc.toString()
			},
			onSuccess: this.success.bind(this),
			onFailure: this.failure.bind(this)
		});	
};
	
CalescoPower.prototype.success = function() {
		Mojo.Log.info("Power.success:");
};
	
CalescoPower.prototype.failure = function() {
		Mojo.Log.info("Power.failure:");
};