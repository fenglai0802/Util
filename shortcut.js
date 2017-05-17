/**
   * 自定义快捷键
   * @return {[type]} [description]
   * 不支持  A+Z 这种
   * shortcut(document or textarea).on({
      "Ctrl + Z": function(){

      },
      "Shift+Z": function(){

      }
   })
   */

// 判断MAC和给不同快捷键
let shortcut = (function() {

    function isBody(elem) {
        return (/^html|body$/i).test(elem.tagName);
    }


    return function shortcut(elem) {
        // 默认绑定document
        if (!elem) elem = document;

        var CODE_MAP = {


            'esc': 27,
            'enter': 13,
            'space': 32,
            'back': 46,
            'delete': 46,

            'up': 38,
            'right': 39,
            'down': 40,
            'left': 41

        }

        for (var flen = 12; flen--;) {
            CODE_MAP['f' + flen + 1] = 111 + flen;
        }

        var MODS = {
            'shift': 16,
            'ctrl': 17,
            'control': 17,
            'alt': 18,
            'option': 18,
            'command': 91
        }
        var MOD_MAP = {

            16: 'shiftKey',
            17: 'ctrlKey',
            18: 'altKey',
            91: 'metaKey'

        }


        var bindings = [],
            keysPressed = [],
            modsPressed = {},
            isBound = false,
            isLocked = false,
            isPressed = function(key) {
                if (typeof key === 'string') key = CODE_MAP[key.toLowerCase()] || key.toUpperCase().charCodeAt(0);
                return keysPressed.indexOf(key) !== -1
            }

        function clearAll() {
            keysPressed = [], modsPressed = {}
        }

        function bindEvent() {
            if (isBound) return;
            elem.addEventListener('keydown', capture)
            elem.addEventListener('keyup', release)
            window.addEventListener('focus', clearAll)
            isBound = true;
        }

        function unbindEvent() {
            elem.removeEventListener('keydown', capture)
            elem.removeEventListener('keyup', release)
            window.removeEventListener('focus', clearAll)
            isBound = false;
        }

        function keyCode(key) {

        }

        function capture(event) {
            // console.log('capture', event.keyCode, keysPressed, modsPressed)
            var keyCode = event.keyCode;
            if (keyCode === 224 || keyCode === 93) keyCode = 91
                //if (!isBody(event.target)) return;
            for (var i in MOD_MAP) {
                modsPressed[MOD_MAP[i]] = !!event[MOD_MAP[i]];
            }

            if (MOD_MAP[keyCode] || ~keysPressed.indexOf(keyCode)) {
                // @TODO
            } else {
                keysPressed.push(keyCode);
            }

            if (testMatch(event)) {
                event.preventDefault();
            }

            // mac下 metaKey 按下将导致其他键的release失效,
            // 所以统一在侦测后清理keyPressd
            if (modsPressed.metaKey) keysPressed = [];
        }

        function release(event) {
            var keyCode = event.keyCode;
            // console.log('release', event.keyCode, keysPressed, modsPressed)
            // FF cmd为224
            //
            if (keyCode === 224 || keyCode === 93) keyCode = 91
            var index = keysPressed.indexOf(keyCode);
            if (~index) keysPressed.splice(index, 1);
            if (MOD_MAP[keyCode] === 'metaKey') keysPressed = [];
            for (var i in MOD_MAP) {
                modsPressed[MOD_MAP[i]] = !!event[MOD_MAP[i]];
            }
        }

        // 测试是否满足
        function testMatch(ev) {
            var matched = false;

            bindings.forEach(function(binding) {

                var mods = binding.mods;

                var test = binding.keys.every(isPressed);

                if (test) {
                    for (var i in modsPressed) {
                        if (modsPressed[i] !== (mods.indexOf(i) !== -1)) {
                            test = false
                            break;
                        }
                    }
                }
                if (test) {
                    binding.listener(ev, binding)
                    matched = true;
                }
            })
            return matched;
        }

        function getKeys(combo) {
            var key = {
                keys: [],
                mods: []
            }
            combo.split('+')
                .forEach(function(name) {
                    name = name.trim();
                    var mod = MODS[name.toLowerCase()]
                    if (mod) key.mods.push(MOD_MAP[mod])
                    else key.keys.push(CODE_MAP[name.toLowerCase()] || name.toUpperCase().charCodeAt(0))
                })
            return key;
        }

        function on(combo, listener, once) {
            var unbinds = [];

            var type = _.typeOf(combo);

            switch (type) {
                case 'object':
                    once = listener;
                    for (var i in combo) unbinds.push(_on(i, combo[i], once));
                    break;
                case 'array':
                    unbinds = combo.map(function(co) {
                        return _on(co, listener, once)
                    });
                    break
                case 'string':
                    unbinds.push(_on(combo, listener))
                    break;
                default:
                    throw Error('不支持的combo参数')

            }
            return function() {
                unbinds.forEach(off);
            }

        }

        function off(binding) {
            var index = bindings.indexOf(binding)
            bindings.splice(index, 1);
        }


        function _on(combo, listener) {
            var binding = getKeys(combo);
            binding.name = combo;
            binding.listener = listener;
            bindings.push(binding);

            if (!isBound) bindEvent();

            return binding;

        }

        return {
            on: on,
            pressed: function(name) {
                var modKey = MOD_MAP[MODS[name]];
                if (modKey) return modsPressed[modKey];
                return isPressed(name);
            }
        }
    }
})();

module.exports = shortcut;
