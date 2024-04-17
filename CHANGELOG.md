<!--
Guiding Principles:

Changelogs are for humans, not machines.
There should be an entry for every single version.
The same types of changes should be grouped.
Versions and sections should be linkable.
The latest version comes first.
The release date of each version is displayed.
Mention whether you follow Semantic Versioning.

Usage:

Change log entries are to be added to the Unreleased section under the
appropriate stanza (see below). Each entry should ideally include a tag and
the GitHub issue reference in the following format:

* (<tag>) \#<issue-number> message

Tag must include `sql` if having any changes relate to schema

The issue numbers will later be link-ified during the release process,
so you do not have to worry about including a link manually, but you can if you wish.

Types of changes (Stanzas):

"Features" for new features.
"Improvements" for changes in existing functionality.
"Deprecated" for soon-to-be removed features.
"Bug Fixes" for any bug fixes.
"Schema Breaking" for breaking SQL Schema.
"API Breaking" for breaking API.

If any PR belong to multiple types of change, reference it into all types with only ticket id, no need description (convention)

Ref: https://keepachangelog.com/en/1.0.0/
-->

<!--
Templates for Unreleased:

## Unreleased

### Features

### Improvements

### Bug Fixes

### Schema Breaking

### API Breaking
-->

# Changelog

## Unreleased

### Features

- (indexing) [#1](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/1) Add indexer
- (indexing) [#8](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/8) Indexing per chain transactions
- (indexing) [#9](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/9) Indexing transaction involvers as accounts
- (indexing) [#10](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/10) Indexing recent transactions for involvers
- (indexing) [#16](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/16) Add ability to enable and disable indexing a chain for hot reload
- (indexing) [#22](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/22) Provide a way to mark chain stopped operation
- (query) [#23](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/23) Provide a way get out-dated chains
- (other) [#37](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/37) Add delegation snapshot helper

### Improvements

- (indexing,sql) [#13](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/13) Add column storing epoch UTC last updated
- (rpc) [#14](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/14) Improve error message and detection when upstream RPC returns error
- (indexing) [#15](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/15) Improve performance and prevent unexpected error when indexing blocks
- (indexing) [#18](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/18) Retry indexing failed block
- (refactor) [#25](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/25) Refactor indexer
- (refactor) [#26](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/26) Refactor naming for methods of RWMutex structs
- (indexing) [#29](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/29) Indexing token contract into account ERC-20/NFT balance contract list
- (rpc) [#30](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/30) Fetch BE-Json-RPC with retry
- (indexing) [#33](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/33) Exclude failed blocks when indexing new blocks
- (indexing) [#34](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/34) Mark failed blocks when failed to index new blocks range
- (indexing) [#35](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/35) Index EVM/Wasm `action` into 2 transaction tables

### Bug Fixes

- (indexing) [#19](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/19) Skip retry indexing failed block with `height = 0`
- (indexing) [#20](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/20) Fix ultimately retry indexing failed block
- (indexing) [#31](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/31) Fix tx type `wasm` not indexed into DB & improve Be-Json-RPC retry
- (indexing) [#36](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/36) Fix issue only one block indexed per batch