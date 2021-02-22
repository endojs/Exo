module main

go 1.15

require (
	github.com/Agoric/agoric-sdk v0.24.0
	github.com/cosmos/cosmos-sdk v0.40.1 // indirect
	github.com/ethereum/go-ethereum v1.9.22 // indirect
)

// Silence a warning on MacOS
replace github.com/keybase/go-keychain => github.com/99designs/go-keychain v0.0.0-20191008050251-8e49817e8af4

replace github.com/gogo/protobuf => github.com/regen-network/protobuf v1.3.2-alpha.regen.4

// At least until tendermint v0.34.4 is released.
// replace github.com/tendermint/tendermint => github.com/agoric-labs/tendermint v0.33.1-dev2.0.20210126214117-87803b32fbb4

// At least until https://github.com/cosmos/cosmos-sdk/issues/8478 is solved and
// released.
replace github.com/cosmos/cosmos-sdk => github.com/agoric-labs/cosmos-sdk v0.34.4-0.20210129184725-f1afab29a888
