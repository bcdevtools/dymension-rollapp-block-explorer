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

#### Features

#### Improvements

#### Bug Fixes

#### Schema Breaking

#### API Breaking
-->

# Changelog

## Unreleased

#### Features
- (indexer) [#1](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/1) Add indexer
- (indexer,tx) [#8](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/8) Indexing per chain transactions
- (indexer,tx) [#9](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/9) Indexing transaction involvers as accounts
- (indexer,tx) [#10](https://github.com/bcdevtools/dymension-rollapp-block-explorer/pull/10) Indexing recent transactions for involvers