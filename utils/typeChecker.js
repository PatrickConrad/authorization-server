const stocks = ['bonds', {litter: "big"}, 'stalks']

const isType = (value) => {
    if(value === undefined) {
    console.log('undefined')
    return undefined;
    }
    if(!value){
        console.log('null')   
        return null;
    }

    if(value.constructor.name === 'Array' || value.constructor.name === 'Object' || value.constructor.name === 'Boolean' || value.constructor.name === 'Function' || value.constructor.name === 'String' || value.constructor.name === 'Date' || value.constructor.name === 'RegExp' || value.constructor.name === 'Null' || value.constructor.name === 'Undefined'){
        console.log('name', value.constructor.name)
        return (value.constructor.name || 'undefined').toLowerCase();
        
    }
    const getMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(value)).slice(1).map(prop => eval(value[prop]))
    console.log("v", getMethods.filter(m=> m.constructor.name !== 'Function'))
    const notMethod = getMethods.filter(m=> m.constructor.name  !== 'Function')
    const setMethod = getMethods.map(m=> m.constructor.name)
    console.log('s', notMethod)
    console.log(getMethods)
    if(notMethod.length>0) return console.log('not method')
    const vals = Object.entries(value)
    const valPasses = vals.map(v=>{
        console.log(v[1].data.constructor.name.toLowerCase() !== v[1].expected)
        if(v[1].data.constructor.name.toLowerCase() !== v[1].expected) return {name: v[1].data.constructor.name.toLowerCase(), status: false};
        return {type: v[1].data.constructor.name.toLowerCase(), status: true}
    })
    console.log(valPasses)
    console.log('vals', [...vals, ...getMethods])
    const myKey = value.constructor.name
    return ({name: value.constructor.name.toLowerCase(), data: valPasses} || 'undefined');
}

const checkType = (type, expected) => {
    if(isType(type) === expected) return true;
    return false;
}

class Toco {
    constructor(data){
        this.help = {data, expected: 'string'}
    }
    intro(){
        console.log("Hello")
    }
    final(){
        console.log("Hello")
    }
}

const getType = (value) => {
            const func = ()=>{
                console.log("hi")
            }
        isType(new Toco('heloo'))
        console.log("isType", isType(new Toco('hi')))
        
        
        console.log("valsss", typeof func)
        if(typeof value == 'object'){
           if(Array.isArray(stocks)) {
            console.log('array')
            return 'array';
           }
           return 'object'
        }

        return typeof value
}

module.exports = {
    getType,
    checkType
}