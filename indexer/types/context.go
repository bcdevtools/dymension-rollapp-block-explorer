package types

import (
	"context"
	"github.com/EscanBE/go-lib/logging"
	"github.com/bcdevtools/dymension-rollapp-block-explorer/indexer/database"
	"time"
)

// Context hold the working context of the application entirely.
// It contains application configuration, logger, as well as connection pool,...
type Context struct {
	baseCtx     context.Context
	telegramBot TelegramBot
	logger      logging.Logger
	database    database.Database
	config      Config
	sealed      bool
}

// NewContext returns an empty `Context`
func NewContext() Context {
	return Context{
		baseCtx: context.Background(),
	}
}

func (c Context) WithTelegramBot(bot TelegramBot) Context {
	c.preventUpdateIfSealed()
	c.telegramBot = bot
	return c
}

func (c Context) GetTelegramBot() TelegramBot {
	return c.telegramBot
}

func (c Context) WithLogger(logger logging.Logger) Context {
	c.preventUpdateIfSealed()
	c.logger = logger
	return c
}

func (c Context) GetLogger() logging.Logger {
	return c.logger
}

func (c Context) WithDatabase(db database.Database) Context {
	c.preventUpdateIfSealed()
	c.database = db
	return c
}

func (c Context) GetDatabase() database.Database {
	return c.database
}

func (c Context) WithConfig(cfg Config) Context {
	c.preventUpdateIfSealed()
	c.config = cfg
	return c
}

func (c Context) GetConfig() Config {
	return c.config
}

func (c Context) Sealed() Context {
	c.sealed = true
	return c
}

func (c Context) preventUpdateIfSealed() {
	if c.sealed {
		panic("context is sealed")
	}
}

var _ context.Context = Context{}

// ContextKey defines a type alias for a stdlib Context key.
type ContextKey string

// AppContextKey is the key in the context.Context which holds the application context.
const AppContextKey = "be-indexer-context"

func WrapIndexerContext(ctx Context) context.Context {
	return ctx
}

func UnwrapIndexerContext(ctx context.Context) Context {
	if indexerCtx, ok := ctx.(Context); ok {
		return indexerCtx
	}
	return ctx.Value(AppContextKey).(Context)
}

func (c Context) Deadline() (deadline time.Time, ok bool) {
	return c.baseCtx.Deadline()
}

func (c Context) Done() <-chan struct{} {
	return c.baseCtx.Done()
}

func (c Context) Err() error {
	return c.baseCtx.Err()
}

func (c Context) Value(key any) any {
	if key == AppContextKey {
		return c
	}

	return c.baseCtx.Value(key)
}
