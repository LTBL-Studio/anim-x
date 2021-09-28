# Anim-x

CSS-based animations triggered by JS, defined in your stylesheet.

```sh-session
$ npm i https://github.com/LTBL-Studio/anim-x.git
```

## Quick start

An animation is identified with a name and is applied to an element by successively adding and removing classes.

For this example we will animate this div element with class `square` for a simple apparition with scale.

```html
<div class="square"></div>
```

In your code, select the element we want to animate and call `animateElement()` with a name for your animation.

```js
animateElement(document.querySelector(".square"), "enter")
```

Here, we are triggering an animation called `enter` on our element `.square`.

Anim-x uses promises to have control over your animations, `animateElement()` returns a promise that resolve when the animation ends.

For now, we don't defined any effect and timing for this animation.
No animation is shown.

Animation content is defined in CSS stylesheet.
It's helps to separate concerns, focus on your JS code and get back to animation later.

> In this example we use CSS transitions but you can use `@keyframes` and `animation` properties instead.

for that, Anim-x will use 3 types of classes, in our case :

* `animate-enter-active` Added during all the animation and defines its duration, delay, timing function, etc.
* `animate-enter` Added only when the animation starts and defines the initial style of the animated element
* `animation-enter-end` Added just one frame after `animate-enter` was removed and defines the final style of the animated element.

Css transition will interpolate the style between `animate-enter` and `animate-enter-end`.

```css
.square.animate-enter-active {
    transition: ease 0.5s all;
}

.square.animate-enter {
    transform: scale(0.3);
    opacity: 0;
}

.square.animate-enter-end {
    transform: scale(1);
    opacity: 1;
}
```

>In our example, our animation is called "enter", but name of the animation defines the name of animation classes.
>
> * `animate-[animationName]-active`
> * `animate-[animationName]`
> * `animate-[animationName]-end`

## Stack animation

Anim-x helps you to animate sequencial elements like list of items.

Function `animateStack` will call `animateElement` on each item in order.

```js
animateElement(document.querySelectorAll(".my-list > *"), "enter")
```

During the process a class `animate-[animationName]-stack` is added to all animated elements during all stack animation.
A CSS var `--animate-stack-index` is also defined to helps you calculate delays for each element.

```css
.my-list > .animate-enter-active {
    transition: ease 0.5s all;
    transition-delay: calc(var(--animate-stack-index) * 100ms);
}

.my-list > .animate-enter {
    transform: scale(0.3);
    opacity: 0;
}

.my-list > .animate-enter-end {
    transform: scale(1);
    opacity: 1;
}
```

## Options

This is a list of options you can pass to `animateElement` and `animateStack` as last parameter

* `rejectOnCancel` boolean (default: false) : if the animation is cancelled, reject the promise instead of resolving it
* `subtree` boolean (default: true) : if true, Anim-x will resolve until all children animations are completed