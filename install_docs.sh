#!/bin/bash

FILES=$(find coreconcepts/* -maxdepth 0 -type f)


for f in $FILES
do
  SAVEIFS=$IFS   # Save current IFS
  IFS=$'/'      # Change IFS to new line
  fn=($f) # split to array $names
  IFS=$SAVEIFS   # Restore IFS
  length2=${#fn[@]}
  file_name=${fn[$(expr $length2 - 1)]}
  echo "cc $file_name"
  cp $f docs/concepts/$file_name
done

FILES=$(find coreconcepts/tutorials/* -maxdepth 0 -type f)


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
    single_source md $f docs/tutorials/coreconcepts/$file_name
  fi
done

FILES=$(find art_game/* -maxdepth 0 -type f)

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
    echo "Starter app $file_name"
    single_source md $f docs/tutorials/starter_app/$file_name
  fi
done
