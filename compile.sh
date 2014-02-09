java -client -jar closure-compiler.jar \
  --js js-lib/common.js \
  --js js-lib/view.js \
  --js js-lib/draw.js \
  --js js-lib/controller.js \
  --js js-lib/state.js \
  --js js-lib/launch.js \
  --warning_level=VERBOSE --formatting=PRETTY_PRINT --language_in=ECMASCRIPT5 --compilation_level=WHITESPACE_ONLY \
  --externs=jquery-1.9-externs.js \
  > js-compiled.js \
&& cp js-compiled.js js-compiled.js~
