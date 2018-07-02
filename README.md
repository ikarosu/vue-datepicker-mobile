# vue-datepicker-mobile

移动端友好的日历，用于酒店入住，可选择范围

## 属性

| 参数 | 说明 | 类型 | 默认值 |
| - | :-: | :-: | -: |
| autoComplete | 选择日期后自动确认 | boolean | false |
| mondayFirst | 周一开头。默认周日开头 | boolean | false |
| reverseSelect | 允许往前反选日期 | boolean | false |

## Prop
| 参数 | 说明 | 类型 | 默认值 |
| - | :-: | :-: | -: |
| display | 显示这个日期选择器 | boolean | false |
| displayRange | 显示的范围，以月为长度 | number | 13 |
| displayRangeStart | 显示的开始月份，默认为当月。示例：`'2018-9-1'` | string | - |
| selectRangeStart | 可以选择的开始日期，默认为当日。格式同上。 | string | - |
| selectRangeEnd | 可以选择的结束日期，默认为显示结束。格式同上。 | string | - |
| restday* | 自定义节假日，会有“休”字提示。是一个字符串数组。示例：`['2019.5.1', '2019.5.2', '2019.5.3']` | array | - |
| workday* | 自定义工作日，会有“班”字提示。是一个字符串数组。示例：`['2019.5.4', '2019.5.5']` | array | - |
| customData* | 自定义显示的文本数组，可以是一个字符串或者对象。 | array | - |

### customData*
数据以当日为index 0，往后加入到日历中。
当时字符串的时候，直接显示文本。 `['￥100']`
如果需要高亮显示，则需是一个对象。`[{ highlight: true, text: '￥100'}]`

## Events

### select()
### cancle()
