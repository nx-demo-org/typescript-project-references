#!/bin/bash

# This script generates 200 unique Nx libraries.

for i in {9..200}
do
   # Define unique names for the library and directory for each iteration
   LIB_NAME="subfoobar$i-lib"
   LIB_DIR="libs/subfoobar$i-lib"

   # Print which library is being created
   echo "🚀 Generating library #$i: $LIB_NAME"

   # Run the Nx generate command
   pnpm exec nx generate @nx/js:library --directory="$LIB_DIR" --name="$LIB_NAME" --unitTestRunner=jest --no-interactive

   # Optional: Add a small sleep to avoid overwhelming the system, though likely not necessary
   # sleep 0.1
done

echo "✅ All 200 libraries have been generated."