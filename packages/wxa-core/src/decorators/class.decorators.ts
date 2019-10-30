import {classFactory} from './helpers';
import promisify from '../utils/promisify';
import {eventbus} from '../utils/eventbus';
import {router} from '../utils/router';
import wxapi from '../utils/wxapi';
import {storage} from '../utils/storage';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import * as helpers from '../utils/helpers';
import fetch from '../utils/fetch';
// import mixin from '../base/mixin';

// Class Decorators.
const Eventbus = classFactory('$eventbus', eventbus);
const Router = classFactory('$router', router);
const Wxapi = classFactory('$wxapi', wxapi(wx));
const Storage = classFactory('$storage', storage);
const Utils = classFactory('$utils', {
    debounce,
    promisify,
    throttle,
    ...helpers,
});
const Fetch = classFactory('$fetch', fetch);

// TODO: 暂时搁置，legacy decorator 不好实现增加 instance property 的功能
// 参考：https://www.typescriptlang.org/docs/handbook/decorators.html#property-decorators
//
// 不是不能，有个运行时的办法可以解决，但不能做静态分析
// 参考：https://stackoverflow.com/questions/54813329/adding-properties-to-a-class-via-decorators-in-typescript

// const Mixins = (...args)=>classFactory('mixins', [mixin({mixins: args})]);

const enhanceClass = (constructor) => {
    Utils(constructor);
    Storage(constructor);
    Wxapi(constructor);
    Router(constructor);
    Eventbus(constructor);
    Fetch(constructor);
};

// Page and App level class Decorators.
const Page = enhanceClass;
const App = enhanceClass;

export {
    Page,
    App,
    Storage,
    Wxapi,
    Router,
    Eventbus,
    Fetch,
    Utils,
    // Mixins,
};
