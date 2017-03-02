import flatten from 'lodash/array/flatten';

function shallowEqual(objA, objB) {
	if (objA === objB) {
	  return true;
	}

	if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
	  return false;
	}

	var keysA = Object.keys(objA);
	var keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
	  return false;
	}

	var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
	for (var i = 0; i < keysA.length; i++) {
	  if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
	    return false;
	  }
	}

	return true;
}

function flattenStoresListeners(stores) {
	return stores.map( store => {
		if(store.store) {
			let realStore = store.store;
			return {
				add: store.add.map( add => realStore[add].bind(realStore) ),
				remove: store.remove.map( remove => realStore[remove].bind(realStore) ),
			}
		}
		return {
			add: [store.addChangeListener.bind(store)],
			remove: [store.removeChangeListener.bind(store)],
		}
	} );

}

function addListeners(stores) {
	return flatten(flattenStoresListeners(stores).map(store => store.add));
}
function removeListeners(stores) {
	return flatten(flattenStoresListeners(stores).map(store => store.remove));
}
function actionWithListener(cb) {
	return (listener) => {
		listener(cb);
	}
}

function ReduxDecorator(Base) {

	class ContainerClass extends Base {

		constructor(props, context) {
			super(props, context);

			this._onChange = this._onChange.bind(this);

			this.state = Base.calculateState(undefined, props, context, this.state);
			addListeners(Base.getStores()).map(actionWithListener(this._onChange));
		};

		componentWillReceiveProps(nextProps, nextContext) {
			if (super.componentWillReceiveProps) {
				super.componentWillReceiveProps(nextProps, nextContext);
			}
		}

		shouldComponentUpdate(nextProps, nextState) {
			return ( !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState) );
		}

		componentWillUnmount() {
			if (super.componentWillUnmount) {
				super.componentWillUnmount();
			}

			removeListeners(Base.getStores()).map(actionWithListener(this._onChange));
		}

		_onChange() {
			let {state, props, context} = this;
			if( !shallowEqual(state, Base.calculateState(undefined, props, context, state)) ) {
				this.setState(Base.calculateState(undefined, props, context, state));
			}
		}

	}

	return ContainerClass;

}

module.exports = ReduxDecorator;