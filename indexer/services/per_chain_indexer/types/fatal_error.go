package types

// FatalError is error which affects the whole process.
// They are not something that can be ignored.
type FatalError error
