ENV ?= production

.PHONY: verify-web verify-api verify-e2e verify-mobile-layout mobile-sync ios-build ios-test-sim ios-test-devicefarm android-build android-test-emulator android-test-devicefarm android-test-testlab

verify-web:
	./scripts/verify-web.sh

verify-api:
	./scripts/verify-api.sh

verify-e2e:
	./scripts/verify-e2e.sh

verify-mobile-layout:
	./scripts/verify-mobile-layout.sh

mobile-sync:
	./scripts/mobile-sync.sh $(ENV) both

ios-build:
	./scripts/ios-build.sh $(ENV)

ios-test-sim:
	./scripts/ios-test-sim.sh

ios-test-devicefarm:
	./scripts/ios-test-devicefarm.sh

android-build:
	./scripts/android-build.sh $(ENV)

android-test-emulator:
	./scripts/android-test-emulator.sh

android-test-devicefarm:
	./scripts/android-test-devicefarm.sh

android-test-testlab:
	./scripts/android-test-testlab.sh
