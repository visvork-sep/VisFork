#!/bin/bash
java -jar simian-4.0.0.jar -includes=src/**.ts -includes=src/**.tsx -excludes=src/**test.ts -excludes=src/**test.tsx -excludes=test/**.ts -excludes=test/**.tsx -balanceParentheses+