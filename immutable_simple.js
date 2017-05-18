let _ = module.exports;


//  always return new object
let clone = _.clone = function(target) {

        let type = typeOf(target);

        if (type === 'array') {
            return exports.slice(target);
        }
        if (type === 'object') {
            return extend({}, target)
        }
        return target;

    }
/*
 * _.dset(state, target, "dimension")
 * @TODO: Immutable settter and getter
 * 说明：将state下的dimension(pathes路径),修改为target,如果是replace== true则是替换，否则的话是构成一个新的
 */
let dset = _.dset = function(target, assignment, pathes, options) {


    if (options === true) options = {
        replace: true
    }
    options = options || {};

    let replace = options.replace;

    if (typeof pathes === 'number') pathes = '' + pathes;
    if (typeof pathes === 'string') pathes = pathes.split('.');

    pathes = pathes || [];

    // _.extend(state, [1,2,3], 'b.dimensions', true);

    let tType = typeOf(target),
        aType = typeOf(assignment),
        len = pathes.length;

    if (!len) {
        return !replace && (tType === 'object' && aType === 'object') ?
            assign({}, target, assignment) : assignment;
    }

    let nextPath = pathes.shift();
    let dest = clone(target);

    if (dest === undefined && options.autoCreated) {
        dest = {}
    }

    dest[nextPath] = dset(dest[nextPath], assignment, pathes, options)

    return dest;

}

let dget = _.dget = function(target, pathes) {
    if (typeof pathes === 'string') pathes = pathes.split('.');
    pathes.some(function(p) {
        target = target[p]
        if (target == null) return true
    })
    return target;
}
