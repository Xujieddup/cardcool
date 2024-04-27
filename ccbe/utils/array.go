package utils

import "reflect"

// func ArrayColumn[T, V any](list []T, k V) []V {
// 	values := make([]V, len(list))
// 	for i, v := range list {
// 		values[i] = v[k]
// 	}
// 	return values
// }

func ArrayColumn2[T, V any](array []T, k any) any {
	values := make([]V, len(array))
	switch reflect.TypeOf(array).Elem().Kind() {
	case reflect.Slice, reflect.Array:
		for i, v := range array {
			values[i] = reflect.ValueOf(v).Index(int(reflect.ValueOf(k).Int())).Interface().(V)
		}
		break
	case reflect.Map:
		for i, v := range array {
			values[i] = reflect.ValueOf(v).MapIndex(reflect.ValueOf(k)).Interface().(V)
		}
		break
	case reflect.Struct:
		for i, v := range array {
			values[i] = reflect.ValueOf(v).FieldByName(reflect.ValueOf(k).String()).Interface().(V)
		}
		break
	}
	return values
}

// func Array2Map(list []interface{}, indexKey, columnKey string) map[string]interface{} {
// 	nd := make(map[string]interface{})
// 	for _, item := range list {
// 		nd[item[indexKey]] = item[columnKey]
// 	}
// 	return nd
// }

func InArray(s interface{}, d map[string]string) int {
	for _, v := range d {
		if s == v {
			return 1
		}
	}
	return 0
}

// func ArrayColumn(d map[int]map[string]string, columnKey, indexKey string) map[string]string {
// 	nd := make(map[string]string)
// 	for k, v := range d {
// 		for e, q := range v {
// 			nd[d[indexKey]] = d[columnKey]
// 		}
// 	}
// 	return nd
// }

// func ArrayKeys(s string, d map[string]string) int {
// 	for k, _ := range d {
// 		if s == d {
// 			return true
// 		}
// 	}
// 	return false
// }

// func ArrayValues(d map[string]string) map[int]string {
// 	nd := make([]string, len(d))

// 	for _, v := range d {
// 		if v != nil {
// 			append(nd, v)
// 		}
// 	}
// 	return nd
// }
