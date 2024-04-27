package utils

import (
	"errors"
	"os"
)

func IsExist(path string) (bool, error) {
	fi, err := os.Stat(path)
	if err == nil {
		if fi.IsDir() {
			return true, nil
		} else {
			return false, errors.New("已存在同名文件")
		}
	}
	if os.IsNotExist(err) {
		return false, nil
	} else {
		return false, err
	}
}
