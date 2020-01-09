#!/bin/bash

./create_docs.sh

source_md () {
  rm $2/* 
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
      single_source md $f $2/$file_name
    fi
  done
}

source_md "src/tutorials/coreconcepts/*" "docs/tutorials/coreconcepts"
source_md "src/tutorials/starter_app/*" "docs/tutorials/starter_app"
single_source md src/install.md docs/install.md
