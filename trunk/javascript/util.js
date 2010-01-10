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

function sec2str(seconds) {
	sec = seconds % 60;
	min = (seconds - sec) / 60;
	str = min + ":";
	if (sec < 10) {
		str += "0";
	}
	str += sec;
	return str;
}

function str2sec(str) {
	var tim = str.split(':',2);
	var sec = parseInt(tim[0] * 60) + parseInt(tim[1]);
	//Mojo.Log.info("> %j", tim)
	//Mojo.Log.info(">", sec)
	return sec;
}

function f2c(temp) {
	return parseInt((temp-32) * 5.0/9.0);
}

function oz2ml(oz) {
	return parseInt(oz * 29.5735296);
}

function hasUnit(val) {
	var str = String(val);
	if (str.search(/[a-zA-Z]/) > 0) {
		return true;
	}
	return false;
}

function isUSRegion() {
	Mojo.Log.info("isUSRegion:");
	var loc = Mojo.Locale.getCurrentLocale();
	if (loc.substr(3,2) == "us") {
		return true;
	}
	return false;
}

