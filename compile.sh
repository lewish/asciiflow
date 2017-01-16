java -client -jar closure-compiler.jar \
  --js js-lib/common.js \
  --js js-lib/view.js \
  --js js-lib/draw.js \
  --js js-lib/draw-select.js \
  --js js-lib/state.js \
  --js js-lib/controller.js \
  --js js-lib/drive-controller.js \
  --js js-lib/input-controller.js \
  --js js-lib/launch.js \
  --warning_level=VERBOSE --formatting=PRETTY_PRINT --language_in=ECMASCRIPT6 --compilation_level=ADVANCED_OPTIMIZATIONS \
  --externs=jquery-3.1-externs.js \
  > js-compiled.js
