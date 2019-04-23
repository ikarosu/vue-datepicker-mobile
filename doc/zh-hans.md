# vue-datepicker-mobile

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

## v2

![e.g.](https://github.com/ikarosu/vue-datepicker-mobile/blob/v2/git/v2.jpg?raw=true)

[Live Demo](https://ikarosu.github.io/datepicker/)

![demo](https://github.com/ikarosu/vue-datepicker-mobile/blob/master/git/qr.png?raw=true)

## Props


| 参数 | 说明 | 类型 | 默认值 |
| :-: | :- | :-: | :-: |
| custom | 自定义数据，对象的key表示数据插入的位置，value为一个按日排序的数据数组。有两种模式。* | [object, array] | - |
| endText | 选中的终点日期文本 | string | '离店' |
| initDate | 日历初始化位置，接受一个日期字符串，默认当年当月。 | string | 今日 |
| initLength | 从initDate开始，初始渲染长度 | number | 6 |
| loadLength | 滚动到尽头时每次加载的长度 | number | 6 |
| mondayFirst | 是否周一开头 | boolean | true |
| selectArea | 允许用户选择的区域。数组表示开始和结束示例：`['2019-05-01', '2019-08-02']` | array | - |
| selected | 选中某一段区域。数据结构同上 | array | - |
| single | 是否单独选择一个日期，默认选择一个范围 | boolean | false |
| startText | 选中的起点日期文本 | string | '入住' |
| cancleText | 取消按钮文本 | string | '取消' |
| confirmText | 确认按钮文本 | string | '确认' |
| visible | 显示这个日期选择器 | boolean | false |
| weekTexts | 从周一到周日的数组，用于自定义显示名称 | array | `['一', '二', '三', '四', '五', '六', '日']` |

\* 注

```javascript
// 当key为月份如：'2019-05'时，value则为从当月1日开始的数据序列。可接受多个月份（多个key）
{
  '2019-04': [{custom1},{custom2},{custom29},{custom30}]
  '2019-05': [{custom1},{custom2},{custom30},{custom31}]
}
```

```javascript
// 当key为具体日期如：'2019-05-20'时，value为从该日起的数据序列，自动往下一个月添加超出的数据
{
  '2019-04-09': [{custom1},{custom2},{custom29},{custom30},{custom99},{custom100},{custom2xx},{custom3xx}]
}
```

```javascript
// 直接传入一个数组，相当于上面的key为当日
[{custom1},{custom2},{custom29},{custom30},{custom99},{custom100},{custom2xx},{custom3xx}]
```


### custom

| 参数 | 说明 | 类型 |
| :-: | :- | :-: |
| bgc | 背景颜色。接受一个合法的颜色值 | string |
| disabled | 自定义禁用状态 | boolean |
| color | 文字颜色 | string |
| info | 文本内容，如果是一个数组，将多行显示。 | [string, object, array] |

#### info

| 参数 | 说明 | 类型 |
| :-: | :- | :-: |
| text | 显示文本 | string |
| color | 文字颜色 | string |

此处color优先级高于外部

完整示例

```javascript
[
  {
    bgc: '#abc',
    disabled: true,
    color: 'red',
    info: '已满'
  },
  {
    bgc: 'rgb(255,0,100)',
    info: ['001', '002']
  },
  {
    bgc: 'hsl(100,100%,50%)',
    color: 'rgba(99, 99, 99, .9)',
    info: { text: '007', color: 'hsla(60, 50%, 70%, .6)' }
  }
]
```

## Event

### `select({ start, end, range })`

选择后触发，有三个参数，start和end分别代表被选中的开始和结尾，是一个日期对象，而range是一个数组，表示出了开始和结尾中间被选中的部分，为选中对象的集合，如果开始和结尾没有间隔，得到一个空数组。

#### 日期对象

```javascript
start: {
  date: new Date(), // 当日的日期对象
  data: {
    disabled: false,
    custom: {} // 传入的custom对象
  }
}
```

### cancel()

取消时触发，用于手动隐藏窗口。

### confirm({ start, end, range })

确认时触发。

### disable(date)

当选择的日期段中`custom.disabled`为`true`时触发，`date`是一个日期对象。

### viewport(month)

当某一月份出现在视野范围内时触发，返回触发的日期

```javascript
month: {
  date: new Date(), // 当月日期对象，日期并不总是1号。
  days: [date1, date2, date29, date30] // 当月的所有日期对象
}
```

## 使用

```
npm i aki-datepicker
```

```javascript
// main.js
import AkiDate from 'aki-datepicker'
Vue.use(AkiDate)
```

### 简单使用

```html
<aki-date :visible="visible" @confirm="confirmHandler" @cancle="visible=false" />
```

## 说明

项目中使用了Intersection Observer API

- [Caniuse](https://caniuse.com/#feat=intersectionobserver)
- [Polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill)

## 鸣谢

[date-utils](https://github.com/JerrySievert/date-utils)