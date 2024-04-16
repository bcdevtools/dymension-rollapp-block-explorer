GIT_TAG := $(shell echo $(shell git describe --tags || git branch --show-current) | sed 's/^v//')

###############################################################################
###                                Build flags                              ###
###############################################################################

LD_FLAGS = -X github.com/bcdevtools/dymension-rollapp-block-explorer/delegation-snapshot/constants.VERSION=$(GIT_TAG)

BUILD_FLAGS := -ldflags '$(LD_FLAGS)'

###############################################################################
###                                  Build                                  ###
###############################################################################

build: go.sum
	@echo "Building dessd binary..."
	@echo "Flags $(BUILD_FLAGS)"
	@go build -mod=readonly $(BUILD_FLAGS) -o build/dessd ./cmd/dessd
	@echo "Builded successfully"
.PHONY: build

###############################################################################
###                                 Install                                 ###
###############################################################################

install: go.sum
	@echo "Installing dessd binary..."
	@echo "Flags $(BUILD_FLAGS)"
	@go install -mod=readonly $(BUILD_FLAGS) ./cmd/dessd
	@echo "Installed successfully"
.PHONY: install