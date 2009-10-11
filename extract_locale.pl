#!/usr/bin/perl -w
#
#

while(<STDIN>) {
	/\$L\((.*?)\)/;
	print "\t$1 : $1,\n";
}
