#!/bin/bash

# This script generates unique Nx libraries, checking if they already exist.

for i in {1..200}
do
   # Define unique names for the library and directory for each iteration
   LIB_NAME="subfoobar$i-lib"
   LIB_DIR="libs/subfoobar$i-lib"

   # Check if the directory already exists
   if [ -d "$LIB_DIR" ]; then
       # If it exists, print a message and skip to the next iteration
       echo "⏩ Directory '$LIB_DIR' already exists, skipping."
   else
       # If it doesn't exist, print the generation message and run the command
       echo "🚀 Generating library #$i: $LIB_NAME"
       pnpm exec nx generate @nx/js:library --directory="$LIB_DIR" --name="$LIB_NAME" --unitTestRunner=jest --no-interactive
   fi
done

echo "✅ Script finished. All libraries have been checked or generated."