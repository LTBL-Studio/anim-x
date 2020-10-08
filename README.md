# Anim-x

Tiny but powerful CSS transitions based animation library.

```sh-session
$ npm i anim-x
```

## Quick start

An animation is identified with a name and is applied to an element by successively adding or removing classes.
Anim-x goal is to organize these classes to allow a flexible use of these animation classes.

Let's dive into your first animation with Anim-x.

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
We must define this by applying our style in CSS stylesheet.

for that, Anim-x will use 3 types of classes, in our case :

* `animate-enter-active` Added during all the animation and defines its duration, delay, timing function, etc.
* `animate-enter` Added only when the animation starts and must define the initial style of the animated element
* `animation-enter-end` Added just one frame after `animate-enter` was removed and must define the final style of the animated element.

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

Now, we have our animation ready
