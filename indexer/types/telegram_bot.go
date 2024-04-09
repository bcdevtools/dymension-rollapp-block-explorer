package types

import (
	"github.com/EscanBE/go-lib/logging"
	"github.com/EscanBE/go-lib/telegram/bot"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/pkg/errors"
)

type TelegramBot interface {
	SendTelegramLogMessage(msg string) (*tgbotapi.Message, error)
	SendTelegramErrorMessage(msg string) (*tgbotapi.Message, error)
	SendTelegramError(err error) (*tgbotapi.Message, error)
	SendTelegramMessage(c tgbotapi.Chattable) (*tgbotapi.Message, error)
	StopReceivingUpdates()

	//

	WithLogger(logger logging.Logger) TelegramBot
	EnableDebug(debug bool) TelegramBot
}

var _ TelegramBot = &telegramBot{}

type telegramBot struct {
	bot          *bot.TelegramBot
	logger       logging.Logger
	logChannelID int64
	errChannelID int64
}

func NewTelegramBot(token string, logChannelID, errChannelID int64) (TelegramBot, error) {
	if token == "" {
		return nil, nil
	}

	b, err := bot.NewBot(token)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to initialize Telegram bot")
	}

	return &telegramBot{
		bot:          b,
		logChannelID: logChannelID,
		errChannelID: errChannelID,
	}, nil
}

func (t *telegramBot) SendTelegramLogMessage(msg string) (m *tgbotapi.Message, err error) {
	if t.enabledPublishLogMsgs() {
		m, err = t.SendTelegramMessage(tgbotapi.NewMessage(t.logChannelID, msg))
		if err != nil && t.logger != nil {
			t.logger.Error("Failed to send telegram log message", "type", "log", "error", err.Error())
		}
	}

	return
}

func (t *telegramBot) SendTelegramErrorMessage(msg string) (m *tgbotapi.Message, err error) {
	if t.enabledPublishErrMsgs() {
		m, err = t.SendTelegramMessage(tgbotapi.NewMessage(t.errChannelID, msg))
		if err != nil && t.logger != nil {
			t.logger.Error("Failed to send telegram error message", "type", "error", "error", err.Error())
		}
	}

	return
}

func (t *telegramBot) SendTelegramError(err error) (*tgbotapi.Message, error) {
	return t.SendTelegramErrorMessage(err.Error())
}

func (t *telegramBot) SendTelegramMessage(c tgbotapi.Chattable) (m *tgbotapi.Message, err error) {
	if t.enabled() {
		var m2 tgbotapi.Message
		m2, err = t.bot.Send(c)
		if err != nil {
			if t.logger != nil {
				t.logger.Error("Failed to send telegram message", "error", err.Error())
			}
		} else {
			m = &m2
		}
	}

	return
}

func (t *telegramBot) StopReceivingUpdates() {
	if t.enabled() {
		t.bot.StopReceivingUpdates()
	}
}

func (t *telegramBot) WithLogger(logger logging.Logger) TelegramBot {
	if t.enabled() {
		t.logger = logger
	}
	return t
}

func (t *telegramBot) EnableDebug(debug bool) TelegramBot {
	if t.enabled() {
		t.bot.EnableDebug(debug)
	}
	return t
}

func (t *telegramBot) enabled() bool {
	return t != nil && t.bot != nil
}

func (t *telegramBot) enabledPublishLogMsgs() bool {
	return t.enabled() && t.logChannelID != 0
}

func (t *telegramBot) enabledPublishErrMsgs() bool {
	return t.enabled() && t.errChannelID != 0
}
