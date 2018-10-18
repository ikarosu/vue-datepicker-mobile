# vue-datepicker-mobile

移动端友好的日历，用于酒店入住，可选择范围

![e.g.](https://github.com/ikarosu/vue-datepicker-mobile/blob/master/git/eg.png?raw=true)

[Live Demo](https://ikarosu.github.io/datepicker/)

![demo](https://github.com/ikarosu/vue-datepicker-mobile/blob/master/git/qr.png?raw=true)

## 属性

| 参数 | 说明 | 类型 | 默认值 |
| :-: | :- | :-: | :-: |
| single | 是否单独选择一个日期，默认选择一个范围 | boolean | false |
| autoComplete | 是否选择日期后自动确认，false时将显示确认按钮，由用户手动点击确认。 | boolean | false |
| mondayFirst | 是否周一开头。默认周日开头 | boolean | false |
| reverseSelect | 是否允许往前反选日期 | boolean | false |
| beginningText | 选中的起点日期文本 | string | '入住' |
| endText | 选中的终点日期文本 | string | '离店' |

## Props
| 参数 | 说明 | 类型 | 默认值 |
| :-: | :- | :-: | :-: |
| display | 显示这个日期选择器 | boolean | false |
| displayRange | 显示的范围，以月为长度 | number | 13 |
| displayRangeStart | 显示的开始月份，默认为当月。示例：`'2018-9-1'` | string | - |
| selectRangeStart | 可以选择的开始日期，默认为当日。格式同上。 | string | - |
| selectRangeEnd | 可以选择的结束日期，默认为显示结束。格式同上。 | string | - |
| restday | 自定义节假日，会有“休”字提示。是一个字符串数组。示例：`['2019.5.1', '2019.5.2', '2019.5.3']` | array | - |
| workday | 自定义工作日，会有“班”字提示。是一个字符串数组。示例：`['2019.5.4', '2019.5.5']` | array | - |
| custom | 自定义数据，可以是一个字符串或者对象的数组。 | array | - |
| initPosition | 日历初始化位置，接受一个日期字符串，默认当年当月。 | string | - |

### custom
数据以当日为index 0，顺序往后加入到日历中。

当是字符串的时候，直接显示文本。 `['￥100']`

通过传入一个对象，来配置其他选项

| 参数 | 说明 | 类型 |
| :-: | :- | :-: |
| text | 文本 | string |
| highlight | 高亮显示文本 | boolean |
| bgcolor | 背景颜色。接受一个合法的颜色值 | string |
| bdcolor | 边框颜色。接受一个合法的颜色值 | string |
| disabled | 自定义禁用状态 | boolean |

例如：`[{ highlight: true, text: '￥100' }]`

此外，你还可以添加一些其他属性，可以在日期对象的`custom`属性中获得

## Events

### `select({ start, end, range })`
选择后触发，有三个参数，start和end分别代表被选中的开始和结尾，是一个日期对象，而range是一个数组，表示出了开始和结尾中间被选中的部分，为选中对象的集合，如果开始和结尾没有间隔，得到一个空数组。
#### 日期对象
被选中的对象包含以下属性：

| 参数 | 说明 | 类型 |
| :-: | :- | :-: |
| year | 年份 | number |
| month | 月份 | number |
| day | 号数 | number |
| date | 完整日期 YYYY-M-D | string |
| odate | 完整日期 YYYY-MM-DD | string |
| rest | 是否为休息日，包含不是工作日的周末和指定公休日 | boolean |
| restday | 是否为指定的休息日 | boolean |
| workday | 是否为指定的工作日（补班） | boolean |
| disabled | 是否禁用，可选的都为false | boolean |
| custom | 自定义数据。具体属性见上方`custom` | object |
| begin | 是否为选中的开始 | boolean |
| active | 是否为选中中间部分 | boolean |
| end | 是否为选中的结束 | boolean |
### cancel()
取消时触发，用于手动隐藏窗口。

### selectDisabled(date)
当选择的日期段中包含`custom.disabled`时触发，`date`是一个日期对象。

可通过自定义属性来得到禁用的原因，给用户提示。

### viewport({ year, month, date })
当某一月份出现在视野范围内时触发，返回触发的日期

\* Safari 默认不生效，如果你需要兼容Safari，你需要一个[polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill)

### click(target[, start])
点击了日历上一个可选日期时触发。

只有single为false时（默认），有第二个参数，如果是第一次点击（选择起点），则start为true。

### clickStart(target)
只有single为false时（默认）触发。

点击了起点时触发。

### clickEnd(target)
只有single为false时（默认）触发。

点击了终点时触发。

## Methods

### setData(custom, date)
给某一个日期设置自定义数据。date为一个日期字符串，YYYY-MM-DD。

## 使用示例
```
npm i aki-datepicker
```

```javascript
// main.js
import AkiDate from 'aki-datepicker'
Vue.use(AkiDate)
```

```html
<input type="date" @click="show = true" v-model="startDate" readonly>
-
<input type="date" @click="show = true" v-model="endDate" readonly>
<aki-date
  ref="date"
  :restday="restday"
  :workday="workday"
  :display="show"
  :custom="data"
  @select="select"
  @cancel="cancel"
  @selectDisabled="selectErr"
  @viewport="viewport"
  @click="click"
  @clickStart="clickStart"
  @clickEnd="clickEnd"
  autoComplete/>
```

```javascript
import { Snackbars } from 'clearaki-ui'

export default {
  data() {
    return {
      startDate: '',
      endDate: '',
      restday: [],
      workday: ['2018-9-29', '2018-9-30'],
      data: ['￥1300', '￥1345', { highlight: true, text: '￥999' }],
      show: true
    }
  },
  methods: {
    select({ start, end, range }) {
      this.startDate = start.odate
      this.endDate = end.odate
      console.log('range', range)
      this.show = false
    },
    cancel() {
      this.show = false
    },
    selectErr(date) {
      console.log('date', date)
      Snackbars(`无法选择该范围：${date.date}为${date.custom.dec}`)
    },
    viewport({ year, month, date }) {
      console.log('现在出现在视线内的是：', `${year}-${month}`)
    },
    click(target, start) {
      console.log('click', target)
      console.log('click', start)
    },
    clickStart(tar) {
      console.log('start', tar)
      // 设置一周后那天的边框颜色为orange
      const time = new Date(tar.date).getTime() + 7 * 24 * 60 * 60 * 1000
      const date = new Date(time).toJSON().split('T')[0]
      this.$refs.date.setData({ bdcolor: 'orange' }, date)
    },
    clickEnd(tar) {
      console.log('end', tar)
    }
  },
  created() {
    setTimeout(() => {
      this.workday = ['2018-8-25', '2018-8-26', '2018-8-27']
      this.restday = ['2018-8-22', '2018-8-23', '2018-8-24']
      this.data = [
        '￥1999',
        { text: '￥2018', bgcolor: 'lightgreen' },
        '', '', '', '',
        { highlight: true, text: '￥666', bgcolor: 'gold' },
        { highlight: true, text: '￥888' }, '', '',
        { disabled: true, bgcolor: 'red', dec: '正在维修' }
      ]
    }, 2000)
  }
}
```
