# 消逝集合卡
## 配置资源文件
~~~ 
- url: /hacsfiles/xiaoshi-card/xiaoshi-card.js
  type: module
~~~
## 功能1：灯光控制卡2.0
**引用示例**
~~~
type: custom:xiaoshi-light-card
entities:             # 要想使用全关功能，灯光必须是light实体
  - light.light1
  - light.light2
  - light.light3    
width: 87vw           # 卡片宽度
height: 20vw          # 卡片高度
rgb: true             # 是否显示亮度、色温控制
show: auto            # 当有这行调用时，仅当灯光时on时才会显示，当灯光时off时卡片整体隐藏
theme: "on"           # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
total: "on"           # 选项on显示表头统计行，选项off不显示统计行，默认参数为on
columns: 1            # 布局的列数，默认1列
~~~

## 功能2：插座控制卡2.0
**引用示例**
~~~
type: custom:xiaoshi-switch-card
entities:
  - entity: switch.switch1   # 插座1实体 
    power: sensor.power1     # 插座1对应功率实体
  - entity: switch.switch2   # 插座2实体
    power: sensor.power2     # 插座2对应功率实体
height: 85vw                 # 卡片宽度
width: 20vw                  # 卡片高度
theme: "on"                  # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
total: "on"                  # 选项on显示表头统计行，选项off不显示统计行，默认参数为on
columns: 1                   # 布局的列数，默认1列
~~~

## 功能3：text输入框卡2.0
**引用示例**
~~~
type: custom:xiaoshi-text-card
entity: text.text1           # text实体
height: 56px                 # 卡片高度
width: 65vw                  # 卡片宽度
border-radius: 10px          # 圆角大小,默认值是10px
theme: "on"                  # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
~~~

## 功能4：加载随机图片网址API
**引用示例**
~~~
type: custom:xiaoshi-image-card
top: 0vh  # 上下偏移的距离
url:
  - https://api.suyanw.cn/api/sjmv.php  # 引用图片api网址的数组
  - https://api.suyanw.cn/api/meinv.php # 引用图片api网址的数组
~~~

## 功能5：加载随机视频网址API
**引用示例**
~~~
type: custom:xiaoshi-video-card 
top: 0vh  # 上下偏移的距离
url:
  - https://videos.xxapi.cn/0db2ccb392531052.mp4 # 引用视频api网址的数组
  - https://videos.xxapi.cn/228f4dd7318750dd.mp4 # 引用视频api网址的数组
~~~

## 功能6：分布卡(温度分布、湿度分布)
**引用示例**
~~~
type: custom:xiaoshi-grid-card
display: true                # 当display为true或者[[[ return true]]] 时 隐藏整张卡片
entities:
  - entity: sensor.shidu_ciwo
    grid: 0%,0%,30%,29%
  - entity: sensor.shidu_keting
    grid: 32%,69%,17%,9%     # 横坐标、纵坐标、宽度、高度
    state: false             # false不显示数值，默认显示，可省略 
    unit: " %"               # 显示的单位，默认不显示，可省略
width: 100px                 # 卡片 整体宽度
height: 120px                # 卡片 整体高度
min: 20                      # 当前地区最小值
max: 80                      # 当前地区最大值
mode: 湿度                   # 【温度】或者【湿度】
~~~

## 功能7：进度条
**引用示例**
~~~
type: custom:xiaoshi-slider-card
entity: number.xxxxxxx
style:
  slider-width: 110px                 # 总宽度，默认100px
  slider-height: 10px                 # 总高度，默认30px
  track-color: rgba(200,200,200,0.5)  # 背景色，默认rgba(255,255,255,0.3)
  thumb-size: 15px                    # 进度点大小，默认15px
  thumb-color: rgb(255,255,255)       # 进度点颜色，默认，白色
  slider-color: rgb(25,155,125)       # 进度条背景色，默认，浅蓝色
  track-height: 20px                  # 进度条高度，默认5px
  track-radius: 4px                   # 圆角大小，默认2px
~~~

## 功能8：国网表格（电费日历）(需要NR整合数据)
**引用示例**
~~~
type: custom:xiaoshi-state-grid-calendar
entity: sensor.state_grid   # 青龙NR实体 或 HASS集成NR实体
theme: "off"                # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
height: 330px               # 总高度
width: 380px                # 总宽度
border: 10px                # 圆角大小
color_num: '#FF6347'        # 电量颜色，默认值：'#FF6347'
color_cost: '#804aff'       # 电费颜色，默认值：'#804aff'
~~~

## 功能9：国网表格（NR整合数据）
**引用示例**
~~~
type: custom:xiaoshi-state-grid-nodered
entity: sensor.state_grid   # 青龙NR实体 或 HASS集成NR实体
button: button.qinglong     # 刷新按钮
title: 电费信息              # 标题，默认电费信息
titleFontSize: 20px         # 标题字体大小
theme: "off"                # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
height: 330px               # 总高度
width: 380px                # 总宽度
border: 10px                # 圆角大小
cardwidth: 70px             # 每个按钮宽度
cardheight: 35px            # 每个按钮高度
color_num: '#FF6347'        # 电量颜色，默认值：'#FF6347'
color_cost: '#804aff'       # 电费颜色，默认值：'#804aff'
t_num: none                 # 有此项时，不显示尖相关数据
p_num: none                 # 有此项时，不显示峰相关数据
n_num: none                 # 有此项时，不显示平相关数据
v_num: none                 # 有此项时，不显示谷相关数据
icon: none                  # 有此项时，不显示图标
balance_name: '电费余额'     # 电费余额的名字
~~~

