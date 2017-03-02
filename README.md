# Pure Flux

使组件不再维护store中的listener。

## Why

在Flux的工作流中，页面的变化是由页面订阅的事件被触发而改变。
当某个```store```被多个页面同时订阅时，可能会产生不必要的```render```，导致页面渲染异常。
如果对于不同页面或```action```在```store```上添加多个```listener```，则会导致代码不利于维护，过多功能一致的代码被重复编写。

该组件的功能就是将```listener```的事件统一维护在这里，业务组件只需要关注业务而不需要维护state的值。

## How

在业务组件中，添加2个静态方法```getStores```和```calculateState```

* ```getStores```方法返回一个store的数组，```ReduxDecorator```会在```componentWillMount```和```componentWillUnmount```的时候自动监听/解除监听stores中的```ChangeListener```广播。
如果需要监听其他方法的广播，需要传入一个对象，包含```store```和```add```、```remove```广播的方法名。
```
[{
	store: XXXStore,
	add: ['addXXXListener'],
	remove: ['removeXXXListener'],	
}]
```

* ```calculateState```方法接受当前的```props```、```context```和```state```，根据业务逻辑返回业务需要的```state```
```
static calculateState(props, ctx, state) {
	return {
		state1: XXXStore.getValue()
	};
};
```
该方法会在```getStores```中监听的广播被触发时，自动计算出需要的```state```，如果```state```不变，则不更新业务组件，保证业务组件的```render```只有在真正需要的数据被修改时才会触发。

* 业务组件在export时，只需要用```ReduxDecorator```方法执行一次即可：```export ReduxDecorator(XXXClass)```，使用计算过的state可直接从state中获取```this.state.state1```。
当环境集成了ES7的Decorator并通过```Compoent```的方式创建组件时，可直接加上该注解。
```
@ReduxDecorator
export default class XXXComp extends Component {
...
}
```