package constants

// Define constants in this file

//goland:noinspection GoSnakeCaseUsage
const (
	APP_NAME    = "Block Explorer Indexer"
	APP_DESC    = "Indexing multiple blockchains"
	BINARY_NAME = "beid"

	// Do not change bellow

	DEFAULT_HOME                 = "." + BINARY_NAME
	DEFAULT_CONFIG_FILE_NAME     = "config." + CONFIG_TYPE
	DEFAULT_CHAIN_LIST_FILE_NAME = "chains." + CONFIG_TYPE
	CONFIG_TYPE                  = "yaml"
)

//goland:noinspection GoSnakeCaseUsage
const (
	FLAG_HOME = "home"
)

//goland:noinspection GoSnakeCaseUsage
const (
	FILE_PERMISSION     = 0o600
	FILE_PERMISSION_STR = "600"
)
