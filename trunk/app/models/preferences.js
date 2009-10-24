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

Calesco.Prefs = ({
 	
	initialize: function() {
		Mojo.Log.info("Prefs.initilize:");
		
		// Set Defaults
		this.setDefaults();
		
		// Read cookie
		this.cookieData = new Mojo.Model.Cookie("calescoPrefs");
		var oldPrefs = this.cookieData.get();
		
		// Assign cookie data to globals
		if (oldPrefs) {
			if (oldPrefs.appVersion == Calesco.appVersion) {			
				Calesco.teaTempUnit = oldPrefs.teaTempUnit;
				Calesco.teaAmntUnit = oldPrefs.teaAmntUnit;
				Calesco.teaWvolUnit = oldPrefs.teaWvolUnit;
				Calesco.timerAutostart = oldPrefs.timerAutostart;
				Calesco.alarmRepeat = oldPrefs.alarmRepeat;
				Calesco.alarmRepeatCount = oldPrefs.alarmRepeatCount;
				Calesco.alarmRepeatDelay = oldPrefs.alarmRepeatDelay;
				Calesco.alarmSoundName = oldPrefs.alarmSoundName;
				Calesco.alarmSoundPath = oldPrefs.alarmSoundPath;
				Calesco.alarmVibrate = oldPrefs.alarmVibrate;
				Calesco.lastVersion = oldPrefs.appVersion;
			}
			else {
				// migration routines
				switch (oldPrefs.appVersion) {
					case "0.6.3":
					case "0.6.2":
					case "0.6.1":
						Mojo.Log.info("Migrating prefs from version 0.6.1");
							
						Calesco.teaAmntUnit = oldPrefs.teaAmntUnit;
						Calesco.teaWvolUnit = oldPrefs.teaWvolUnit;
					case "0.6.0":
					case "0.5.1":
					case "0.5.0":
						Mojo.Log.info("Migrating prefs from version 0.5.0");
						
						Calesco.alarmVibrate = oldPrefs.alarmVibrate;
					case "0.4.1":
						Mojo.Log.info("Migrating prefs from version 0.4.1");
						
						Calesco.alarmRepeatCount = oldPrefs.alarmRepeatCount;
						Calesco.alarmRepeatDelay = oldPrefs.alarmRepeatDelay;
					case "0.4.0":
						Mojo.Log.info("Migrating prefs from version 0.4.0");
						
						Calesco.alarmSoundPath = oldPrefs.alarmSoundPath;
						Calesco.alarmSoundName = oldPrefs.alarmSoundName;
					case "0.3.0":
						Mojo.Log.info("Migrating prefs from version 0.3.0");
						
						Calesco.teaTempUnit = oldPrefs.teaTempUnit;
						Calesco.timerAutostart = oldPrefs.timerAutostart;
						Calesco.alarmRepeat = oldPrefs.alarmRepeat;
						Calesco.lastVersion = oldPrefs.appVersion;
				}
			}
		}
		
		this.store();
	},
	
	setDefaults: function() {
		Mojo.Log.info("Prefs.setDefaults:");
		if (isUSRegion()) {
			Mojo.Log.info("Prefs.setDefaults: Standard units in US");
			Calesco.teaTempUnit = 'F';
			Calesco.teaAmntUnit = ' tsp';
			Calesco.teaWvolUnit = 'oz';
		} else {
			Mojo.Log.info("Prefs.setDefaults: Metric everywhere else");
			Calesco.teaTempUnit = 'C';
			Calesco.teaAmntUnit = 'g';
			Calesco.teaWvolUnit = 'ml';
		}
		Calesco.timerAutostart = 0;
		Calesco.alarmRepeat = 1;
		Calesco.alarmRepeatCount = 10;
		Calesco.alarmRepeatDelay = 2; // seconds
		Calesco.alarmSoundName = $L("Default");
		Calesco.alarmSoundPath = Mojo.appPath + "/sounds/alarm.mp3";
		Calesco.alarmVibrate = 0;
	},
	
	store: function() {
		Mojo.Log.info("Prefs.store:");
		//return;
		this.cookieData.put({
			appVersion: Calesco.appVersion,
			teaTempUnit: Calesco.teaTempUnit,
			teaAmntUnit: Calesco.teaAmntUnit,
			teaWvolUnit: Calesco.teaWvolUnit,
			timerAutostart: Calesco.timerAutostart,
			alarmRepeat: Calesco.alarmRepeat,
			alarmRepeatCount: Calesco.alarmRepeatCount,
			alarmRepeatDelay: Calesco.alarmRepeatDelay,
			alarmSoundName: Calesco.alarmSoundName,
			alarmSoundPath: Calesco.alarmSoundPath,
			alarmVibrate: Calesco.alarmVibrate
		});
	},
	
	erase: function() {
		Mojo.Log.info("Prefs.erase:");
		this.cookieData.remove();
	}
});
 
 
