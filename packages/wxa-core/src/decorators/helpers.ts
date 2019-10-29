export let classFactory = (name, fn)=>{
    return function(constructor) {
        constructor.prototype[name] = fn;
    };
};
