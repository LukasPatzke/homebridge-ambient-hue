# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.7] - 2022-12-26

### Changed
- Fixed a bug in the UI, where a range slider could get stuck in an infinite loop
- Improved debug logging
- Add a configuration option to disable scheduled updates

### Security
- Updated dependencies with security vulnerabilies
- Mask the hue api key in all logging outputs

## [0.0.6] - 2022-02-15

### Changed

- Devices that were renamed in HUE are correctly renamed in HomeKit
- Devices that were removed in HUE are correctly removed from HomeKit

## [0.0.5] - 2022-02-12

### Changed

- Droped support for node versions < v.14

### Security

- Update dependencies

## [0.0.4] - 2021-07-04

### Added

- Configuration option for debug logs.

### Changed

- Redesign smart off feature to use the response from hue
- Fixed formatting

### Security

- Update dependencies
