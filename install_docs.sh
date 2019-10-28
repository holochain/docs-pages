#!/bin/bash

./create_docs.sh

cd docs

source_md () {
  FILES=$(find $1 -maxdepth 0 -type f)
  for f in $FILES
  do
    SAVEIFS=$IFS   # Save current IFS
    IFS=$'/'      # Change IFS to new line
    fn=($f) # split to array $names
    IFS=$SAVEIFS   # Restore IFS
    length2=${#fn[@]}
    file_name=${fn[$(expr $length2 - 1)]}

    SAVEIFS=$IFS   # Save current IFS
    IFS=$'.'      # Change IFS to new line
    changes=($f) # split to array $names
    IFS=$SAVEIFS   # Restore IFS
    length=${#changes[@]}

    if [ "${changes[$(expr $length - 1)]}" = "md" ]; then
      echo "cc tut $file_name"
      single_source md $f $f
    fi
  done
}

source_md tutorials/coreconcepts/*
source_md tutorials/starter_app/*
