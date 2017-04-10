# jquery-table
#### 可以实现table表格固定表头的功能

#### jquery-table 1.0 在大量的数据的时候会出现性能问题,
#### jquery-table 2.0 重写了内部的代码, 全部使用原生javascript编写
        - 增加了一个遮罩层颜色选择, 可以将滚动条上的head进行遮盖了, 默认颜色'#FFF'
        - 增加了一个新的API instableUpdate 能够使符合jqueryTable的元素结构, 都能够间接调用 update
        - 对jquery的调用支持

#### 提供了3个 API
- create 创建table, main函数要传入table表格的父元素, 支持传入一个css样式
```
// 无jquery
createTable({
    type : 'create',
    main : '#main',
    background: '#FFF'
})

// 有jquery
$('#main').createTable('create');
```

- update 刷新table, main函数要传入table表格的父元素, 支持传入一个css样式
```
createTable({
    type : 'update',
    main : '#main',
    background: '#FFF'
})
```

- remove 删除table
```
createTable({
    type : 'remove',
    main : '#main'
})
```

- instableUpdate 弱刷新
```
createTable({
    type : 'instableUpdate',
    main : '#main'
})
```