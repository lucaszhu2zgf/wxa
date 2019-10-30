import once from 'lodash/once';
import delay from 'lodash/delay';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

/**
 * mark methods to deprecate. while developer call it, print a warning text to console
 *
 * @param {any} target
 * @param {any} key
 * @param {any} descriptor
 */
function Deprecate(target, key, descriptor) {
    let fn = descriptor.value;

    descriptor.value = function(...args) {
        console.warn(`DEPRECATE: [${key}] This function will be removed in future versions.`);
        return fn.apply(this, args);
    };
}

/**
 * record timing that function consume.
 *
 * @param {any} name
 * @param {any} rest
 * @return {any}
 */
function Time(name, ...rest) {
    let h: any = (target, key, descriptor)=>{
        let fn = descriptor.value;
        let timer;

        let timeStart;
        let timeEnd;
        if (console != null && typeof console.time === 'function') {
            timeStart = console.time;
            timeEnd = console.timeEnd;
        } else {
            timeStart = ()=>{
                timer = Date.now();
            };

            timeEnd = (name)=>{
                let abstime = Date.now() - timer;

                console.log(name, '：', abstime);
            };
        }

        descriptor.value = function(...args) {
            timeStart(name || key);
            let r = fn.apply(this, args);

            if (r && typeof r.then === 'function') {
                return r.then((succ)=>{
                    timeEnd(name || key);
                    return Promise.resolve(succ);
                }, (fail)=>{
                    timeEnd(name || key);
                    return Promise.reject(fail);
                });
            } else {
                timeEnd(name || key);
                return r;
            }
        };
    };

    if (typeof name === 'string') {
        return h;
    } else {
        let args = [name, ...rest];
        name = void(0);
        h(...args);
    }
}
/**
 * debounce function with delay.
 * @param {number} [delay=300]
 * @param {Object} [options={leading: true, trailing: false}]
 * @return {any}
 */
function Debounce(...args) {
    let delay = 300;
    let options = {leading: true, trailing: false};

    let d: any = (target: any, key: any, descriptor: any)=>{
        let fn = descriptor.value;
        descriptor.value = debounce(fn, delay, options);
    };

    const isWithOptions = typeof args[0] === 'number';
    if (isWithOptions) {
        delay = args[0] || delay;
        options = args[1] || options;
        return d;
    } else {
        d(...args);
    }
}

function Throttle(...args) {
    let first = 1000;
    let options = {leading: true, trailing: false};

    let d: any = (target: any, key: any, descriptor: any)=>{
        let fn = descriptor.value;
        descriptor.value = throttle(fn, first, options);
    };

    const isWithOptions = typeof args[0] === 'number';
    if (isWithOptions) {
        first = args[0] || first;
        options = args[1] || options;
        return d;
    } else {
        d(...args);
    }
}

function Once(target, key, descriptor) {
    let fn = descriptor.value;
    descriptor.value = once(fn);
}

function Delay(wait) {
    return function(target, key, descriptor) {
        let fn = descriptor.value;

        descriptor.value = function(...args) {
            return delay(fn, wait, ...args);
        };
    };
}

/**
 * Lock function util fn finish process
 *
 * @param {Object} target
 * @param {string} key
 * @param {Object} descriptor
 *
 */
function Lock(target, key, descriptor) {
    let fn = descriptor.value;
    let $$LockIsDoing = false;

    let reset = ()=>$$LockIsDoing=false;
    descriptor.value = function(...args) {
        if ($$LockIsDoing) return;
        $$LockIsDoing = true;

        let ret = fn.apply(this, args);

        if (ret && ret.then) {
            // is promise
            return ret.then((succ)=>{
                reset();
                return Promise.resolve(succ);
            }, (fail)=>{
                reset();
                return Promise.reject(fail);
            });
        } else {
            reset();
            return ret;
        }
    };
}

/**
 * specify if show loading while execute the function.
 *
 * @param {String} tips
 * @param {String} type
 *
 * @return {Function}
 */
export default function Loading(tips='Loading', type='loading') {
    return function(target, key, descriptor) {
        let map = {
            loading: {
                show: wx.showLoading,
                hide: wx.hideLoading,
            },
            bar: {
                show: wx.showNavigationBarLoading,
                hide: wx.hideNavigationBarLoading,
            },
        };

        let loader = map[type];
        let fn = descriptor.value;

        descriptor.value = function(...args) {
            loader.show({title: tips, mask: true});

            let ret = fn.call(this, ...args);

            if (ret && ret.then) {
                ret.then((succ)=>{
                    loader.hide();
                    return succ;
                }, (fail)=>{
                    loader.hide();
                    return Promise.reject(fail);
                });
            } else {
                loader.hide();
            }
        };

        return descriptor;
    };
}


export {
    Lock,
    Loading,
    Delay,
    Once,
    Throttle,
    Debounce,
    Deprecate,
    Time,
};
