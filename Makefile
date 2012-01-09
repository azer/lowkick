publish:
	@@node bin/lowkick publish test/config.json

verify:
	@@node bin/lowkick verify test/config.json

cmd:
	@@node bin/lowkick command $(cmd) test/config.json
