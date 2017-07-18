test:
	./node_modules/.bin/mocha --reporter spec

lint:
	./node_modules/.bin/jshint index.js

.PHONY: test
