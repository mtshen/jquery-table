# jquery-table
#### 可以实现table表格固定表头的功能

#### jquery-table 1.0 在大量的数据的时候会出现性能问题,
#### jquery-table 2.0 重写了内部的代码, 已经完全脱离jquery, 全部使用原生javascript编写
#### jquery-table 2.0 还未完全完成, 目前基本没有性能上的问题
        - 增加了一个遮罩层颜色选择, 可以将滚动条上的head进行遮盖了, 默认颜色'#FFF'

#### 提供了2个 API
- create 创建table, main函数要传入table表格的父元素, 支持传入一个css样式
```
createTable({
    type : 'create',
    main : '#main'
})
```

- update 刷新table, main函数要传入table表格的父元素, 支持传入一个css样式
```
createTable({
    type : 'update',
    main : '#main'
})
```