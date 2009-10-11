#!/bin/bash


echo "{"

cd app
grep -R '$L(' * | ../extract_locale.pl | sort -u

echo "}"

