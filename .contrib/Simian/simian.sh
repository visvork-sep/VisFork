#!/bin/bash
java -jar simian-4.0.0.jar -includes=src/**.ts\|tsx -excludes=src/**test.ts\|tsx -balanceParentheses+
