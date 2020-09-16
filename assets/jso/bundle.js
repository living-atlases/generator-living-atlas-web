
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var url_min = createCommonjsModule(function (module) {
    !function(t){var y=/^[a-z]+:/,d=/[-a-z0-9]+(\.[-a-z0-9])*:\d+/i,v=/\/\/(.*?)(?::(.*?))?@/,r=/^win/i,g=/:$/,m=/^\?/,q=/^#/,w=/(.*\/)/,A=/^\/{2,}/,I=/(^\/?)/,e=/'/g,o=/%([ef][0-9a-f])%([89ab][0-9a-f])%([89ab][0-9a-f])/gi,n=/%([cd][0-9a-f])%([89ab][0-9a-f])/gi,i=/%([0-7][0-9a-f])/gi,s=/\+/g,a=/^\w:$/,C=/[^/#?]/;var p,S="undefined"==typeof window&&"undefined"!=typeof commonjsGlobal&&"function"==typeof commonjsRequire,b=!S&&t.navigator&&t.navigator.userAgent&&~t.navigator.userAgent.indexOf("MSIE"),x=S?t.require:null,j={protocol:"protocol",host:"hostname",port:"port",path:"pathname",query:"search",hash:"hash"},z={ftp:21,gopher:70,http:80,https:443,ws:80,wss:443};function E(){return S?p=p||"file://"+(process.platform.match(r)?"/":"")+x("fs").realpathSync("."):"about:srcdoc"===document.location.href?self.parent.document.location.href:document.location.href}function h(t,r,e){var o,n,i;r=r||E(),S?o=x("url").parse(r):(o=document.createElement("a")).href=r;var a,s,p=(s={path:!0,query:!0,hash:!0},(a=r)&&y.test(a)&&(s.protocol=!0,s.host=!0,d.test(a)&&(s.port=!0),v.test(a)&&(s.user=!0,s.pass=!0)),s);for(n in i=r.match(v)||[],j)p[n]?t[n]=o[j[n]]||"":t[n]="";if(t.protocol=t.protocol.replace(g,""),t.query=t.query.replace(m,""),t.hash=F(t.hash.replace(q,"")),t.user=F(i[1]||""),t.pass=F(i[2]||""),t.port=z[t.protocol]==t.port||0==t.port?"":t.port,!p.protocol&&C.test(r.charAt(0))&&(t.path=r.split("?")[0].split("#")[0]),!p.protocol&&e){var h=new L(E().match(w)[0]),u=h.path.split("/"),c=t.path.split("/"),f=["protocol","user","pass","host","port"],l=f.length;for(u.pop(),n=0;n<l;n++)t[f[n]]=h[f[n]];for(;".."===c[0];)u.pop(),c.shift();t.path=("/"!==r.charAt(0)?u.join("/"):"")+"/"+c.join("/");}t.path=t.path.replace(A,"/"),b&&(t.path=t.path.replace(I,"/")),t.paths(t.paths()),t.query=new U(t.query);}function u(t){return encodeURIComponent(t).replace(e,"%27")}function F(t){return (t=(t=(t=t.replace(s," ")).replace(o,function(t,r,e,o){var n=parseInt(r,16)-224,i=parseInt(e,16)-128;if(0==n&&i<32)return t;var a=(n<<12)+(i<<6)+(parseInt(o,16)-128);return 65535<a?t:String.fromCharCode(a)})).replace(n,function(t,r,e){var o=parseInt(r,16)-192;if(o<2)return t;var n=parseInt(e,16)-128;return String.fromCharCode((o<<6)+n)})).replace(i,function(t,r){return String.fromCharCode(parseInt(r,16))})}function U(t){for(var r=t.split("&"),e=0,o=r.length;e<o;e++){var n=r[e].split("="),i=decodeURIComponent(n[0].replace(s," "));if(i){var a=void 0!==n[1]?F(n[1]):null;void 0===this[i]?this[i]=a:(this[i]instanceof Array||(this[i]=[this[i]]),this[i].push(a));}}}function L(t,r){h(this,t,!r);}U.prototype.toString=function(){var t,r,e="",o=u;for(t in this){var n=this[t];if(!(n instanceof Function||void 0===n))if(n instanceof Array){var i=n.length;if(!i){e+=(e?"&":"")+o(t)+"=";continue}for(r=0;r<i;r++){var a=n[r];void 0!==a&&(e+=e?"&":"",e+=o(t)+(null===a?"":"="+o(a)));}}else e+=e?"&":"",e+=o(t)+(null===n?"":"="+o(n));}return e},L.prototype.clearQuery=function(){for(var t in this.query)this.query[t]instanceof Function||delete this.query[t];return this},L.prototype.queryLength=function(){var t=0;for(var r in this.query)this.query[r]instanceof Function||t++;return t},L.prototype.isEmptyQuery=function(){return 0===this.queryLength()},L.prototype.paths=function(t){var r,e="",o=0;if(t&&t.length&&t+""!==t){for(this.isAbsolute()&&(e="/"),r=t.length;o<r;o++)t[o]=!o&&a.test(t[o])?t[o]:u(t[o]);this.path=e+t.join("/");}for(o=0,r=(t=("/"===this.path.charAt(0)?this.path.slice(1):this.path).split("/")).length;o<r;o++)t[o]=F(t[o]);return t},L.prototype.encode=u,L.prototype.decode=F,L.prototype.isAbsolute=function(){return this.protocol||"/"===this.path.charAt(0)},L.prototype.toString=function(){return (this.protocol&&this.protocol+"://")+(this.user&&u(this.user)+(this.pass&&":"+u(this.pass))+"@")+(this.host&&this.host)+(this.port&&":"+this.port)+(this.path&&this.path)+(this.query.toString()&&"?"+this.query)+(this.hash&&"#"+u(this.hash))},t[t.exports?"exports":"Url"]=L;}(module.exports?module:window);
    });

    var projectNameRegexp = /\p{General_Category=Letter}/u;
    var domainRegexp = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;
    var hostnameRegexp = /^[._\-a-z0-9A-Z, ]+$/;
    //module.exports.shortNameRegexp = /^[._\-a-z0-9A-Z ]+$/;
    var shortNameRegexp = /\p{General_Category=Letter}/u;

    /* node_modules/smelte/src/components/Icon/Icon.svelte generated by Svelte v3.24.1 */

    const file = "node_modules/smelte/src/components/Icon/Icon.svelte";

    function create_fragment(ctx) {
    	let i;
    	let i_class_value;
    	let i_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "material-icons icon text-xl " + /*$$props*/ ctx[5].class + " duration-200 ease-in" + " svelte-zzky5a");
    			attr_dev(i, "style", i_style_value = /*color*/ ctx[4] ? `color: ${/*color*/ ctx[4]}` : "");
    			toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			toggle_class(i, "tip", /*tip*/ ctx[3]);
    			toggle_class(i, "text-base", /*small*/ ctx[0]);
    			toggle_class(i, "text-xs", /*xs*/ ctx[1]);
    			add_location(i, file, 20, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 32 && i_class_value !== (i_class_value = "material-icons icon text-xl " + /*$$props*/ ctx[5].class + " duration-200 ease-in" + " svelte-zzky5a")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*color*/ 16 && i_style_value !== (i_style_value = /*color*/ ctx[4] ? `color: ${/*color*/ ctx[4]}` : "")) {
    				attr_dev(i, "style", i_style_value);
    			}

    			if (dirty & /*$$props, reverse*/ 36) {
    				toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			}

    			if (dirty & /*$$props, tip*/ 40) {
    				toggle_class(i, "tip", /*tip*/ ctx[3]);
    			}

    			if (dirty & /*$$props, small*/ 33) {
    				toggle_class(i, "text-base", /*small*/ ctx[0]);
    			}

    			if (dirty & /*$$props, xs*/ 34) {
    				toggle_class(i, "text-xs", /*xs*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { small = false } = $$props;
    	let { xs = false } = $$props;
    	let { reverse = false } = $$props;
    	let { tip = false } = $$props;
    	let { color = "default" } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Icon", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("small" in $$new_props) $$invalidate(0, small = $$new_props.small);
    		if ("xs" in $$new_props) $$invalidate(1, xs = $$new_props.xs);
    		if ("reverse" in $$new_props) $$invalidate(2, reverse = $$new_props.reverse);
    		if ("tip" in $$new_props) $$invalidate(3, tip = $$new_props.tip);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ small, xs, reverse, tip, color });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("small" in $$props) $$invalidate(0, small = $$new_props.small);
    		if ("xs" in $$props) $$invalidate(1, xs = $$new_props.xs);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$new_props.reverse);
    		if ("tip" in $$props) $$invalidate(3, tip = $$new_props.tip);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [small, xs, reverse, tip, color, $$props, $$scope, $$slots, click_handler];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			small: 0,
    			xs: 1,
    			reverse: 2,
    			tip: 3,
    			color: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get small() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const noDepth = ["white", "black", "transparent"];

    function getClass(prop, color, depth, defaultDepth) {
      if (noDepth.includes(color)) {
        return `${prop}-${color}`;
      }
      return `${prop}-${color}-${depth || defaultDepth} `;
    }

    function utils(color, defaultDepth = 500) {
      return {
        bg: depth => getClass("bg", color, depth, defaultDepth),
        border: depth => getClass("border", color, depth, defaultDepth),
        txt: depth => getClass("text", color, depth, defaultDepth),
        caret: depth => getClass("caret", color, depth, defaultDepth)
      };
    }

    class ClassBuilder {
      constructor(classes, defaultClasses) {
        this.defaults =
          (typeof classes === "function" ? classes(defaultClasses) : classes) ||
          defaultClasses;

        this.classes = this.defaults;
      }

      flush() {
        this.classes = this.defaults;

        return this;
      }

      extend(...fns) {
        return this;
      }

      get() {
        return this.classes;
      }

      replace(classes, cond = true) {
        if (cond && classes) {
          this.classes = Object.keys(classes).reduce(
            (acc, from) => acc.replace(new RegExp(from, "g"), classes[from]),
            this.classes
          );
        }

        return this;
      }

      remove(classes, cond = true) {
        if (cond && classes) {
          this.classes = classes
            .split(" ")
            .reduce(
              (acc, cur) => acc.replace(new RegExp(cur, "g"), ""),
              this.classes
            );
        }

        return this;
      }

      add(className, cond = true, defaultValue) {
        if (!cond || !className) return this;

        switch (typeof className) {
          case "string":
          default:
            this.classes += ` ${className} `;
            return this;
          case "function":
            this.classes += ` ${className(defaultValue || this.classes)} `;
            return this;
        }
      }
    }

    const defaultReserved = ["class", "add", "remove", "replace", "value"];

    function filterProps(reserved, props) {
      const r = [...reserved, ...defaultReserved];

      return Object.keys(props).reduce(
        (acc, cur) =>
          cur.includes("$$") || cur.includes("Class") || r.includes(cur)
            ? acc
            : { ...acc, [cur]: props[cur] },
        {}
      );
    }

    // Thanks Lagden! https://svelte.dev/repl/61d9178d2b9944f2aa2bfe31612ab09f?version=3.6.7
    function ripple(color, centered) {
      return function(event) {
        const target = event.currentTarget;
        const circle = document.createElement("span");
        const d = Math.max(target.clientWidth, target.clientHeight);

        const removeCircle = () => {
          circle.remove();
          circle.removeEventListener("animationend", removeCircle);
        };

        circle.addEventListener("animationend", removeCircle);
        circle.style.width = circle.style.height = `${d}px`;
        const rect = target.getBoundingClientRect();

        if (centered) {
          circle.classList.add(
            "absolute",
            "top-0",
            "left-0",
            "ripple-centered",
            `bg-${color}-transDark`
          );
        } else {
          circle.style.left = `${event.clientX - rect.left - d / 2}px`;
          circle.style.top = `${event.clientY - rect.top - d / 2}px`;

          circle.classList.add("ripple-normal", `bg-${color}-trans`);
        }

        circle.classList.add("ripple");

        target.appendChild(circle);
      };
    }

    function r(color = "primary", centered = false) {
      return function(node) {
        const onMouseDown = ripple(color, centered);
        node.addEventListener("mousedown", onMouseDown);

        return {
          onDestroy: () => node.removeEventListener("mousedown", onMouseDown),
        };
      };
    }

    /* node_modules/smelte/src/components/Button/Button.svelte generated by Svelte v3.24.1 */
    const file$1 = "node_modules/smelte/src/components/Button/Button.svelte";

    // (150:0) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t;
    	let ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[3] && create_if_block_2(ctx);
    	const default_slot_template = /*$$slots*/ ctx[29].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], null);

    	let button_levels = [
    		{ class: /*classes*/ ctx[1] },
    		/*props*/ ctx[8],
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$1, 150, 2, 4051);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(ripple_action = /*ripple*/ ctx[7].call(null, button)),
    					listen_dev(button, "click", /*click_handler_3*/ ctx[37], false, false, false),
    					listen_dev(button, "click", /*click_handler_1*/ ctx[33], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler_1*/ ctx[34], false, false, false),
    					listen_dev(button, "*", /*_handler_1*/ ctx[35], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[38], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*classes*/ 2) && { class: /*classes*/ ctx[1] },
    				/*props*/ ctx[8],
    				(!current || dirty[0] & /*disabled*/ 4) && { disabled: /*disabled*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block.name,
    		type: "else",
    		source: "(150:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (129:0) {#if href}
    function create_if_block(ctx) {
    	let a;
    	let button;
    	let t;
    	let ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[3] && create_if_block_1(ctx);
    	const default_slot_template = /*$$slots*/ ctx[29].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], null);

    	let button_levels = [
    		{ class: /*classes*/ ctx[1] },
    		/*props*/ ctx[8],
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	let a_levels = [{ href: /*href*/ ctx[5] }, /*props*/ ctx[8]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$1, 133, 4, 3751);
    			set_attributes(a, a_data);
    			add_location(a, file$1, 129, 2, 3714);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(ripple_action = /*ripple*/ ctx[7].call(null, button)),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[36], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[30], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler*/ ctx[31], false, false, false),
    					listen_dev(button, "*", /*_handler*/ ctx[32], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[38], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*classes*/ 2) && { class: /*classes*/ ctx[1] },
    				/*props*/ ctx[8],
    				(!current || dirty[0] & /*disabled*/ 4) && { disabled: /*disabled*/ ctx[2] }
    			]));

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty[0] & /*href*/ 32) && { href: /*href*/ ctx[5] },
    				/*props*/ ctx[8]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block.name,
    		type: "if",
    		source: "(129:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (161:4) {#if icon}
    function create_if_block_2(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: /*iClasses*/ ctx[6],
    				small: /*small*/ ctx[4],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iClasses*/ 64) icon_1_changes.class = /*iClasses*/ ctx[6];
    			if (dirty[0] & /*small*/ 16) icon_1_changes.small = /*small*/ ctx[4];

    			if (dirty[0] & /*icon*/ 8 | dirty[1] & /*$$scope*/ 128) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(161:4) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (162:6) <Icon class={iClasses} {small}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 8) set_data_dev(t, /*icon*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(162:6) <Icon class={iClasses} {small}>",
    		ctx
    	});

    	return block_1;
    }

    // (144:6) {#if icon}
    function create_if_block_1(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: /*iClasses*/ ctx[6],
    				small: /*small*/ ctx[4],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iClasses*/ 64) icon_1_changes.class = /*iClasses*/ ctx[6];
    			if (dirty[0] & /*small*/ 16) icon_1_changes.small = /*small*/ ctx[4];

    			if (dirty[0] & /*icon*/ 8 | dirty[1] & /*$$scope*/ 128) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(144:6) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (145:8) <Icon class={iClasses} {small}>
    function create_default_slot(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 8) set_data_dev(t, /*icon*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(145:8) <Icon class={iClasses} {small}>",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    const classesDefault = "py-2 px-4 uppercase text-sm font-medium relative overflow-hidden";
    const basicDefault = "text-white duration-200 ease-in";
    const outlinedDefault = "bg-transparent border border-solid";
    const textDefault = "bg-transparent border-none px-4 hover:bg-transparent";
    const iconDefault = "p-4 flex items-center select-none";
    const fabDefault = "hover:bg-transparent";
    const smallDefault = "pt-1 pb-1 pl-2 pr-2 text-xs";
    const disabledDefault = "bg-gray-300 text-gray-500 dark:bg-dark-400 elevation-none pointer-events-none hover:bg-gray-300 cursor-default";
    const elevationDefault = "hover:elevation-5 elevation-3";

    function instance$1($$self, $$props, $$invalidate) {
    	let { value = false } = $$props;
    	let { outlined = false } = $$props;
    	let { text = false } = $$props;
    	let { block = false } = $$props;
    	let { disabled = false } = $$props;
    	let { icon = null } = $$props;
    	let { small = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { flat = false } = $$props;
    	let { iconClass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { href = null } = $$props;
    	let { fab = false } = $$props;
    	let { remove = "" } = $$props;
    	let { add = "" } = $$props;
    	let { replace = {} } = $$props;
    	let { classes = classesDefault } = $$props;
    	let { basicClasses = basicDefault } = $$props;
    	let { outlinedClasses = outlinedDefault } = $$props;
    	let { textClasses = textDefault } = $$props;
    	let { iconClasses = iconDefault } = $$props;
    	let { fabClasses = fabDefault } = $$props;
    	let { smallClasses = smallDefault } = $$props;
    	let { disabledClasses = disabledDefault } = $$props;
    	let { elevationClasses = elevationDefault } = $$props;
    	fab = fab || text && icon;
    	const basic = !outlined && !text && !fab;
    	const elevation = (basic || icon) && !disabled && !flat && !text;
    	let Classes = i => i;
    	let iClasses = i => i;
    	let shade = 0;
    	const { bg, border, txt } = utils(color);
    	const cb = new ClassBuilder(classes, classesDefault);
    	let iconCb;

    	if (icon) {
    		iconCb = new ClassBuilder(iconClass);
    	}

    	const ripple = r(text || fab || outlined ? color : "white");

    	const props = filterProps(
    		[
    			"outlined",
    			"text",
    			"color",
    			"block",
    			"disabled",
    			"icon",
    			"small",
    			"light",
    			"dark",
    			"flat",
    			"add",
    			"remove",
    			"replace"
    		],
    		$$props
    	);

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function _handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble($$self, event);
    	}

    	function _handler_1(event) {
    		bubble($$self, event);
    	}

    	const click_handler_2 = () => $$invalidate(0, value = !value);
    	const click_handler_3 = () => $$invalidate(0, value = !value);

    	$$self.$$set = $$new_props => {
    		$$invalidate(50, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("outlined" in $$new_props) $$invalidate(10, outlined = $$new_props.outlined);
    		if ("text" in $$new_props) $$invalidate(11, text = $$new_props.text);
    		if ("block" in $$new_props) $$invalidate(12, block = $$new_props.block);
    		if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("icon" in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ("small" in $$new_props) $$invalidate(4, small = $$new_props.small);
    		if ("light" in $$new_props) $$invalidate(13, light = $$new_props.light);
    		if ("dark" in $$new_props) $$invalidate(14, dark = $$new_props.dark);
    		if ("flat" in $$new_props) $$invalidate(15, flat = $$new_props.flat);
    		if ("iconClass" in $$new_props) $$invalidate(16, iconClass = $$new_props.iconClass);
    		if ("color" in $$new_props) $$invalidate(17, color = $$new_props.color);
    		if ("href" in $$new_props) $$invalidate(5, href = $$new_props.href);
    		if ("fab" in $$new_props) $$invalidate(9, fab = $$new_props.fab);
    		if ("remove" in $$new_props) $$invalidate(18, remove = $$new_props.remove);
    		if ("add" in $$new_props) $$invalidate(19, add = $$new_props.add);
    		if ("replace" in $$new_props) $$invalidate(20, replace = $$new_props.replace);
    		if ("classes" in $$new_props) $$invalidate(1, classes = $$new_props.classes);
    		if ("basicClasses" in $$new_props) $$invalidate(21, basicClasses = $$new_props.basicClasses);
    		if ("outlinedClasses" in $$new_props) $$invalidate(22, outlinedClasses = $$new_props.outlinedClasses);
    		if ("textClasses" in $$new_props) $$invalidate(23, textClasses = $$new_props.textClasses);
    		if ("iconClasses" in $$new_props) $$invalidate(24, iconClasses = $$new_props.iconClasses);
    		if ("fabClasses" in $$new_props) $$invalidate(25, fabClasses = $$new_props.fabClasses);
    		if ("smallClasses" in $$new_props) $$invalidate(26, smallClasses = $$new_props.smallClasses);
    		if ("disabledClasses" in $$new_props) $$invalidate(27, disabledClasses = $$new_props.disabledClasses);
    		if ("elevationClasses" in $$new_props) $$invalidate(28, elevationClasses = $$new_props.elevationClasses);
    		if ("$$scope" in $$new_props) $$invalidate(38, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Icon,
    		utils,
    		ClassBuilder,
    		filterProps,
    		createRipple: r,
    		value,
    		outlined,
    		text,
    		block,
    		disabled,
    		icon,
    		small,
    		light,
    		dark,
    		flat,
    		iconClass,
    		color,
    		href,
    		fab,
    		remove,
    		add,
    		replace,
    		classesDefault,
    		basicDefault,
    		outlinedDefault,
    		textDefault,
    		iconDefault,
    		fabDefault,
    		smallDefault,
    		disabledDefault,
    		elevationDefault,
    		classes,
    		basicClasses,
    		outlinedClasses,
    		textClasses,
    		iconClasses,
    		fabClasses,
    		smallClasses,
    		disabledClasses,
    		elevationClasses,
    		basic,
    		elevation,
    		Classes,
    		iClasses,
    		shade,
    		bg,
    		border,
    		txt,
    		cb,
    		iconCb,
    		ripple,
    		props,
    		normal,
    		lighter
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(50, $$props = assign(assign({}, $$props), $$new_props));
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("outlined" in $$props) $$invalidate(10, outlined = $$new_props.outlined);
    		if ("text" in $$props) $$invalidate(11, text = $$new_props.text);
    		if ("block" in $$props) $$invalidate(12, block = $$new_props.block);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("icon" in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ("small" in $$props) $$invalidate(4, small = $$new_props.small);
    		if ("light" in $$props) $$invalidate(13, light = $$new_props.light);
    		if ("dark" in $$props) $$invalidate(14, dark = $$new_props.dark);
    		if ("flat" in $$props) $$invalidate(15, flat = $$new_props.flat);
    		if ("iconClass" in $$props) $$invalidate(16, iconClass = $$new_props.iconClass);
    		if ("color" in $$props) $$invalidate(17, color = $$new_props.color);
    		if ("href" in $$props) $$invalidate(5, href = $$new_props.href);
    		if ("fab" in $$props) $$invalidate(9, fab = $$new_props.fab);
    		if ("remove" in $$props) $$invalidate(18, remove = $$new_props.remove);
    		if ("add" in $$props) $$invalidate(19, add = $$new_props.add);
    		if ("replace" in $$props) $$invalidate(20, replace = $$new_props.replace);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ("basicClasses" in $$props) $$invalidate(21, basicClasses = $$new_props.basicClasses);
    		if ("outlinedClasses" in $$props) $$invalidate(22, outlinedClasses = $$new_props.outlinedClasses);
    		if ("textClasses" in $$props) $$invalidate(23, textClasses = $$new_props.textClasses);
    		if ("iconClasses" in $$props) $$invalidate(24, iconClasses = $$new_props.iconClasses);
    		if ("fabClasses" in $$props) $$invalidate(25, fabClasses = $$new_props.fabClasses);
    		if ("smallClasses" in $$props) $$invalidate(26, smallClasses = $$new_props.smallClasses);
    		if ("disabledClasses" in $$props) $$invalidate(27, disabledClasses = $$new_props.disabledClasses);
    		if ("elevationClasses" in $$props) $$invalidate(28, elevationClasses = $$new_props.elevationClasses);
    		if ("Classes" in $$props) Classes = $$new_props.Classes;
    		if ("iClasses" in $$props) $$invalidate(6, iClasses = $$new_props.iClasses);
    		if ("shade" in $$props) $$invalidate(39, shade = $$new_props.shade);
    		if ("iconCb" in $$props) $$invalidate(40, iconCb = $$new_props.iconCb);
    		if ("normal" in $$props) $$invalidate(41, normal = $$new_props.normal);
    		if ("lighter" in $$props) $$invalidate(42, lighter = $$new_props.lighter);
    	};

    	let normal;
    	let lighter;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*light, dark*/ 24576 | $$self.$$.dirty[1] & /*shade*/ 256) {
    			 {
    				$$invalidate(39, shade = light ? 200 : 0);
    				$$invalidate(39, shade = dark ? -400 : shade);
    			}
    		}

    		if ($$self.$$.dirty[1] & /*shade*/ 256) {
    			 $$invalidate(41, normal = 500 - shade);
    		}

    		if ($$self.$$.dirty[1] & /*shade*/ 256) {
    			 $$invalidate(42, lighter = 400 - shade);
    		}

    		 $$invalidate(1, classes = cb.flush().add(basicClasses, basic, basicDefault).add(`${bg(normal)} hover:${bg(lighter)}`, basic).add(elevationClasses, elevation, elevationDefault).add(outlinedClasses, outlined, outlinedDefault).add(`${border(lighter)} ${txt(normal)} hover:${bg("trans")} dark-hover:${bg("transDark")}`, outlined).add(`${txt(lighter)}`, text).add(textClasses, text, textDefault).add(iconClasses, icon, iconDefault).remove("py-2", icon).remove(txt(lighter), fab).add(disabledClasses, disabled, disabledDefault).add(smallClasses, small, smallDefault).add("flex items-center justify-center h-8 w-8", small && icon).add("border-solid", outlined).add("rounded-full", icon).add("w-full", block).add("rounded", basic || outlined || text).add("button", !icon).add(fabClasses, fab, fabDefault).add(`hover:${bg("transLight")}`, fab).add($$props.class).remove(remove).replace(replace).add(add).get());

    		if ($$self.$$.dirty[0] & /*fab, iconClass*/ 66048 | $$self.$$.dirty[1] & /*iconCb*/ 512) {
    			 if (iconCb) {
    				$$invalidate(6, iClasses = iconCb.flush().add(txt(), fab && !iconClass).get());
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		classes,
    		disabled,
    		icon,
    		small,
    		href,
    		iClasses,
    		ripple,
    		props,
    		fab,
    		outlined,
    		text,
    		block,
    		light,
    		dark,
    		flat,
    		iconClass,
    		color,
    		remove,
    		add,
    		replace,
    		basicClasses,
    		outlinedClasses,
    		textClasses,
    		iconClasses,
    		fabClasses,
    		smallClasses,
    		disabledClasses,
    		elevationClasses,
    		$$slots,
    		click_handler,
    		mouseover_handler,
    		_handler,
    		click_handler_1,
    		mouseover_handler_1,
    		_handler_1,
    		click_handler_2,
    		click_handler_3,
    		$$scope
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				value: 0,
    				outlined: 10,
    				text: 11,
    				block: 12,
    				disabled: 2,
    				icon: 3,
    				small: 4,
    				light: 13,
    				dark: 14,
    				flat: 15,
    				iconClass: 16,
    				color: 17,
    				href: 5,
    				fab: 9,
    				remove: 18,
    				add: 19,
    				replace: 20,
    				classes: 1,
    				basicClasses: 21,
    				outlinedClasses: 22,
    				textClasses: 23,
    				iconClasses: 24,
    				fabClasses: 25,
    				smallClasses: 26,
    				disabledClasses: 27,
    				elevationClasses: 28
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get basicClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basicClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlinedClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlinedClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fabClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fabClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get smallClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set smallClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabledClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabledClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elevationClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elevationClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/Card/Card.svelte generated by Svelte v3.24.1 */
    const file$2 = "node_modules/smelte/src/components/Card/Card.svelte";
    const get_actions_slot_changes = dirty => ({});
    const get_actions_slot_context = ctx => ({});
    const get_text_slot_changes = dirty => ({});
    const get_text_slot_context = ctx => ({});
    const get_media_slot_changes = dirty => ({});
    const get_media_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	const title_slot_template = /*$$slots*/ ctx[6].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[5], get_title_slot_context);
    	const media_slot_template = /*$$slots*/ ctx[6].media;
    	const media_slot = create_slot(media_slot_template, ctx, /*$$scope*/ ctx[5], get_media_slot_context);
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	const text_slot_template = /*$$slots*/ ctx[6].text;
    	const text_slot = create_slot(text_slot_template, ctx, /*$$scope*/ ctx[5], get_text_slot_context);
    	const actions_slot_template = /*$$slots*/ ctx[6].actions;
    	const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[5], get_actions_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (title_slot) title_slot.c();
    			t0 = space();
    			if (media_slot) media_slot.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (text_slot) text_slot.c();
    			t3 = space();
    			if (actions_slot) actions_slot.c();
    			attr_dev(div, "class", /*c*/ ctx[0]);
    			add_location(div, file$2, 23, 0, 538);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (title_slot) {
    				title_slot.m(div, null);
    			}

    			append_dev(div, t0);

    			if (media_slot) {
    				media_slot.m(div, null);
    			}

    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t2);

    			if (text_slot) {
    				text_slot.m(div, null);
    			}

    			append_dev(div, t3);

    			if (actions_slot) {
    				actions_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}

    			if (media_slot) {
    				if (media_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(media_slot, media_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_media_slot_changes, get_media_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (text_slot) {
    				if (text_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(text_slot, text_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_text_slot_changes, get_text_slot_context);
    				}
    			}

    			if (actions_slot) {
    				if (actions_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(actions_slot, actions_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_actions_slot_changes, get_actions_slot_context);
    				}
    			}

    			if (!current || dirty & /*c*/ 1) {
    				attr_dev(div, "class", /*c*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(media_slot, local);
    			transition_in(default_slot, local);
    			transition_in(text_slot, local);
    			transition_in(actions_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(media_slot, local);
    			transition_out(default_slot, local);
    			transition_out(text_slot, local);
    			transition_out(actions_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot) title_slot.d(detaching);
    			if (media_slot) media_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (text_slot) text_slot.d(detaching);
    			if (actions_slot) actions_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$1 = "rounded inline-flex flex-col overflow-hidden duration-200 ease-in";

    function instance$2($$self, $$props, $$invalidate) {
    	let { hover = true } = $$props;
    	let { elevation = 1 } = $$props;
    	let { hoverElevation = 8 } = $$props;
    	let { classes = classesDefault$1 } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault$1);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, ['title','media','default','text','actions']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("hover" in $$new_props) $$invalidate(1, hover = $$new_props.hover);
    		if ("elevation" in $$new_props) $$invalidate(2, elevation = $$new_props.elevation);
    		if ("hoverElevation" in $$new_props) $$invalidate(3, hoverElevation = $$new_props.hoverElevation);
    		if ("classes" in $$new_props) $$invalidate(4, classes = $$new_props.classes);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		classesDefault: classesDefault$1,
    		hover,
    		elevation,
    		hoverElevation,
    		classes,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("hover" in $$props) $$invalidate(1, hover = $$new_props.hover);
    		if ("elevation" in $$props) $$invalidate(2, elevation = $$new_props.elevation);
    		if ("hoverElevation" in $$props) $$invalidate(3, hoverElevation = $$new_props.hoverElevation);
    		if ("classes" in $$props) $$invalidate(4, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(0, c = $$new_props.c);
    	};

    	let c;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(0, c = cb.flush().add(`elevation-${elevation} hover:elevation-${hoverElevation}`, hover).add(classes, true, classesDefault$1).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);
    	return [c, hover, elevation, hoverElevation, classes, $$scope, $$slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			hover: 1,
    			elevation: 2,
    			hoverElevation: 3,
    			classes: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get hover() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elevation() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elevation(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverElevation() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverElevation(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/Card/Title.svelte generated by Svelte v3.24.1 */
    const file$3 = "node_modules/smelte/src/components/Card/Title.svelte";

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div1;
    	let t1;
    	let t2;
    	let div2;
    	let t3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(/*subheader*/ ctx[1]);
    			attr_dev(img, "class", "rounded-full");
    			attr_dev(img, "width", "44");
    			attr_dev(img, "height", "44");
    			if (img.src !== (img_src_value = /*avatar*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			toggle_class(img, "hidden", !/*avatar*/ ctx[2]);
    			add_location(img, file$3, 24, 4, 472);
    			add_location(div0, file$3, 23, 2, 462);
    			attr_dev(div1, "class", "font-medium text-lg");
    			toggle_class(div1, "hidden", !/*title*/ ctx[0]);
    			add_location(div1, file$3, 33, 4, 648);
    			attr_dev(div2, "class", "text-sm text-gray-600 pt-0");
    			toggle_class(div2, "hidden", !/*subheader*/ ctx[1]);
    			add_location(div2, file$3, 34, 4, 721);
    			attr_dev(div3, "class", "pl-4 py-2");
    			add_location(div3, file$3, 32, 2, 620);
    			attr_dev(div4, "class", /*c*/ ctx[3]);
    			add_location(div4, file$3, 22, 0, 444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*avatar*/ 4 && img.src !== (img_src_value = /*avatar*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*avatar*/ 4) {
    				toggle_class(img, "hidden", !/*avatar*/ ctx[2]);
    			}

    			if (dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

    			if (dirty & /*title*/ 1) {
    				toggle_class(div1, "hidden", !/*title*/ ctx[0]);
    			}

    			if (dirty & /*subheader*/ 2) set_data_dev(t3, /*subheader*/ ctx[1]);

    			if (dirty & /*subheader*/ 2) {
    				toggle_class(div2, "hidden", !/*subheader*/ ctx[1]);
    			}

    			if (dirty & /*c*/ 8) {
    				attr_dev(div4, "class", /*c*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$2 = "flex px-4 py-2 items-center";

    function instance$3($$self, $$props, $$invalidate) {
    	const hover = true;
    	let { title = "" } = $$props;
    	let { subheader = "" } = $$props;
    	let { avatar = "" } = $$props;
    	let { classes = classesDefault$2 } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault$2);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Title", $$slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("title" in $$new_props) $$invalidate(0, title = $$new_props.title);
    		if ("subheader" in $$new_props) $$invalidate(1, subheader = $$new_props.subheader);
    		if ("avatar" in $$new_props) $$invalidate(2, avatar = $$new_props.avatar);
    		if ("classes" in $$new_props) $$invalidate(5, classes = $$new_props.classes);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		hover,
    		title,
    		subheader,
    		avatar,
    		classesDefault: classesDefault$2,
    		classes,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ("title" in $$props) $$invalidate(0, title = $$new_props.title);
    		if ("subheader" in $$props) $$invalidate(1, subheader = $$new_props.subheader);
    		if ("avatar" in $$props) $$invalidate(2, avatar = $$new_props.avatar);
    		if ("classes" in $$props) $$invalidate(5, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(3, c = $$new_props.c);
    	};

    	let c;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(3, c = cb.flush().add(classes, true, classesDefault$2).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);
    	return [title, subheader, avatar, c, hover, classes];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			hover: 4,
    			title: 0,
    			subheader: 1,
    			avatar: 2,
    			classes: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get hover() {
    		return this.$$.ctx[4];
    	}

    	set hover(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subheader() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subheader(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avatar() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatar(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Card$1 = {
      Card,
      Title
    };

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadIn(t) {
        return t * t;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* node_modules/smelte/src/components/Util/Spacer.svelte generated by Svelte v3.24.1 */

    const file$4 = "node_modules/smelte/src/components/Util/Spacer.svelte";

    function create_fragment$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "flex-grow");
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spacer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Spacer", $$slots, []);
    	return [];
    }

    class Spacer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spacer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const Spacer$1 = Spacer;

    /* node_modules/smelte/src/components/List/ListItem.svelte generated by Svelte v3.24.1 */
    const file$5 = "node_modules/smelte/src/components/List/ListItem.svelte";

    // (59:2) {#if icon}
    function create_if_block_1$1(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: "pr-6",
    				small: /*dense*/ ctx[3],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*dense*/ 8) icon_1_changes.small = /*dense*/ ctx[3];

    			if (dirty & /*$$scope, icon*/ 4194305) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(59:2) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (60:4) <Icon       class="pr-6"       small={dense}     >
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*icon*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 1) set_data_dev(t, /*icon*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(60:4) <Icon       class=\\\"pr-6\\\"       small={dense}     >",
    		ctx
    	});

    	return block;
    }

    // (70:12) {text}
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*text*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(70:12) {text}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#if subheading}
    function create_if_block$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*subheading*/ ctx[2]);
    			attr_dev(div, "class", /*subheadingClasses*/ ctx[5]);
    			add_location(div, file$5, 72, 6, 1808);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subheading*/ 4) set_data_dev(t, /*subheading*/ ctx[2]);

    			if (dirty & /*subheadingClasses*/ 32) {
    				attr_dev(div, "class", /*subheadingClasses*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(72:4) {#if subheading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let li;
    	let t0;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t1;
    	let ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[0] && create_if_block_1$1(ctx);
    	const default_slot_template = /*$$slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);
    	let if_block1 = /*subheading*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", div0_class_value = /*$$props*/ ctx[9].class);
    			add_location(div0, file$5, 68, 4, 1716);
    			attr_dev(div1, "class", "flex flex-col p-0");
    			add_location(div1, file$5, 67, 2, 1680);
    			attr_dev(li, "class", /*c*/ ctx[6]);
    			attr_dev(li, "tabindex", /*tabindex*/ ctx[4]);
    			add_location(li, file$5, 51, 0, 1479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if (if_block0) if_block0.m(li, null);
    			append_dev(li, t0);
    			append_dev(li, div1);
    			append_dev(div1, div0);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div0, null);
    			}

    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(ripple_action = /*ripple*/ ctx[7].call(null, li)),
    					listen_dev(li, "keypress", /*change*/ ctx[8], false, false, false),
    					listen_dev(li, "click", /*change*/ ctx[8], false, false, false),
    					listen_dev(li, "click", /*click_handler*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*icon*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(li, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*text*/ 2) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 512 && div0_class_value !== (div0_class_value = /*$$props*/ ctx[9].class)) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (/*subheading*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*c*/ 64) {
    				attr_dev(li, "class", /*c*/ ctx[6]);
    			}

    			if (!current || dirty & /*tabindex*/ 16) {
    				attr_dev(li, "tabindex", /*tabindex*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$3 = "focus:bg-gray-50 dark-focus:bg-gray-700 hover:bg-gray-transDark relative overflow-hidden duration-100 p-4 cursor-pointer text-gray-700 dark:text-gray-100 flex items-center z-10";
    const selectedClassesDefault = "bg-gray-200 dark:bg-primary-transLight";
    const subheadingClassesDefault = "text-gray-600 p-0 text-sm";

    function instance$5($$self, $$props, $$invalidate) {
    	let { icon = "" } = $$props;
    	let { id = "" } = $$props;
    	let { value = "" } = $$props;
    	let { text = "" } = $$props;
    	let { subheading = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { dense = false } = $$props;
    	let { selected = false } = $$props;
    	let { tabindex = null } = $$props;
    	let { selectedClasses = selectedClassesDefault } = $$props;
    	let { subheadingClasses = subheadingClassesDefault } = $$props;
    	let { to = "" } = $$props;
    	const item = null;
    	const items = [];
    	const level = null;
    	const ripple = r();
    	const dispatch = createEventDispatcher();

    	function change() {
    		if (disabled) return;
    		$$invalidate(10, value = id);
    		dispatch("change", id, to);
    	}

    	let { classes = classesDefault$3 } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault$3);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("icon" in $$new_props) $$invalidate(0, icon = $$new_props.icon);
    		if ("id" in $$new_props) $$invalidate(11, id = $$new_props.id);
    		if ("value" in $$new_props) $$invalidate(10, value = $$new_props.value);
    		if ("text" in $$new_props) $$invalidate(1, text = $$new_props.text);
    		if ("subheading" in $$new_props) $$invalidate(2, subheading = $$new_props.subheading);
    		if ("disabled" in $$new_props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ("dense" in $$new_props) $$invalidate(3, dense = $$new_props.dense);
    		if ("selected" in $$new_props) $$invalidate(13, selected = $$new_props.selected);
    		if ("tabindex" in $$new_props) $$invalidate(4, tabindex = $$new_props.tabindex);
    		if ("selectedClasses" in $$new_props) $$invalidate(14, selectedClasses = $$new_props.selectedClasses);
    		if ("subheadingClasses" in $$new_props) $$invalidate(5, subheadingClasses = $$new_props.subheadingClasses);
    		if ("to" in $$new_props) $$invalidate(15, to = $$new_props.to);
    		if ("classes" in $$new_props) $$invalidate(19, classes = $$new_props.classes);
    		if ("$$scope" in $$new_props) $$invalidate(22, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		createEventDispatcher,
    		Icon,
    		createRipple: r,
    		classesDefault: classesDefault$3,
    		selectedClassesDefault,
    		subheadingClassesDefault,
    		icon,
    		id,
    		value,
    		text,
    		subheading,
    		disabled,
    		dense,
    		selected,
    		tabindex,
    		selectedClasses,
    		subheadingClasses,
    		to,
    		item,
    		items,
    		level,
    		ripple,
    		dispatch,
    		change,
    		classes,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), $$new_props));
    		if ("icon" in $$props) $$invalidate(0, icon = $$new_props.icon);
    		if ("id" in $$props) $$invalidate(11, id = $$new_props.id);
    		if ("value" in $$props) $$invalidate(10, value = $$new_props.value);
    		if ("text" in $$props) $$invalidate(1, text = $$new_props.text);
    		if ("subheading" in $$props) $$invalidate(2, subheading = $$new_props.subheading);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ("dense" in $$props) $$invalidate(3, dense = $$new_props.dense);
    		if ("selected" in $$props) $$invalidate(13, selected = $$new_props.selected);
    		if ("tabindex" in $$props) $$invalidate(4, tabindex = $$new_props.tabindex);
    		if ("selectedClasses" in $$props) $$invalidate(14, selectedClasses = $$new_props.selectedClasses);
    		if ("subheadingClasses" in $$props) $$invalidate(5, subheadingClasses = $$new_props.subheadingClasses);
    		if ("to" in $$props) $$invalidate(15, to = $$new_props.to);
    		if ("classes" in $$props) $$invalidate(19, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(6, c = $$new_props.c);
    	};

    	let c;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(6, c = cb.flush().add(selectedClasses, selected, selectedClassesDefault).add("py-2", dense).add("text-gray-600", disabled).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		icon,
    		text,
    		subheading,
    		dense,
    		tabindex,
    		subheadingClasses,
    		c,
    		ripple,
    		change,
    		$$props,
    		value,
    		id,
    		disabled,
    		selected,
    		selectedClasses,
    		to,
    		item,
    		items,
    		level,
    		classes,
    		$$slots,
    		click_handler,
    		$$scope
    	];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			icon: 0,
    			id: 11,
    			value: 10,
    			text: 1,
    			subheading: 2,
    			disabled: 12,
    			dense: 3,
    			selected: 13,
    			tabindex: 4,
    			selectedClasses: 14,
    			subheadingClasses: 5,
    			to: 15,
    			item: 16,
    			items: 17,
    			level: 18,
    			classes: 19
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get icon() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subheading() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subheading(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedClasses() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedClasses(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subheadingClasses() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subheadingClasses(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get to() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		return this.$$.ctx[16];
    	}

    	set item(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		return this.$$.ctx[17];
    	}

    	set items(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get level() {
    		return this.$$.ctx[18];
    	}

    	set level(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/List/List.svelte generated by Svelte v3.24.1 */
    const file$6 = "node_modules/smelte/src/components/List/List.svelte";

    const get_item_slot_changes_1 = dirty => ({
    	item: dirty & /*items*/ 2,
    	dense: dirty & /*dense*/ 4,
    	value: dirty & /*value*/ 1
    });

    const get_item_slot_context_1 = ctx => ({
    	item: /*item*/ ctx[6],
    	dense: /*dense*/ ctx[2],
    	value: /*value*/ ctx[0]
    });

    const get_item_slot_changes = dirty => ({
    	item: dirty & /*items*/ 2,
    	dense: dirty & /*dense*/ 4,
    	value: dirty & /*value*/ 1
    });

    const get_item_slot_context = ctx => ({
    	item: /*item*/ ctx[6],
    	dense: /*dense*/ ctx[2],
    	value: /*value*/ ctx[0]
    });

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (55:4) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const item_slot_template = /*$$slots*/ ctx[12].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[18], get_item_slot_context_1);
    	const item_slot_or_fallback = item_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (item_slot_or_fallback) item_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (item_slot) {
    				if (item_slot.p && dirty & /*$$scope, items, dense, value*/ 262151) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_item_slot_changes_1, get_item_slot_context_1);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty & /*items, value, dense*/ 7) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(55:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if item.to !== undefined}
    function create_if_block$2(ctx) {
    	let current;
    	const item_slot_template = /*$$slots*/ ctx[12].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[18], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (item_slot_or_fallback) item_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (item_slot) {
    				if (item_slot.p && dirty & /*$$scope, items, dense, value*/ 262151) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_item_slot_changes, get_item_slot_context);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty & /*items, dense, value*/ 7) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(47:4) {#if item.to !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (57:8) <ListItem           bind:value           {selectedClasses}           {itemClasses}           {...item}           tabindex={i + 1}           id={id(item)}           selected={value === id(item)}           {dense}           on:change           on:click>
    function create_default_slot_1$1(ctx) {
    	let t_value = getText(/*item*/ ctx[6]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = getText(/*item*/ ctx[6]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(57:8) <ListItem           bind:value           {selectedClasses}           {itemClasses}           {...item}           tabindex={i + 1}           id={id(item)}           selected={value === id(item)}           {dense}           on:change           on:click>",
    		ctx
    	});

    	return block;
    }

    // (56:47)          
    function fallback_block_1(ctx) {
    	let listitem;
    	let updating_value;
    	let t;
    	let current;

    	const listitem_spread_levels = [
    		{
    			selectedClasses: /*selectedClasses*/ ctx[4]
    		},
    		{ itemClasses: /*itemClasses*/ ctx[5] },
    		/*item*/ ctx[6],
    		{ tabindex: /*i*/ ctx[22] + 1 },
    		{ id: id(/*item*/ ctx[6]) },
    		{
    			selected: /*value*/ ctx[0] === id(/*item*/ ctx[6])
    		},
    		{ dense: /*dense*/ ctx[2] }
    	];

    	function listitem_value_binding_1(value) {
    		/*listitem_value_binding_1*/ ctx[15].call(null, value);
    	}

    	let listitem_props = {
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < listitem_spread_levels.length; i += 1) {
    		listitem_props = assign(listitem_props, listitem_spread_levels[i]);
    	}

    	if (/*value*/ ctx[0] !== void 0) {
    		listitem_props.value = /*value*/ ctx[0];
    	}

    	listitem = new ListItem({ props: listitem_props, $$inline: true });
    	binding_callbacks.push(() => bind(listitem, "value", listitem_value_binding_1));
    	listitem.$on("change", /*change_handler_1*/ ctx[16]);
    	listitem.$on("click", /*click_handler*/ ctx[17]);

    	const block = {
    		c: function create() {
    			create_component(listitem.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = (dirty & /*selectedClasses, itemClasses, items, id, value, dense*/ 55)
    			? get_spread_update(listitem_spread_levels, [
    					dirty & /*selectedClasses*/ 16 && {
    						selectedClasses: /*selectedClasses*/ ctx[4]
    					},
    					dirty & /*itemClasses*/ 32 && { itemClasses: /*itemClasses*/ ctx[5] },
    					dirty & /*items*/ 2 && get_spread_object(/*item*/ ctx[6]),
    					listitem_spread_levels[3],
    					dirty & /*id, items*/ 2 && { id: id(/*item*/ ctx[6]) },
    					dirty & /*value, id, items*/ 3 && {
    						selected: /*value*/ ctx[0] === id(/*item*/ ctx[6])
    					},
    					dirty & /*dense*/ 4 && { dense: /*dense*/ ctx[2] }
    				])
    			: {};

    			if (dirty & /*$$scope, items*/ 262146) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				listitem_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			listitem.$set(listitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(56:47)          ",
    		ctx
    	});

    	return block;
    }

    // (50:10) <ListItem bind:value {...item} id={id(item)} {dense} on:change>
    function create_default_slot$2(ctx) {
    	let t_value = /*item*/ ctx[6].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*item*/ ctx[6].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(50:10) <ListItem bind:value {...item} id={id(item)} {dense} on:change>",
    		ctx
    	});

    	return block;
    }

    // (48:47)          
    function fallback_block$1(ctx) {
    	let a;
    	let listitem;
    	let updating_value;
    	let a_tabindex_value;
    	let a_href_value;
    	let t;
    	let current;
    	const listitem_spread_levels = [/*item*/ ctx[6], { id: id(/*item*/ ctx[6]) }, { dense: /*dense*/ ctx[2] }];

    	function listitem_value_binding(value) {
    		/*listitem_value_binding*/ ctx[13].call(null, value);
    	}

    	let listitem_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < listitem_spread_levels.length; i += 1) {
    		listitem_props = assign(listitem_props, listitem_spread_levels[i]);
    	}

    	if (/*value*/ ctx[0] !== void 0) {
    		listitem_props.value = /*value*/ ctx[0];
    	}

    	listitem = new ListItem({ props: listitem_props, $$inline: true });
    	binding_callbacks.push(() => bind(listitem, "value", listitem_value_binding));
    	listitem.$on("change", /*change_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(listitem.$$.fragment);
    			t = space();
    			attr_dev(a, "tabindex", a_tabindex_value = /*i*/ ctx[22] + 1);
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[6].to);
    			add_location(a, file$6, 48, 8, 1154);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			mount_component(listitem, a, null);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = (dirty & /*items, id, dense*/ 6)
    			? get_spread_update(listitem_spread_levels, [
    					dirty & /*items*/ 2 && get_spread_object(/*item*/ ctx[6]),
    					dirty & /*id, items*/ 2 && { id: id(/*item*/ ctx[6]) },
    					dirty & /*dense*/ 4 && { dense: /*dense*/ ctx[2] }
    				])
    			: {};

    			if (dirty & /*$$scope, items*/ 262146) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				listitem_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			listitem.$set(listitem_changes);

    			if (!current || dirty & /*items*/ 2 && a_href_value !== (a_href_value = /*item*/ ctx[6].to)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(listitem);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(48:47)          ",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#each items as item, i}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[6].to !== undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(46:2) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let ul;
    	let current;
    	let each_value = /*items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", /*c*/ ctx[7]);
    			toggle_class(ul, "rounded-t-none", /*select*/ ctx[3]);
    			add_location(ul, file$6, 44, 0, 994);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, id, dense, value, $$scope, undefined, selectedClasses, itemClasses, getText*/ 262199) {
    				each_value = /*items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*c*/ 128) {
    				attr_dev(ul, "class", /*c*/ ctx[7]);
    			}

    			if (dirty & /*c, select*/ 136) {
    				toggle_class(ul, "rounded-t-none", /*select*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$4 = "py-2 rounded";

    function id(i) {
    	if (i.id !== undefined) return i.id;
    	if (i.value !== undefined) return i.value;
    	if (i.to !== undefined) return i.to;
    	if (i.text !== undefined) return i.text;
    	return i;
    }

    function getText(i) {
    	if (i.text !== undefined) return i.text;
    	if (i.value !== undefined) return i.value;
    	return i;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { items = [] } = $$props;
    	let { value = "" } = $$props;
    	let { dense = false } = $$props;
    	let { select = false } = $$props;
    	const level = null;
    	const text = "";
    	const item = {};
    	const to = null;
    	const selectedClasses = i => i;
    	const itemClasses = i => i;
    	let { classes = classesDefault$4 } = $$props;
    	const cb = new ClassBuilder($$props.class);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("List", $$slots, ['item']);

    	function listitem_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function listitem_value_binding_1(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler_1(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(20, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("items" in $$new_props) $$invalidate(1, items = $$new_props.items);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("dense" in $$new_props) $$invalidate(2, dense = $$new_props.dense);
    		if ("select" in $$new_props) $$invalidate(3, select = $$new_props.select);
    		if ("classes" in $$new_props) $$invalidate(11, classes = $$new_props.classes);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		ListItem,
    		items,
    		value,
    		dense,
    		select,
    		level,
    		text,
    		item,
    		to,
    		selectedClasses,
    		itemClasses,
    		classesDefault: classesDefault$4,
    		classes,
    		id,
    		getText,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(20, $$props = assign(assign({}, $$props), $$new_props));
    		if ("items" in $$props) $$invalidate(1, items = $$new_props.items);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("dense" in $$props) $$invalidate(2, dense = $$new_props.dense);
    		if ("select" in $$props) $$invalidate(3, select = $$new_props.select);
    		if ("classes" in $$props) $$invalidate(11, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(7, c = $$new_props.c);
    	};

    	let c;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(7, c = cb.flush().add(classes, true, classesDefault$4).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		items,
    		dense,
    		select,
    		selectedClasses,
    		itemClasses,
    		item,
    		c,
    		level,
    		text,
    		to,
    		classes,
    		$$slots,
    		listitem_value_binding,
    		change_handler,
    		listitem_value_binding_1,
    		change_handler_1,
    		click_handler,
    		$$scope
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			items: 1,
    			value: 0,
    			dense: 2,
    			select: 3,
    			level: 8,
    			text: 9,
    			item: 6,
    			to: 10,
    			selectedClasses: 4,
    			itemClasses: 5,
    			classes: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get items() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get level() {
    		return this.$$.ctx[8];
    	}

    	set level(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		return this.$$.ctx[9];
    	}

    	set text(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		return this.$$.ctx[6];
    	}

    	set item(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get to() {
    		return this.$$.ctx[10];
    	}

    	set to(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedClasses() {
    		return this.$$.ctx[4];
    	}

    	set selectedClasses(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemClasses() {
    		return this.$$.ctx[5];
    	}

    	set itemClasses(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/TextField/Label.svelte generated by Svelte v3.24.1 */
    const file$7 = "node_modules/smelte/src/components/TextField/Label.svelte";

    function create_fragment$7(ctx) {
    	let label;
    	let label_class_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let label_levels = [
    		{
    			class: label_class_value = "" + (/*lClasses*/ ctx[0] + " " + /*$$props*/ ctx[2].class)
    		},
    		/*props*/ ctx[1]
    	];

    	let label_data = {};

    	for (let i = 0; i < label_levels.length; i += 1) {
    		label_data = assign(label_data, label_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot) default_slot.c();
    			set_attributes(label, label_data);
    			toggle_class(label, "svelte-r33x2y", true);
    			add_location(label, file$7, 74, 0, 1625);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}

    			set_attributes(label, label_data = get_spread_update(label_levels, [
    				(!current || dirty & /*lClasses, $$props*/ 5 && label_class_value !== (label_class_value = "" + (/*lClasses*/ ctx[0] + " " + /*$$props*/ ctx[2].class))) && { class: label_class_value },
    				/*props*/ ctx[1]
    			]));

    			toggle_class(label, "svelte-r33x2y", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { outlined = false } = $$props;
    	let { labelOnTop = false } = $$props;
    	let { prepend = false } = $$props;
    	let { color = "primary" } = $$props;
    	let { bgColor = "white" } = $$props;
    	let { dense = false } = $$props;
    	let labelDefault = `pt-4 absolute top-0 label-transition block pb-2 px-4 pointer-events-none cursor-text`;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { labelClasses = labelDefault } = $$props;
    	const { bg, border, txt, caret } = utils(color);
    	const l = new ClassBuilder(labelClasses, labelDefault);
    	let lClasses = i => i;
    	const props = filterProps(["focused", "error", "outlined", "labelOnTop", "prepend", "color", "dense"], $$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Label", $$slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("focused" in $$new_props) $$invalidate(3, focused = $$new_props.focused);
    		if ("error" in $$new_props) $$invalidate(4, error = $$new_props.error);
    		if ("outlined" in $$new_props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("labelOnTop" in $$new_props) $$invalidate(6, labelOnTop = $$new_props.labelOnTop);
    		if ("prepend" in $$new_props) $$invalidate(7, prepend = $$new_props.prepend);
    		if ("color" in $$new_props) $$invalidate(8, color = $$new_props.color);
    		if ("bgColor" in $$new_props) $$invalidate(9, bgColor = $$new_props.bgColor);
    		if ("dense" in $$new_props) $$invalidate(10, dense = $$new_props.dense);
    		if ("add" in $$new_props) $$invalidate(11, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(12, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(13, replace = $$new_props.replace);
    		if ("labelClasses" in $$new_props) $$invalidate(14, labelClasses = $$new_props.labelClasses);
    		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		ClassBuilder,
    		filterProps,
    		focused,
    		error,
    		outlined,
    		labelOnTop,
    		prepend,
    		color,
    		bgColor,
    		dense,
    		labelDefault,
    		add,
    		remove,
    		replace,
    		labelClasses,
    		bg,
    		border,
    		txt,
    		caret,
    		l,
    		lClasses,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("focused" in $$props) $$invalidate(3, focused = $$new_props.focused);
    		if ("error" in $$props) $$invalidate(4, error = $$new_props.error);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("labelOnTop" in $$props) $$invalidate(6, labelOnTop = $$new_props.labelOnTop);
    		if ("prepend" in $$props) $$invalidate(7, prepend = $$new_props.prepend);
    		if ("color" in $$props) $$invalidate(8, color = $$new_props.color);
    		if ("bgColor" in $$props) $$invalidate(9, bgColor = $$new_props.bgColor);
    		if ("dense" in $$props) $$invalidate(10, dense = $$new_props.dense);
    		if ("labelDefault" in $$props) labelDefault = $$new_props.labelDefault;
    		if ("add" in $$props) $$invalidate(11, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(12, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(13, replace = $$new_props.replace);
    		if ("labelClasses" in $$props) $$invalidate(14, labelClasses = $$new_props.labelClasses);
    		if ("lClasses" in $$props) $$invalidate(0, lClasses = $$new_props.lClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focused, error, labelOnTop, outlined, bgColor, prepend, dense, add, remove, replace*/ 16120) {
    			 $$invalidate(0, lClasses = l.flush().add(txt(), focused && !error).add("text-error-500", focused && error).add("label-top text-xs", labelOnTop).add("text-xs", focused).remove("pt-4 pb-2 px-4 px-1 pt-0", labelOnTop && outlined).add(`ml-3 p-1 pt-0 mt-0 bg-${bgColor} dark:bg-dark-500`, labelOnTop && outlined).remove("px-4", prepend).add("pr-4 pl-10", prepend).remove("pt-4", dense).add("pt-3", dense).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		lClasses,
    		props,
    		$$props,
    		focused,
    		error,
    		outlined,
    		labelOnTop,
    		prepend,
    		color,
    		bgColor,
    		dense,
    		add,
    		remove,
    		replace,
    		labelClasses,
    		$$scope,
    		$$slots
    	];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			focused: 3,
    			error: 4,
    			outlined: 5,
    			labelOnTop: 6,
    			prepend: 7,
    			color: 8,
    			bgColor: 9,
    			dense: 10,
    			add: 11,
    			remove: 12,
    			replace: 13,
    			labelClasses: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get focused() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelOnTop() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelOnTop(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClasses() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClasses(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/TextField/Hint.svelte generated by Svelte v3.24.1 */
    const file$8 = "node_modules/smelte/src/components/TextField/Hint.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let t0_value = (/*hint*/ ctx[1] || "") + "";
    	let t0;
    	let t1;
    	let t2_value = (/*error*/ ctx[0] || "") + "";
    	let t2;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			attr_dev(div, "class", /*classes*/ ctx[3]);
    			add_location(div, file$8, 36, 0, 797);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*hint*/ 2) && t0_value !== (t0_value = (/*hint*/ ctx[1] || "") + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*error*/ 1) && t2_value !== (t2_value = (/*error*/ ctx[0] || "") + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*classes*/ 8) {
    				attr_dev(div, "class", /*classes*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[2], true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[2], false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let classesDefault = "text-xs py-1 pl-4 absolute bottom-1 left-0";
    	let { error = false } = $$props;
    	let { hint = "" } = $$props;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { transitionProps = { y: -10, duration: 100, easing: quadOut } } = $$props;
    	const l = new ClassBuilder($$props.class, classesDefault);
    	let Classes = i => i;
    	const props = filterProps(["error", "hint"], $$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hint", $$slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("error" in $$new_props) $$invalidate(0, error = $$new_props.error);
    		if ("hint" in $$new_props) $$invalidate(1, hint = $$new_props.hint);
    		if ("add" in $$new_props) $$invalidate(4, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(5, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(6, replace = $$new_props.replace);
    		if ("transitionProps" in $$new_props) $$invalidate(2, transitionProps = $$new_props.transitionProps);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		ClassBuilder,
    		filterProps,
    		fly,
    		quadOut,
    		classesDefault,
    		error,
    		hint,
    		add,
    		remove,
    		replace,
    		transitionProps,
    		l,
    		Classes,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("classesDefault" in $$props) classesDefault = $$new_props.classesDefault;
    		if ("error" in $$props) $$invalidate(0, error = $$new_props.error);
    		if ("hint" in $$props) $$invalidate(1, hint = $$new_props.hint);
    		if ("add" in $$props) $$invalidate(4, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(5, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(6, replace = $$new_props.replace);
    		if ("transitionProps" in $$props) $$invalidate(2, transitionProps = $$new_props.transitionProps);
    		if ("Classes" in $$props) Classes = $$new_props.Classes;
    		if ("classes" in $$props) $$invalidate(3, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error, hint, add, remove, replace*/ 115) {
    			 $$invalidate(3, classes = l.flush().add("text-error-500", error).add("text-gray-600", hint).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [error, hint, transitionProps, classes, add, remove, replace];
    }

    class Hint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			error: 0,
    			hint: 1,
    			add: 4,
    			remove: 5,
    			replace: 6,
    			transitionProps: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hint",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get error() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionProps() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionProps(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/TextField/Underline.svelte generated by Svelte v3.24.1 */
    const file$9 = "node_modules/smelte/src/components/TextField/Underline.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-xd9zs6"));
    			set_style(div0, "height", "2px");
    			set_style(div0, "transition", "width .2s ease");
    			add_location(div0, file$9, 61, 2, 1133);
    			attr_dev(div1, "class", div1_class_value = "line absolute bottom-0 left-0 w-full bg-gray-600 " + /*$$props*/ ctx[3].class + " svelte-xd9zs6");
    			toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			add_location(div1, file$9, 58, 0, 1009);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*classes*/ 4 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-xd9zs6"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*$$props*/ 8 && div1_class_value !== (div1_class_value = "line absolute bottom-0 left-0 w-full bg-gray-600 " + /*$$props*/ ctx[3].class + " svelte-xd9zs6")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*$$props, noUnderline, outlined*/ 11) {
    				toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { noUnderline = false } = $$props;
    	let { outlined = false } = $$props;
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { color = "primary" } = $$props;
    	let defaultClasses = `mx-auto w-0`;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { lineClasses = defaultClasses } = $$props;
    	const { bg, border, txt, caret } = utils(color);
    	const l = new ClassBuilder(lineClasses, defaultClasses);
    	let Classes = i => i;
    	const props = filterProps(["focused", "error", "outlined", "labelOnTop", "prepend", "bgcolor", "color"], $$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Underline", $$slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("noUnderline" in $$new_props) $$invalidate(0, noUnderline = $$new_props.noUnderline);
    		if ("outlined" in $$new_props) $$invalidate(1, outlined = $$new_props.outlined);
    		if ("focused" in $$new_props) $$invalidate(4, focused = $$new_props.focused);
    		if ("error" in $$new_props) $$invalidate(5, error = $$new_props.error);
    		if ("color" in $$new_props) $$invalidate(6, color = $$new_props.color);
    		if ("add" in $$new_props) $$invalidate(7, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(8, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(9, replace = $$new_props.replace);
    		if ("lineClasses" in $$new_props) $$invalidate(10, lineClasses = $$new_props.lineClasses);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		ClassBuilder,
    		filterProps,
    		noUnderline,
    		outlined,
    		focused,
    		error,
    		color,
    		defaultClasses,
    		add,
    		remove,
    		replace,
    		lineClasses,
    		bg,
    		border,
    		txt,
    		caret,
    		l,
    		Classes,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("noUnderline" in $$props) $$invalidate(0, noUnderline = $$new_props.noUnderline);
    		if ("outlined" in $$props) $$invalidate(1, outlined = $$new_props.outlined);
    		if ("focused" in $$props) $$invalidate(4, focused = $$new_props.focused);
    		if ("error" in $$props) $$invalidate(5, error = $$new_props.error);
    		if ("color" in $$props) $$invalidate(6, color = $$new_props.color);
    		if ("defaultClasses" in $$props) defaultClasses = $$new_props.defaultClasses;
    		if ("add" in $$props) $$invalidate(7, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(8, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(9, replace = $$new_props.replace);
    		if ("lineClasses" in $$props) $$invalidate(10, lineClasses = $$new_props.lineClasses);
    		if ("Classes" in $$props) Classes = $$new_props.Classes;
    		if ("classes" in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focused, error, add, remove, replace*/ 944) {
    			 $$invalidate(2, classes = l.flush().add(txt(), focused && !error).add("bg-error-500", error).add("w-full", focused || error).add(bg(), focused).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		noUnderline,
    		outlined,
    		classes,
    		$$props,
    		focused,
    		error,
    		color,
    		add,
    		remove,
    		replace,
    		lineClasses
    	];
    }

    class Underline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			noUnderline: 0,
    			outlined: 1,
    			focused: 4,
    			error: 5,
    			color: 6,
    			add: 7,
    			remove: 8,
    			replace: 9,
    			lineClasses: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Underline",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get noUnderline() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineClasses() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineClasses(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/TextField/TextField.svelte generated by Svelte v3.24.1 */
    const file$a = "node_modules/smelte/src/components/TextField/TextField.svelte";
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (140:2) {#if label}
    function create_if_block_6(ctx) {
    	let current;
    	const label_slot_template = /*$$slots*/ ctx[40].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[60], get_label_slot_context);
    	const label_slot_or_fallback = label_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (label_slot_or_fallback) label_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (label_slot_or_fallback) {
    				label_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (label_slot) {
    				if (label_slot.p && dirty[1] & /*$$scope*/ 536870912) {
    					update_slot(label_slot, label_slot_template, ctx, /*$$scope*/ ctx[60], dirty, get_label_slot_changes, get_label_slot_context);
    				}
    			} else {
    				if (label_slot_or_fallback && label_slot_or_fallback.p && dirty[0] & /*labelOnTop, focused, error, outlined, prepend, color, bgColor, dense, label*/ 33952078) {
    					label_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (label_slot_or_fallback) label_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(140:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (142:4) <Label       {labelOnTop}       {focused}       {error}       {outlined}       {prepend}       {color}       {bgColor}       dense={dense && !outlined}     >
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*label*/ 8) set_data_dev(t, /*label*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(142:4) <Label       {labelOnTop}       {focused}       {error}       {outlined}       {prepend}       {color}       {bgColor}       dense={dense && !outlined}     >",
    		ctx
    	});

    	return block;
    }

    // (141:21)      
    function fallback_block_2(ctx) {
    	let label_1;
    	let current;

    	label_1 = new Label({
    			props: {
    				labelOnTop: /*labelOnTop*/ ctx[25],
    				focused: /*focused*/ ctx[1],
    				error: /*error*/ ctx[6],
    				outlined: /*outlined*/ ctx[2],
    				prepend: /*prepend*/ ctx[8],
    				color: /*color*/ ctx[17],
    				bgColor: /*bgColor*/ ctx[18],
    				dense: /*dense*/ ctx[12] && !/*outlined*/ ctx[2],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_1_changes = {};
    			if (dirty[0] & /*labelOnTop*/ 33554432) label_1_changes.labelOnTop = /*labelOnTop*/ ctx[25];
    			if (dirty[0] & /*focused*/ 2) label_1_changes.focused = /*focused*/ ctx[1];
    			if (dirty[0] & /*error*/ 64) label_1_changes.error = /*error*/ ctx[6];
    			if (dirty[0] & /*outlined*/ 4) label_1_changes.outlined = /*outlined*/ ctx[2];
    			if (dirty[0] & /*prepend*/ 256) label_1_changes.prepend = /*prepend*/ ctx[8];
    			if (dirty[0] & /*color*/ 131072) label_1_changes.color = /*color*/ ctx[17];
    			if (dirty[0] & /*bgColor*/ 262144) label_1_changes.bgColor = /*bgColor*/ ctx[18];
    			if (dirty[0] & /*dense, outlined*/ 4100) label_1_changes.dense = /*dense*/ ctx[12] && !/*outlined*/ ctx[2];

    			if (dirty[0] & /*label*/ 8 | dirty[1] & /*$$scope*/ 536870912) {
    				label_1_changes.$$scope = { dirty, ctx };
    			}

    			label_1.$set(label_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(141:21)      ",
    		ctx
    	});

    	return block;
    }

    // (186:36) 
    function create_if_block_5(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			input.readOnly = true;
    			attr_dev(input, "class", /*iClasses*/ ctx[26]);
    			input.disabled = /*disabled*/ ctx[20];
    			input.value = /*value*/ ctx[0];
    			add_location(input, file$a, 186, 4, 4892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler_2*/ ctx[51], false, false, false),
    					listen_dev(input, "input", /*input_handler_2*/ ctx[52], false, false, false),
    					listen_dev(input, "click", /*click_handler_2*/ ctx[53], false, false, false),
    					listen_dev(input, "blur", /*blur_handler_2*/ ctx[54], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_2*/ ctx[55], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iClasses*/ 67108864) {
    				attr_dev(input, "class", /*iClasses*/ ctx[26]);
    			}

    			if (dirty[0] & /*disabled*/ 1048576) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[20]);
    			}

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				prop_dev(input, "value", /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(186:36) ",
    		ctx
    	});

    	return block;
    }

    // (170:32) 
    function create_if_block_4(ctx) {
    	let textarea_1;
    	let textarea_1_placeholder_value;
    	let mounted;
    	let dispose;

    	let textarea_1_levels = [
    		{ rows: /*rows*/ ctx[10] },
    		{ class: /*iClasses*/ ctx[26] },
    		{ disabled: /*disabled*/ ctx[20] },
    		{ "aria-label": /*label*/ ctx[3] },
    		/*props*/ ctx[29],
    		{
    			placeholder: textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : ""
    		}
    	];

    	let textarea_1_data = {};

    	for (let i = 0; i < textarea_1_levels.length; i += 1) {
    		textarea_1_data = assign(textarea_1_data, textarea_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			set_attributes(textarea_1, textarea_1_data);
    			add_location(textarea_1, file$a, 170, 4, 4544);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);
    			set_input_value(textarea_1, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "change", /*change_handler_1*/ ctx[47], false, false, false),
    					listen_dev(textarea_1, "input", /*input_handler_1*/ ctx[48], false, false, false),
    					listen_dev(textarea_1, "click", /*click_handler_1*/ ctx[49], false, false, false),
    					listen_dev(textarea_1, "focus", /*focus_handler_1*/ ctx[46], false, false, false),
    					listen_dev(textarea_1, "blur", /*blur_handler_1*/ ctx[50], false, false, false),
    					listen_dev(textarea_1, "input", /*textarea_1_input_handler*/ ctx[57]),
    					listen_dev(textarea_1, "focus", /*toggleFocused*/ ctx[28], false, false, false),
    					listen_dev(textarea_1, "blur", /*toggleFocused*/ ctx[28], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea_1, textarea_1_data = get_spread_update(textarea_1_levels, [
    				dirty[0] & /*rows*/ 1024 && { rows: /*rows*/ ctx[10] },
    				dirty[0] & /*iClasses*/ 67108864 && { class: /*iClasses*/ ctx[26] },
    				dirty[0] & /*disabled*/ 1048576 && { disabled: /*disabled*/ ctx[20] },
    				dirty[0] & /*label*/ 8 && { "aria-label": /*label*/ ctx[3] },
    				/*props*/ ctx[29],
    				dirty[0] & /*value, placeholder*/ 17 && textarea_1_placeholder_value !== (textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : "") && {
    					placeholder: textarea_1_placeholder_value
    				}
    			]));

    			if (dirty[0] & /*value*/ 1) {
    				set_input_value(textarea_1, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(170:32) ",
    		ctx
    	});

    	return block;
    }

    // (155:2) {#if (!textarea && !select) || autocomplete}
    function create_if_block_3(ctx) {
    	let input;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{ "aria-label": /*label*/ ctx[3] },
    		/*props*/ ctx[29],
    		{ class: /*iClasses*/ ctx[26] },
    		{ disabled: /*disabled*/ ctx[20] },
    		{
    			placeholder: input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : ""
    		}
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 155, 4, 4216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "focus", /*toggleFocused*/ ctx[28], false, false, false),
    					listen_dev(input, "blur", /*toggleFocused*/ ctx[28], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[42], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[56]),
    					listen_dev(input, "change", /*change_handler*/ ctx[41], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[43], false, false, false),
    					listen_dev(input, "click", /*click_handler*/ ctx[44], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[45], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*label*/ 8 && { "aria-label": /*label*/ ctx[3] },
    				/*props*/ ctx[29],
    				dirty[0] & /*iClasses*/ 67108864 && { class: /*iClasses*/ ctx[26] },
    				dirty[0] & /*disabled*/ 1048576 && { disabled: /*disabled*/ ctx[20] },
    				dirty[0] & /*value, placeholder*/ 17 && input_placeholder_value !== (input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : "") && { placeholder: input_placeholder_value }
    			]));

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(155:2) {#if (!textarea && !select) || autocomplete}",
    		ctx
    	});

    	return block;
    }

    // (199:2) {#if append}
    function create_if_block_2$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const append_slot_template = /*$$slots*/ ctx[40].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[60], get_append_slot_context);
    	const append_slot_or_fallback = append_slot || fallback_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (append_slot_or_fallback) append_slot_or_fallback.c();
    			attr_dev(div, "class", /*aClasses*/ ctx[22]);
    			add_location(div, file$a, 199, 4, 5076);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (append_slot_or_fallback) {
    				append_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_3*/ ctx[58], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (append_slot) {
    				if (append_slot.p && dirty[1] & /*$$scope*/ 536870912) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[60], dirty, get_append_slot_changes, get_append_slot_context);
    				}
    			} else {
    				if (append_slot_or_fallback && append_slot_or_fallback.p && dirty[0] & /*appendReverse, focused, iconClass, append*/ 557186) {
    					append_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*aClasses*/ 4194304) {
    				attr_dev(div, "class", /*aClasses*/ ctx[22]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (append_slot_or_fallback) append_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(199:2) {#if append}",
    		ctx
    	});

    	return block;
    }

    // (205:8) <Icon           reverse={appendReverse}           class="{focused ? txt() : ""} {iconClass}"         >
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*append*/ ctx[7]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*append*/ 128) set_data_dev(t, /*append*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(205:8) <Icon           reverse={appendReverse}           class=\\\"{focused ? txt() : \\\"\\\"} {iconClass}\\\"         >",
    		ctx
    	});

    	return block;
    }

    // (204:26)          
    function fallback_block_1$1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				reverse: /*appendReverse*/ ctx[15],
    				class: "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : "") + " " + /*iconClass*/ ctx[19]),
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty[0] & /*appendReverse*/ 32768) icon_changes.reverse = /*appendReverse*/ ctx[15];
    			if (dirty[0] & /*focused, iconClass*/ 524290) icon_changes.class = "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : "") + " " + /*iconClass*/ ctx[19]);

    			if (dirty[0] & /*append*/ 128 | dirty[1] & /*$$scope*/ 536870912) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$1.name,
    		type: "fallback",
    		source: "(204:26)          ",
    		ctx
    	});

    	return block;
    }

    // (215:2) {#if prepend}
    function create_if_block_1$2(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*$$slots*/ ctx[40].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[60], get_prepend_slot_context);
    	const prepend_slot_or_fallback = prepend_slot || fallback_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (prepend_slot_or_fallback) prepend_slot_or_fallback.c();
    			attr_dev(div, "class", /*pClasses*/ ctx[23]);
    			add_location(div, file$a, 215, 4, 5385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (prepend_slot_or_fallback) {
    				prepend_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_4*/ ctx[59], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty[1] & /*$$scope*/ 536870912) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[60], dirty, get_prepend_slot_changes, get_prepend_slot_context);
    				}
    			} else {
    				if (prepend_slot_or_fallback && prepend_slot_or_fallback.p && dirty[0] & /*prependReverse, focused, iconClass, prepend*/ 590082) {
    					prepend_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*pClasses*/ 8388608) {
    				attr_dev(div, "class", /*pClasses*/ ctx[23]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (prepend_slot_or_fallback) prepend_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(215:2) {#if prepend}",
    		ctx
    	});

    	return block;
    }

    // (221:8) <Icon           reverse={prependReverse}           class="{focused ? txt() : ""} {iconClass}"         >
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*prepend*/ ctx[8]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*prepend*/ 256) set_data_dev(t, /*prepend*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(221:8) <Icon           reverse={prependReverse}           class=\\\"{focused ? txt() : \\\"\\\"} {iconClass}\\\"         >",
    		ctx
    	});

    	return block;
    }

    // (220:27)          
    function fallback_block$2(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				reverse: /*prependReverse*/ ctx[16],
    				class: "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : "") + " " + /*iconClass*/ ctx[19]),
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty[0] & /*prependReverse*/ 65536) icon_changes.reverse = /*prependReverse*/ ctx[16];
    			if (dirty[0] & /*focused, iconClass*/ 524290) icon_changes.class = "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : "") + " " + /*iconClass*/ ctx[19]);

    			if (dirty[0] & /*prepend*/ 256 | dirty[1] & /*$$scope*/ 536870912) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(220:27)          ",
    		ctx
    	});

    	return block;
    }

    // (237:2) {#if showHint}
    function create_if_block$3(ctx) {
    	let hint_1;
    	let current;

    	hint_1 = new Hint({
    			props: {
    				error: /*error*/ ctx[6],
    				hint: /*hint*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hint_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hint_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hint_1_changes = {};
    			if (dirty[0] & /*error*/ 64) hint_1_changes.error = /*error*/ ctx[6];
    			if (dirty[0] & /*hint*/ 32) hint_1_changes.hint = /*hint*/ ctx[5];
    			hint_1.$set(hint_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hint_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hint_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hint_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(237:2) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let underline;
    	let t4;
    	let current;
    	let if_block0 = /*label*/ ctx[3] && create_if_block_6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*textarea*/ ctx[9] && !/*select*/ ctx[11] || /*autocomplete*/ ctx[13]) return create_if_block_3;
    		if (/*textarea*/ ctx[9] && !/*select*/ ctx[11]) return create_if_block_4;
    		if (/*select*/ ctx[11] && !/*autocomplete*/ ctx[13]) return create_if_block_5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);
    	let if_block2 = /*append*/ ctx[7] && create_if_block_2$1(ctx);
    	let if_block3 = /*prepend*/ ctx[8] && create_if_block_1$2(ctx);

    	underline = new Underline({
    			props: {
    				noUnderline: /*noUnderline*/ ctx[14],
    				outlined: /*outlined*/ ctx[2],
    				focused: /*focused*/ ctx[1],
    				error: /*error*/ ctx[6]
    			},
    			$$inline: true
    		});

    	let if_block4 = /*showHint*/ ctx[24] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			create_component(underline.$$.fragment);
    			t4 = space();
    			if (if_block4) if_block4.c();
    			attr_dev(div, "class", /*wClasses*/ ctx[21]);
    			add_location(div, file$a, 138, 0, 3910);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			mount_component(underline, div, null);
    			append_dev(div, t4);
    			if (if_block4) if_block4.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*label*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			}

    			if (/*append*/ ctx[7]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*append*/ 128) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*prepend*/ ctx[8]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*prepend*/ 256) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			const underline_changes = {};
    			if (dirty[0] & /*noUnderline*/ 16384) underline_changes.noUnderline = /*noUnderline*/ ctx[14];
    			if (dirty[0] & /*outlined*/ 4) underline_changes.outlined = /*outlined*/ ctx[2];
    			if (dirty[0] & /*focused*/ 2) underline_changes.focused = /*focused*/ ctx[1];
    			if (dirty[0] & /*error*/ 64) underline_changes.error = /*error*/ ctx[6];
    			underline.$set(underline_changes);

    			if (/*showHint*/ ctx[24]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*showHint*/ 16777216) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$3(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*wClasses*/ 2097152) {
    				attr_dev(div, "class", /*wClasses*/ ctx[21]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(underline.$$.fragment, local);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(underline.$$.fragment, local);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			destroy_component(underline);
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$5 = "mt-2 mb-6 relative text-gray-600 dark:text-gray-100";
    const appendDefault = "absolute right-0 top-0 pb-2 pr-4 pt-4 text-gray-700 z-10";
    const prependDefault = "absolute left-0 top-0 pb-2 pl-2 pt-4 text-xs text-gray-700 z-10";

    function instance$a($$self, $$props, $$invalidate) {
    	let { outlined = false } = $$props;
    	let { value = null } = $$props;
    	let { label = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { hint = "" } = $$props;
    	let { error = false } = $$props;
    	let { append = "" } = $$props;
    	let { prepend = "" } = $$props;
    	let { persistentHint = false } = $$props;
    	let { textarea = false } = $$props;
    	let { rows = 5 } = $$props;
    	let { select = false } = $$props;
    	let { dense = false } = $$props;
    	let { autocomplete = false } = $$props;
    	let { noUnderline = false } = $$props;
    	let { appendReverse = false } = $$props;
    	let { prependReverse = false } = $$props;
    	let { color = "primary" } = $$props;
    	let { bgColor = "white" } = $$props;
    	let { iconClass = "" } = $$props;
    	let { disabled = false } = $$props;
    	const inputDefault = `duration-200 ease-in pb-2 pt-6 px-4 rounded-t text-black dark:text-gray-100 w-full`;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { inputClasses = inputDefault } = $$props;
    	let { classes = classesDefault$5 } = $$props;
    	let { appendClasses = appendDefault } = $$props;
    	let { prependClasses = prependDefault } = $$props;
    	const { bg, border, txt, caret } = utils(color);
    	const cb = new ClassBuilder(inputClasses, inputDefault);
    	const ccb = new ClassBuilder(classes, classesDefault$5);
    	const acb = new ClassBuilder(appendClasses, appendDefault);
    	const pcb = new ClassBuilder(prependClasses, prependDefault);

    	let { extend = () => {
    		
    	} } = $$props;

    	let { focused = false } = $$props;
    	let wClasses = i => i;
    	let aClasses = i => i;
    	let pClasses = i => i;

    	function toggleFocused() {
    		$$invalidate(1, focused = !focused);
    	}

    	const props = filterProps(
    		[
    			"outlined",
    			"label",
    			"placeholder",
    			"hint",
    			"error",
    			"append",
    			"prepend",
    			"persistentHint",
    			"textarea",
    			"rows",
    			"select",
    			"autocomplete",
    			"noUnderline",
    			"appendReverse",
    			"prependReverse",
    			"color",
    			"bgColor",
    			"disabled",
    			"replace",
    			"remove",
    			"small"
    		],
    		$$props
    	);

    	const dispatch = createEventDispatcher();
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TextField", $$slots, ['label','append','prepend']);

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble($$self, event);
    	}

    	function change_handler_1(event) {
    		bubble($$self, event);
    	}

    	function input_handler_1(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_1(event) {
    		bubble($$self, event);
    	}

    	function change_handler_2(event) {
    		bubble($$self, event);
    	}

    	function input_handler_2(event) {
    		bubble($$self, event);
    	}

    	function click_handler_2(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_2(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_2(event) {
    		bubble($$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function textarea_1_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	const click_handler_3 = () => dispatch("click-append");
    	const click_handler_4 = () => dispatch("click-prepend");

    	$$self.$$set = $$new_props => {
    		$$invalidate(69, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("outlined" in $$new_props) $$invalidate(2, outlined = $$new_props.outlined);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$new_props) $$invalidate(3, label = $$new_props.label);
    		if ("placeholder" in $$new_props) $$invalidate(4, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(5, hint = $$new_props.hint);
    		if ("error" in $$new_props) $$invalidate(6, error = $$new_props.error);
    		if ("append" in $$new_props) $$invalidate(7, append = $$new_props.append);
    		if ("prepend" in $$new_props) $$invalidate(8, prepend = $$new_props.prepend);
    		if ("persistentHint" in $$new_props) $$invalidate(31, persistentHint = $$new_props.persistentHint);
    		if ("textarea" in $$new_props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ("rows" in $$new_props) $$invalidate(10, rows = $$new_props.rows);
    		if ("select" in $$new_props) $$invalidate(11, select = $$new_props.select);
    		if ("dense" in $$new_props) $$invalidate(12, dense = $$new_props.dense);
    		if ("autocomplete" in $$new_props) $$invalidate(13, autocomplete = $$new_props.autocomplete);
    		if ("noUnderline" in $$new_props) $$invalidate(14, noUnderline = $$new_props.noUnderline);
    		if ("appendReverse" in $$new_props) $$invalidate(15, appendReverse = $$new_props.appendReverse);
    		if ("prependReverse" in $$new_props) $$invalidate(16, prependReverse = $$new_props.prependReverse);
    		if ("color" in $$new_props) $$invalidate(17, color = $$new_props.color);
    		if ("bgColor" in $$new_props) $$invalidate(18, bgColor = $$new_props.bgColor);
    		if ("iconClass" in $$new_props) $$invalidate(19, iconClass = $$new_props.iconClass);
    		if ("disabled" in $$new_props) $$invalidate(20, disabled = $$new_props.disabled);
    		if ("add" in $$new_props) $$invalidate(32, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(33, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(34, replace = $$new_props.replace);
    		if ("inputClasses" in $$new_props) $$invalidate(35, inputClasses = $$new_props.inputClasses);
    		if ("classes" in $$new_props) $$invalidate(36, classes = $$new_props.classes);
    		if ("appendClasses" in $$new_props) $$invalidate(37, appendClasses = $$new_props.appendClasses);
    		if ("prependClasses" in $$new_props) $$invalidate(38, prependClasses = $$new_props.prependClasses);
    		if ("extend" in $$new_props) $$invalidate(39, extend = $$new_props.extend);
    		if ("focused" in $$new_props) $$invalidate(1, focused = $$new_props.focused);
    		if ("$$scope" in $$new_props) $$invalidate(60, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		utils,
    		ClassBuilder,
    		filterProps,
    		Icon,
    		Label,
    		Hint,
    		Underline,
    		outlined,
    		value,
    		label,
    		placeholder,
    		hint,
    		error,
    		append,
    		prepend,
    		persistentHint,
    		textarea,
    		rows,
    		select,
    		dense,
    		autocomplete,
    		noUnderline,
    		appendReverse,
    		prependReverse,
    		color,
    		bgColor,
    		iconClass,
    		disabled,
    		inputDefault,
    		classesDefault: classesDefault$5,
    		appendDefault,
    		prependDefault,
    		add,
    		remove,
    		replace,
    		inputClasses,
    		classes,
    		appendClasses,
    		prependClasses,
    		bg,
    		border,
    		txt,
    		caret,
    		cb,
    		ccb,
    		acb,
    		pcb,
    		extend,
    		focused,
    		wClasses,
    		aClasses,
    		pClasses,
    		toggleFocused,
    		props,
    		dispatch,
    		showHint,
    		labelOnTop,
    		iClasses
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(69, $$props = assign(assign({}, $$props), $$new_props));
    		if ("outlined" in $$props) $$invalidate(2, outlined = $$new_props.outlined);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$props) $$invalidate(3, label = $$new_props.label);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(5, hint = $$new_props.hint);
    		if ("error" in $$props) $$invalidate(6, error = $$new_props.error);
    		if ("append" in $$props) $$invalidate(7, append = $$new_props.append);
    		if ("prepend" in $$props) $$invalidate(8, prepend = $$new_props.prepend);
    		if ("persistentHint" in $$props) $$invalidate(31, persistentHint = $$new_props.persistentHint);
    		if ("textarea" in $$props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ("rows" in $$props) $$invalidate(10, rows = $$new_props.rows);
    		if ("select" in $$props) $$invalidate(11, select = $$new_props.select);
    		if ("dense" in $$props) $$invalidate(12, dense = $$new_props.dense);
    		if ("autocomplete" in $$props) $$invalidate(13, autocomplete = $$new_props.autocomplete);
    		if ("noUnderline" in $$props) $$invalidate(14, noUnderline = $$new_props.noUnderline);
    		if ("appendReverse" in $$props) $$invalidate(15, appendReverse = $$new_props.appendReverse);
    		if ("prependReverse" in $$props) $$invalidate(16, prependReverse = $$new_props.prependReverse);
    		if ("color" in $$props) $$invalidate(17, color = $$new_props.color);
    		if ("bgColor" in $$props) $$invalidate(18, bgColor = $$new_props.bgColor);
    		if ("iconClass" in $$props) $$invalidate(19, iconClass = $$new_props.iconClass);
    		if ("disabled" in $$props) $$invalidate(20, disabled = $$new_props.disabled);
    		if ("add" in $$props) $$invalidate(32, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(33, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(34, replace = $$new_props.replace);
    		if ("inputClasses" in $$props) $$invalidate(35, inputClasses = $$new_props.inputClasses);
    		if ("classes" in $$props) $$invalidate(36, classes = $$new_props.classes);
    		if ("appendClasses" in $$props) $$invalidate(37, appendClasses = $$new_props.appendClasses);
    		if ("prependClasses" in $$props) $$invalidate(38, prependClasses = $$new_props.prependClasses);
    		if ("extend" in $$props) $$invalidate(39, extend = $$new_props.extend);
    		if ("focused" in $$props) $$invalidate(1, focused = $$new_props.focused);
    		if ("wClasses" in $$props) $$invalidate(21, wClasses = $$new_props.wClasses);
    		if ("aClasses" in $$props) $$invalidate(22, aClasses = $$new_props.aClasses);
    		if ("pClasses" in $$props) $$invalidate(23, pClasses = $$new_props.pClasses);
    		if ("showHint" in $$props) $$invalidate(24, showHint = $$new_props.showHint);
    		if ("labelOnTop" in $$props) $$invalidate(25, labelOnTop = $$new_props.labelOnTop);
    		if ("iClasses" in $$props) $$invalidate(26, iClasses = $$new_props.iClasses);
    	};

    	let showHint;
    	let labelOnTop;
    	let iClasses;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*error, hint, focused*/ 98 | $$self.$$.dirty[1] & /*persistentHint*/ 1) {
    			 $$invalidate(24, showHint = error || (persistentHint ? hint : focused && hint));
    		}

    		if ($$self.$$.dirty[0] & /*placeholder, focused, value*/ 19) {
    			 $$invalidate(25, labelOnTop = placeholder || focused || (value || value === 0));
    		}

    		 $$invalidate(26, iClasses = cb.flush().remove("pt-6 pb-2", outlined).add("border rounded bg-transparent py-4 duration-200 ease-in", outlined).add("border-error-500 caret-error-500", error).remove(caret(), error).add(caret(), !error).add(border(), focused && !error).add("border-gray-600", !error && !focused).add("bg-gray-100 dark:bg-dark-600", !outlined).add("bg-gray-300 dark:bg-dark-200", focused && !outlined).remove("px-4", prepend).add("pr-4 pl-10", prepend).add(add).remove("pt-6 pb-2", dense && !outlined).add("pt-4 pb-1", dense && !outlined).remove("bg-gray-100", disabled).add("bg-gray-50", disabled).add("cursor-pointer", select && !autocomplete).add($$props.class).remove(remove).replace(replace).extend(extend).get());

    		if ($$self.$$.dirty[0] & /*select, autocomplete, dense, outlined, error, disabled*/ 1062980) {
    			 $$invalidate(21, wClasses = ccb.flush().add("select", select || autocomplete).add("dense", dense && !outlined).remove("mb-6 mt-2", dense && !outlined).add("mb-4 mt-1", dense).replace({ "text-gray-600": "text-error-500" }, error).add("text-gray-200", disabled).get());
    		}
    	};

    	 $$invalidate(22, aClasses = acb.flush().get());
    	 $$invalidate(23, pClasses = pcb.flush().get());
    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		focused,
    		outlined,
    		label,
    		placeholder,
    		hint,
    		error,
    		append,
    		prepend,
    		textarea,
    		rows,
    		select,
    		dense,
    		autocomplete,
    		noUnderline,
    		appendReverse,
    		prependReverse,
    		color,
    		bgColor,
    		iconClass,
    		disabled,
    		wClasses,
    		aClasses,
    		pClasses,
    		showHint,
    		labelOnTop,
    		iClasses,
    		txt,
    		toggleFocused,
    		props,
    		dispatch,
    		persistentHint,
    		add,
    		remove,
    		replace,
    		inputClasses,
    		classes,
    		appendClasses,
    		prependClasses,
    		extend,
    		$$slots,
    		change_handler,
    		blur_handler,
    		input_handler,
    		click_handler,
    		focus_handler,
    		focus_handler_1,
    		change_handler_1,
    		input_handler_1,
    		click_handler_1,
    		blur_handler_1,
    		change_handler_2,
    		input_handler_2,
    		click_handler_2,
    		blur_handler_2,
    		focus_handler_2,
    		input_input_handler,
    		textarea_1_input_handler,
    		click_handler_3,
    		click_handler_4,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				outlined: 2,
    				value: 0,
    				label: 3,
    				placeholder: 4,
    				hint: 5,
    				error: 6,
    				append: 7,
    				prepend: 8,
    				persistentHint: 31,
    				textarea: 9,
    				rows: 10,
    				select: 11,
    				dense: 12,
    				autocomplete: 13,
    				noUnderline: 14,
    				appendReverse: 15,
    				prependReverse: 16,
    				color: 17,
    				bgColor: 18,
    				iconClass: 19,
    				disabled: 20,
    				add: 32,
    				remove: 33,
    				replace: 34,
    				inputClasses: 35,
    				classes: 36,
    				appendClasses: 37,
    				prependClasses: 38,
    				extend: 39,
    				focused: 1
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get append() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set append(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentHint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentHint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autocomplete() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autocomplete(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noUnderline() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appendReverse() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appendReverse(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prependReverse() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prependReverse(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClass() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClass(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appendClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appendClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prependClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prependClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extend() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extend(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/Menu/Menu.svelte generated by Svelte v3.24.1 */
    const file$b = "node_modules/smelte/src/components/Menu/Menu.svelte";
    const get_menu_slot_changes = dirty => ({});
    const get_menu_slot_context = ctx => ({});
    const get_activator_slot_changes = dirty => ({});
    const get_activator_slot_context = ctx => ({});

    // (47:4) {#if open}
    function create_if_block$4(ctx) {
    	let div;
    	let list;
    	let updating_value;
    	let div_intro;
    	let div_outro;
    	let current;

    	const list_spread_levels = [
    		{ select: true },
    		{ dense: true },
    		{ items: /*items*/ ctx[2] },
    		/*listProps*/ ctx[3]
    	];

    	function list_value_binding(value) {
    		/*list_value_binding*/ ctx[14].call(null, value);
    	}

    	let list_props = {};

    	for (let i = 0; i < list_spread_levels.length; i += 1) {
    		list_props = assign(list_props, list_spread_levels[i]);
    	}

    	if (/*value*/ ctx[1] !== void 0) {
    		list_props.value = /*value*/ ctx[1];
    	}

    	list = new List({ props: list_props, $$inline: true });
    	binding_callbacks.push(() => bind(list, "value", list_value_binding));
    	list.$on("change", /*change_handler*/ ctx[15]);
    	list.$on("change", /*change_handler_1*/ ctx[16]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(list.$$.fragment);
    			attr_dev(div, "class", /*l*/ ctx[5]);
    			add_location(div, file$b, 47, 6, 1265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(list, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = (dirty & /*items, listProps*/ 12)
    			? get_spread_update(list_spread_levels, [
    					list_spread_levels[0],
    					list_spread_levels[1],
    					dirty & /*items*/ 4 && { items: /*items*/ ctx[2] },
    					dirty & /*listProps*/ 8 && get_spread_object(/*listProps*/ ctx[3])
    				])
    			: {};

    			if (!updating_value && dirty & /*value*/ 2) {
    				updating_value = true;
    				list_changes.value = /*value*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			list.$set(list_changes);

    			if (!current || dirty & /*l*/ 32) {
    				attr_dev(div, "class", /*l*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, /*inProps*/ ctx[6]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, /*outProps*/ ctx[7]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(list);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(47:4) {#if open}",
    		ctx
    	});

    	return block;
    }

    // (46:20)      
    function fallback_block$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(46:20)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const activator_slot_template = /*$$slots*/ ctx[11].activator;
    	const activator_slot = create_slot(activator_slot_template, ctx, /*$$scope*/ ctx[10], get_activator_slot_context);
    	const menu_slot_template = /*$$slots*/ ctx[11].menu;
    	const menu_slot = create_slot(menu_slot_template, ctx, /*$$scope*/ ctx[10], get_menu_slot_context);
    	const menu_slot_or_fallback = menu_slot || fallback_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (activator_slot) activator_slot.c();
    			t = space();
    			if (menu_slot_or_fallback) menu_slot_or_fallback.c();
    			attr_dev(div, "class", /*c*/ ctx[4]);
    			add_location(div, file$b, 43, 0, 1154);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (activator_slot) {
    				activator_slot.m(div, null);
    			}

    			append_dev(div, t);

    			if (menu_slot_or_fallback) {
    				menu_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*click_handler_1*/ ctx[13], false, false, false),
    					listen_dev(div, "click", stop_propagation(/*click_handler*/ ctx[12]), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (activator_slot) {
    				if (activator_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(activator_slot, activator_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_activator_slot_changes, get_activator_slot_context);
    				}
    			}

    			if (menu_slot) {
    				if (menu_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(menu_slot, menu_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_menu_slot_changes, get_menu_slot_context);
    				}
    			} else {
    				if (menu_slot_or_fallback && menu_slot_or_fallback.p && dirty & /*l, items, listProps, value, open*/ 47) {
    					menu_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*c*/ 16) {
    				attr_dev(div, "class", /*c*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(activator_slot, local);
    			transition_in(menu_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(activator_slot, local);
    			transition_out(menu_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (activator_slot) activator_slot.d(detaching);
    			if (menu_slot_or_fallback) menu_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$6 = "cursor-pointer relative";
    const listClassesDefault = "absolute w-auto top-16 bg-white left-0 bg-white rounded elevation-3 z-20 dark:bg-dark-500";

    function instance$b($$self, $$props, $$invalidate) {
    	let { items = [] } = $$props;
    	let { open = false } = $$props;
    	let { value = null } = $$props;
    	let { classes = classesDefault$6 } = $$props;
    	let { listClasses = listClassesDefault } = $$props;
    	let { listProps = {} } = $$props;
    	const cb = new ClassBuilder($$props.class);
    	const lcb = new ClassBuilder(listClasses, listClassesDefault);
    	const dispatch = createEventDispatcher();
    	const inProps = { y: 10, duration: 200, easing: quadIn };

    	const outProps = {
    		y: -10,
    		duration: 100,
    		easing: quadOut,
    		delay: 100
    	};

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Menu", $$slots, ['activator','menu']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	const click_handler_1 = () => $$invalidate(0, open = false);

    	function list_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(1, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	const change_handler_1 = () => $$invalidate(0, open = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(20, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("items" in $$new_props) $$invalidate(2, items = $$new_props.items);
    		if ("open" in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ("value" in $$new_props) $$invalidate(1, value = $$new_props.value);
    		if ("classes" in $$new_props) $$invalidate(8, classes = $$new_props.classes);
    		if ("listClasses" in $$new_props) $$invalidate(9, listClasses = $$new_props.listClasses);
    		if ("listProps" in $$new_props) $$invalidate(3, listProps = $$new_props.listProps);
    		if ("$$scope" in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fly,
    		quadOut,
    		quadIn,
    		List,
    		TextField,
    		ClassBuilder,
    		classesDefault: classesDefault$6,
    		listClassesDefault,
    		items,
    		open,
    		value,
    		classes,
    		listClasses,
    		listProps,
    		cb,
    		lcb,
    		dispatch,
    		inProps,
    		outProps,
    		c,
    		l
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(20, $$props = assign(assign({}, $$props), $$new_props));
    		if ("items" in $$props) $$invalidate(2, items = $$new_props.items);
    		if ("open" in $$props) $$invalidate(0, open = $$new_props.open);
    		if ("value" in $$props) $$invalidate(1, value = $$new_props.value);
    		if ("classes" in $$props) $$invalidate(8, classes = $$new_props.classes);
    		if ("listClasses" in $$props) $$invalidate(9, listClasses = $$new_props.listClasses);
    		if ("listProps" in $$props) $$invalidate(3, listProps = $$new_props.listProps);
    		if ("c" in $$props) $$invalidate(4, c = $$new_props.c);
    		if ("l" in $$props) $$invalidate(5, l = $$new_props.l);
    	};

    	let c;
    	let l;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(4, c = cb.flush().add(classes, true, classesDefault$6).add($$props.class).get());
    	};

    	 $$invalidate(5, l = lcb.flush().get());
    	$$props = exclude_internal_props($$props);

    	return [
    		open,
    		value,
    		items,
    		listProps,
    		c,
    		l,
    		inProps,
    		outProps,
    		classes,
    		listClasses,
    		$$scope,
    		$$slots,
    		click_handler,
    		click_handler_1,
    		list_value_binding,
    		change_handler,
    		change_handler_1
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			items: 2,
    			open: 0,
    			value: 1,
    			classes: 8,
    			listClasses: 9,
    			listProps: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get items() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listClasses() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listClasses(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listProps() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listProps(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* node_modules/smelte/src/components/Ripple/Ripple.svelte generated by Svelte v3.24.1 */
    const file$c = "node_modules/smelte/src/components/Ripple/Ripple.svelte";

    function create_fragment$c(ctx) {
    	let span;
    	let span_class_value;
    	let ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", span_class_value = "z-40 " + /*$$props*/ ctx[3].class + " p-2 rounded-full flex items-center justify-center top-0 left-0 " + (/*noHover*/ ctx[0] ? "" : /*hoverClass*/ ctx[2]) + " svelte-1o8z87d");
    			add_location(span, file$c, 15, 0, 293);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(ripple_action = /*ripple*/ ctx[1].call(null, span));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$$props, noHover, hoverClass*/ 13 && span_class_value !== (span_class_value = "z-40 " + /*$$props*/ ctx[3].class + " p-2 rounded-full flex items-center justify-center top-0 left-0 " + (/*noHover*/ ctx[0] ? "" : /*hoverClass*/ ctx[2]) + " svelte-1o8z87d")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { color = "primary" } = $$props;
    	let { noHover = false } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Ripple", $$slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("noHover" in $$new_props) $$invalidate(0, noHover = $$new_props.noHover);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		color,
    		noHover,
    		createRipple: r,
    		ripple,
    		hoverClass
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("noHover" in $$props) $$invalidate(0, noHover = $$new_props.noHover);
    		if ("ripple" in $$props) $$invalidate(1, ripple = $$new_props.ripple);
    		if ("hoverClass" in $$props) $$invalidate(2, hoverClass = $$new_props.hoverClass);
    	};

    	let ripple;
    	let hoverClass;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 16) {
    			 $$invalidate(1, ripple = r(color, true));
    		}

    		if ($$self.$$.dirty & /*color*/ 16) {
    			 $$invalidate(2, hoverClass = `hover:bg-${color}-transLight`);
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [noHover, ripple, hoverClass, $$props, color, $$scope, $$slots];
    }

    class Ripple extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { color: 4, noHover: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ripple",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get color() {
    		throw new Error("<Ripple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Ripple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noHover() {
    		throw new Error("<Ripple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noHover(value) {
    		throw new Error("<Ripple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function hideListAction(node, cb) {
      const onWindowClick = e => {
        if (!node.contains(e.target)) {
          cb();
        }
      };

      window.addEventListener("click", onWindowClick);

      return {
        destroy: () => {
          window.removeEventListener("click", onWindowClick);
        }
      };
    }

    /* node_modules/smelte/src/components/Select/Select.svelte generated by Svelte v3.24.1 */
    const file$d = "node_modules/smelte/src/components/Select/Select.svelte";
    const get_options_slot_changes = dirty => ({});
    const get_options_slot_context = ctx => ({});
    const get_select_slot_changes = dirty => ({});
    const get_select_slot_context = ctx => ({});

    // (114:22)      
    function fallback_block_1$2(ctx) {
    	let textfield;
    	let current;

    	textfield = new TextField({
    			props: {
    				select: true,
    				dense: /*dense*/ ctx[10],
    				focused: /*showList*/ ctx[1],
    				autocomplete: /*autocomplete*/ ctx[12],
    				value: /*selectedLabel*/ ctx[24],
    				outlined: /*outlined*/ ctx[5],
    				label: /*label*/ ctx[3],
    				placeholder: /*placeholder*/ ctx[6],
    				hint: /*hint*/ ctx[7],
    				error: /*error*/ ctx[8],
    				append: /*append*/ ctx[9],
    				persistentHint: /*persistentHint*/ ctx[11],
    				color: /*color*/ ctx[4],
    				add: /*add*/ ctx[21],
    				remove: /*remove*/ ctx[22],
    				replace: /*replace*/ ctx[23],
    				noUnderline: /*noUnderline*/ ctx[13],
    				class: /*inputWrapperClasses*/ ctx[14],
    				appendClasses: /*appendClasses*/ ctx[2],
    				labelClasses: /*labelClasses*/ ctx[15],
    				inputClasses: /*inputClasses*/ ctx[16],
    				prependClasses: /*prependClasses*/ ctx[17],
    				appendReverse: /*showList*/ ctx[1]
    			},
    			$$inline: true
    		});

    	textfield.$on("click", /*handleInputClick*/ ctx[30]);
    	textfield.$on("click-append", /*click_append_handler*/ ctx[39]);
    	textfield.$on("click", /*click_handler*/ ctx[40]);
    	textfield.$on("input", /*filterItems*/ ctx[29]);

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};
    			if (dirty[0] & /*dense*/ 1024) textfield_changes.dense = /*dense*/ ctx[10];
    			if (dirty[0] & /*showList*/ 2) textfield_changes.focused = /*showList*/ ctx[1];
    			if (dirty[0] & /*autocomplete*/ 4096) textfield_changes.autocomplete = /*autocomplete*/ ctx[12];
    			if (dirty[0] & /*selectedLabel*/ 16777216) textfield_changes.value = /*selectedLabel*/ ctx[24];
    			if (dirty[0] & /*outlined*/ 32) textfield_changes.outlined = /*outlined*/ ctx[5];
    			if (dirty[0] & /*label*/ 8) textfield_changes.label = /*label*/ ctx[3];
    			if (dirty[0] & /*placeholder*/ 64) textfield_changes.placeholder = /*placeholder*/ ctx[6];
    			if (dirty[0] & /*hint*/ 128) textfield_changes.hint = /*hint*/ ctx[7];
    			if (dirty[0] & /*error*/ 256) textfield_changes.error = /*error*/ ctx[8];
    			if (dirty[0] & /*append*/ 512) textfield_changes.append = /*append*/ ctx[9];
    			if (dirty[0] & /*persistentHint*/ 2048) textfield_changes.persistentHint = /*persistentHint*/ ctx[11];
    			if (dirty[0] & /*color*/ 16) textfield_changes.color = /*color*/ ctx[4];
    			if (dirty[0] & /*add*/ 2097152) textfield_changes.add = /*add*/ ctx[21];
    			if (dirty[0] & /*remove*/ 4194304) textfield_changes.remove = /*remove*/ ctx[22];
    			if (dirty[0] & /*replace*/ 8388608) textfield_changes.replace = /*replace*/ ctx[23];
    			if (dirty[0] & /*noUnderline*/ 8192) textfield_changes.noUnderline = /*noUnderline*/ ctx[13];
    			if (dirty[0] & /*inputWrapperClasses*/ 16384) textfield_changes.class = /*inputWrapperClasses*/ ctx[14];
    			if (dirty[0] & /*appendClasses*/ 4) textfield_changes.appendClasses = /*appendClasses*/ ctx[2];
    			if (dirty[0] & /*labelClasses*/ 32768) textfield_changes.labelClasses = /*labelClasses*/ ctx[15];
    			if (dirty[0] & /*inputClasses*/ 65536) textfield_changes.inputClasses = /*inputClasses*/ ctx[16];
    			if (dirty[0] & /*prependClasses*/ 131072) textfield_changes.prependClasses = /*prependClasses*/ ctx[17];
    			if (dirty[0] & /*showList*/ 2) textfield_changes.appendReverse = /*showList*/ ctx[1];
    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$2.name,
    		type: "fallback",
    		source: "(114:22)      ",
    		ctx
    	});

    	return block;
    }

    // (146:2) {#if showList}
    function create_if_block$5(ctx) {
    	let current;
    	const options_slot_template = /*$$slots*/ ctx[38].options;
    	const options_slot = create_slot(options_slot_template, ctx, /*$$scope*/ ctx[37], get_options_slot_context);
    	const options_slot_or_fallback = options_slot || fallback_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (options_slot_or_fallback) options_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (options_slot_or_fallback) {
    				options_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (options_slot) {
    				if (options_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(options_slot, options_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_options_slot_changes, get_options_slot_context);
    				}
    			} else {
    				if (options_slot_or_fallback && options_slot_or_fallback.p && dirty[0] & /*o, showList, listClasses, selectedClasses, itemClasses, dense, filteredItems, value*/ 169608195) {
    					options_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(options_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(options_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (options_slot_or_fallback) options_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(146:2) {#if showList}",
    		ctx
    	});

    	return block;
    }

    // (147:25)        
    function fallback_block$4(ctx) {
    	let div;
    	let list;
    	let updating_value;
    	let current;
    	let mounted;
    	let dispose;

    	function list_value_binding(value) {
    		/*list_value_binding*/ ctx[41].call(null, value);
    	}

    	let list_props = {
    		class: /*listClasses*/ ctx[18],
    		selectedClasses: /*selectedClasses*/ ctx[19],
    		itemClasses: /*itemClasses*/ ctx[20],
    		select: true,
    		dense: /*dense*/ ctx[10],
    		items: /*filteredItems*/ ctx[25]
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		list_props.value = /*value*/ ctx[0];
    	}

    	list = new List({ props: list_props, $$inline: true });
    	binding_callbacks.push(() => bind(list, "value", list_value_binding));
    	list.$on("change", /*change_handler*/ ctx[42]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(list.$$.fragment);
    			attr_dev(div, "class", /*o*/ ctx[27]);
    			add_location(div, file$d, 147, 6, 3674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(list, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[43], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};
    			if (dirty[0] & /*listClasses*/ 262144) list_changes.class = /*listClasses*/ ctx[18];
    			if (dirty[0] & /*selectedClasses*/ 524288) list_changes.selectedClasses = /*selectedClasses*/ ctx[19];
    			if (dirty[0] & /*itemClasses*/ 1048576) list_changes.itemClasses = /*itemClasses*/ ctx[20];
    			if (dirty[0] & /*dense*/ 1024) list_changes.dense = /*dense*/ ctx[10];
    			if (dirty[0] & /*filteredItems*/ 33554432) list_changes.items = /*filteredItems*/ ctx[25];

    			if (!updating_value && dirty[0] & /*value*/ 1) {
    				updating_value = true;
    				list_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			list.$set(list_changes);

    			if (!current || dirty[0] & /*o*/ 134217728) {
    				attr_dev(div, "class", /*o*/ ctx[27]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(list);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$4.name,
    		type: "fallback",
    		source: "(147:25)        ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let t;
    	let hideListAction_action;
    	let current;
    	let mounted;
    	let dispose;
    	const select_slot_template = /*$$slots*/ ctx[38].select;
    	const select_slot = create_slot(select_slot_template, ctx, /*$$scope*/ ctx[37], get_select_slot_context);
    	const select_slot_or_fallback = select_slot || fallback_block_1$2(ctx);
    	let if_block = /*showList*/ ctx[1] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (select_slot_or_fallback) select_slot_or_fallback.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", /*c*/ ctx[26]);
    			add_location(div, file$d, 112, 0, 2940);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (select_slot_or_fallback) {
    				select_slot_or_fallback.m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(hideListAction_action = hideListAction.call(null, div, /*onHideListPanel*/ ctx[31]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (select_slot) {
    				if (select_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(select_slot, select_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_select_slot_changes, get_select_slot_context);
    				}
    			} else {
    				if (select_slot_or_fallback && select_slot_or_fallback.p && dirty[0] & /*dense, showList, autocomplete, selectedLabel, outlined, label, placeholder, hint, error, append, persistentHint, color, add, remove, replace, noUnderline, inputWrapperClasses, appendClasses, labelClasses, inputClasses, prependClasses*/ 31719422) {
    					select_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (/*showList*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showList*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*c*/ 67108864) {
    				attr_dev(div, "class", /*c*/ ctx[26]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select_slot_or_fallback, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select_slot_or_fallback, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (select_slot_or_fallback) select_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const optionsClassesDefault = "absolute left-0 bg-white rounded elevation-3 w-full z-20 dark:bg-dark-500";
    const classesDefault$7 = "cursor-pointer relative pb-4";

    function process$1(it) {
    	return it.map(i => typeof i !== "object" ? { value: i, text: i } : i);
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const noop = i => i;
    	let { items = [] } = $$props;
    	let { value = "" } = $$props;
    	const text = "";
    	let { label = "" } = $$props;
    	let { selectedLabel: selectedLabelProp = undefined } = $$props;
    	let { color = "primary" } = $$props;
    	let { outlined = false } = $$props;
    	let { placeholder = "" } = $$props;
    	let { hint = "" } = $$props;
    	let { error = false } = $$props;
    	let { append = "arrow_drop_down" } = $$props;
    	let { dense = false } = $$props;
    	let { persistentHint = false } = $$props;
    	let { autocomplete = false } = $$props;
    	let { noUnderline = false } = $$props;
    	let { showList = false } = $$props;
    	let { classes = classesDefault$7 } = $$props;
    	let { optionsClasses = optionsClassesDefault } = $$props;
    	let { inputWrapperClasses = noop } = $$props;
    	let { appendClasses = noop } = $$props;
    	let { labelClasses = noop } = $$props;
    	let { inputClasses = noop } = $$props;
    	let { prependClasses = noop } = $$props;
    	let { listClasses = noop } = $$props;
    	let { selectedClasses = noop } = $$props;
    	let { itemClasses = noop } = $$props;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let itemsProcessed = [];
    	const dispatch = createEventDispatcher();
    	let selectedLabel = "";
    	let filterText = null;

    	function filterItems({ target }) {
    		$$invalidate(45, filterText = target.value.toLowerCase());
    	}

    	function handleInputClick() {
    		if (autocomplete) {
    			$$invalidate(1, showList = true);
    		} else {
    			$$invalidate(1, showList = !showList);
    		}
    	}

    	const onHideListPanel = () => $$invalidate(1, showList = false);
    	const cb = new ClassBuilder(classes, classesDefault$7);
    	const ocb = new ClassBuilder(optionsClasses, optionsClassesDefault);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Select", $$slots, ['select','options']);
    	const click_append_handler = e => $$invalidate(1, showList = !showList);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function list_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	const change_handler = ({ detail }) => {
    		dispatch("change", detail);
    	};

    	const click_handler_1 = () => $$invalidate(1, showList = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(49, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("items" in $$new_props) $$invalidate(32, items = $$new_props.items);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$new_props) $$invalidate(3, label = $$new_props.label);
    		if ("selectedLabel" in $$new_props) $$invalidate(34, selectedLabelProp = $$new_props.selectedLabel);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("outlined" in $$new_props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("placeholder" in $$new_props) $$invalidate(6, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(7, hint = $$new_props.hint);
    		if ("error" in $$new_props) $$invalidate(8, error = $$new_props.error);
    		if ("append" in $$new_props) $$invalidate(9, append = $$new_props.append);
    		if ("dense" in $$new_props) $$invalidate(10, dense = $$new_props.dense);
    		if ("persistentHint" in $$new_props) $$invalidate(11, persistentHint = $$new_props.persistentHint);
    		if ("autocomplete" in $$new_props) $$invalidate(12, autocomplete = $$new_props.autocomplete);
    		if ("noUnderline" in $$new_props) $$invalidate(13, noUnderline = $$new_props.noUnderline);
    		if ("showList" in $$new_props) $$invalidate(1, showList = $$new_props.showList);
    		if ("classes" in $$new_props) $$invalidate(35, classes = $$new_props.classes);
    		if ("optionsClasses" in $$new_props) $$invalidate(36, optionsClasses = $$new_props.optionsClasses);
    		if ("inputWrapperClasses" in $$new_props) $$invalidate(14, inputWrapperClasses = $$new_props.inputWrapperClasses);
    		if ("appendClasses" in $$new_props) $$invalidate(2, appendClasses = $$new_props.appendClasses);
    		if ("labelClasses" in $$new_props) $$invalidate(15, labelClasses = $$new_props.labelClasses);
    		if ("inputClasses" in $$new_props) $$invalidate(16, inputClasses = $$new_props.inputClasses);
    		if ("prependClasses" in $$new_props) $$invalidate(17, prependClasses = $$new_props.prependClasses);
    		if ("listClasses" in $$new_props) $$invalidate(18, listClasses = $$new_props.listClasses);
    		if ("selectedClasses" in $$new_props) $$invalidate(19, selectedClasses = $$new_props.selectedClasses);
    		if ("itemClasses" in $$new_props) $$invalidate(20, itemClasses = $$new_props.itemClasses);
    		if ("add" in $$new_props) $$invalidate(21, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(22, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(23, replace = $$new_props.replace);
    		if ("$$scope" in $$new_props) $$invalidate(37, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		quadOut,
    		quadIn,
    		List,
    		TextField,
    		ClassBuilder,
    		hideListAction,
    		optionsClassesDefault,
    		classesDefault: classesDefault$7,
    		noop,
    		items,
    		value,
    		text,
    		label,
    		selectedLabelProp,
    		color,
    		outlined,
    		placeholder,
    		hint,
    		error,
    		append,
    		dense,
    		persistentHint,
    		autocomplete,
    		noUnderline,
    		showList,
    		classes,
    		optionsClasses,
    		inputWrapperClasses,
    		appendClasses,
    		labelClasses,
    		inputClasses,
    		prependClasses,
    		listClasses,
    		selectedClasses,
    		itemClasses,
    		add,
    		remove,
    		replace,
    		itemsProcessed,
    		process: process$1,
    		dispatch,
    		selectedLabel,
    		filterText,
    		filterItems,
    		handleInputClick,
    		onHideListPanel,
    		cb,
    		ocb,
    		filteredItems,
    		c,
    		o
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(49, $$props = assign(assign({}, $$props), $$new_props));
    		if ("items" in $$props) $$invalidate(32, items = $$new_props.items);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$props) $$invalidate(3, label = $$new_props.label);
    		if ("selectedLabelProp" in $$props) $$invalidate(34, selectedLabelProp = $$new_props.selectedLabelProp);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("placeholder" in $$props) $$invalidate(6, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(7, hint = $$new_props.hint);
    		if ("error" in $$props) $$invalidate(8, error = $$new_props.error);
    		if ("append" in $$props) $$invalidate(9, append = $$new_props.append);
    		if ("dense" in $$props) $$invalidate(10, dense = $$new_props.dense);
    		if ("persistentHint" in $$props) $$invalidate(11, persistentHint = $$new_props.persistentHint);
    		if ("autocomplete" in $$props) $$invalidate(12, autocomplete = $$new_props.autocomplete);
    		if ("noUnderline" in $$props) $$invalidate(13, noUnderline = $$new_props.noUnderline);
    		if ("showList" in $$props) $$invalidate(1, showList = $$new_props.showList);
    		if ("classes" in $$props) $$invalidate(35, classes = $$new_props.classes);
    		if ("optionsClasses" in $$props) $$invalidate(36, optionsClasses = $$new_props.optionsClasses);
    		if ("inputWrapperClasses" in $$props) $$invalidate(14, inputWrapperClasses = $$new_props.inputWrapperClasses);
    		if ("appendClasses" in $$props) $$invalidate(2, appendClasses = $$new_props.appendClasses);
    		if ("labelClasses" in $$props) $$invalidate(15, labelClasses = $$new_props.labelClasses);
    		if ("inputClasses" in $$props) $$invalidate(16, inputClasses = $$new_props.inputClasses);
    		if ("prependClasses" in $$props) $$invalidate(17, prependClasses = $$new_props.prependClasses);
    		if ("listClasses" in $$props) $$invalidate(18, listClasses = $$new_props.listClasses);
    		if ("selectedClasses" in $$props) $$invalidate(19, selectedClasses = $$new_props.selectedClasses);
    		if ("itemClasses" in $$props) $$invalidate(20, itemClasses = $$new_props.itemClasses);
    		if ("add" in $$props) $$invalidate(21, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(22, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(23, replace = $$new_props.replace);
    		if ("itemsProcessed" in $$props) $$invalidate(44, itemsProcessed = $$new_props.itemsProcessed);
    		if ("selectedLabel" in $$props) $$invalidate(24, selectedLabel = $$new_props.selectedLabel);
    		if ("filterText" in $$props) $$invalidate(45, filterText = $$new_props.filterText);
    		if ("filteredItems" in $$props) $$invalidate(25, filteredItems = $$new_props.filteredItems);
    		if ("c" in $$props) $$invalidate(26, c = $$new_props.c);
    		if ("o" in $$props) $$invalidate(27, o = $$new_props.o);
    	};

    	let filteredItems;
    	let c;
    	let o;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*items*/ 2) {
    			 $$invalidate(44, itemsProcessed = process$1(items));
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1 | $$self.$$.dirty[1] & /*selectedLabelProp, itemsProcessed*/ 8200) {
    			 {
    				if (selectedLabelProp !== undefined) {
    					$$invalidate(24, selectedLabel = selectedLabelProp);
    				} else if (value !== undefined) {
    					let selectedItem = itemsProcessed.find(i => i.value === value);
    					$$invalidate(24, selectedLabel = selectedItem ? selectedItem.text : "");
    				} else {
    					$$invalidate(24, selectedLabel = "");
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*itemsProcessed, filterText*/ 24576) {
    			 $$invalidate(25, filteredItems = itemsProcessed.filter(i => !filterText || i.text.toLowerCase().includes(filterText)));
    		}

    		 $$invalidate(26, c = cb.flush().add(classes, true, classesDefault$7).add($$props.class).get());

    		if ($$self.$$.dirty[0] & /*outlined*/ 32 | $$self.$$.dirty[1] & /*optionsClasses*/ 32) {
    			 $$invalidate(27, o = ocb.flush().add(optionsClasses, true, optionsClassesDefault).add("rounded-t-none", !outlined).get());
    		}

    		if ($$self.$$.dirty[0] & /*dense*/ 1024) {
    			 if (dense) {
    				$$invalidate(2, appendClasses = i => i.replace("pt-4", "pt-3"));
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		showList,
    		appendClasses,
    		label,
    		color,
    		outlined,
    		placeholder,
    		hint,
    		error,
    		append,
    		dense,
    		persistentHint,
    		autocomplete,
    		noUnderline,
    		inputWrapperClasses,
    		labelClasses,
    		inputClasses,
    		prependClasses,
    		listClasses,
    		selectedClasses,
    		itemClasses,
    		add,
    		remove,
    		replace,
    		selectedLabel,
    		filteredItems,
    		c,
    		o,
    		dispatch,
    		filterItems,
    		handleInputClick,
    		onHideListPanel,
    		items,
    		text,
    		selectedLabelProp,
    		classes,
    		optionsClasses,
    		$$scope,
    		$$slots,
    		click_append_handler,
    		click_handler,
    		list_value_binding,
    		change_handler,
    		click_handler_1
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$d,
    			create_fragment$d,
    			safe_not_equal,
    			{
    				items: 32,
    				value: 0,
    				text: 33,
    				label: 3,
    				selectedLabel: 34,
    				color: 4,
    				outlined: 5,
    				placeholder: 6,
    				hint: 7,
    				error: 8,
    				append: 9,
    				dense: 10,
    				persistentHint: 11,
    				autocomplete: 12,
    				noUnderline: 13,
    				showList: 1,
    				classes: 35,
    				optionsClasses: 36,
    				inputWrapperClasses: 14,
    				appendClasses: 2,
    				labelClasses: 15,
    				inputClasses: 16,
    				prependClasses: 17,
    				listClasses: 18,
    				selectedClasses: 19,
    				itemClasses: 20,
    				add: 21,
    				remove: 22,
    				replace: 23
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		return this.$$.ctx[33];
    	}

    	set text(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get append() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set append(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentHint() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentHint(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autocomplete() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autocomplete(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noUnderline() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showList() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showList(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionsClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionsClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputWrapperClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputWrapperClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appendClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appendClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prependClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prependClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/Snackbar/Snackbar.svelte generated by Svelte v3.24.1 */
    const file$e = "node_modules/smelte/src/components/Snackbar/Snackbar.svelte";
    const get_action_slot_changes = dirty => ({});
    const get_action_slot_context = ctx => ({});

    // (112:0) {#if value && (running === hash)}
    function create_if_block$6(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let div0_intro;
    	let div0_outro;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
    	let if_block = !/*noAction*/ ctx[5] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			add_location(div0, file$e, 116, 6, 2707);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*wClasses*/ ctx[6]) + " svelte-1ym8qvd"));
    			add_location(div1, file$e, 115, 4, 2678);
    			attr_dev(div2, "class", "fixed w-full h-full top-0 left-0 z-30 pointer-events-none");
    			add_location(div2, file$e, 112, 2, 2595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div0, t);
    			if (if_block) if_block.m(div0, null);
    			/*div0_binding*/ ctx[17](div0);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler_1*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}

    			if (!/*noAction*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*noAction*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*wClasses*/ 64 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*wClasses*/ ctx[6]) + " svelte-1ym8qvd"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				if (!div0_intro) div0_intro = create_in_transition(div0, scale, /*inProps*/ ctx[3]);
    				div0_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, fade, /*outProps*/ ctx[4]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			/*div0_binding*/ ctx[17](null);
    			if (detaching && div0_outro) div0_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(112:0) {#if value && (running === hash)}",
    		ctx
    	});

    	return block;
    }

    // (123:8) {#if !noAction}
    function create_if_block_1$3(ctx) {
    	let spacer;
    	let t;
    	let current;
    	spacer = new Spacer$1({ $$inline: true });
    	const action_slot_template = /*$$slots*/ ctx[15].action;
    	const action_slot = create_slot(action_slot_template, ctx, /*$$scope*/ ctx[19], get_action_slot_context);
    	const action_slot_or_fallback = action_slot || fallback_block$5(ctx);

    	const block = {
    		c: function create() {
    			create_component(spacer.$$.fragment);
    			t = space();
    			if (action_slot_or_fallback) action_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			mount_component(spacer, target, anchor);
    			insert_dev(target, t, anchor);

    			if (action_slot_or_fallback) {
    				action_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (action_slot) {
    				if (action_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(action_slot, action_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_action_slot_changes, get_action_slot_context);
    				}
    			} else {
    				if (action_slot_or_fallback && action_slot_or_fallback.p && dirty & /*value, timeout*/ 5) {
    					action_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spacer.$$.fragment, local);
    			transition_in(action_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spacer.$$.fragment, local);
    			transition_out(action_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spacer, detaching);
    			if (detaching) detach_dev(t);
    			if (action_slot_or_fallback) action_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(123:8) {#if !noAction}",
    		ctx
    	});

    	return block;
    }

    // (126:12) {#if !timeout}
    function create_if_block_2$2(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[16]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(126:12) {#if !timeout}",
    		ctx
    	});

    	return block;
    }

    // (127:14) <Button text on:click={() => value = false}>
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(127:14) <Button text on:click={() => value = false}>",
    		ctx
    	});

    	return block;
    }

    // (125:30)              
    function fallback_block$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*timeout*/ ctx[2] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*timeout*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*timeout*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$5.name,
    		type: "fallback",
    		source: "(125:30)              ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*value*/ ctx[0] && running === /*hash*/ ctx[1] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*value*/ ctx[0] && running === /*hash*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*value, running, hash*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const queue = writable([]);
    let running = false;
    const wrapperDefault = "fixed w-full h-full flex items-center justify-center pointer-events-none";

    function instance$e($$self, $$props, $$invalidate) {
    	let $queue;
    	validate_store(queue, "queue");
    	component_subscribe($$self, queue, $$value => $$invalidate(23, $queue = $$value));
    	let { value = false } = $$props;
    	let { timeout = 2000 } = $$props;
    	let { inProps = { duration: 100, easing: quadIn } } = $$props;

    	let { outProps = {
    		duration: 100,
    		easing: quadOut,
    		delay: 150
    	} } = $$props;

    	let { color = "gray" } = $$props;
    	let { text = "white" } = $$props;
    	let { top = false } = $$props;
    	let { bottom = true } = $$props;
    	let { right = false } = $$props;
    	let { left = false } = $$props;
    	let { noAction = true } = $$props;
    	let { hash = false } = $$props;
    	const dispatch = createEventDispatcher();

    	const classesDefault = `pointer-events-auto flex absolute py-2 px-4 z-30 mb-4 content-between mx-auto
      rounded items-center elevation-2 h-12`;

    	let { classes = wrapperDefault } = $$props;
    	const cb = new ClassBuilder($$props.class, classesDefault);
    	const wrapperCb = new ClassBuilder(classes, wrapperDefault);
    	let wClasses = i => i;
    	let tm;
    	let node;

    	let bg = () => {
    		
    	};

    	function toggle(h, id) {
    		if (value === false && running === false) {
    			return;
    		}

    		$$invalidate(1, hash = running = $$invalidate(0, value = id));
    		if (!timeout) return;

    		$$invalidate(20, tm = setTimeout(
    			() => {
    				$$invalidate(0, value = running = $$invalidate(1, hash = false));
    				dispatch("finish");

    				if ($queue.length) {
    					$queue.shift()();
    				}
    			},
    			timeout
    		));
    	}

    	wClasses = wrapperCb.flush().add(`text-${text}`).get();
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Snackbar", $$slots, ['default','action']);
    	const click_handler = () => $$invalidate(0, value = false);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			node = $$value;
    			(((((((($$invalidate(7, node), $$invalidate(24, c)), $$invalidate(21, bg)), $$invalidate(8, color)), $$invalidate(12, right)), $$invalidate(10, top)), $$invalidate(13, left)), $$invalidate(11, bottom)), $$invalidate(5, noAction));
    		});
    	}

    	const click_handler_1 = () => $$invalidate(0, value = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(30, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("timeout" in $$new_props) $$invalidate(2, timeout = $$new_props.timeout);
    		if ("inProps" in $$new_props) $$invalidate(3, inProps = $$new_props.inProps);
    		if ("outProps" in $$new_props) $$invalidate(4, outProps = $$new_props.outProps);
    		if ("color" in $$new_props) $$invalidate(8, color = $$new_props.color);
    		if ("text" in $$new_props) $$invalidate(9, text = $$new_props.text);
    		if ("top" in $$new_props) $$invalidate(10, top = $$new_props.top);
    		if ("bottom" in $$new_props) $$invalidate(11, bottom = $$new_props.bottom);
    		if ("right" in $$new_props) $$invalidate(12, right = $$new_props.right);
    		if ("left" in $$new_props) $$invalidate(13, left = $$new_props.left);
    		if ("noAction" in $$new_props) $$invalidate(5, noAction = $$new_props.noAction);
    		if ("hash" in $$new_props) $$invalidate(1, hash = $$new_props.hash);
    		if ("classes" in $$new_props) $$invalidate(14, classes = $$new_props.classes);
    		if ("$$scope" in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		queue,
    		running,
    		fade,
    		scale,
    		createEventDispatcher,
    		quadOut,
    		quadIn,
    		Button,
    		Spacer: Spacer$1,
    		utils,
    		ClassBuilder,
    		value,
    		timeout,
    		inProps,
    		outProps,
    		color,
    		text,
    		top,
    		bottom,
    		right,
    		left,
    		noAction,
    		hash,
    		dispatch,
    		classesDefault,
    		wrapperDefault,
    		classes,
    		cb,
    		wrapperCb,
    		wClasses,
    		tm,
    		node,
    		bg,
    		toggle,
    		toggler,
    		$queue,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(30, $$props = assign(assign({}, $$props), $$new_props));
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("timeout" in $$props) $$invalidate(2, timeout = $$new_props.timeout);
    		if ("inProps" in $$props) $$invalidate(3, inProps = $$new_props.inProps);
    		if ("outProps" in $$props) $$invalidate(4, outProps = $$new_props.outProps);
    		if ("color" in $$props) $$invalidate(8, color = $$new_props.color);
    		if ("text" in $$props) $$invalidate(9, text = $$new_props.text);
    		if ("top" in $$props) $$invalidate(10, top = $$new_props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$new_props.bottom);
    		if ("right" in $$props) $$invalidate(12, right = $$new_props.right);
    		if ("left" in $$props) $$invalidate(13, left = $$new_props.left);
    		if ("noAction" in $$props) $$invalidate(5, noAction = $$new_props.noAction);
    		if ("hash" in $$props) $$invalidate(1, hash = $$new_props.hash);
    		if ("classes" in $$props) $$invalidate(14, classes = $$new_props.classes);
    		if ("wClasses" in $$props) $$invalidate(6, wClasses = $$new_props.wClasses);
    		if ("tm" in $$props) $$invalidate(20, tm = $$new_props.tm);
    		if ("node" in $$props) $$invalidate(7, node = $$new_props.node);
    		if ("bg" in $$props) $$invalidate(21, bg = $$new_props.bg);
    		if ("toggler" in $$props) $$invalidate(22, toggler = $$new_props.toggler);
    		if ("c" in $$props) $$invalidate(24, c = $$new_props.c);
    	};

    	let toggler;
    	let c;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 256) {
    			 {
    				const u = utils(color || "gray");
    				$$invalidate(21, bg = u.bg);
    			}
    		}

    		if ($$self.$$.dirty & /*hash, value*/ 3) {
    			 {
    				$$invalidate(1, hash = hash || (value ? btoa(`${value}${new Date().valueOf()}`) : null));
    				($$invalidate(0, value), $$invalidate(1, hash));
    			}
    		}

    		if ($$self.$$.dirty & /*value, hash*/ 3) {
    			 $$invalidate(22, toggler = () => toggle(value, hash));
    		}

    		if ($$self.$$.dirty & /*value, toggler*/ 4194305) {
    			 if (value) {
    				queue.update(u => [...u, toggler]);
    			}
    		}

    		if ($$self.$$.dirty & /*running, value, $queue*/ 8388609) {
    			 if (!running && value && $queue.length) {
    				$queue.shift()();
    			}
    		}

    		if ($$self.$$.dirty & /*value, tm*/ 1048577) {
    			 if (!value) clearTimeout(tm);
    		}

    		if ($$self.$$.dirty & /*bg, color, right, top, left, bottom, noAction*/ 2112800) {
    			 $$invalidate(24, c = cb.flush().add(bg(800), color).add("right-0 mr-2", right).add("top-0 mt-2", top).add("left-0 ml-2", left).add("bottom-0", bottom).add("snackbar", !noAction).get());
    		}

    		if ($$self.$$.dirty & /*node, c*/ 16777344) {
    			// for some reason it doesn't get updated otherwise
    			 if (node) $$invalidate(7, node.classList = c, node);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		hash,
    		timeout,
    		inProps,
    		outProps,
    		noAction,
    		wClasses,
    		node,
    		color,
    		text,
    		top,
    		bottom,
    		right,
    		left,
    		classes,
    		$$slots,
    		click_handler,
    		div0_binding,
    		click_handler_1,
    		$$scope
    	];
    }

    class Snackbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			value: 0,
    			timeout: 2,
    			inProps: 3,
    			outProps: 4,
    			color: 8,
    			text: 9,
    			top: 10,
    			bottom: 11,
    			right: 12,
    			left: 13,
    			noAction: 5,
    			hash: 1,
    			classes: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Snackbar",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get value() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get timeout() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timeout(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inProps() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inProps(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outProps() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outProps(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noAction() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noAction(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hash() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hash(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/Switch/Switch.svelte generated by Svelte v3.24.1 */
    const file$f = "node_modules/smelte/src/components/Switch/Switch.svelte";

    // (63:4) <Ripple color={value && !disabled ? color : 'gray'} noHover>
    function create_default_slot$5(ctx) {
    	let div;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", /*th*/ ctx[6]);
    			attr_dev(div, "style", div_style_value = /*value*/ ctx[0] ? "left: 1.25rem" : "");
    			add_location(div, file$f, 63, 6, 1907);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*th*/ 64) {
    				attr_dev(div, "class", /*th*/ ctx[6]);
    			}

    			if (dirty & /*value*/ 1 && div_style_value !== (div_style_value = /*value*/ ctx[0] ? "left: 1.25rem" : "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(63:4) <Ripple color={value && !disabled ? color : 'gray'} noHover>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div2;
    	let input;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let ripple;
    	let t2;
    	let label_1;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;

    	ripple = new Ripple({
    			props: {
    				color: /*value*/ ctx[0] && !/*disabled*/ ctx[3]
    				? /*color*/ ctx[2]
    				: "gray",
    				noHover: true,
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			input = element("input");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			create_component(ripple.$$.fragment);
    			t2 = space();
    			label_1 = element("label");
    			t3 = text(/*label*/ ctx[1]);
    			attr_dev(input, "class", "hidden");
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$f, 59, 2, 1712);
    			attr_dev(div0, "class", "w-full h-full absolute");
    			add_location(div0, file$f, 61, 4, 1797);
    			attr_dev(div1, "class", /*tr*/ ctx[5]);
    			add_location(div1, file$f, 60, 2, 1776);
    			attr_dev(label_1, "aria-hidden", "true");
    			attr_dev(label_1, "class", /*l*/ ctx[7]);
    			add_location(label_1, file$f, 68, 2, 2004);
    			attr_dev(div2, "class", /*c*/ ctx[4]);
    			add_location(div2, file$f, 58, 0, 1677);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			mount_component(ripple, div1, null);
    			append_dev(div2, t2);
    			append_dev(div2, label_1);
    			append_dev(label_1, t3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[14]),
    					listen_dev(input, "change", /*change_handler*/ ctx[13], false, false, false),
    					listen_dev(div2, "click", /*check*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			const ripple_changes = {};

    			if (dirty & /*value, disabled, color*/ 13) ripple_changes.color = /*value*/ ctx[0] && !/*disabled*/ ctx[3]
    			? /*color*/ ctx[2]
    			: "gray";

    			if (dirty & /*$$scope, th, value*/ 2097217) {
    				ripple_changes.$$scope = { dirty, ctx };
    			}

    			ripple.$set(ripple_changes);

    			if (!current || dirty & /*tr*/ 32) {
    				attr_dev(div1, "class", /*tr*/ ctx[5]);
    			}

    			if (!current || dirty & /*label*/ 2) set_data_dev(t3, /*label*/ ctx[1]);

    			if (!current || dirty & /*l*/ 128) {
    				attr_dev(label_1, "class", /*l*/ ctx[7]);
    			}

    			if (!current || dirty & /*c*/ 16) {
    				attr_dev(div2, "class", /*c*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(ripple);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const trackClassesDefault = "relative w-10 h-auto z-0 rounded-full overflow-visible flex items-center justify-center";
    const thumbClassesDefault = "rounded-full p-2 w-5 h-5 absolute elevation-3 duration-100";
    const labelClassesDefault = "pl-2 cursor-pointer";

    function instance$f($$self, $$props, $$invalidate) {
    	const classesDefault = `inline-flex items-center mb-2 cursor-pointer z-10`;
    	let { value = false } = $$props;
    	let { label = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { disabled = false } = $$props;
    	let { trackClasses = trackClassesDefault } = $$props;
    	let { thumbClasses = thumbClassesDefault } = $$props;
    	let { labelClasses = labelClassesDefault } = $$props;
    	let { classes = classesDefault } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault);
    	const trcb = new ClassBuilder(trackClasses, trackClassesDefault);
    	const thcb = new ClassBuilder(thumbClasses, thumbClassesDefault);
    	const lcb = new ClassBuilder(labelClasses, labelClassesDefault);

    	function check() {
    		if (disabled) return;
    		$$invalidate(0, value = !value);
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Switch", $$slots, []);

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(20, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$new_props) $$invalidate(1, label = $$new_props.label);
    		if ("color" in $$new_props) $$invalidate(2, color = $$new_props.color);
    		if ("disabled" in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ("trackClasses" in $$new_props) $$invalidate(9, trackClasses = $$new_props.trackClasses);
    		if ("thumbClasses" in $$new_props) $$invalidate(10, thumbClasses = $$new_props.thumbClasses);
    		if ("labelClasses" in $$new_props) $$invalidate(11, labelClasses = $$new_props.labelClasses);
    		if ("classes" in $$new_props) $$invalidate(12, classes = $$new_props.classes);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		ClassBuilder,
    		classesDefault,
    		trackClassesDefault,
    		thumbClassesDefault,
    		labelClassesDefault,
    		value,
    		label,
    		color,
    		disabled,
    		trackClasses,
    		thumbClasses,
    		labelClasses,
    		classes,
    		cb,
    		trcb,
    		thcb,
    		lcb,
    		check,
    		c,
    		tr,
    		th,
    		l
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(20, $$props = assign(assign({}, $$props), $$new_props));
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$props) $$invalidate(1, label = $$new_props.label);
    		if ("color" in $$props) $$invalidate(2, color = $$new_props.color);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ("trackClasses" in $$props) $$invalidate(9, trackClasses = $$new_props.trackClasses);
    		if ("thumbClasses" in $$props) $$invalidate(10, thumbClasses = $$new_props.thumbClasses);
    		if ("labelClasses" in $$props) $$invalidate(11, labelClasses = $$new_props.labelClasses);
    		if ("classes" in $$props) $$invalidate(12, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(4, c = $$new_props.c);
    		if ("tr" in $$props) $$invalidate(5, tr = $$new_props.tr);
    		if ("th" in $$props) $$invalidate(6, th = $$new_props.th);
    		if ("l" in $$props) $$invalidate(7, l = $$new_props.l);
    	};

    	let c;
    	let tr;
    	let th;
    	let l;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(4, c = cb.flush().add(classes, true, classesDefault).add($$props.class).get());

    		if ($$self.$$.dirty & /*value, color, trackClasses*/ 517) {
    			 $$invalidate(5, tr = trcb.flush().add("bg-gray-700", !value).add(`bg-${color}-200`, value).add(trackClasses, true, trackClassesDefault).get());
    		}

    		if ($$self.$$.dirty & /*thumbClasses, value, color*/ 1029) {
    			 $$invalidate(6, th = thcb.flush().add(thumbClasses, true, thumbClassesDefault).add("bg-white left-0", !value).add(`bg-${color}-400`, value).get());
    		}

    		if ($$self.$$.dirty & /*labelClasses, disabled*/ 2056) {
    			 $$invalidate(7, l = lcb.flush().add(labelClasses, true, labelClassesDefault).add("text-gray-500", disabled).add("text-gray-700", !disabled).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		label,
    		color,
    		disabled,
    		c,
    		tr,
    		th,
    		l,
    		check,
    		trackClasses,
    		thumbClasses,
    		labelClasses,
    		classes,
    		change_handler,
    		input_change_handler
    	];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			value: 0,
    			label: 1,
    			color: 2,
    			disabled: 3,
    			trackClasses: 9,
    			thumbClasses: 10,
    			labelClasses: 11,
    			classes: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get value() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trackClasses() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trackClasses(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbClasses() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbClasses(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClasses() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClasses(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/Tooltip/Tooltip.svelte generated by Svelte v3.24.1 */
    const file$g = "node_modules/smelte/src/components/Tooltip/Tooltip.svelte";
    const get_activator_slot_changes$1 = dirty => ({});
    const get_activator_slot_context$1 = ctx => ({});

    // (78:2) {#if show}
    function create_if_block$7(ctx) {
    	let div;
    	let div_class_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*c*/ ctx[3]) + " svelte-1n6auy7"));
    			add_location(div, file$g, 78, 4, 1636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*c*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(/*c*/ ctx[3]) + " svelte-1n6auy7"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, scale, { duration: 150 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, scale, { duration: 150, delay: 100 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(78:2) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const activator_slot_template = /*$$slots*/ ctx[9].activator;
    	const activator_slot = create_slot(activator_slot_template, ctx, /*$$scope*/ ctx[8], get_activator_slot_context$1);
    	let if_block = /*show*/ ctx[0] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (activator_slot) activator_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			add_location(div0, file$g, 66, 2, 1395);
    			attr_dev(div1, "class", "relative inline-block");
    			add_location(div1, file$g, 65, 0, 1357);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (activator_slot) {
    				activator_slot.m(div0, null);
    			}

    			append_dev(div1, t);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div0,
    						"mouseenter",
    						function () {
    							if (is_function(debounce(/*showTooltip*/ ctx[4], /*delayShow*/ ctx[2]))) debounce(/*showTooltip*/ ctx[4], /*delayShow*/ ctx[2]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div0,
    						"mouseleave",
    						function () {
    							if (is_function(debounce(/*hideTooltip*/ ctx[5], /*delayHide*/ ctx[1]))) debounce(/*hideTooltip*/ ctx[5], /*delayHide*/ ctx[1]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div0, "mouseenter", /*mouseenter_handler*/ ctx[10], false, false, false),
    					listen_dev(div0, "mouseleave", /*mouseleave_handler*/ ctx[11], false, false, false),
    					listen_dev(div0, "mouseover", /*mouseover_handler*/ ctx[12], false, false, false),
    					listen_dev(div0, "mouseout", /*mouseout_handler*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (activator_slot) {
    				if (activator_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(activator_slot, activator_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_activator_slot_changes$1, get_activator_slot_context$1);
    				}
    			}

    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*show*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(activator_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(activator_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (activator_slot) activator_slot.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$8 = "tooltip whitespace-no-wrap text-xs absolute mt-2 bg-gray-600 text-gray-50 rounded md:px-2 md:py-2 py-4 px-3 z-30";

    function debounce(func, wait, immediate) {
    	let timeout;

    	return function () {
    		let context = this, args = arguments;

    		let later = function () {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		};

    		let callNow = immediate && !timeout;
    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    		if (callNow) func.apply(context, args);
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { classes = classesDefault$8 } = $$props;
    	let { show = false } = $$props;
    	let { timeout = null } = $$props;
    	let { delayHide = 100 } = $$props;
    	let { delayShow = 100 } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault$8);

    	function showTooltip() {
    		if (show) return;
    		$$invalidate(0, show = true);
    		if (!timeout) return;

    		$$invalidate(6, timeout = setTimeout(
    			() => {
    				$$invalidate(0, show = false);
    			},
    			timeout
    		));
    	}

    	function hideTooltip() {
    		if (!show) return;
    		$$invalidate(0, show = false);
    		clearTimeout(timeout);
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tooltip", $$slots, ['activator','default']);

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseout_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(15, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("classes" in $$new_props) $$invalidate(7, classes = $$new_props.classes);
    		if ("show" in $$new_props) $$invalidate(0, show = $$new_props.show);
    		if ("timeout" in $$new_props) $$invalidate(6, timeout = $$new_props.timeout);
    		if ("delayHide" in $$new_props) $$invalidate(1, delayHide = $$new_props.delayHide);
    		if ("delayShow" in $$new_props) $$invalidate(2, delayShow = $$new_props.delayShow);
    		if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		fade,
    		ClassBuilder,
    		classesDefault: classesDefault$8,
    		classes,
    		show,
    		timeout,
    		delayHide,
    		delayShow,
    		cb,
    		showTooltip,
    		hideTooltip,
    		debounce,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(15, $$props = assign(assign({}, $$props), $$new_props));
    		if ("classes" in $$props) $$invalidate(7, classes = $$new_props.classes);
    		if ("show" in $$props) $$invalidate(0, show = $$new_props.show);
    		if ("timeout" in $$props) $$invalidate(6, timeout = $$new_props.timeout);
    		if ("delayHide" in $$props) $$invalidate(1, delayHide = $$new_props.delayHide);
    		if ("delayShow" in $$props) $$invalidate(2, delayShow = $$new_props.delayShow);
    		if ("c" in $$props) $$invalidate(3, c = $$new_props.c);
    	};

    	let c;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(3, c = cb.flush().add(classes, true, classesDefault$8).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		show,
    		delayHide,
    		delayShow,
    		c,
    		showTooltip,
    		hideTooltip,
    		timeout,
    		classes,
    		$$scope,
    		$$slots,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseover_handler,
    		mouseout_handler
    	];
    }

    class Tooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			classes: 7,
    			show: 0,
    			timeout: 6,
    			delayHide: 1,
    			delayShow: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tooltip",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get classes() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get timeout() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timeout(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delayHide() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delayHide(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delayShow() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delayShow(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/IntroPage.svelte generated by Svelte v3.24.1 */
    const file$h = "src/IntroPage.svelte";

    // (24:4) <div slot="activator">
    function create_activator_slot(ctx) {
    	let div;
    	let a;
    	let sup;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			sup = element("sup");
    			sup.textContent = "(1)";
    			add_location(sup, file$h, 24, 22, 925);
    			attr_dev(a, "role", "button");
    			add_location(a, file$h, 24, 5, 908);
    			attr_dev(div, "slot", "activator");
    			add_location(div, file$h, 23, 4, 880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, sup);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot.name,
    		type: "slot",
    		source: "(24:4) <div slot=\\\"activator\\\">",
    		ctx
    	});

    	return block;
    }

    // (23:3) <Tooltip>
    function create_default_slot$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\n\t\t\t\tThat is, a big collection of IT 'recipes' that defines how to auto-deploy the LA services given some\n\t\t\t\tvariables (the ansible inventories)");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(23:3) <Tooltip>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let blockquote;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let h50;
    	let t5;
    	let p2;
    	let t6;
    	let a0;
    	let t8;
    	let t9;
    	let ul;
    	let li0;
    	let t10;
    	let a1;
    	let t12;
    	let t13;
    	let li1;
    	let t14;
    	let a2;
    	let t16;
    	let a3;
    	let t18;
    	let tooltip;
    	let t19;
    	let t20;
    	let li2;
    	let t22;
    	let p3;
    	let t24;
    	let h51;
    	let t26;
    	let a4;
    	let t28;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				$$slots: {
    					default: [create_default_slot$6],
    					activator: [create_activator_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			blockquote = element("blockquote");
    			p0 = element("p");
    			p0.textContent = "This tool facilitates the generation of your Living Atlas (LA) initial configuration.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "This allows you to bootstrap the initial deployment of your LA Platform.";
    			t3 = space();
    			h50 = element("h5");
    			h50.textContent = "How this works?";
    			t5 = space();
    			p2 = element("p");
    			t6 = text("A ");
    			a0 = element("a");
    			a0.textContent = "Living Atlas";
    			t8 = text(" can be typically\n\t\tdeployed using:");
    			t9 = space();
    			ul = element("ul");
    			li0 = element("li");
    			t10 = text("the ");
    			a1 = element("a");
    			a1.textContent = "Atlas of Living Australia (ALA)";
    			t12 = text(" Free and Open\n\t\t\tSource Software, with");
    			t13 = space();
    			li1 = element("li");
    			t14 = text("the ");
    			a2 = element("a");
    			a2.textContent = "ala-install";
    			t16 = text("\n\t\t\tALA ");
    			a3 = element("a");
    			a3.textContent = "ansible";
    			t18 = text(" playbooks\n\t\t\t");
    			create_component(tooltip.$$.fragment);
    			t19 = text("\n\t\t\t, with");
    			t20 = space();
    			li2 = element("li");
    			li2.textContent = "some custom ansible inventories with information about your LA site (like your domain,\n\t\t\torganization name, name of the servers to use, contact email, and a big etcetera)";
    			t22 = space();
    			p3 = element("p");
    			p3.textContent = "This generator helps you with this last step. Following this assistant, and asking some basic questions\n\t\tyou can generate and download your initial LA inventories. It generates also a compatible LA\n\t\tbasic theme for your site.";
    			t24 = space();
    			h51 = element("h5");
    			h51.textContent = "Do you prefer to use the command line?";
    			t26 = text("\n\tNo problem, this is only a web helper for our ");
    			a4 = element("a");
    			a4.textContent = "yeoman living-atlas generator";
    			t28 = text(".");
    			attr_dev(p0, "class", "svelte-g25crf");
    			add_location(p0, file$h, 6, 2, 160);
    			attr_dev(p1, "class", "svelte-g25crf");
    			add_location(p1, file$h, 9, 2, 262);
    			attr_dev(blockquote, "class", "pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg right");
    			add_location(blockquote, file$h, 5, 1, 77);
    			add_location(h50, file$h, 13, 1, 365);
    			attr_dev(a0, "href", "https://living-atlases.gbif.org");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$h, 14, 6, 396);
    			attr_dev(p2, "class", "svelte-g25crf");
    			add_location(p2, file$h, 14, 1, 391);
    			attr_dev(a1, "href", "https://ala.org.au/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$h, 17, 10, 547);
    			add_location(li0, file$h, 17, 2, 539);
    			attr_dev(a2, "href", "https://github.com/AtlasOfLivingAustralia/ala-install/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$h, 20, 10, 686);
    			attr_dev(a3, "href", "https://www.ansible.com/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$h, 21, 7, 790);
    			add_location(li1, file$h, 20, 2, 678);
    			add_location(li2, file$h, 31, 2, 1134);
    			attr_dev(ul, "class", "list-decimal svelte-g25crf");
    			add_location(ul, file$h, 16, 1, 511);
    			attr_dev(p3, "class", "svelte-g25crf");
    			add_location(p3, file$h, 35, 1, 1326);
    			add_location(h51, file$h, 39, 1, 1564);
    			attr_dev(a4, "href", "https://www.npmjs.com/package/generator-living-atlas");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$h, 40, 47, 1659);
    			attr_dev(div, "class", "to-left");
    			add_location(div, file$h, 4, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, blockquote);
    			append_dev(blockquote, p0);
    			append_dev(blockquote, t1);
    			append_dev(blockquote, p1);
    			append_dev(div, t3);
    			append_dev(div, h50);
    			append_dev(div, t5);
    			append_dev(div, p2);
    			append_dev(p2, t6);
    			append_dev(p2, a0);
    			append_dev(p2, t8);
    			append_dev(div, t9);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, t10);
    			append_dev(li0, a1);
    			append_dev(li0, t12);
    			append_dev(ul, t13);
    			append_dev(ul, li1);
    			append_dev(li1, t14);
    			append_dev(li1, a2);
    			append_dev(li1, t16);
    			append_dev(li1, a3);
    			append_dev(li1, t18);
    			mount_component(tooltip, li1, null);
    			append_dev(li1, t19);
    			append_dev(ul, t20);
    			append_dev(ul, li2);
    			append_dev(div, t22);
    			append_dev(div, p3);
    			append_dev(div, t24);
    			append_dev(div, h51);
    			append_dev(div, t26);
    			append_dev(div, a4);
    			append_dev(div, t28);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tooltip_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tooltip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IntroPage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("IntroPage", $$slots, []);
    	$$self.$capture_state = () => ({ Tooltip });
    	return [];
    }

    class IntroPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntroPage",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* node_modules/svelte-flex/src/Flex.svelte generated by Svelte v3.24.1 */

    const file$i = "node_modules/svelte-flex/src/Flex.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let div_levels = [/*$$restProps*/ ctx[1], { class: /*className*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "svelte-f66dpe", true);
    			add_location(div, file$i, 70, 0, 1526);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] }
    			]));

    			toggle_class(div, "svelte-f66dpe", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const omit_props_names = ["direction","align","justify","reverse"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { direction = "row" } = $$props;
    	let { align = "center" } = $$props;
    	let { justify = "center" } = $$props;
    	let { reverse = false } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Flex", $$slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("direction" in $$new_props) $$invalidate(2, direction = $$new_props.direction);
    		if ("align" in $$new_props) $$invalidate(3, align = $$new_props.align);
    		if ("justify" in $$new_props) $$invalidate(4, justify = $$new_props.justify);
    		if ("reverse" in $$new_props) $$invalidate(5, reverse = $$new_props.reverse);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		direction,
    		align,
    		justify,
    		reverse,
    		className
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("direction" in $$props) $$invalidate(2, direction = $$new_props.direction);
    		if ("align" in $$props) $$invalidate(3, align = $$new_props.align);
    		if ("justify" in $$props) $$invalidate(4, justify = $$new_props.justify);
    		if ("reverse" in $$props) $$invalidate(5, reverse = $$new_props.reverse);
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    	};

    	let className;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(0, className = [
    			"flex",
    			`flex-direction--${direction}${reverse ? "--reverse" : ""}`,
    			`flex-align--${align}`,
    			`flex-justify--${justify}`,
    			//  Apply any additional/custom classNames, if provided
    			$$restProps.class ? $$restProps.class : ""
    		].join(" "));
    	};

    	return [className, $$restProps, direction, align, justify, reverse, $$scope, $$slots];
    }

    class Flex extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			direction: 2,
    			align: 3,
    			justify: 4,
    			reverse: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Flex",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get direction() {
    		throw new Error("<Flex>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<Flex>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Flex>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Flex>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get justify() {
    		throw new Error("<Flex>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set justify(value) {
    		throw new Error("<Flex>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Flex>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Flex>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/BtnArea.svelte generated by Svelte v3.24.1 */
    const file$j = "src/BtnArea.svelte";

    // (16:4) {#if !firstBtnDisabled}
    function create_if_block$8(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				block: true,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*onFirstBtnClick*/ ctx[1])) /*onFirstBtnClick*/ ctx[1].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "py-2 mr-2");
    			add_location(div, file$j, 16, 6, 404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(16:4) {#if !firstBtnDisabled}",
    		ctx
    	});

    	return block;
    }

    // (18:8) <Button on:click={onFirstBtnClick} block>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("« Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(18:8) <Button on:click={onFirstBtnClick} block>",
    		ctx
    	});

    	return block;
    }

    // (22:6) <Button block disabled={sndBtnDisabled} on:click="{onSndBtnClick}">
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*sndBtnText*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sndBtnText*/ 16) set_data_dev(t, /*sndBtnText*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(22:6) <Button block disabled={sndBtnDisabled} on:click=\\\"{onSndBtnClick}\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:2) <Flex direction="row" align="end" justify="center">
    function create_default_slot$7(ctx) {
    	let t;
    	let div;
    	let button;
    	let current;
    	let if_block = !/*firstBtnDisabled*/ ctx[0] && create_if_block$8(ctx);

    	button = new Button({
    			props: {
    				block: true,
    				disabled: /*sndBtnDisabled*/ ctx[2],
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*onSndBtnClick*/ ctx[3])) /*onSndBtnClick*/ ctx[3].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "py-2");
    			add_location(div, file$j, 20, 4, 520);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!/*firstBtnDisabled*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*firstBtnDisabled*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const button_changes = {};
    			if (dirty & /*sndBtnDisabled*/ 4) button_changes.disabled = /*sndBtnDisabled*/ ctx[2];

    			if (dirty & /*$$scope, sndBtnText*/ 80) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(15:2) <Flex direction=\\\"row\\\" align=\\\"end\\\" justify=\\\"center\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div;
    	let flex;
    	let current;

    	flex = new Flex({
    			props: {
    				direction: "row",
    				align: "end",
    				justify: "center",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(flex.$$.fragment);
    			attr_dev(div, "class", "btn-area svelte-y3qrnb");
    			set_style(div, "--height", /*footerHeight*/ ctx[5]);
    			add_location(div, file$j, 13, 0, 259);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(flex, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const flex_changes = {};

    			if (dirty & /*$$scope, sndBtnDisabled, onSndBtnClick, sndBtnText, onFirstBtnClick, firstBtnDisabled*/ 95) {
    				flex_changes.$$scope = { dirty, ctx };
    			}

    			flex.$set(flex_changes);

    			if (!current || dirty & /*footerHeight*/ 32) {
    				set_style(div, "--height", /*footerHeight*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(flex);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { firstBtnDisabled } = $$props;
    	let { onFirstBtnClick } = $$props;
    	let { sndBtnDisabled } = $$props;
    	let { onSndBtnClick } = $$props;
    	let { sndBtnText } = $$props;
    	let { footerHeight } = $$props;

    	const writable_props = [
    		"firstBtnDisabled",
    		"onFirstBtnClick",
    		"sndBtnDisabled",
    		"onSndBtnClick",
    		"sndBtnText",
    		"footerHeight"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BtnArea> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BtnArea", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("firstBtnDisabled" in $$props) $$invalidate(0, firstBtnDisabled = $$props.firstBtnDisabled);
    		if ("onFirstBtnClick" in $$props) $$invalidate(1, onFirstBtnClick = $$props.onFirstBtnClick);
    		if ("sndBtnDisabled" in $$props) $$invalidate(2, sndBtnDisabled = $$props.sndBtnDisabled);
    		if ("onSndBtnClick" in $$props) $$invalidate(3, onSndBtnClick = $$props.onSndBtnClick);
    		if ("sndBtnText" in $$props) $$invalidate(4, sndBtnText = $$props.sndBtnText);
    		if ("footerHeight" in $$props) $$invalidate(5, footerHeight = $$props.footerHeight);
    	};

    	$$self.$capture_state = () => ({
    		Flex,
    		Button,
    		firstBtnDisabled,
    		onFirstBtnClick,
    		sndBtnDisabled,
    		onSndBtnClick,
    		sndBtnText,
    		footerHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ("firstBtnDisabled" in $$props) $$invalidate(0, firstBtnDisabled = $$props.firstBtnDisabled);
    		if ("onFirstBtnClick" in $$props) $$invalidate(1, onFirstBtnClick = $$props.onFirstBtnClick);
    		if ("sndBtnDisabled" in $$props) $$invalidate(2, sndBtnDisabled = $$props.sndBtnDisabled);
    		if ("onSndBtnClick" in $$props) $$invalidate(3, onSndBtnClick = $$props.onSndBtnClick);
    		if ("sndBtnText" in $$props) $$invalidate(4, sndBtnText = $$props.sndBtnText);
    		if ("footerHeight" in $$props) $$invalidate(5, footerHeight = $$props.footerHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		firstBtnDisabled,
    		onFirstBtnClick,
    		sndBtnDisabled,
    		onSndBtnClick,
    		sndBtnText,
    		footerHeight
    	];
    }

    class BtnArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			firstBtnDisabled: 0,
    			onFirstBtnClick: 1,
    			sndBtnDisabled: 2,
    			onSndBtnClick: 3,
    			sndBtnText: 4,
    			footerHeight: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BtnArea",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*firstBtnDisabled*/ ctx[0] === undefined && !("firstBtnDisabled" in props)) {
    			console.warn("<BtnArea> was created without expected prop 'firstBtnDisabled'");
    		}

    		if (/*onFirstBtnClick*/ ctx[1] === undefined && !("onFirstBtnClick" in props)) {
    			console.warn("<BtnArea> was created without expected prop 'onFirstBtnClick'");
    		}

    		if (/*sndBtnDisabled*/ ctx[2] === undefined && !("sndBtnDisabled" in props)) {
    			console.warn("<BtnArea> was created without expected prop 'sndBtnDisabled'");
    		}

    		if (/*onSndBtnClick*/ ctx[3] === undefined && !("onSndBtnClick" in props)) {
    			console.warn("<BtnArea> was created without expected prop 'onSndBtnClick'");
    		}

    		if (/*sndBtnText*/ ctx[4] === undefined && !("sndBtnText" in props)) {
    			console.warn("<BtnArea> was created without expected prop 'sndBtnText'");
    		}

    		if (/*footerHeight*/ ctx[5] === undefined && !("footerHeight" in props)) {
    			console.warn("<BtnArea> was created without expected prop 'footerHeight'");
    		}
    	}

    	get firstBtnDisabled() {
    		throw new Error("<BtnArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstBtnDisabled(value) {
    		throw new Error("<BtnArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFirstBtnClick() {
    		throw new Error("<BtnArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFirstBtnClick(value) {
    		throw new Error("<BtnArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sndBtnDisabled() {
    		throw new Error("<BtnArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sndBtnDisabled(value) {
    		throw new Error("<BtnArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSndBtnClick() {
    		throw new Error("<BtnArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSndBtnClick(value) {
    		throw new Error("<BtnArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sndBtnText() {
    		throw new Error("<BtnArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sndBtnText(value) {
    		throw new Error("<BtnArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get footerHeight() {
    		throw new Error("<BtnArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set footerHeight(value) {
    		throw new Error("<BtnArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/UrlPrefix.svelte generated by Svelte v3.24.1 */

    const file$k = "src/UrlPrefix.svelte";

    // (5:10) {#if ssl}
    function create_if_block$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("s");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(5:10) {#if ssl}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let if_block = /*ssl*/ ctx[0] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("http");
    			if (if_block) if_block.c();
    			t1 = text("://");
    			add_location(span, file$k, 4, 0, 38);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			if (if_block) if_block.m(span, null);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*ssl*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(span, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { ssl } = $$props;
    	const writable_props = ["ssl"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UrlPrefix> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("UrlPrefix", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("ssl" in $$props) $$invalidate(0, ssl = $$props.ssl);
    	};

    	$$self.$capture_state = () => ({ ssl });

    	$$self.$inject_state = $$props => {
    		if ("ssl" in $$props) $$invalidate(0, ssl = $$props.ssl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ssl];
    }

    class UrlPrefix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { ssl: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UrlPrefix",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ssl*/ ctx[0] === undefined && !("ssl" in props)) {
    			console.warn("<UrlPrefix> was created without expected prop 'ssl'");
    		}
    	}

    	get ssl() {
    		throw new Error("<UrlPrefix>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ssl(value) {
    		throw new Error("<UrlPrefix>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Service.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$l = "src/Service.svelte";

    // (63:0) {#if (service.depends != null && conf[`LA_use_${service.depends}`] === true) || service.depends == null }
    function create_if_block$a(ctx) {
    	let div;
    	let flex;
    	let t0;
    	let t1;
    	let hr;
    	let current;

    	flex = new Flex({
    			props: {
    				justify: "between",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = (!/*service*/ ctx[1].optional || /*conf*/ ctx[0]["LA_use_" + /*service*/ ctx[1].name_int]) && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(flex.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			hr = element("hr");
    			attr_dev(div, "class", "p-20 pb-5 pt-3 body-2");
    			add_location(div, file$l, 63, 1, 2565);
    			add_location(hr, file$l, 139, 1, 5184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(flex, div, null);
    			append_dev(div, t0);
    			if (if_block) if_block.m(div, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flex_changes = {};

    			if (dirty & /*$$scope, service, conf*/ 65539) {
    				flex_changes.$$scope = { dirty, ctx };
    			}

    			flex.$set(flex_changes);

    			if (!/*service*/ ctx[1].optional || /*conf*/ ctx[0]["LA_use_" + /*service*/ ctx[1].name_int]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*service, conf*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flex.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flex.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(flex);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(63:0) {#if (service.depends != null && conf[`LA_use_${service.depends}`] === true) || service.depends == null }",
    		ctx
    	});

    	return block;
    }

    // (76:3) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let t0_value = /*service*/ ctx[1].desc.charAt(0).toUpperCase() + /*service*/ ctx[1].desc.slice(1) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			attr_dev(span, "class", "desc svelte-198fmxd");
    			add_location(span, file$l, 76, 4, 2969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*service*/ 2 && t0_value !== (t0_value = /*service*/ ctx[1].desc.charAt(0).toUpperCase() + /*service*/ ctx[1].desc.slice(1) + "")) set_data_dev(t0, t0_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(76:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:3) {#if (service.optional) }
    function create_if_block_8(ctx) {
    	let div;
    	let switch_1;
    	let updating_value;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	function switch_1_value_binding(value) {
    		/*switch_1_value_binding*/ ctx[8].call(null, value);
    	}

    	let switch_1_props = {
    		color: "secondary",
    		label: "Use the " + /*service*/ ctx[1].name + " service (" + /*service*/ ctx[1].desc + ")?"
    	};

    	if (/*conf*/ ctx[0]["LA_use_" + /*service*/ ctx[1].name_int] !== void 0) {
    		switch_1_props.value = /*conf*/ ctx[0]["LA_use_" + /*service*/ ctx[1].name_int];
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, "value", switch_1_value_binding));
    	let if_block = /*service*/ ctx[1].recommended && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(switch_1.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			add_location(div, file$l, 66, 4, 2661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(switch_1, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*onChange*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_1_changes = {};
    			if (dirty & /*service*/ 2) switch_1_changes.label = "Use the " + /*service*/ ctx[1].name + " service (" + /*service*/ ctx[1].desc + ")?";

    			if (!updating_value && dirty & /*conf, service*/ 3) {
    				updating_value = true;
    				switch_1_changes.value = /*conf*/ ctx[0]["LA_use_" + /*service*/ ctx[1].name_int];
    				add_flush_callback(() => updating_value = false);
    			}

    			switch_1.$set(switch_1_changes);

    			if (/*service*/ ctx[1].recommended) {
    				if (if_block) ; else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(switch_1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(66:3) {#if (service.optional) }",
    		ctx
    	});

    	return block;
    }

    // (72:5) {#if service.recommended}
    function create_if_block_9(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Tip: It's quite recommended.";
    			attr_dev(span, "class", "tip svelte-198fmxd");
    			add_location(span, file$l, 72, 6, 2878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(72:5) {#if service.recommended}",
    		ctx
    	});

    	return block;
    }

    // (65:2) <Flex justify="between">
    function create_default_slot_4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_8, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*service*/ ctx[1].optional) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(65:2) <Flex justify=\\\"between\\\">",
    		ctx
    	});

    	return block;
    }

    // (81:2) {#if !service.optional || conf["LA_use_" + service.name_int]}
    function create_if_block_1$4(ctx) {
    	let flex;
    	let current;

    	flex = new Flex({
    			props: {
    				justify: "between",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(flex.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flex, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flex_changes = {};

    			if (dirty & /*$$scope, service, deployError, hostnamesList, conf, urlError*/ 65567) {
    				flex_changes.$$scope = { dirty, ctx };
    			}

    			flex.$set(flex_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flex, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(81:2) {#if !service.optional || conf[\\\"LA_use_\\\" + service.name_int]}",
    		ctx
    	});

    	return block;
    }

    // (84:5) {#if (typeof service.forceSubdomain === 'undefined' && !service.forceSubdomain) && !service.withoutUrl}
    function create_if_block_7(ctx) {
    	let tooltip;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				$$slots: {
    					default: [create_default_slot_3],
    					activator: [create_activator_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltip_changes = {};

    			if (dirty & /*$$scope, conf, service*/ 65539) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(84:5) {#if (typeof service.forceSubdomain === 'undefined' && !service.forceSubdomain) && !service.withoutUrl}",
    		ctx
    	});

    	return block;
    }

    // (86:7) <div slot="activator">
    function create_activator_slot_1(ctx) {
    	let div0;
    	let div1;
    	let switch_1;
    	let updating_value;
    	let current;
    	let mounted;
    	let dispose;

    	function switch_1_value_binding_1(value) {
    		/*switch_1_value_binding_1*/ ctx[9].call(null, value);
    	}

    	let switch_1_props = {};

    	if (/*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_uses_subdomain`] !== void 0) {
    		switch_1_props.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_uses_subdomain`];
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, "value", switch_1_value_binding_1));

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			create_component(switch_1.$$.fragment);
    			add_location(div1, file$l, 86, 8, 3361);
    			attr_dev(div0, "slot", "activator");
    			add_location(div0, file$l, 85, 7, 3330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div1);
    			mount_component(switch_1, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*onChange*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_1_changes = {};

    			if (!updating_value && dirty & /*conf, service*/ 3) {
    				updating_value = true;
    				switch_1_changes.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_uses_subdomain`];
    				add_flush_callback(() => updating_value = false);
    			}

    			switch_1.$set(switch_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(switch_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot_1.name,
    		type: "slot",
    		source: "(86:7) <div slot=\\\"activator\\\">",
    		ctx
    	});

    	return block;
    }

    // (85:6) <Tooltip>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\n\t\t\t\t\t\t\tUse a subdomain for this service?");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(85:6) <Tooltip>",
    		ctx
    	});

    	return block;
    }

    // (96:5) {#if !service.withoutUrl}
    function create_if_block_6$1(ctx) {
    	let urlprefix;
    	let current;

    	urlprefix = new UrlPrefix({
    			props: { ssl: /*conf*/ ctx[0].LA_enable_ssl },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(urlprefix.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(urlprefix, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const urlprefix_changes = {};
    			if (dirty & /*conf*/ 1) urlprefix_changes.ssl = /*conf*/ ctx[0].LA_enable_ssl;
    			urlprefix.$set(urlprefix_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(urlprefix.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(urlprefix.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(urlprefix, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(96:5) {#if !service.withoutUrl}",
    		ctx
    	});

    	return block;
    }

    // (100:5) {#if !service.withoutUrl}
    function create_if_block_3$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_uses_subdomain`] && create_if_block_5$1(ctx);
    	let if_block1 = !/*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_uses_subdomain`] && create_if_block_4$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_uses_subdomain`]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*conf, service*/ 3) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_uses_subdomain`]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*conf, service*/ 3) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(100:5) {#if !service.withoutUrl}",
    		ctx
    	});

    	return block;
    }

    // (101:6) {#if conf[`LA_${service.name_int}_uses_subdomain`]}
    function create_if_block_5$1(ctx) {
    	let textfield0;
    	let updating_value;
    	let t0;
    	let span;
    	let t1;
    	let t2_value = /*conf*/ ctx[0].LA_domain + "";
    	let t2;
    	let t3;
    	let t4;
    	let textfield1;
    	let updating_value_1;
    	let current;

    	function textfield0_value_binding(value) {
    		/*textfield0_value_binding*/ ctx[10].call(null, value);
    	}

    	let textfield0_props = {
    		error: /*urlError*/ ctx[4][/*service*/ ctx[1].name_int],
    		hint: /*service*/ ctx[1].hint
    	};

    	if (/*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_suburl`] !== void 0) {
    		textfield0_props.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_suburl`];
    	}

    	textfield0 = new TextField({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield0, "value", textfield0_value_binding));
    	textfield0.$on("change", /*onChange*/ ctx[5]);

    	function textfield1_value_binding(value) {
    		/*textfield1_value_binding*/ ctx[11].call(null, value);
    	}

    	let textfield1_props = {};

    	if (/*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_iniPath`] !== void 0) {
    		textfield1_props.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_iniPath`];
    	}

    	textfield1 = new TextField({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield1, "value", textfield1_value_binding));
    	textfield1.$on("change", /*onChange*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(textfield0.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(".");
    			t2 = text(t2_value);
    			t3 = text("/");
    			t4 = space();
    			create_component(textfield1.$$.fragment);
    			attr_dev(span, "class", "nowrap svelte-198fmxd");
    			add_location(span, file$l, 104, 7, 3984);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(span, t3);
    			insert_dev(target, t4, anchor);
    			mount_component(textfield1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield0_changes = {};
    			if (dirty & /*urlError, service*/ 18) textfield0_changes.error = /*urlError*/ ctx[4][/*service*/ ctx[1].name_int];
    			if (dirty & /*service*/ 2) textfield0_changes.hint = /*service*/ ctx[1].hint;

    			if (!updating_value && dirty & /*conf, service*/ 3) {
    				updating_value = true;
    				textfield0_changes.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_suburl`];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			if ((!current || dirty & /*conf*/ 1) && t2_value !== (t2_value = /*conf*/ ctx[0].LA_domain + "")) set_data_dev(t2, t2_value);
    			const textfield1_changes = {};

    			if (!updating_value_1 && dirty & /*conf, service*/ 3) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_iniPath`];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t4);
    			destroy_component(textfield1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(101:6) {#if conf[`LA_${service.name_int}_uses_subdomain`]}",
    		ctx
    	});

    	return block;
    }

    // (109:6) {#if !conf[`LA_${service.name_int}_uses_subdomain`]}
    function create_if_block_4$1(ctx) {
    	let span0;
    	let t0_value = /*conf*/ ctx[0].LA_domain + "";
    	let t0;
    	let t1;
    	let t2;
    	let textfield;
    	let updating_value;
    	let t3;
    	let span1;
    	let current;

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[12].call(null, value);
    	}

    	let textfield_props = {
    		error: /*urlError*/ ctx[4][/*service*/ ctx[1].name_int],
    		hint: /*service*/ ctx[1].hint
    	};

    	if (/*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_suburl`] !== void 0) {
    		textfield_props.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_suburl`];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, "value", textfield_value_binding));
    	textfield.$on("change", /*onChange*/ ctx[5]);

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text("/");
    			t2 = space();
    			create_component(textfield.$$.fragment);
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "/";
    			attr_dev(span0, "class", "nowrap svelte-198fmxd");
    			add_location(span0, file$l, 109, 7, 4203);
    			add_location(span1, file$l, 113, 7, 4429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(textfield, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*conf*/ 1) && t0_value !== (t0_value = /*conf*/ ctx[0].LA_domain + "")) set_data_dev(t0, t0_value);
    			const textfield_changes = {};
    			if (dirty & /*urlError, service*/ 18) textfield_changes.error = /*urlError*/ ctx[4][/*service*/ ctx[1].name_int];
    			if (dirty & /*service*/ 2) textfield_changes.hint = /*service*/ ctx[1].hint;

    			if (!updating_value && dirty & /*conf, service*/ 3) {
    				updating_value = true;
    				textfield_changes.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_suburl`];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			destroy_component(textfield, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(109:6) {#if !conf[`LA_${service.name_int}_uses_subdomain`]}",
    		ctx
    	});

    	return block;
    }

    // (83:4) <Flex justify="start">
    function create_default_slot_2$2(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = typeof /*service*/ ctx[1].forceSubdomain === "undefined" && !/*service*/ ctx[1].forceSubdomain && !/*service*/ ctx[1].withoutUrl && create_if_block_7(ctx);
    	let if_block1 = !/*service*/ ctx[1].withoutUrl && create_if_block_6$1(ctx);
    	let if_block2 = !/*service*/ ctx[1].withoutUrl && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (typeof /*service*/ ctx[1].forceSubdomain === "undefined" && !/*service*/ ctx[1].forceSubdomain && !/*service*/ ctx[1].withoutUrl) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*service*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*service*/ ctx[1].withoutUrl) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*service*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!/*service*/ ctx[1].withoutUrl) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*service*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_3$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(83:4) <Flex justify=\\\"start\\\">",
    		ctx
    	});

    	return block;
    }

    // (132:4) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				icon: "help_outline",
    				text: true,
    				light: true,
    				flat: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "btn-hidden svelte-198fmxd");
    			add_location(div, file$l, 132, 5, 5057);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(132:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (123:4) {#if service.sample != null}
    function create_if_block_2$3(ctx) {
    	let tooltip;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1$4],
    					activator: [create_activator_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltip_changes = {};

    			if (dirty & /*$$scope, service*/ 65538) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(123:4) {#if service.sample != null}",
    		ctx
    	});

    	return block;
    }

    // (125:6) <div slot="activator">
    function create_activator_slot$1(ctx) {
    	let div;
    	let a;
    	let button;
    	let a_href_value;
    	let current;

    	button = new Button({
    			props: {
    				icon: "help_outline",
    				text: true,
    				light: true,
    				flat: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(a, "class", "btn-visible nohover svelte-198fmxd");
    			attr_dev(a, "href", a_href_value = /*service*/ ctx[1].sample);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$l, 125, 7, 4833);
    			attr_dev(div, "slot", "activator");
    			add_location(div, file$l, 124, 6, 4803);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			mount_component(button, a, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*service*/ 2 && a_href_value !== (a_href_value = /*service*/ ctx[1].sample)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot$1.name,
    		type: "slot",
    		source: "(125:6) <div slot=\\\"activator\\\">",
    		ctx
    	});

    	return block;
    }

    // (124:5) <Tooltip>
    function create_default_slot_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\n\t\t\t\t\t\tSee a similar service in production");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(124:5) <Tooltip>",
    		ctx
    	});

    	return block;
    }

    // (82:3) <Flex justify="between">
    function create_default_slot$8(ctx) {
    	let flex;
    	let t0;
    	let div;
    	let select;
    	let updating_value;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	flex = new Flex({
    			props: {
    				justify: "start",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function select_value_binding(value) {
    		/*select_value_binding*/ ctx[13].call(null, value);
    	}

    	let select_props = {
    		error: /*deployError*/ ctx[3][/*service*/ ctx[1].name_int],
    		class: "deploy-in",
    		outlined: true,
    		label: "deploy it in",
    		items: /*hostnamesList*/ ctx[2]
    	};

    	if (/*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_hostname`] !== void 0) {
    		select_props.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_hostname`];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "value", select_value_binding));
    	select.$on("change", /*change_handler*/ ctx[14]);
    	const if_block_creators = [create_if_block_2$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*service*/ ctx[1].sample != null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(flex.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(select.$$.fragment);
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "deploy-in svelte-198fmxd");
    			add_location(div, file$l, 117, 4, 4484);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flex, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(select, div, null);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flex_changes = {};

    			if (dirty & /*$$scope, urlError, service, conf*/ 65555) {
    				flex_changes.$$scope = { dirty, ctx };
    			}

    			flex.$set(flex_changes);
    			const select_changes = {};
    			if (dirty & /*deployError, service*/ 10) select_changes.error = /*deployError*/ ctx[3][/*service*/ ctx[1].name_int];
    			if (dirty & /*hostnamesList*/ 4) select_changes.items = /*hostnamesList*/ ctx[2];

    			if (!updating_value && dirty & /*conf, service*/ 3) {
    				updating_value = true;
    				select_changes.value = /*conf*/ ctx[0][`LA_${/*service*/ ctx[1].name_int}_hostname`];
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flex.$$.fragment, local);
    			transition_in(select.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flex.$$.fragment, local);
    			transition_out(select.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flex, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(select);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(82:3) <Flex justify=\\\"between\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*service*/ ctx[1].depends != null && /*conf*/ ctx[0][`LA_use_${/*service*/ ctx[1].depends}`] === true || /*service*/ ctx[1].depends == null) && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*service*/ ctx[1].depends != null && /*conf*/ ctx[0][`LA_use_${/*service*/ ctx[1].depends}`] === true || /*service*/ ctx[1].depends == null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*service, conf*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const subdomainRegexp = /[a-z0-9_.\-]+/;

    function instance$l($$self, $$props, $$invalidate) {
    	let { service } = $$props;
    	let { conf } = $$props;
    	let { hostnamesList } = $$props;
    	let { save } = $$props;
    	let { debug } = $$props;
    	let deployError = {};
    	let urlError = {};
    	deployError[service.name_int] = "kk";
    	urlError[service.name_int] = "";

    	let verify = function () {
    		if (conf[`LA_${service.name_int}_suburl`] == null) {
    			$$invalidate(0, conf[`LA_${service.name_int}_suburl`] = service.name, conf);
    		}

    		if (conf[`LA_${service.name_int}_iniPath`] == null) {
    			$$invalidate(0, conf[`LA_${service.name_int}_iniPath`] = service.path, conf);
    		}

    		if (hostnamesList && hostnamesList.length > 0 && (conf[`LA_${service.name_int}_hostname`] == "" || !hostnamesList.includes(conf[`LA_${service.name_int}_hostname`]))) {
    			if (debug) console.log("Setting " + conf[`LA_${service.name_int}_hostname`] + ` to ${hostnamesList[0]}`);
    			$$invalidate(0, conf[`LA_${service.name_int}_hostname`] = hostnamesList[0], conf);
    		}

    		if (!conf["LA_use_ala_bie"]) {
    			$$invalidate(0, conf["LA_use_species_lists"] = false, conf);
    		}

    		$$invalidate(
    			0,
    			conf[`LA_${service.name_int}_path`] = conf[`LA_${service.name_int}_uses_subdomain`]
    			? conf[`LA_${service.name_int}_iniPath`].startsWith("/")
    				? ""
    				: "/" + conf[`LA_${service.name_int}_iniPath`]
    			: conf[`LA_${service.name_int}_suburl`].startsWith("/")
    				? ""
    				: "/" + conf[`LA_${service.name_int}_suburl`],
    			conf
    		);

    		$$invalidate(
    			0,
    			conf[`LA_${service.name_int}_url`] = conf[`LA_${service.name_int}_uses_subdomain`]
    			? conf[`LA_${service.name_int}_suburl`] + "." + conf.LA_domain
    			: conf.LA_domain,
    			conf
    		);

    		$$invalidate(
    			4,
    			urlError[service.name_int] = !subdomainRegexp.test(conf[`LA_${service.name_int}_suburl`])
    			? "Invalid subdomain"
    			: "",
    			urlError
    		);

    		$$invalidate(
    			3,
    			deployError[service.name_int] = conf[`LA_${service.name_int}_hostname`] == null || !hostnamesList.includes(conf[`LA_${service.name_int}_hostname`])
    			? "Please select a server"
    			: "",
    			deployError
    		);

    		if (debug) console.log("Url: " + conf[`LA_${service.name_int}_url`]);
    		if (debug) console.log("Path: " + conf[`LA_${service.name_int}_path`]);
    		if (debug) console.log("Hostname : " + conf[`LA_${service.name_int}_hostname`]);
    	};

    	let onChange = function (val) {
    		if (val && debug) console.log(val);
    		if (debug) console.log("on service change");
    		verify();
    		save();
    	};

    	const writable_props = ["service", "conf", "hostnamesList", "save", "debug"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Service> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Service", $$slots, []);

    	function switch_1_value_binding(value) {
    		conf["LA_use_" + service.name_int] = value;
    		$$invalidate(0, conf);
    	}

    	function switch_1_value_binding_1(value) {
    		conf[`LA_${service.name_int}_uses_subdomain`] = value;
    		$$invalidate(0, conf);
    	}

    	function textfield0_value_binding(value) {
    		conf[`LA_${service.name_int}_suburl`] = value;
    		$$invalidate(0, conf);
    	}

    	function textfield1_value_binding(value) {
    		conf[`LA_${service.name_int}_iniPath`] = value;
    		$$invalidate(0, conf);
    	}

    	function textfield_value_binding(value) {
    		conf[`LA_${service.name_int}_suburl`] = value;
    		$$invalidate(0, conf);
    	}

    	function select_value_binding(value) {
    		conf[`LA_${service.name_int}_hostname`] = value;
    		$$invalidate(0, conf);
    	}

    	const change_handler = v => onChange(v.datail);

    	$$self.$$set = $$props => {
    		if ("service" in $$props) $$invalidate(1, service = $$props.service);
    		if ("conf" in $$props) $$invalidate(0, conf = $$props.conf);
    		if ("hostnamesList" in $$props) $$invalidate(2, hostnamesList = $$props.hostnamesList);
    		if ("save" in $$props) $$invalidate(6, save = $$props.save);
    		if ("debug" in $$props) $$invalidate(7, debug = $$props.debug);
    	};

    	$$self.$capture_state = () => ({
    		Flex,
    		Button,
    		Card: Card$1,
    		Select,
    		Switch,
    		TextField,
    		Tooltip,
    		UrlPrefix,
    		service,
    		conf,
    		hostnamesList,
    		save,
    		debug,
    		subdomainRegexp,
    		deployError,
    		urlError,
    		verify,
    		onChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("service" in $$props) $$invalidate(1, service = $$props.service);
    		if ("conf" in $$props) $$invalidate(0, conf = $$props.conf);
    		if ("hostnamesList" in $$props) $$invalidate(2, hostnamesList = $$props.hostnamesList);
    		if ("save" in $$props) $$invalidate(6, save = $$props.save);
    		if ("debug" in $$props) $$invalidate(7, debug = $$props.debug);
    		if ("deployError" in $$props) $$invalidate(3, deployError = $$props.deployError);
    		if ("urlError" in $$props) $$invalidate(4, urlError = $$props.urlError);
    		if ("verify" in $$props) $$invalidate(15, verify = $$props.verify);
    		if ("onChange" in $$props) $$invalidate(5, onChange = $$props.onChange);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 {
    		verify();
    	}

    	return [
    		conf,
    		service,
    		hostnamesList,
    		deployError,
    		urlError,
    		onChange,
    		save,
    		debug,
    		switch_1_value_binding,
    		switch_1_value_binding_1,
    		textfield0_value_binding,
    		textfield1_value_binding,
    		textfield_value_binding,
    		select_value_binding,
    		change_handler
    	];
    }

    class Service extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			service: 1,
    			conf: 0,
    			hostnamesList: 2,
    			save: 6,
    			debug: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Service",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*service*/ ctx[1] === undefined && !("service" in props)) {
    			console_1.warn("<Service> was created without expected prop 'service'");
    		}

    		if (/*conf*/ ctx[0] === undefined && !("conf" in props)) {
    			console_1.warn("<Service> was created without expected prop 'conf'");
    		}

    		if (/*hostnamesList*/ ctx[2] === undefined && !("hostnamesList" in props)) {
    			console_1.warn("<Service> was created without expected prop 'hostnamesList'");
    		}

    		if (/*save*/ ctx[6] === undefined && !("save" in props)) {
    			console_1.warn("<Service> was created without expected prop 'save'");
    		}

    		if (/*debug*/ ctx[7] === undefined && !("debug" in props)) {
    			console_1.warn("<Service> was created without expected prop 'debug'");
    		}
    	}

    	get service() {
    		throw new Error("<Service>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set service(value) {
    		throw new Error("<Service>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get conf() {
    		throw new Error("<Service>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set conf(value) {
    		throw new Error("<Service>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hostnamesList() {
    		throw new Error("<Service>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hostnamesList(value) {
    		throw new Error("<Service>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get save() {
    		throw new Error("<Service>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set save(value) {
    		throw new Error("<Service>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get debug() {
    		throw new Error("<Service>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debug(value) {
    		throw new Error("<Service>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SiteMenu.svelte generated by Svelte v3.24.1 */
    const file$m = "src/SiteMenu.svelte";

    // (65:0) <Snackbar timeout={5000} top bind:value={showSnackbarTop}>
    function create_default_slot_1$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "URL copied. People with this URL can edit this configuration. You can also bookmark it";
    			add_location(div, file$m, 65, 1, 1678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(65:0) <Snackbar timeout={5000} top bind:value={showSnackbarTop}>",
    		ctx
    	});

    	return block;
    }

    // (69:1) <div slot="activator">
    function create_activator_slot$2(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				icon: "menu",
    				text: true,
    				light: true,
    				flat: true
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "slot", "activator");
    			add_location(div, file$m, 68, 1, 1836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot$2.name,
    		type: "slot",
    		source: "(69:1) <div slot=\\\"activator\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let input;
    	let t0;
    	let snackbar;
    	let updating_value;
    	let t1;
    	let menu;
    	let updating_open;
    	let updating_value_1;
    	let current;

    	function snackbar_value_binding(value) {
    		/*snackbar_value_binding*/ ctx[5].call(null, value);
    	}

    	let snackbar_props = {
    		timeout: 5000,
    		top: true,
    		$$slots: { default: [create_default_slot_1$5] },
    		$$scope: { ctx }
    	};

    	if (/*showSnackbarTop*/ ctx[2] !== void 0) {
    		snackbar_props.value = /*showSnackbarTop*/ ctx[2];
    	}

    	snackbar = new Snackbar({ props: snackbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(snackbar, "value", snackbar_value_binding));

    	function menu_open_binding(value) {
    		/*menu_open_binding*/ ctx[7].call(null, value);
    	}

    	function menu_value_binding(value) {
    		/*menu_value_binding*/ ctx[8].call(null, value);
    	}

    	let menu_props = {
    		items: /*items*/ ctx[3],
    		$$slots: { activator: [create_activator_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*open*/ ctx[0] !== void 0) {
    		menu_props.open = /*open*/ ctx[0];
    	}

    	if (/*selected*/ ctx[1] !== void 0) {
    		menu_props.value = /*selected*/ ctx[1];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind(menu, "open", menu_open_binding));
    	binding_callbacks.push(() => bind(menu, "value", menu_value_binding));

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			create_component(snackbar.$$.fragment);
    			t1 = space();
    			create_component(menu.$$.fragment);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "InputToCopy");
    			attr_dev(input, "id", "inputContainingTextToBeCopied");
    			input.value = "foo";
    			set_style(input, "display", "none");
    			set_style(input, "position", "relative");
    			set_style(input, "left", "-10000px");
    			add_location(input, file$m, 61, 0, 1468);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(snackbar, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const snackbar_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				snackbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*showSnackbarTop*/ 4) {
    				updating_value = true;
    				snackbar_changes.value = /*showSnackbarTop*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			snackbar.$set(snackbar_changes);
    			const menu_changes = {};

    			if (dirty & /*$$scope, open*/ 4097) {
    				menu_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty & /*open*/ 1) {
    				updating_open = true;
    				menu_changes.open = /*open*/ ctx[0];
    				add_flush_callback(() => updating_open = false);
    			}

    			if (!updating_value_1 && dirty & /*selected*/ 2) {
    				updating_value_1 = true;
    				menu_changes.value = /*selected*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			menu.$set(menu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(snackbar.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(snackbar.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			destroy_component(snackbar, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { save } = $$props;
    	let open = false;
    	let selected = "";
    	let showSnackbarTop = false;

    	const items = [
    		{
    			value: 1,
    			text: "Share this configuration"
    		},
    		{ value: 2, text: "Make a copy" },
    		{
    			value: 3,
    			text: "This software on github"
    		},
    		{ value: 4, text: "Report issues" },
    		{ value: 5, text: "Reset this assistant" },
    		{
    			value: 6,
    			text: "Living Atlases Community"
    		}
    	];

    	let doReset = () => {
    		save(true);
    	};

    	let doCopy = () => {
    		save(false, true);
    	};

    	let doShare = () => {
    		const text = window.location.href;
    		const copyDiv = document.getElementById("inputContainingTextToBeCopied");
    		copyDiv.style.display = "block";
    		copyDiv.value = text;
    		copyDiv.focus();
    		document.execCommand("SelectAll");
    		document.execCommand("Copy", false, null);
    		copyDiv.style.display = "none";
    		$$invalidate(2, showSnackbarTop = true);
    	};

    	const writable_props = ["save"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SiteMenu> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SiteMenu", $$slots, []);

    	function snackbar_value_binding(value) {
    		showSnackbarTop = value;
    		$$invalidate(2, showSnackbarTop);
    	}

    	const click_handler = () => $$invalidate(0, open = !open);

    	function menu_open_binding(value) {
    		open = value;
    		$$invalidate(0, open);
    	}

    	function menu_value_binding(value) {
    		selected = value;
    		$$invalidate(1, selected);
    	}

    	$$self.$$set = $$props => {
    		if ("save" in $$props) $$invalidate(4, save = $$props.save);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		Menu,
    		Snackbar,
    		save,
    		open,
    		selected,
    		showSnackbarTop,
    		items,
    		doReset,
    		doCopy,
    		doShare
    	});

    	$$self.$inject_state = $$props => {
    		if ("save" in $$props) $$invalidate(4, save = $$props.save);
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("showSnackbarTop" in $$props) $$invalidate(2, showSnackbarTop = $$props.showSnackbarTop);
    		if ("doReset" in $$props) $$invalidate(9, doReset = $$props.doReset);
    		if ("doCopy" in $$props) $$invalidate(10, doCopy = $$props.doCopy);
    		if ("doShare" in $$props) $$invalidate(11, doShare = $$props.doShare);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected*/ 2) {
    			 {
    				switch (selected) {
    					case 1:
    						doShare();
    						break;
    					case 2:
    						doCopy();
    						break;
    					case 3:
    						window.open("https://github.com/living-atlases/generator-living-atlas-web", "_blank");
    						break;
    					case 4:
    						window.open("https://github.com/living-atlases/generator-living-atlas-web/issues", "_blank");
    						break;
    					case 5:
    						doReset();
    						break;
    					case 6:
    						window.open("https://living-atlases.gbif.org/", "_blank");
    						break;
    				}
    			}
    		}
    	};

    	return [
    		open,
    		selected,
    		showSnackbarTop,
    		items,
    		save,
    		snackbar_value_binding,
    		click_handler,
    		menu_open_binding,
    		menu_value_binding
    	];
    }

    class SiteMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { save: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SiteMenu",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*save*/ ctx[4] === undefined && !("save" in props)) {
    			console.warn("<SiteMenu> was created without expected prop 'save'");
    		}
    	}

    	get save() {
    		throw new Error("<SiteMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set save(value) {
    		throw new Error("<SiteMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Services.svelte generated by Svelte v3.24.1 */

    const services = [
    	"collectory",
    	"ala_hub",
    	"biocache_service",
    	"ala_bie",
    	"bie_index",
    	"images",
    	"species_lists",
    	"regions",
    	"logger",
    	"solr",
    	"cas",
    	"spatial",
    	"alerts",
    	"doi",
    	"dashboard",
    	"branding",
    	"biocache_backend"
    ];

    let servicesStore = {
    	collectory: {
    		name: "collections",
    		name_int: "collectory",
    		desc: "biodiversity collections",
    		optional: false,
    		sample: "https://collections.ala.org.au",
    		path: ""
    	},
    	ala_hub: {
    		name: "records",
    		name_int: "ala_hub",
    		desc: "occurrences search frontend",
    		optional: false,
    		hint: "Typically 'records' or similar",
    		sample: "https://biocache.ala.org.au",
    		path: ""
    	},
    	biocache_service: {
    		name: "records-ws",
    		name_int: "biocache_service",
    		desc: "occurrences web service",
    		optional: false,
    		sample: "https://biocache.ala.org.au/ws",
    		path: ""
    	},
    	ala_bie: {
    		name: "species",
    		name_int: "ala_bie",
    		desc: "species search frontend",
    		optional: true,
    		sample: "https://bie.ala.org.au",
    		path: ""
    	},
    	bie_index: {
    		name: "species-ws",
    		name_int: "bie_index",
    		desc: "species web service",
    		depends: "ala_bie",
    		optional: false,
    		sample: "https://bie.ala.org.au/ws",
    		path: ""
    	},
    	images: {
    		name: "images",
    		name_int: "images",
    		desc: "images service",
    		optional: true,
    		sample: "https://images.ala.org.au",
    		path: ""
    	},
    	species_lists: {
    		name: "lists",
    		name_int: "species_lists",
    		desc: "user provided species lists",
    		depends: "ala_bie",
    		optional: true,
    		sample: "https://lists.ala.org.au",
    		path: ""
    	},
    	regions: {
    		name: "regions",
    		name_int: "regions",
    		desc: "regional data frontend",
    		optional: true,
    		sample: "https://regions.ala.org.au",
    		path: ""
    	},
    	logger: {
    		name: "logger",
    		name_int: "logger",
    		desc: "event logging (downloads stats, etc)",
    		optional: false,
    		sample: "https://logger.ala.org.au",
    		path: ""
    	},
    	solr: {
    		name: "index",
    		name_int: "solr",
    		desc: "indexing (Solr)",
    		optional: false,
    		path: ""
    	},
    	cas: {
    		name: "auth",
    		name_int: "cas",
    		desc: "CAS authentication system",
    		optional: true,
    		forceSubdomain: true,
    		sample: "https://auth.ala.org.au/cas/",
    		recommended: true,
    		path: ""
    	},
    	biocache_backend: {
    		name: "biocache-backend",
    		name_int: "biocache_backend",
    		desc: "cassandra and biocache-store backend",
    		withoutUrl: true,
    		optional: false,
    		path: ""
    	},
    	branding: {
    		name: "branding",
    		name_int: "branding",
    		desc: "Web branding used by all services",
    		withoutUrl: true,
    		optional: false,
    		path: ""
    	},
    	biocache_cli: {
    		name: "biocache-cli",
    		name_int: "biocache_cli",
    		desc: "manages the loading, sampling, processing and indexing of occurrence records",
    		optional: false,
    		path: ""
    	},
    	spatial: {
    		name: "spatial",
    		name_int: "spatial",
    		desc: "spatial front-end",
    		optional: true,
    		forceSubdomain: true,
    		sample: "https://spatial.ala.org.au",
    		path: ""
    	},
    	webapi: {
    		name: "webapi",
    		name_int: "webapi",
    		desc: "API front-end",
    		optional: true,
    		sample: "https://api.ala.org.au",
    		path: ""
    	},
    	dashboard: {
    		name: "dashboard",
    		name_int: "dashboard",
    		desc: "work in progress",
    		optional: true,
    		sample: "https://dashboard.ala.org.au",
    		path: ""
    	},
    	alerts: {
    		name: "alerts",
    		name_int: "alerts",
    		desc: "users can subscribe to notifications about new species occurrences they are interested, regions, etc",
    		optional: true,
    		sample: "https://alerts.ala.org.au",
    		path: ""
    	},
    	doi: {
    		name: "doi",
    		name_int: "doi",
    		desc: "mainly used for generating DOIs of user downloads",
    		optional: true,
    		sample: "https://doi.ala.org.au",
    		path: ""
    	},
    	nameindexer: {
    		name: "nameindexer",
    		name_int: "nameindexer",
    		desc: "nameindexer",
    		optional: false,
    		path: ""
    	}
    };

    const readLocalStorage = key => {
      try {
        return localStorageSerializer.from(localStorage.getItem(key));
      } catch (e) {
        throw new Error(`couldn't use local storage for key: ${key}`);
      }
    };

    const localStorageSerializer = {
      from: value => {
        try {
          return JSON.parse(value);
        } catch (e) {
          if (e instanceof SyntaxError) {
            return value;
          }
        }
      },
      to: value => (value instanceof Object ? JSON.stringify(value) : value)
    };

    const debounce$1 = (func, delay) => {
      let timer;
      return function() {
        const me = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(me, args), delay);
      };
    };

    const localstorageHook = options => ({
      onInit: value => {
        const initialValue = readLocalStorage(options.localstorage.key);
        if (!initialValue) {
          localStorage.setItem(
            options.localstorage.key,
            localStorageSerializer.to(value)
          );
        }
        return initialValue || value;
      },

      onDispose: value => {
        localStorage.setItem(
          options.localstorage.key,
          localStorageSerializer.to(value)
        );
      }
    });

    const historyHook = ({ history: { size = 50 } }) => {
      const history = writable([]);
      let undoing;
      let setter;

      const readableHistory = derived(history, $history => $history);

      const onStoreInit = valueStoreSetter => (setter = valueStoreSetter);

      const undo = () => {
        history.update(n => {
          if (n.length <= 1) {
            return n;
          }
          n.pop();
          const newValue = n[n.length - 1];
          undoing = { value: newValue };
          setter(newValue);
          return n;
        });
      };

      const onNewVal = value => {
        //if there is an undo, the store.set will triger subscriber so we need to skip history for the value
        if (undoing && undoing.value === value) {
          undoing = false;
          return;
        }
        history.update(n => {
          while (n.length >= size) {
            n.shift();
          }
          return n.concat(value);
        });
      };

      return {
        onNewVal,
        onStoreInit,
        exports: {
          history: readableHistory,
          undo
        }
      };
    };

    /**
     * Svelte compatible store type
     * @typedef {Object} SvelteCompatibleStore
     * @property {function} subscribe Subscription function
     * @property {function} set Set function
     * @property {function} update Update function
     * @property {StorezExtra} z Storez extra
     *
     * @typedef {Object} StorezExtra
     * @property {SvelteDerivedStore} history Returns history of the past values of the store
     * @property {Number} debounce Interval in ms between 2 stores updates
     * @property {() => any} get Get current value (not reactive)
     *
     * @typedef {Object} Options
     * @property {LocalStorageOptions} localstorage Localstorage options
     * @property {HistoryOptions} history History options
     *
     * @typedef {Object} LocalStorageOptions
     * @property {String} key Key used for the local storage
     *
     * @typedef {Object} HistoryOptions
     * @property {Number} [size=50] Number of mutations to keep in history
     *
     * @typedef {(val: any) => SvelteCompatibleStore} Simple
     * @typedef {(val: any, start:function) => SvelteCompatibleStore} Compatible
     * @typedef {(val: any, options:Options) => SvelteCompatibleStore} SimpleExtended
     * @typedef {(val: any, start:function, options: Options) => SvelteCompatibleStore} CompatibleExtended
     *
     * @typedef {Simple & Compatible & SimpleExtended & CompatibleExtended} MethodArgument
     */

    /**
     * Create a Svelte writable store on steroids
     * @type {MethodArgument}
     */
    const storez = (...args) => {
      const val = args[0];

      let start = () => {};
      let options = {};

      if (args.length > 1) {
        if (typeof args[1] === "function") {
          start = args[1];
          if (args.length > 2) {
            options = args[2];
          }
        } else {
          options = args[1];
        }
      }

      return storezImpl(val, start, options);
    };

    const storezImpl = (val, start, options) => {
      let oldValue;
      let currentValue = val;
      let dispose;
      let subscribedToValueStore = false;
      const subscriptions = [];

      const hooks = [
        options.localstorage && localstorageHook(options),
        options.history && historyHook(options)
      ].filter(Boolean);

      const runHooks = (fnName, ...args) =>
        hooks.forEach(hook => hook[fnName] && hook[fnName](...args));
      const processHooks = (fnName, ...args) =>
        hooks.reduce((acc, cur) => (cur[fnName] ? cur[fnName](acc) : acc), ...args);

      let initialValue = processHooks("onInit", val);

      const valueStore = writable(initialValue, start);

      const setter = newVal => {
    		// console.log(`Subs number: ${subscriptions.length}`);
        valueStore.set(newVal);
        subscriptions.forEach(sub => sub(currentValue, oldValue));
      };

      const updater = fn => {
        setter(fn(currentValue));
      };

      const subscribeValueStore = () => {
        subscribedToValueStore = true;
        return valueStore.subscribe(newVal => {
          oldValue = currentValue;
          currentValue = newVal;
          runHooks("onNewVal", newVal, oldValue);
        });
      };

      runHooks("onStoreInit", setter);

      dispose = subscribeValueStore();

      const z = hooks.reduce(
        (acc, cur) => (cur.exports ? Object.assign(acc, cur.exports) : acc),
        { get: () => currentValue }
      );

      return {
        subscribe: subscriptionFn => {
          if (!subscriptions.length && !subscribedToValueStore) {
            dispose = subscribeValueStore();
          }
          subscriptions.push(subscriptionFn);
    		  // console.log(`Subs number: ${subscriptions.length}`);
          subscriptionFn(currentValue);
          return () => {
            const index = subscriptions.indexOf(subscriptionFn);
            if (index !== -1) {
              subscriptions.splice(index, 1);
            }
            runHooks("onDispose", currentValue);
            if (subscriptions.length === 0 && subscribedToValueStore) {
              //dispose
              dispose();
              subscribedToValueStore = false;
            }
          };
        },

        set: options.debounce > 0 ? debounce$1(setter, options.debounce) : setter,

        update:
          options.debounce > 0 ? debounce$1(updater, options.debounce) : updater,
        z
      };
    };

    var cookieUniversalCommon = createCommonjsModule(function (module) {
    module.exports=function(e){function t(o){if(r[o])return r[o].exports;var n=r[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,t),n.l=!0,n.exports}var r={};return t.m=e,t.c=r,t.d=function(e,r,o){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:o});},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,r){var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n=r(1);e.exports=function(t,r){var i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],a="object"===("undefined"==typeof document?"undefined":o(document))&&"string"==typeof document.cookie,s="object"===(void 0===t?"undefined":o(t))&&"object"===(void 0===r?"undefined":o(r))&&void 0!==e,u=!a&&!s||a&&s,f=function(e){if(s){var o=t.headers.cookie||"";return e&&(o=r.getHeaders(),o=o["set-cookie"]?o["set-cookie"].map(function(e){return e.split(";")[0]}).join(";"):""),o}if(a)return document.cookie||""},c=function(){var e=r.getHeader("Set-Cookie");return (e="string"==typeof e?[e]:e)||[]},p=function(e){return r.setHeader("Set-Cookie",e)},d=function(e,t){if(!t)return e;try{return JSON.parse(e)}catch(t){return e}},l={parseJSON:i,set:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{path:"/"};if(!u)if(t="object"===(void 0===t?"undefined":o(t))?JSON.stringify(t):t,s){var i=c();i.push(n.serialize(e,t,r)),p(i);}else document.cookie=n.serialize(e,t,r);},setAll:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];u||Array.isArray(e)&&e.forEach(function(e){var t=e.name,r=void 0===t?"":t,o=e.value,n=void 0===o?"":o,i=e.opts,a=void 0===i?{path:"/"}:i;l.set(r,n,a);});},get:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{fromRes:!1,parseJSON:l.parseJSON};if(u)return "";var r=n.parse(f(t.fromRes)),o=r[e];return d(o,t.parseJSON)},getAll:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{fromRes:!1,parseJSON:l.parseJSON};if(u)return {};var t=n.parse(f(e.fromRes));for(var r in t)t[r]=d(t[r],e.parseJSON);return t},remove:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{path:"/"};if(!u){var r=l.get(e);t.expires=new Date(0),void 0!==r&&l.set(e,"",t);}},removeAll:function(){if(!u){var e=n.parse(f());for(var t in e)l.remove(t);}},nodeCookie:n};return l};},function(e,t,r){function o(e,t){if("string"!=typeof e)throw new TypeError("argument str must be a string");for(var r={},o=t||{},n=e.split(u),s=o.decode||a,f=0;f<n.length;f++){var c=n[f],p=c.indexOf("=");if(!(p<0)){var d=c.substr(0,p).trim(),l=c.substr(++p,c.length).trim();'"'==l[0]&&(l=l.slice(1,-1)),void 0==r[d]&&(r[d]=i(l,s));}}return r}function n(e,t,r){var o=r||{},n=o.encode||s;if("function"!=typeof n)throw new TypeError("option encode is invalid");if(!f.test(e))throw new TypeError("argument name is invalid");var i=n(t);if(i&&!f.test(i))throw new TypeError("argument val is invalid");var a=e+"="+i;if(null!=o.maxAge){var u=o.maxAge-0;if(isNaN(u))throw new Error("maxAge should be a Number");a+="; Max-Age="+Math.floor(u);}if(o.domain){if(!f.test(o.domain))throw new TypeError("option domain is invalid");a+="; Domain="+o.domain;}if(o.path){if(!f.test(o.path))throw new TypeError("option path is invalid");a+="; Path="+o.path;}if(o.expires){if("function"!=typeof o.expires.toUTCString)throw new TypeError("option expires is invalid");a+="; Expires="+o.expires.toUTCString();}if(o.httpOnly&&(a+="; HttpOnly"),o.secure&&(a+="; Secure"),o.sameSite){switch("string"==typeof o.sameSite?o.sameSite.toLowerCase():o.sameSite){case!0:a+="; SameSite=Strict";break;case"lax":a+="; SameSite=Lax";break;case"strict":a+="; SameSite=Strict";break;case"none":a+="; SameSite=None";break;default:throw new TypeError("option sameSite is invalid")}}return a}function i(e,t){try{return t(e)}catch(t){return e}}/*!
     * cookie
     * Copyright(c) 2012-2014 Roman Shtylman
     * Copyright(c) 2015 Douglas Christopher Wilson
     * MIT Licensed
     */
    t.parse=o,t.serialize=n;var a=decodeURIComponent,s=encodeURIComponent,u=/; */,f=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;}]);
    });

    var validate = function (choice, cookie) {
      const choices = Object.keys(choice);
      const chosen = Object.keys(cookie.choices);

      if (chosen.length !== choices.length) {
        return false
      }

      return chosen.every(c => choices.includes(c))
    };

    /* node_modules/@beyonk/gdpr-cookie-consent-banner/src/components/Banner.svelte generated by Svelte v3.24.1 */

    const { Error: Error_1, Object: Object_1 } = globals;
    const file$n = "node_modules/@beyonk/gdpr-cookie-consent-banner/src/components/Banner.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[28] = list;
    	child_ctx[29] = i;
    	return child_ctx;
    }

    // (126:0) {#if showEditIcon}
    function create_if_block_3$2(ctx) {
    	let button;
    	let svg;
    	let path;
    	let button_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M510.52 255.82c-69.97-.85-126.47-57.69-126.47-127.86-70.17\n        0-127-56.49-127.86-126.45-27.26-4.14-55.13.3-79.72 12.82l-69.13\n        35.22a132.221 132.221 0 0 0-57.79 57.81l-35.1 68.88a132.645 132.645 0 0\n        0-12.82 80.95l12.08 76.27a132.521 132.521 0 0 0 37.16 72.96l54.77\n        54.76a132.036 132.036 0 0 0 72.71 37.06l76.71 12.15c27.51 4.36 55.7-.11\n        80.53-12.76l69.13-35.21a132.273 132.273 0 0 0\n        57.79-57.81l35.1-68.88c12.56-24.64 17.01-52.58 12.91-79.91zM176\n        368c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32\n        32zm32-160c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33\n        32-32 32zm160 128c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32\n        32-14.33 32-32 32z");
    			add_location(path, file$n, 131, 6, 3452);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$n, 130, 4, 3383);
    			attr_dev(button, "class", "cookieConsentToggle");
    			add_location(button, file$n, 126, 2, 3282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, fade, {}, true);
    				button_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!button_transition) button_transition = create_bidirectional_transition(button, fade, {}, false);
    			button_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching && button_transition) button_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(126:0) {#if showEditIcon}",
    		ctx
    	});

    	return block;
    }

    // (148:0) {#if shown}
    function create_if_block_2$4(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let div0;
    	let p0;
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let div2;
    	let button0;
    	let t3;
    	let t4;
    	let button1;
    	let t5;
    	let div4_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(/*heading*/ ctx[1]);
    			t1 = space();
    			p1 = element("p");
    			t2 = space();
    			div2 = element("div");
    			button0 = element("button");
    			t3 = text(/*settingsLabel*/ ctx[4]);
    			t4 = space();
    			button1 = element("button");
    			t5 = text(/*acceptLabel*/ ctx[3]);
    			attr_dev(p0, "class", "cookieConsent__Title");
    			add_location(p0, file$n, 152, 8, 4437);
    			attr_dev(p1, "class", "cookieConsent__Description");
    			add_location(p1, file$n, 153, 8, 4491);
    			attr_dev(div0, "class", "cookieConsent__Content");
    			add_location(div0, file$n, 151, 6, 4392);
    			attr_dev(div1, "class", "cookieConsent__Left");
    			add_location(div1, file$n, 150, 4, 4352);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "cookieConsent__Button");
    			add_location(button0, file$n, 159, 6, 4642);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "cookieConsent__Button");
    			add_location(button1, file$n, 165, 6, 4808);
    			attr_dev(div2, "class", "cookieConsent__Right");
    			add_location(div2, file$n, 158, 4, 4601);
    			attr_dev(div3, "class", "cookieConsent");
    			add_location(div3, file$n, 149, 2, 4320);
    			attr_dev(div4, "class", "cookieConsentWrapper");
    			add_location(div4, file$n, 148, 0, 4267);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			p1.innerHTML = /*description*/ ctx[2];
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(button0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, button1);
    			append_dev(button1, t5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_1*/ ctx[16], false, false, false),
    					listen_dev(button1, "click", /*choose*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*heading*/ 2) set_data_dev(t0, /*heading*/ ctx[1]);
    			if (!current || dirty & /*description*/ 4) p1.innerHTML = /*description*/ ctx[2];			if (!current || dirty & /*settingsLabel*/ 16) set_data_dev(t3, /*settingsLabel*/ ctx[4]);
    			if (!current || dirty & /*acceptLabel*/ 8) set_data_dev(t5, /*acceptLabel*/ ctx[3]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, true);
    				div4_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, false);
    			div4_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_transition) div4_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(148:0) {#if shown}",
    		ctx
    	});

    	return block;
    }

    // (174:0) {#if settingsShown}
    function create_if_block$b(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let button;
    	let t1;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*choicesArr*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button = element("button");
    			t1 = text(/*closeLabel*/ ctx[5]);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "cookieConsent__Button cookieConsent__Button--Close");
    			add_location(button, file$n, 193, 4, 5736);
    			attr_dev(div0, "class", "cookieConsentOperations__List");
    			add_location(div0, file$n, 175, 2, 5027);
    			attr_dev(div1, "class", "cookieConsentOperations");
    			add_location(div1, file$n, 174, 0, 4971);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t0);
    			append_dev(div0, button);
    			append_dev(button, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*choicesArr, choicesMerged, Object*/ 768) {
    				each_value = /*choicesArr*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*closeLabel*/ 32) set_data_dev(t1, /*closeLabel*/ ctx[5]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(174:0) {#if settingsShown}",
    		ctx
    	});

    	return block;
    }

    // (178:6) {#if Object.hasOwnProperty.call(choicesMerged, choice.id) && choicesMerged[choice.id]}
    function create_if_block_1$5(ctx) {
    	let div;
    	let input;
    	let input_id_value;
    	let input_disabled_value;
    	let t0;
    	let label;
    	let t1_value = /*choice*/ ctx[27].label + "";
    	let t1;
    	let label_for_value;
    	let t2;
    	let span;
    	let t3_value = /*choice*/ ctx[27].description + "";
    	let t3;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[17].call(input, /*choice*/ ctx[27]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", input_id_value = `gdpr-check-${/*choice*/ ctx[27].id}`);
    			input.disabled = input_disabled_value = /*choice*/ ctx[27].id === "necessary";
    			add_location(input, file$n, 181, 10, 5322);
    			attr_dev(label, "for", label_for_value = `gdpr-check-${/*choice*/ ctx[27].id}`);
    			add_location(label, file$n, 186, 10, 5520);
    			attr_dev(span, "class", "cookieConsentOperations__ItemLabel");
    			add_location(span, file$n, 187, 10, 5592);
    			attr_dev(div, "class", "cookieConsentOperations__Item");
    			toggle_class(div, "disabled", /*choice*/ ctx[27].id === "necessary");
    			add_location(div, file$n, 178, 8, 5205);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*choicesMerged*/ ctx[8][/*choice*/ ctx[27].id].value;
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, t3);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", input_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*choicesArr*/ 512 && input_id_value !== (input_id_value = `gdpr-check-${/*choice*/ ctx[27].id}`)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*choicesArr*/ 512 && input_disabled_value !== (input_disabled_value = /*choice*/ ctx[27].id === "necessary")) {
    				prop_dev(input, "disabled", input_disabled_value);
    			}

    			if (dirty & /*choicesMerged, choicesArr*/ 768) {
    				input.checked = /*choicesMerged*/ ctx[8][/*choice*/ ctx[27].id].value;
    			}

    			if (dirty & /*choicesArr*/ 512 && t1_value !== (t1_value = /*choice*/ ctx[27].label + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*choicesArr*/ 512 && label_for_value !== (label_for_value = `gdpr-check-${/*choice*/ ctx[27].id}`)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*choicesArr*/ 512 && t3_value !== (t3_value = /*choice*/ ctx[27].description + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*choicesArr*/ 512) {
    				toggle_class(div, "disabled", /*choice*/ ctx[27].id === "necessary");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(178:6) {#if Object.hasOwnProperty.call(choicesMerged, choice.id) && choicesMerged[choice.id]}",
    		ctx
    	});

    	return block;
    }

    // (177:4) {#each choicesArr as choice}
    function create_each_block$1(ctx) {
    	let show_if = Object.hasOwnProperty.call(/*choicesMerged*/ ctx[8], /*choice*/ ctx[27].id) && /*choicesMerged*/ ctx[8][/*choice*/ ctx[27].id];
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*choicesMerged, choicesArr*/ 768) show_if = Object.hasOwnProperty.call(/*choicesMerged*/ ctx[8], /*choice*/ ctx[27].id) && /*choicesMerged*/ ctx[8][/*choice*/ ctx[27].id];

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(177:4) {#each choicesArr as choice}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*showEditIcon*/ ctx[0] && create_if_block_3$2(ctx);
    	let if_block1 = /*shown*/ ctx[6] && create_if_block_2$4(ctx);
    	let if_block2 = /*settingsShown*/ ctx[7] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showEditIcon*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showEditIcon*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*shown*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*shown*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*settingsShown*/ ctx[7]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*settingsShown*/ 128) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$b(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	const cookies = cookieUniversalCommon();
    	let { cookieName = null } = $$props;
    	let { showEditIcon = true } = $$props;
    	let shown = false;
    	let settingsShown = false;
    	let { heading = "GDPR Notice" } = $$props;
    	let { description = "We use cookies to offer a better browsing experience, analyze site traffic, personalize content, and serve targeted advertisements. Please review our privacy policy & cookies information page. By clicking accept, you consent to our privacy policy & use of cookies." } = $$props;

    	let { categories = {
    		analytics() {
    			
    		},
    		tracking() {
    			
    		},
    		marketing() {
    			
    		},
    		necessary() {
    			
    		}
    	} } = $$props;

    	let { cookieConfig = {} } = $$props;
    	let { choices = {} } = $$props;

    	const choicesDefaults = {
    		necessary: {
    			label: "Necessary cookies",
    			description: "Used for cookie control. Can't be turned off.",
    			value: true
    		},
    		tracking: {
    			label: "Tracking cookies",
    			description: "Used for advertising purposes.",
    			value: true
    		},
    		analytics: {
    			label: "Analytics cookies",
    			description: "Used to control Google Analytics, a 3rd party tool offered by Google to track user behavior.",
    			value: true
    		},
    		marketing: {
    			label: "Marketing cookies",
    			description: "Used for marketing data.",
    			value: true
    		}
    	};

    	let { acceptLabel = "Accept cookies" } = $$props;
    	let { settingsLabel = "Cookie settings" } = $$props;
    	let { closeLabel = "Close settings" } = $$props;

    	onMount(() => {
    		if (!cookieName) {
    			throw new Error("You must set gdpr cookie name");
    		}

    		const cookie = cookies.get(cookieName);

    		if (cookie && chosenMatchesChoice(cookie)) {
    			execute(cookie.choices);
    		} else {
    			removeCookie();
    			$$invalidate(6, shown = true);
    		}
    	});

    	function setCookie(choices) {
    		const expires = new Date();
    		expires.setDate(expires.getDate() + 365);
    		const options = Object.assign({}, cookieConfig, { expires });
    		cookies.set(cookieName, { choices }, options);
    	}

    	function removeCookie() {
    		const { path } = cookieConfig;
    		cookies.remove(cookieName, Object.assign({}, path ? { path } : {}));
    	}

    	function chosenMatchesChoice(cookie) {
    		return validate(cookieChoices, cookie);
    	}

    	function execute(chosen) {
    		const types = Object.keys(cookieChoices);

    		types.forEach(t => {
    			const agreed = chosen[t];

    			if (choicesMerged[t]) {
    				$$invalidate(8, choicesMerged[t].value = agreed, choicesMerged);
    			}

    			if (agreed) {
    				categories[t] && categories[t]();
    				dispatch(`${t}`);
    			}
    		});

    		$$invalidate(6, shown = false);
    	}

    	function choose() {
    		setCookie(cookieChoices);
    		execute(cookieChoices);
    	}

    	const writable_props = [
    		"cookieName",
    		"showEditIcon",
    		"heading",
    		"description",
    		"categories",
    		"cookieConfig",
    		"choices",
    		"acceptLabel",
    		"settingsLabel",
    		"closeLabel"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Banner> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Banner", $$slots, []);
    	const click_handler = () => $$invalidate(6, shown = true);

    	const click_handler_1 = () => {
    		$$invalidate(7, settingsShown = true);
    	};

    	function input_change_handler(choice) {
    		choicesMerged[choice.id].value = this.checked;
    		($$invalidate(8, choicesMerged), $$invalidate(14, choices));
    		(($$invalidate(9, choicesArr), $$invalidate(8, choicesMerged)), $$invalidate(14, choices));
    	}

    	const click_handler_2 = () => {
    		$$invalidate(7, settingsShown = false);
    	};

    	$$self.$$set = $$props => {
    		if ("cookieName" in $$props) $$invalidate(11, cookieName = $$props.cookieName);
    		if ("showEditIcon" in $$props) $$invalidate(0, showEditIcon = $$props.showEditIcon);
    		if ("heading" in $$props) $$invalidate(1, heading = $$props.heading);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    		if ("categories" in $$props) $$invalidate(12, categories = $$props.categories);
    		if ("cookieConfig" in $$props) $$invalidate(13, cookieConfig = $$props.cookieConfig);
    		if ("choices" in $$props) $$invalidate(14, choices = $$props.choices);
    		if ("acceptLabel" in $$props) $$invalidate(3, acceptLabel = $$props.acceptLabel);
    		if ("settingsLabel" in $$props) $$invalidate(4, settingsLabel = $$props.settingsLabel);
    		if ("closeLabel" in $$props) $$invalidate(5, closeLabel = $$props.closeLabel);
    	};

    	$$self.$capture_state = () => ({
    		Cookie: cookieUniversalCommon,
    		validate,
    		fade,
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		cookies,
    		cookieName,
    		showEditIcon,
    		shown,
    		settingsShown,
    		heading,
    		description,
    		categories,
    		cookieConfig,
    		choices,
    		choicesDefaults,
    		acceptLabel,
    		settingsLabel,
    		closeLabel,
    		setCookie,
    		removeCookie,
    		chosenMatchesChoice,
    		execute,
    		choose,
    		choicesMerged,
    		choicesArr,
    		cookieChoices
    	});

    	$$self.$inject_state = $$props => {
    		if ("cookieName" in $$props) $$invalidate(11, cookieName = $$props.cookieName);
    		if ("showEditIcon" in $$props) $$invalidate(0, showEditIcon = $$props.showEditIcon);
    		if ("shown" in $$props) $$invalidate(6, shown = $$props.shown);
    		if ("settingsShown" in $$props) $$invalidate(7, settingsShown = $$props.settingsShown);
    		if ("heading" in $$props) $$invalidate(1, heading = $$props.heading);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    		if ("categories" in $$props) $$invalidate(12, categories = $$props.categories);
    		if ("cookieConfig" in $$props) $$invalidate(13, cookieConfig = $$props.cookieConfig);
    		if ("choices" in $$props) $$invalidate(14, choices = $$props.choices);
    		if ("acceptLabel" in $$props) $$invalidate(3, acceptLabel = $$props.acceptLabel);
    		if ("settingsLabel" in $$props) $$invalidate(4, settingsLabel = $$props.settingsLabel);
    		if ("closeLabel" in $$props) $$invalidate(5, closeLabel = $$props.closeLabel);
    		if ("choicesMerged" in $$props) $$invalidate(8, choicesMerged = $$props.choicesMerged);
    		if ("choicesArr" in $$props) $$invalidate(9, choicesArr = $$props.choicesArr);
    		if ("cookieChoices" in $$props) cookieChoices = $$props.cookieChoices;
    	};

    	let choicesMerged;
    	let choicesArr;
    	let cookieChoices;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*choices*/ 16384) {
    			 $$invalidate(8, choicesMerged = Object.assign({}, choicesDefaults, choices));
    		}

    		if ($$self.$$.dirty & /*choicesMerged*/ 256) {
    			 $$invalidate(9, choicesArr = Object.values(choicesMerged).map((item, index) => {
    				return Object.assign({}, item, { id: Object.keys(choicesMerged)[index] });
    			}));
    		}

    		if ($$self.$$.dirty & /*choicesArr*/ 512) {
    			 cookieChoices = choicesArr.reduce(
    				(result, item, index, array) => {
    					result[item.id] = item.value ? item.value : false;
    					return result;
    				},
    				{}
    			);
    		}
    	};

    	return [
    		showEditIcon,
    		heading,
    		description,
    		acceptLabel,
    		settingsLabel,
    		closeLabel,
    		shown,
    		settingsShown,
    		choicesMerged,
    		choicesArr,
    		choose,
    		cookieName,
    		categories,
    		cookieConfig,
    		choices,
    		click_handler,
    		click_handler_1,
    		input_change_handler,
    		click_handler_2
    	];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			cookieName: 11,
    			showEditIcon: 0,
    			heading: 1,
    			description: 2,
    			categories: 12,
    			cookieConfig: 13,
    			choices: 14,
    			acceptLabel: 3,
    			settingsLabel: 4,
    			closeLabel: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get cookieName() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cookieName(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showEditIcon() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showEditIcon(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get heading() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set heading(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get categories() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set categories(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cookieConfig() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cookieConfig(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get choices() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choices(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get acceptLabel() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set acceptLabel(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settingsLabel() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settingsLabel(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeLabel() {
    		throw new Error_1("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeLabel(value) {
    		throw new Error_1("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var utils$1 = {
      assert: (condition, message) => {
        if (!condition)
          throw Error('Assert failed: ' + (message || ''))
      },
      title: (shortName) => `${shortName} LA Inventories`
    };

    /* src/Assistant.svelte generated by Svelte v3.24.1 */

    const { console: console_1$1 } = globals;
    const file$o = "src/Assistant.svelte";

    // (188:3) {#if (conf.page === 1)}
    function create_if_block_3$3(ctx) {
    	let intropage;
    	let current;
    	intropage = new IntroPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(intropage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(intropage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intropage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intropage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(intropage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(188:3) {#if (conf.page === 1)}",
    		ctx
    	});

    	return block;
    }

    // (191:3) {#if (conf.page === 2)}
    function create_if_block_2$5(ctx) {
    	let textfield0;
    	let updating_value;
    	let t0;
    	let textfield1;
    	let updating_value_1;
    	let t1;
    	let tooltip;
    	let t2;
    	let flex;
    	let current;

    	function textfield0_value_binding(value) {
    		/*textfield0_value_binding*/ ctx[22].call(null, value);
    	}

    	let textfield0_props = {
    		label: "Your LA Project Long Name",
    		error: /*longNameError*/ ctx[2],
    		append: /*longNameAppend*/ ctx[3]
    	};

    	if (/*conf*/ ctx[1].LA_project_name !== void 0) {
    		textfield0_props.value = /*conf*/ ctx[1].LA_project_name;
    	}

    	textfield0 = new TextField({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield0, "value", textfield0_value_binding));
    	textfield0.$on("change", /*onChange*/ ctx[18]);

    	function textfield1_value_binding(value) {
    		/*textfield1_value_binding*/ ctx[23].call(null, value);
    	}

    	let textfield1_props = {
    		label: "Your LA Project Short Name",
    		error: /*shortNameError*/ ctx[4],
    		append: /*shortNameAppend*/ ctx[5]
    	};

    	if (/*conf*/ ctx[1].LA_project_shortname !== void 0) {
    		textfield1_props.value = /*conf*/ ctx[1].LA_project_shortname;
    	}

    	textfield1 = new TextField({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield1, "value", textfield1_value_binding));
    	textfield1.$on("change", /*onChange*/ ctx[18]);

    	tooltip = new Tooltip({
    			props: {
    				$$slots: {
    					default: [create_default_slot_5],
    					activator: [create_activator_slot$3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	flex = new Flex({
    			props: {
    				align: "center",
    				justify: "start",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(textfield0.$$.fragment);
    			t0 = space();
    			create_component(textfield1.$$.fragment);
    			t1 = space();
    			create_component(tooltip.$$.fragment);
    			t2 = space();
    			create_component(flex.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(textfield1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tooltip, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(flex, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield0_changes = {};
    			if (dirty[0] & /*longNameError*/ 4) textfield0_changes.error = /*longNameError*/ ctx[2];
    			if (dirty[0] & /*longNameAppend*/ 8) textfield0_changes.append = /*longNameAppend*/ ctx[3];

    			if (!updating_value && dirty[0] & /*conf*/ 2) {
    				updating_value = true;
    				textfield0_changes.value = /*conf*/ ctx[1].LA_project_name;
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			const textfield1_changes = {};
    			if (dirty[0] & /*shortNameError*/ 16) textfield1_changes.error = /*shortNameError*/ ctx[4];
    			if (dirty[0] & /*shortNameAppend*/ 32) textfield1_changes.append = /*shortNameAppend*/ ctx[5];

    			if (!updating_value_1 && dirty[0] & /*conf*/ 2) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*conf*/ ctx[1].LA_project_shortname;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    			const tooltip_changes = {};

    			if (dirty[0] & /*conf*/ 2 | dirty[1] & /*$$scope*/ 128) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    			const flex_changes = {};

    			if (dirty[0] & /*mainDomainError, mainDomainAppend, conf*/ 770 | dirty[1] & /*$$scope*/ 128) {
    				flex_changes.$$scope = { dirty, ctx };
    			}

    			flex.$set(flex_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			transition_in(tooltip.$$.fragment, local);
    			transition_in(flex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(tooltip.$$.fragment, local);
    			transition_out(flex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(textfield1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tooltip, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(flex, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(191:3) {#if (conf.page === 2)}",
    		ctx
    	});

    	return block;
    }

    // (197:5) <div slot="activator">
    function create_activator_slot$3(ctx) {
    	let div;
    	let switch_1;
    	let updating_value;
    	let current;

    	function switch_1_value_binding(value) {
    		/*switch_1_value_binding*/ ctx[24].call(null, value);
    	}

    	let switch_1_props = { label: "Use SSL?" };

    	if (/*conf*/ ctx[1].LA_enable_ssl !== void 0) {
    		switch_1_props.value = /*conf*/ ctx[1].LA_enable_ssl;
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, "value", switch_1_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(switch_1.$$.fragment);
    			attr_dev(div, "slot", "activator");
    			add_location(div, file$o, 196, 5, 6680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(switch_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_1_changes = {};

    			if (!updating_value && dirty[0] & /*conf*/ 2) {
    				updating_value = true;
    				switch_1_changes.value = /*conf*/ ctx[1].LA_enable_ssl;
    				add_flush_callback(() => updating_value = false);
    			}

    			switch_1.$set(switch_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(switch_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot$3.name,
    		type: "slot",
    		source: "(197:5) <div slot=\\\"activator\\\">",
    		ctx
    	});

    	return block;
    }

    // (196:4) <Tooltip>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\n\t\t\t\t\tQuite recommended");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(196:4) <Tooltip>",
    		ctx
    	});

    	return block;
    }

    // (202:4) <Flex align="center" justify="start">
    function create_default_slot_4$1(ctx) {
    	let urlprefix;
    	let t;
    	let textfield;
    	let updating_value;
    	let current;

    	urlprefix = new UrlPrefix({
    			props: { ssl: /*conf*/ ctx[1].LA_enable_ssl },
    			$$inline: true
    		});

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[25].call(null, value);
    	}

    	let textfield_props = {
    		error: /*mainDomainError*/ ctx[8],
    		append: /*mainDomainAppend*/ ctx[9],
    		label: "The domain of your LA node"
    	};

    	if (/*conf*/ ctx[1].LA_domain !== void 0) {
    		textfield_props.value = /*conf*/ ctx[1].LA_domain;
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, "value", textfield_value_binding));
    	textfield.$on("change", /*onChange*/ ctx[18]);

    	const block = {
    		c: function create() {
    			create_component(urlprefix.$$.fragment);
    			t = space();
    			create_component(textfield.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(urlprefix, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const urlprefix_changes = {};
    			if (dirty[0] & /*conf*/ 2) urlprefix_changes.ssl = /*conf*/ ctx[1].LA_enable_ssl;
    			urlprefix.$set(urlprefix_changes);
    			const textfield_changes = {};
    			if (dirty[0] & /*mainDomainError*/ 256) textfield_changes.error = /*mainDomainError*/ ctx[8];
    			if (dirty[0] & /*mainDomainAppend*/ 512) textfield_changes.append = /*mainDomainAppend*/ ctx[9];

    			if (!updating_value && dirty[0] & /*conf*/ 2) {
    				updating_value = true;
    				textfield_changes.value = /*conf*/ ctx[1].LA_domain;
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(urlprefix.$$.fragment, local);
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(urlprefix.$$.fragment, local);
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(urlprefix, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(202:4) <Flex align=\\\"center\\\" justify=\\\"start\\\">",
    		ctx
    	});

    	return block;
    }

    // (209:3) {#if (conf.page === 3)}
    function create_if_block_1$6(ctx) {
    	let textfield;
    	let updating_value;
    	let t;
    	let p;
    	let card_card;
    	let current;

    	function textfield_value_binding_1(value) {
    		/*textfield_value_binding_1*/ ctx[26].call(null, value);
    	}

    	let textfield_props = {
    		textarea: true,
    		rows: "4",
    		append: /*hostnameAppend*/ ctx[7],
    		error: /*hostnameError*/ ctx[6],
    		outlined: true,
    		label: "Names of the servers you will use (comma or space separated)"
    	};

    	if (/*conf*/ ctx[1].hostnames !== void 0) {
    		textfield_props.value = /*conf*/ ctx[1].hostnames;
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, "value", textfield_value_binding_1));
    	textfield.$on("change", /*onChange*/ ctx[18]);

    	card_card = new Card$1.Card({
    			props: {
    				$$slots: {
    					default: [create_default_slot_3$1],
    					text: [create_text_slot],
    					title: [create_title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    			t = space();
    			p = element("p");
    			create_component(card_card.$$.fragment);
    			add_location(p, file$o, 213, 4, 7358);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, p, anchor);
    			mount_component(card_card, p, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};
    			if (dirty[0] & /*hostnameAppend*/ 128) textfield_changes.append = /*hostnameAppend*/ ctx[7];
    			if (dirty[0] & /*hostnameError*/ 64) textfield_changes.error = /*hostnameError*/ ctx[6];

    			if (!updating_value && dirty[0] & /*conf*/ 2) {
    				updating_value = true;
    				textfield_changes.value = /*conf*/ ctx[1].hostnames;
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    			const card_card_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				card_card_changes.$$scope = { dirty, ctx };
    			}

    			card_card.$set(card_card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			transition_in(card_card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			transition_out(card_card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(p);
    			destroy_component(card_card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(209:3) {#if (conf.page === 3)}",
    		ctx
    	});

    	return block;
    }

    // (216:6) <div slot="title">
    function create_title_slot(ctx) {
    	let div;
    	let card_title;
    	let current;

    	card_title = new Card$1.Title({
    			props: { title: "Tips", d: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(card_title.$$.fragment);
    			attr_dev(div, "slot", "title");
    			add_location(div, file$o, 215, 6, 7385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(card_title, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card_title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card_title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(card_title);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(216:6) <div slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (219:6) <div slot="text" class="p-5 pb-5 pt-0 text-gray-700 body-2">
    function create_text_slot(ctx) {
    	let div;
    	let t0;
    	let a0;
    	let t2;
    	let a1;
    	let t4;
    	let br;
    	let t5;
    	let a2;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("See the ");
    			a0 = element("a");
    			a0.textContent = "infrastructure requirements page";
    			t2 = text(" and other portals infrastructure in\n\t\t\t\t\t\t\t");
    			a1 = element("a");
    			a1.textContent = "our documentation wiki";
    			t4 = text(" to dimension your LA portal.\n\t\t\t\t\t\t\tFor a test portal a big server can host the main basic LA services.");
    			br = element("br");
    			t5 = text("\n\t\t\t\t\t\t\tIf you are unsure type something like \"server1, server2, server3\".\n\t\t\t\t\t\t\t");
    			a2 = element("a");
    			a2.textContent = "You can modify this and the rest of values later.";
    			span = element("span");
    			attr_dev(a0, "href", "https://github.com/AtlasOfLivingAustralia/documentation/wiki/Infrastructure-Requirements");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$o, 219, 15, 7535);
    			attr_dev(a1, "href", "https://github.com/AtlasOfLivingAustralia/documentation/wiki/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$o, 221, 7, 7744);
    			add_location(br, file$o, 223, 74, 7971);
    			attr_dev(a2, "href", "https://github.com/living-atlases/generator-living-atlas#rerunning-the-generator");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$o, 225, 7, 8057);
    			attr_dev(span, "class", "");
    			add_location(span, file$o, 227, 61, 8235);
    			attr_dev(div, "slot", "text");
    			attr_dev(div, "class", "p-5 pb-5 pt-0 text-gray-700 body-2");
    			add_location(div, file$o, 218, 6, 7459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, a0);
    			append_dev(div, t2);
    			append_dev(div, a1);
    			append_dev(div, t4);
    			append_dev(div, br);
    			append_dev(div, t5);
    			append_dev(div, a2);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_text_slot.name,
    		type: "slot",
    		source: "(219:6) <div slot=\\\"text\\\" class=\\\"p-5 pb-5 pt-0 text-gray-700 body-2\\\">",
    		ctx
    	});

    	return block;
    }

    // (215:5) <Card.Card>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(215:5) <Card.Card>",
    		ctx
    	});

    	return block;
    }

    // (234:3) {#if (conf.page === 4)}
    function create_if_block$c(ctx) {
    	let div;
    	let h5;
    	let t1;
    	let list;
    	let t2;
    	let form;
    	let button;
    	let current;

    	list = new List({
    			props: {
    				class: "",
    				items: services,
    				$$slots: {
    					item: [
    						create_item_slot,
    						({ item }) => ({ 37: item }),
    						({ item }) => [0, item ? 64 : 0]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			h5.textContent = "Define how your services URLs will look like:";
    			t1 = space();
    			create_component(list.$$.fragment);
    			t2 = space();
    			form = element("form");
    			button = element("button");
    			attr_dev(h5, "class", "t-center svelte-i3mvti");
    			add_location(h5, file$o, 235, 5, 8366);
    			attr_dev(div, "class", "to-left svelte-i3mvti");
    			add_location(div, file$o, 234, 4, 8339);
    			attr_dev(button, "id", "submit-btn");
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "name", "uuid");
    			button.value = /*uuid*/ ctx[16];
    			attr_dev(button, "class", "link-button");
    			add_location(button, file$o, 244, 5, 8761);
    			attr_dev(form, "target", "_blank");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "action", "/v1/gen");
    			attr_dev(form, "class", "form-link svelte-i3mvti");
    			add_location(form, file$o, 243, 4, 8684);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			append_dev(div, t1);
    			mount_component(list, div, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, button);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty[0] & /*conf, debug*/ 3 | dirty[1] & /*$$scope, item*/ 192) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(list);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(form);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(234:3) {#if (conf.page === 4)}",
    		ctx
    	});

    	return block;
    }

    // (238:6) <li slot="item" let:item={item}>
    function create_item_slot(ctx) {
    	let li;
    	let service;
    	let current;

    	service = new Service({
    			props: {
    				conf: /*conf*/ ctx[1],
    				service: servicesStore[/*item*/ ctx[37]],
    				save: /*save*/ ctx[17],
    				debug: /*debug*/ ctx[0],
    				hostnamesList: /*conf*/ ctx[1].hostnamesList
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(service.$$.fragment);
    			attr_dev(li, "slot", "item");
    			add_location(li, file$o, 237, 6, 8482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(service, li, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const service_changes = {};
    			if (dirty[0] & /*conf*/ 2) service_changes.conf = /*conf*/ ctx[1];
    			if (dirty[1] & /*item*/ 64) service_changes.service = servicesStore[/*item*/ ctx[37]];
    			if (dirty[0] & /*debug*/ 1) service_changes.debug = /*debug*/ ctx[0];
    			if (dirty[0] & /*conf*/ 2) service_changes.hostnamesList = /*conf*/ ctx[1].hostnamesList;
    			service.$set(service_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(service.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(service.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(service);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_item_slot.name,
    		type: "slot",
    		source: "(238:6) <li slot=\\\"item\\\" let:item={item}>",
    		ctx
    	});

    	return block;
    }

    // (185:1) <Flex direction="column" align="stretch" justify="start">
    function create_default_slot_1$6(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let btnarea;
    	let current;
    	let if_block0 = /*conf*/ ctx[1].page === 1 && create_if_block_3$3(ctx);
    	let if_block1 = /*conf*/ ctx[1].page === 2 && create_if_block_2$5(ctx);
    	let if_block2 = /*conf*/ ctx[1].page === 3 && create_if_block_1$6(ctx);
    	let if_block3 = /*conf*/ ctx[1].page === 4 && create_if_block$c(ctx);

    	btnarea = new BtnArea({
    			props: {
    				firstBtnDisabled: /*firstBtnDisabled*/ ctx[10],
    				onFirstBtnClick: /*onFirstBtnClick*/ ctx[19],
    				sndBtnDisabled: /*sndBtnDisabled*/ ctx[11],
    				onSndBtnClick: /*onSndBtnClick*/ ctx[20],
    				sndBtnText: /*sndBtnText*/ ctx[12],
    				footerHeight: /*footerHeight*/ ctx[15]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Living Atlas Generator";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			create_component(btnarea.$$.fragment);
    			attr_dev(h2, "class", "svelte-i3mvti");
    			add_location(h2, file$o, 186, 3, 6217);
    			attr_dev(div, "class", "main-flex svelte-i3mvti");
    			add_location(div, file$o, 185, 2, 6190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t3);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t4);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t5);
    			mount_component(btnarea, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*conf*/ ctx[1].page === 1) {
    				if (if_block0) {
    					if (dirty[0] & /*conf*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*conf*/ ctx[1].page === 2) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*conf*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*conf*/ ctx[1].page === 3) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*conf*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$6(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*conf*/ ctx[1].page === 4) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*conf*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$c(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t5);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			const btnarea_changes = {};
    			if (dirty[0] & /*firstBtnDisabled*/ 1024) btnarea_changes.firstBtnDisabled = /*firstBtnDisabled*/ ctx[10];
    			if (dirty[0] & /*sndBtnDisabled*/ 2048) btnarea_changes.sndBtnDisabled = /*sndBtnDisabled*/ ctx[11];
    			if (dirty[0] & /*sndBtnText*/ 4096) btnarea_changes.sndBtnText = /*sndBtnText*/ ctx[12];
    			btnarea.$set(btnarea_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(btnarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(btnarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			destroy_component(btnarea);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(185:1) <Flex direction=\\\"column\\\" align=\\\"stretch\\\" justify=\\\"start\\\">",
    		ctx
    	});

    	return block;
    }

    // (252:1) <Snackbar top bind:value={showSnackbarTop}>
    function create_default_slot$9(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Configuration copied!";
    			add_location(div, file$o, 252, 2, 9058);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(252:1) <Snackbar top bind:value={showSnackbarTop}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let gdprbanner;
    	let t3;
    	let main;
    	let sitemenu;
    	let t4;
    	let flex;
    	let t5;
    	let snackbar;
    	let updating_value;
    	let current;

    	gdprbanner = new Banner({
    			props: {
    				cookieName: "la-generator",
    				acceptLabel: "Accept",
    				closeLabel: "Close",
    				settingsLabel: "Preferences",
    				heading: "Use of Cookies",
    				choices: {
    					tracking: false,
    					marketing: false,
    					analytics: false
    				},
    				categories: /*gdprCategories*/ ctx[14],
    				description: "We use cookies to ensure a better use of our website. If you continue browsing, we consider that you accept their use.",
    				showEditIcon: "false"
    			},
    			$$inline: true
    		});

    	gdprbanner.$on("analytics", initAnalytics);

    	sitemenu = new SiteMenu({
    			props: { save: /*save*/ ctx[17] },
    			$$inline: true
    		});

    	flex = new Flex({
    			props: {
    				direction: "column",
    				align: "stretch",
    				justify: "start",
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function snackbar_value_binding(value) {
    		/*snackbar_value_binding*/ ctx[27].call(null, value);
    	}

    	let snackbar_props = {
    		top: true,
    		$$slots: { default: [create_default_slot$9] },
    		$$scope: { ctx }
    	};

    	if (/*showSnackbarTop*/ ctx[13] !== void 0) {
    		snackbar_props.value = /*showSnackbarTop*/ ctx[13];
    	}

    	snackbar = new Snackbar({ props: snackbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(snackbar, "value", snackbar_value_binding));

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			link2 = element("link");
    			t2 = space();
    			create_component(gdprbanner.$$.fragment);
    			t3 = space();
    			main = element("main");
    			create_component(sitemenu.$$.fragment);
    			t4 = space();
    			create_component(flex.$$.fragment);
    			t5 = space();
    			create_component(snackbar.$$.fragment);
    			attr_dev(link0, "href", "https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$o, 0, 0, 0);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Roboto+Mono");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file$o, 1, 0, 98);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			attr_dev(link2, "rel", "stylesheet");
    			add_location(link2, file$o, 2, 0, 181);
    			attr_dev(main, "class", "hero svelte-i3mvti");
    			set_style(main, "--footer-height", /*footerHeight*/ ctx[15]);
    			add_location(main, file$o, 182, 0, 6041);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, link2, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(gdprbanner, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(sitemenu, main, null);
    			append_dev(main, t4);
    			mount_component(flex, main, null);
    			append_dev(main, t5);
    			mount_component(snackbar, main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flex_changes = {};

    			if (dirty[0] & /*firstBtnDisabled, sndBtnDisabled, sndBtnText, conf, debug, hostnameAppend, hostnameError, mainDomainError, mainDomainAppend, shortNameError, shortNameAppend, longNameError, longNameAppend*/ 8191 | dirty[1] & /*$$scope*/ 128) {
    				flex_changes.$$scope = { dirty, ctx };
    			}

    			flex.$set(flex_changes);
    			const snackbar_changes = {};

    			if (dirty[1] & /*$$scope*/ 128) {
    				snackbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*showSnackbarTop*/ 8192) {
    				updating_value = true;
    				snackbar_changes.value = /*showSnackbarTop*/ ctx[13];
    				add_flush_callback(() => updating_value = false);
    			}

    			snackbar.$set(snackbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gdprbanner.$$.fragment, local);
    			transition_in(sitemenu.$$.fragment, local);
    			transition_in(flex.$$.fragment, local);
    			transition_in(snackbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gdprbanner.$$.fragment, local);
    			transition_out(sitemenu.$$.fragment, local);
    			transition_out(flex.$$.fragment, local);
    			transition_out(snackbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(link2);
    			if (detaching) detach_dev(t2);
    			destroy_component(gdprbanner, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			destroy_component(sitemenu);
    			destroy_component(flex);
    			destroy_component(snackbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function initAnalytics() {
    	
    } // do something with segment.io or google analytics etc

    function instance$o($$self, $$props, $$invalidate) {
    	let gdprCategories = {
    		analytics() {
    			if (debug) console.log("No analytics cookies specified");
    		},
    		tracking() {
    			if (debug) console.log("No tracking cookies specified");
    		},
    		marketing() {
    			if (debug) console.log("No marketing cookies specified");
    		},
    		necessary() {
    			if (debug) console.log("No necessary cookies specified");
    		}
    	};

    	let footerHeight = "70px";
    	let { debug } = $$props;
    	let { initStore } = $$props;
    	let uuid = initStore.uuid;
    	let conf = initStore.conf;
    	if (debug) console.log(`Conf of '${conf.LA_project_name}' with uuid: ${uuid} `);

    	let save = async function (resetConf, copyConf, callback) {
    		if (resetConf) {
    			if (debug) console.log("Resetting the assistant");

    			// window.history.pushState({page: "/"}, "Generator Living Atlas", "/");
    			window.location.pathname = "/";
    		}

    		let req; // let's get the conf for the server;

    		if (copyConf) {
    			let newConf = { ...conf };
    			newConf.LA_project_name = `Copy of ${conf.LA_project_name}`;
    			newConf.page = 2;
    			req = { conf: JSON.stringify(newConf) };
    		} else {
    			req = { uuid, conf: JSON.stringify(conf) };
    		}

    		fetch("/v1/ses", {
    			method: "POST",
    			body: JSON.stringify(req)
    		}).then(res => res.json()).then(ses => {
    			// console.log(ses);
    			if (debug) console.log(conf);

    			if (copyConf) {
    				const newUuid = ses.uuid;
    				$$invalidate(13, showSnackbarTop = true);
    				const copyUrl = new url_min();
    				copyUrl.path = `/${newUuid}`;
    				window.open(copyUrl.toString(), "_blank");
    			}

    			if (callback) callback();
    		});
    	};

    	save();

    	let onChange = function () {
    		if (debug) console.log("onchange");
    		save();
    	};

    	let longNameInvalid = false;
    	let longNameError = "";
    	let longNameAppend = "";
    	let shortNameInvalid = false;
    	let shortNameError = "";
    	let shortNameAppend = "";
    	let hostnameInvalid = false;
    	let hostnameError = "";
    	let hostnameAppend = "";
    	let mainDomainInvalid = false;
    	let mainDomainError = "";
    	let mainDomainAppend = "";
    	let firstBtnDisabled = true;
    	let sndBtnDisabled = false;
    	let firstBtnText = "« Back";
    	let sndBtnText = "Start";
    	let lastPage = false;

    	let pageValid = [
    		() => true,
    		() => !longNameInvalid && !shortNameInvalid && !mainDomainInvalid,
    		() => conf.hostnames != null && !hostnameInvalid,
    		() => true
    	];

    	let hostnamesHint = "Something typically like 'vm1, vm2, vm3' or 'aws-ip-12-34-56-78, aws-ip-12-34-56-79, aws-ip-12-34-56-80'";
    	let showSnackbarTop = false;

    	let onFirstBtnClick = function () {
    		$$invalidate(1, conf.page -= 1, conf);
    		save();
    	};

    	let doPost = function () {
    		const btn = document.getElementById("submit-btn");
    		btn.click();
    	};

    	let onSndBtnClick = function () {
    		if (conf.page === 4) {
    			save(false, false, () => doPost());
    		} else {
    			$$invalidate(1, conf.page += 1, conf);
    			save();
    		}
    	};

    	const writable_props = ["debug", "initStore"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Assistant> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Assistant", $$slots, []);

    	function textfield0_value_binding(value) {
    		conf.LA_project_name = value;
    		((((((((($$invalidate(1, conf), $$invalidate(28, longNameInvalid)), $$invalidate(29, shortNameInvalid)), $$invalidate(31, mainDomainInvalid)), $$invalidate(30, hostnameInvalid)), $$invalidate(35, hostnamesHint)), $$invalidate(0, debug)), $$invalidate(34, pageValid)), $$invalidate(32, lastPage)), $$invalidate(17, save));
    	}

    	function textfield1_value_binding(value) {
    		conf.LA_project_shortname = value;
    		((((((((($$invalidate(1, conf), $$invalidate(28, longNameInvalid)), $$invalidate(29, shortNameInvalid)), $$invalidate(31, mainDomainInvalid)), $$invalidate(30, hostnameInvalid)), $$invalidate(35, hostnamesHint)), $$invalidate(0, debug)), $$invalidate(34, pageValid)), $$invalidate(32, lastPage)), $$invalidate(17, save));
    	}

    	function switch_1_value_binding(value) {
    		conf.LA_enable_ssl = value;
    		((((((((($$invalidate(1, conf), $$invalidate(28, longNameInvalid)), $$invalidate(29, shortNameInvalid)), $$invalidate(31, mainDomainInvalid)), $$invalidate(30, hostnameInvalid)), $$invalidate(35, hostnamesHint)), $$invalidate(0, debug)), $$invalidate(34, pageValid)), $$invalidate(32, lastPage)), $$invalidate(17, save));
    	}

    	function textfield_value_binding(value) {
    		conf.LA_domain = value;
    		((((((((($$invalidate(1, conf), $$invalidate(28, longNameInvalid)), $$invalidate(29, shortNameInvalid)), $$invalidate(31, mainDomainInvalid)), $$invalidate(30, hostnameInvalid)), $$invalidate(35, hostnamesHint)), $$invalidate(0, debug)), $$invalidate(34, pageValid)), $$invalidate(32, lastPage)), $$invalidate(17, save));
    	}

    	function textfield_value_binding_1(value) {
    		conf.hostnames = value;
    		((((((((($$invalidate(1, conf), $$invalidate(28, longNameInvalid)), $$invalidate(29, shortNameInvalid)), $$invalidate(31, mainDomainInvalid)), $$invalidate(30, hostnameInvalid)), $$invalidate(35, hostnamesHint)), $$invalidate(0, debug)), $$invalidate(34, pageValid)), $$invalidate(32, lastPage)), $$invalidate(17, save));
    	}

    	function snackbar_value_binding(value) {
    		showSnackbarTop = value;
    		$$invalidate(13, showSnackbarTop);
    	}

    	$$self.$$set = $$props => {
    		if ("debug" in $$props) $$invalidate(0, debug = $$props.debug);
    		if ("initStore" in $$props) $$invalidate(21, initStore = $$props.initStore);
    	};

    	$$self.$capture_state = () => ({
    		projectNameRegexp,
    		domainRegexp,
    		hostnameRegexp,
    		shortNameRegexp,
    		IntroPage,
    		BtnArea,
    		Service,
    		SiteMenu,
    		Flex,
    		UrlPrefix,
    		Card: Card$1,
    		Button,
    		List,
    		Snackbar,
    		Switch,
    		TextField,
    		Tooltip,
    		services,
    		servicesStore,
    		storez,
    		GdprBanner: Banner,
    		title: utils$1.title,
    		Url: url_min,
    		initAnalytics,
    		gdprCategories,
    		footerHeight,
    		debug,
    		initStore,
    		uuid,
    		conf,
    		save,
    		onChange,
    		longNameInvalid,
    		longNameError,
    		longNameAppend,
    		shortNameInvalid,
    		shortNameError,
    		shortNameAppend,
    		hostnameInvalid,
    		hostnameError,
    		hostnameAppend,
    		mainDomainInvalid,
    		mainDomainError,
    		mainDomainAppend,
    		firstBtnDisabled,
    		sndBtnDisabled,
    		firstBtnText,
    		sndBtnText,
    		lastPage,
    		pageValid,
    		hostnamesHint,
    		showSnackbarTop,
    		onFirstBtnClick,
    		doPost,
    		onSndBtnClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("gdprCategories" in $$props) $$invalidate(14, gdprCategories = $$props.gdprCategories);
    		if ("footerHeight" in $$props) $$invalidate(15, footerHeight = $$props.footerHeight);
    		if ("debug" in $$props) $$invalidate(0, debug = $$props.debug);
    		if ("initStore" in $$props) $$invalidate(21, initStore = $$props.initStore);
    		if ("uuid" in $$props) $$invalidate(16, uuid = $$props.uuid);
    		if ("conf" in $$props) $$invalidate(1, conf = $$props.conf);
    		if ("save" in $$props) $$invalidate(17, save = $$props.save);
    		if ("onChange" in $$props) $$invalidate(18, onChange = $$props.onChange);
    		if ("longNameInvalid" in $$props) $$invalidate(28, longNameInvalid = $$props.longNameInvalid);
    		if ("longNameError" in $$props) $$invalidate(2, longNameError = $$props.longNameError);
    		if ("longNameAppend" in $$props) $$invalidate(3, longNameAppend = $$props.longNameAppend);
    		if ("shortNameInvalid" in $$props) $$invalidate(29, shortNameInvalid = $$props.shortNameInvalid);
    		if ("shortNameError" in $$props) $$invalidate(4, shortNameError = $$props.shortNameError);
    		if ("shortNameAppend" in $$props) $$invalidate(5, shortNameAppend = $$props.shortNameAppend);
    		if ("hostnameInvalid" in $$props) $$invalidate(30, hostnameInvalid = $$props.hostnameInvalid);
    		if ("hostnameError" in $$props) $$invalidate(6, hostnameError = $$props.hostnameError);
    		if ("hostnameAppend" in $$props) $$invalidate(7, hostnameAppend = $$props.hostnameAppend);
    		if ("mainDomainInvalid" in $$props) $$invalidate(31, mainDomainInvalid = $$props.mainDomainInvalid);
    		if ("mainDomainError" in $$props) $$invalidate(8, mainDomainError = $$props.mainDomainError);
    		if ("mainDomainAppend" in $$props) $$invalidate(9, mainDomainAppend = $$props.mainDomainAppend);
    		if ("firstBtnDisabled" in $$props) $$invalidate(10, firstBtnDisabled = $$props.firstBtnDisabled);
    		if ("sndBtnDisabled" in $$props) $$invalidate(11, sndBtnDisabled = $$props.sndBtnDisabled);
    		if ("firstBtnText" in $$props) firstBtnText = $$props.firstBtnText;
    		if ("sndBtnText" in $$props) $$invalidate(12, sndBtnText = $$props.sndBtnText);
    		if ("lastPage" in $$props) $$invalidate(32, lastPage = $$props.lastPage);
    		if ("pageValid" in $$props) $$invalidate(34, pageValid = $$props.pageValid);
    		if ("hostnamesHint" in $$props) $$invalidate(35, hostnamesHint = $$props.hostnamesHint);
    		if ("showSnackbarTop" in $$props) $$invalidate(13, showSnackbarTop = $$props.showSnackbarTop);
    		if ("onFirstBtnClick" in $$props) $$invalidate(19, onFirstBtnClick = $$props.onFirstBtnClick);
    		if ("doPost" in $$props) doPost = $$props.doPost;
    		if ("onSndBtnClick" in $$props) $$invalidate(20, onSndBtnClick = $$props.onSndBtnClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*conf, longNameInvalid, shortNameInvalid, hostnameInvalid, debug*/ 1879048195 | $$self.$$.dirty[1] & /*mainDomainInvalid, lastPage*/ 3) {
    			 {
    				$$invalidate(28, longNameInvalid = !(conf.LA_project_name.length > 0 && projectNameRegexp.test(conf.LA_project_name)));
    				$$invalidate(2, longNameError = longNameInvalid ? "Project name invalid" : "");
    				$$invalidate(3, longNameAppend = longNameInvalid ? "error" : "");
    				$$invalidate(29, shortNameInvalid = !shortNameRegexp.test(conf.LA_project_shortname));
    				$$invalidate(4, shortNameError = shortNameInvalid ? "Project short name invalid" : "");
    				$$invalidate(5, shortNameAppend = shortNameInvalid ? "error" : "");
    				$$invalidate(31, mainDomainInvalid = !domainRegexp.test(conf.LA_domain));

    				$$invalidate(8, mainDomainError = mainDomainInvalid
    				? "You need to provide some-atlas-domain.org"
    				: "");

    				$$invalidate(9, mainDomainAppend = mainDomainInvalid ? "error" : "");
    				$$invalidate(30, hostnameInvalid = !hostnameRegexp.test(conf.hostnames));
    				$$invalidate(6, hostnameError = hostnameInvalid ? hostnamesHint : "");
    				$$invalidate(7, hostnameAppend = hostnameInvalid);
    				$$invalidate(10, firstBtnDisabled = conf.page === 1);
    				if (debug) console.log(`Current page ${conf.page} valid ${pageValid[conf.page - 1]()}`);
    				$$invalidate(11, sndBtnDisabled = !pageValid[conf.page - 1]());
    				$$invalidate(32, lastPage = conf.page === 4);

    				$$invalidate(12, sndBtnText = conf.page === 1
    				? "Start"
    				: lastPage ? "Generate & Download" : "Continue »");

    				const nextTitle = utils$1.title(conf.LA_project_shortname);

    				if (document.title != nextTitle) {
    					document.title = nextTitle;
    				}

    				if (conf.hostnames != null && conf.hostnames.length > 0) {
    					$$invalidate(1, conf.hostnamesList = conf.hostnames.split(/[,\s]/).filter(Boolean), conf);
    					if (debug) console.log(`hostnames: ${conf.hostnamesList.toString()}`);
    					save();
    				}
    			}
    		}
    	};

    	return [
    		debug,
    		conf,
    		longNameError,
    		longNameAppend,
    		shortNameError,
    		shortNameAppend,
    		hostnameError,
    		hostnameAppend,
    		mainDomainError,
    		mainDomainAppend,
    		firstBtnDisabled,
    		sndBtnDisabled,
    		sndBtnText,
    		showSnackbarTop,
    		gdprCategories,
    		footerHeight,
    		uuid,
    		save,
    		onChange,
    		onFirstBtnClick,
    		onSndBtnClick,
    		initStore,
    		textfield0_value_binding,
    		textfield1_value_binding,
    		switch_1_value_binding,
    		textfield_value_binding,
    		textfield_value_binding_1,
    		snackbar_value_binding
    	];
    }

    class Assistant extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { debug: 0, initStore: 21 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Assistant",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*debug*/ ctx[0] === undefined && !("debug" in props)) {
    			console_1$1.warn("<Assistant> was created without expected prop 'debug'");
    		}

    		if (/*initStore*/ ctx[21] === undefined && !("initStore" in props)) {
    			console_1$1.warn("<Assistant> was created without expected prop 'initStore'");
    		}
    	}

    	get debug() {
    		throw new Error("<Assistant>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debug(value) {
    		throw new Error("<Assistant>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initStore() {
    		throw new Error("<Assistant>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initStore(value) {
    		throw new Error("<Assistant>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    const { Error: Error_1$1, console: console_1$2 } = globals;
    const file$p = "src/App.svelte";

    // (46:2) {:else}
    function create_else_block$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*error*/ ctx[1].length > 0 && create_if_block_1$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*error*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*error*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(46:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:2) {#if (typeof initStore.uuid !== "undefined")}
    function create_if_block$d(ctx) {
    	let assistant;
    	let current;

    	assistant = new Assistant({
    			props: {
    				initStore: /*initStore*/ ctx[0],
    				debug: /*debug*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(assistant.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(assistant, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const assistant_changes = {};
    			if (dirty & /*initStore*/ 1) assistant_changes.initStore = /*initStore*/ ctx[0];
    			assistant.$set(assistant_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(assistant.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(assistant.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(assistant, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(44:2) {#if (typeof initStore.uuid !== \\\"undefined\\\")}",
    		ctx
    	});

    	return block;
    }

    // (48:3) {#if (error.length > 0)}
    function create_if_block_1$7(ctx) {
    	let h2;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				block: true,
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*onFirstBtnClick*/ ctx[3]);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Living Atlas Generator";
    			t1 = space();
    			span = element("span");
    			t2 = text(/*error*/ ctx[1]);
    			t3 = space();
    			div = element("div");
    			create_component(button.$$.fragment);
    			add_location(h2, file$p, 48, 4, 1419);
    			attr_dev(span, "class", "error-message svelte-r7f723");
    			add_location(span, file$p, 49, 4, 1455);
    			attr_dev(div, "class", "py-2 mr-2");
    			add_location(div, file$p, 50, 4, 1502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*error*/ 2) set_data_dev(t2, /*error*/ ctx[1]);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(48:3) {#if (error.length > 0)}",
    		ctx
    	});

    	return block;
    }

    // (52:5) <Button on:click={onFirstBtnClick} block>
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Restart");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(52:5) <Button on:click={onFirstBtnClick} block>",
    		ctx
    	});

    	return block;
    }

    // (43:1) <Flex direction="column" align="stretch" justify="center">
    function create_default_slot_1$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$d, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (typeof /*initStore*/ ctx[0].uuid !== "undefined") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(43:1) <Flex direction=\\\"column\\\" align=\\\"stretch\\\" justify=\\\"center\\\">",
    		ctx
    	});

    	return block;
    }

    // (42:0) <Flex direction="row" align="stretch" justify="center">
    function create_default_slot$a(ctx) {
    	let flex;
    	let current;

    	flex = new Flex({
    			props: {
    				direction: "column",
    				align: "stretch",
    				justify: "center",
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(flex.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flex, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flex_changes = {};

    			if (dirty & /*$$scope, initStore, error*/ 67) {
    				flex_changes.$$scope = { dirty, ctx };
    			}

    			flex.$set(flex_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flex, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(42:0) <Flex direction=\\\"row\\\" align=\\\"stretch\\\" justify=\\\"center\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let flex;
    	let current;

    	flex = new Flex({
    			props: {
    				direction: "row",
    				align: "stretch",
    				justify: "center",
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(flex.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(flex, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const flex_changes = {};

    			if (dirty & /*$$scope, initStore, error*/ 67) {
    				flex_changes.$$scope = { dirty, ctx };
    			}

    			flex.$set(flex_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flex, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let initStore = {};
    	let debug = false;
    	let uuid = new url_min().path.replace(/^\/+/, "");
    	let error = "";

    	let init = function () {
    		let req;

    		if (uuid === "" || uuid == null) req = {}; else req = {
    			uuid, // let's ask for a uuid
    			
    		}; // let's get the conf for the server

    		fetch("/v1/ses", {
    			method: "POST",
    			body: JSON.stringify(req)
    		}).then(res => {
    			if (res.ok) return res.json(); else {
    				$$invalidate(1, error = "Oops, we can't find this configuration ...");
    				throw new Error(error);
    			}
    		}).then(ses => {
    			uuid = ses.uuid;
    			let conf = ses.conf;
    			if (debug) console.log(`Conf of '${conf.LA_project_name}' with uuid: ${uuid} `);
    			window.history.pushState({ page: uuid }, utils$1.title(conf.LA_project_shortname), uuid);
    			$$invalidate(0, initStore = { uuid, conf });
    		});
    	};

    	let onFirstBtnClick = () => {
    		const newUrl = new url_min();
    		newUrl.path = "/";
    		window.open(newUrl.toString());
    	};

    	init();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Url: url_min,
    		Assistant,
    		title: utils$1.title,
    		Flex,
    		Button,
    		initStore,
    		debug,
    		uuid,
    		error,
    		init,
    		onFirstBtnClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("initStore" in $$props) $$invalidate(0, initStore = $$props.initStore);
    		if ("debug" in $$props) $$invalidate(2, debug = $$props.debug);
    		if ("uuid" in $$props) uuid = $$props.uuid;
    		if ("error" in $$props) $$invalidate(1, error = $$props.error);
    		if ("init" in $$props) init = $$props.init;
    		if ("onFirstBtnClick" in $$props) $$invalidate(3, onFirstBtnClick = $$props.onFirstBtnClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [initStore, error, debug, onFirstBtnClick];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