## 功能10：国网表格（hassbox集成数据）
**引用示例**
~~~
type: custom:xiaoshi-state-grid-hassbox
title: 电费信息               # 标题，默认电费信息
titleFontSize: 20px          # 标题字体大小
id: 888888888888888          # 国网id
price: 0.6                   #直接指定单价，或者用下面的方式计算
price: |
  [[[
    var num = states["sensor.state_grid_888888888888888_year_ele_num"].state;
    var cost = states["sensor.state_grid_888888888888888_year_ele_cost"].state;
    return cost / num;
  ]]]
theme: "off"                # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
height: 330px               # 总高度
width: 380px                # 总宽度
border: 10px                # 圆角大小
cardwidth: 70px             # 每个按钮宽度
cardheight: 35px            # 每个按钮高度
color_num: '#FF6347'        # 电量颜色，默认值：'#FF6347'
color_cost: '#804aff'       # 电费颜色，默认值：'#804aff'
n_num: none                 # 有此项时，不显示平相关数据
balance_name: '电费余额'     # 电费余额的名字
~~~

## 功能11：国网图表（日统计图表）
**引用示例**
~~~
type: custom:xiaoshi-state-grid-chart-day
entity: sensor.state_grid   # 青龙NR实体 或 HASS集成NR实体
theme: "off"                # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
height: 330px               # 总高度
width: 380px                # 总宽度
color_num: '#FF6347'        # 电量颜色，默认值：'#FF6347'
color_cost: '#804aff'       # 电费颜色，默认值：'#804aff'
~~~

## 功能12：国网图表（月统计图表）
**引用示例**
~~~
type: custom:xiaoshi-state-grid-chart-month
entity: sensor.state_grid   # 青龙NR实体 或 HASS集成NR实体
theme: "off"                # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
height: 330px               # 总高度
width: 380px                # 总宽度
color_num: '#FF6347'        # 电量颜色，默认值：'#FF6347'
color_cost: '#804aff'       # 电费颜色，默认值：'#804aff'
~~~

## 功能13：国网UI（手机端整合）
**引用示例**
~~~
type: custom:xiaoshi-state-grid-phone
entity: sensor.state_grid   # 青龙NR实体 或 HASS集成NR实体
theme: "off"                # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
height: 330px               # 总高度
width: 380px                # 总宽度
color_num: '#FF6347'        # 电量颜色，默认值：'#FF6347'
color_cost: '#804aff'       # 电费颜色，默认值：'#804aff'
~~~

## 功能14：国网UI（平板端整合）
**引用示例**
~~~
type: custom:xiaoshi-state-grid-pad
entity: sensor.state_grid   # 青龙NR实体 或 HASS集成NR实体
theme: "off"                # 选项on是白色，选项off是黑色，也可以引用全局函数：'[[[ return theme()]]]'
height: 330px               # 总高度
width: 380px                # 总宽度
color_num: '#FF6347'        # 电量颜色，默认值：'#FF6347'
color_cost: '#804aff'       # 电费颜色，默认值：'#804aff'
~~~

## 功能15：空调卡片
**引用示例**
~~~
type: custom:xiaoshi-climate-card
entity: climate.kongtiao_keting
temperature: sensor.woshi_wendu              ## 额外温度实体，覆盖空调当前温度，用于空调实体没有【当前温度】情况
timer: timer.ke_ting_kong_diao_ding_shi_qi   ## 辅助元素：定时器实体
theme: on                                    ## 可选on、off、或者函数返回值如'[[[ return theme() ]]]'
auto_show: false                             ## 当有此选项时，空调关闭时，卡片隐藏
width: 100%                                  ## 卡片宽度，可省略，默认100%
buttons:                                     ## 附加按钮：辅热、节能、干燥、睡眠、提示音、指示灯等，没有可省略
  - switch.kongtiao_dryer_keting             ## 没有可省略
  - switch.kongtiao_eco_keting               ## 没有可省略
  - switch.kongtiao_heater_keting            ## 没有可省略
  - switch.kongtiao_sleep_keting             ## 没有可省略
  - switch.kongtiao_alarm_keting             ## 没有可省略
  - light.kongtiao_light_keting              ## 没有可省略
~~~
## 功能16：电脑卡片
**引用示例**
~~~
type: custom:xiaoshi-computer-card
entity: switch.diannao                       ## 电脑开关实体（来源开机卡）
theme: on                                    ## 可选on、off、或者函数返回值如'[[[ return theme() ]]]'
auto_show: false                             ## 当有此选项时，空调关闭时，卡片隐藏
cpu: sensor.pc_cpu_usage                     ## 实体来源：windows电脑安装 IOT link，配置HA的mqtt服务器
memory: sensor.pc_memory_usage               ## 实体来源：官网https://iotlink.gitlab.io/downloads.html
storage:
  - sensor.pc_storage_c_usage                ## 实体来源：同上
  - sensor.pc_storage_d_usage                ## 实体来源：同上
  - sensor.pc_storage_e_usage                ## 实体来源：同上
  - sensor.pc_storage_f_usage                ## 实体来源：同上
~~~
