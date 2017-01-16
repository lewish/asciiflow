java -client -jar closure-compiler.jar \
  --js js-lib/*.js \
  --warning_level=VERBOSE --formatting=PRETTY_PRINT --language_in=ECMASCRIPT6 --compilation_level=ADVANCED_OPTIMIZATIONS \
  --externs=jquery-3.1-externs.js \
  > js-compiled.js
