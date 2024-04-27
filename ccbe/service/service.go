package service

import (
	"context"
)

type Service struct {
	ctx context.Context
}

func New(ctx context.Context) Service {
	srv := Service{ctx: ctx}
	return srv
}
