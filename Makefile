# See the README for installation instructions.

NODE_PATH ?= ./node_modules
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs
LOCALE ?= en_US

.PHONY: all test clean install

all: \
	qrvis.js \
	qrvis.min.js

qrvis.js: \
	src/_start.js \
	src/_package.js \
	src/generator/_package.js \
	src/generator/qrcode.js \
	src/generator/generator.js \
    src/reader/_package.js \
    src/reader/alignpat.js \
    src/reader/bitmat.js \
    src/reader/bmparser.js \
    src/reader/datablock.js \
    src/reader/databr.js \
    src/reader/datamask.js \
    src/reader/decoder.js \
    src/reader/detector.js \
    src/reader/errorlevel.js \
    src/reader/findpat.js \
    src/reader/formatinf.js \
    src/reader/gf256.js \
    src/reader/gf256poly.js \
    src/reader/grid.js \
    src/reader/qrcode2.js \
    src/reader/rsdecoder.js \
    src/reader/version.js \
    src/reader/reader.js \
	src/_end.js

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

qrvis.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a-w $@

install:
	mkdir -p node_modules
	npm install

test: all
	@npm test

clean:
	rm -f qrvis*.js
