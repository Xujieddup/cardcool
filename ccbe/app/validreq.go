package app

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	validator "github.com/go-playground/validator/v10"
)

type ValidError struct {
	Key     string
	Message string
}

type ValidErrors []*ValidError

func (v *ValidError) Error() string {
	return v.Message
}

func (v ValidErrors) Errors() []string {
	var errs []string
	for _, err := range v {
		errs = append(errs, err.Error())
	}

	return errs
}

func (v ValidErrors) Error() string {
	return strings.Join(v.Errors(), ",")
}

func BindAndValid(c *gin.Context, v interface{}) (bool, ValidErrors) {
	var errs ValidErrors
	err := c.ShouldBind(v)
	if err != nil {
		verrs, ok := err.(validator.ValidationErrors)
		if !ok {
			return false, errs
		}
		for index, value := range verrs {
			fmt.Println(index, value)
			errs = append(errs, &ValidError{
				Key:     value.Field(),
				Message: value.Error(),
			})
		}
		return false, errs
	}
	return true, nil
}
