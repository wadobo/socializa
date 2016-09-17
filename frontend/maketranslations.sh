#!/bin/bash

help() {
    echo "usage:"
    echo "  $0 <langcode>"
    echo ""
    echo "example:"
    echo "  $0 es"
}

if [ $# -lt 1 ]
then
    help
fi

LNG=$1
DEST=locales/$LNG/LC_MESSAGES/

mkdir -p $DEST

touch $DEST/socializa.po
xgettext -d socializa -p $DEST -L C --keyword=_ -j src/*.html
