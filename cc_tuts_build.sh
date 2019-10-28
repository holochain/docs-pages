#!/bin/bash

SAVEIFS=$IFS   # Save current IFS
IFS=$'.'      # Change IFS to new line
changes=($1) # split to array $names
IFS=$SAVEIFS   # Restore IFS
length=${#changes[@]}

SAVEIFS=$IFS   # Save current IFS
IFS=$'/'      # Change IFS to new line
f=($1) # split to array $names
IFS=$SAVEIFS   # Restore IFS
length2=${#f[@]}
file_name=${f[$(expr $length2 - 1)]}
if [ "${changes[$(expr $length - 1)]}" = "md" ]; then
  echo "Building cc tutorial: ${file_name}"
  rm docs/tutorials/coreconcepts/$file_name
  single_source md $1 docs/tutorials/coreconcepts/$file_name
fi
