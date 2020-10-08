/**
 * Clear an currently running element animation
 * @param el HTMLElement Animated element to clear animation
 */
export function clearAnimation(el) {
    if (el.$animxStopAnimation) {
        el.$animxStopAnimation();
        el.$animxStopAnimation = null;
    }
}

/**
 * Animate a DOM element according to CSS style, resolves when animation finished (or cancelled)
 *
 * Animate the element "el" using CSS transitions.
 * "animationName" will define the animation class names as such :
 * 1. "animate-[animationName]-active" is added to element "el"
 * 2. Animation frame is requested
 * 3. "animate-[animationName]" is added to element "el"
 * 4. Animation frame is requested
 * 5. "animate-[animationName]" is removed from element "el" and "animate-[animationName]-end" is added
 * 6. Animation duration (defined by "animation-duration" and "animation-delay" css property) is waited
 * 7. "animate-[animationName]-active" and "animate-ænimationName]-end" are removed from element "el"
 * 8. Promise is resolved
 *
 * Options:
 *  - extraDelay Number Delay to add before the animation starts
 *  - rejectOnCancel Boolean Reject the promise if animation is cancelled with "clearAnimation()"
 *
 * @param el HTMLElement Element to animate
 * @param animationName String name of the animation used in class names assigned to element "el"
 * @param options Object Option object for additional parameters
 * @returns {Promise<void>}
 */
export function animateElement(el, animationName, options = {extraDelay: 0, rejectOnCancel: false}) {

    const { extraDelay, rejectOnCancel } = options

    if(Array.isArray(el) || el instanceof HTMLCollection){
        return animateStack(el,animationName, options)
    }

    const {fromClass, toClass, activeClass} = getAnimationClasses(animationName)

    if (el.$animxIsAnimating) {
        clearAnimation(el);
    }

    el.$animxIsAnimating = true;

    return new Promise((resolve, reject) => {

        el.$animxStopAnimation = () => {
            if (!el.$animxIsAnimating) return;
            if (el.$animxAnimateCurrentTimeout) {
                clearTimeout(el.$animxAnimateCurrentTimeout);
            }
            if (el.$animxAnimationFrameRequest) {
                cancelAnimationFrame(el.$animxAnimationFrameRequest);
            }
            el.classList.remove(fromClass);
            el.classList.remove(toClass);
            el.classList.remove(activeClass);
            if(rejectOnCancel) {
                return resolve();
            } else {
                return reject()
            }
        };

        el.classList.add(fromClass);

        let performAnimation = () => {
            el.$animxAnimationFrameRequest = requestAnimationFrame(() => {
                el.$animxAnimationFrameRequest = null;
                el.classList.add(activeClass);

                return (el.$animxAnimationFrameRequest = requestAnimationFrame(() => {
                    el.$animxAnimationFrameRequest = null;
                    el.classList.add(toClass);
                    el.classList.remove(fromClass);

                    el.$animxAnimateCurrentTimeout = setTimeout(() => {
                        el.classList.remove(fromClass);
                        el.classList.remove(toClass);
                        el.classList.remove(activeClass);
                        el.$animxAnimateCurrentTimeout = null;
                        el.$animxStopAnimation = null;
                        el.$animxIsAnimating = false;
                        return resolve();
                    }, getAnimationDuration(el));
                }));
            });
        };
        if (extraDelay) {
            el.$animxAnimateCurrentTimeout = extraDelay;
            return setTimeout(
                () => {
                    el.$animxAnimateCurrentTimeout = null;
                    performAnimation();
                },
                extraDelay ? extraDelay : 0
            );
        } else {
            return (el.$animxAnimationFrameRequest = requestAnimationFrame(() => {
                el.$animxAnimationFrameRequest = null;
                performAnimation();
            }));
        }
    });
}

/**
 * Get animation class names from animation name
 * @param animationName
 * @return {{toClass: string, activeClass: string, fromClass: string}}
 */
export function getAnimationClasses(animationName){
    const fromClass = `animate-${animationName}`;
    const toClass = `animate-${animationName}-end`;
    const activeClass = `animate-${animationName}-active`;
    const stepClass = `animate-${animationName}-step`;
    return {
        fromClass,
        toClass,
        activeClass,
        stepClass
    }
}

/**
 * Animate a stack of elements separated by a delay
 *
 * A delay between each animation start can be defined into the class "animate-[animationName]-step"
 * The CSS property "transition-delay" gives the delay between each animation **start**.
 *
 * @see animateElement
 *
 * @param animationName String name of the animation
 * @param elementList HTMLElement[] Array of elements to animate in order
 * @param options Object Option to pass to "animateElement()"
 * @returns {Promise<void[]>} Resolved when all element animations has ended
 */
export async function animateStack(elementList, animationName, options = {}) {
    const {fromClass, toClass, stepClass} = getAnimationClasses(animationName)

    let elements = Array.from(elementList)

    let promiseList = elements.map(async (el,i) => {
        el.classList.add(stepClass)
        let delay = i * getAnimationDuration(el)
        el.classList.remove(stepClass)
        el.classList.add(fromClass)
        await new Promise(res => setTimeout(res, delay))
        let result = await animateElement(el, animationName, options)
        el.classList.add(toClass)
        return result;
    })

    let results = await Promise.all(promiseList);
    elements.forEach(el => el.classList.remove(toClass))

    return results
}

/**
 * Get CSS transition duration (in ms) for the given element
 *
 * Is computed by adding values of "animation-duration" and "animation-delay" CSS properties
 *
 * @param element HTMLElement Element with css transition to get duration from
 * @returns {number} Duration of the animation + delay in ms
 */
export function getAnimationDuration(element) {
    let style = window.getComputedStyle(element);
    let duration = style.transitionDuration;
    let delay = style.transitionDelay;
    let animationDuration = style.animationDuration;
    let animationDelay = style.animationDelay;

    duration = Math.round(
        duration.indexOf("ms") > -1
            ? parseFloat(duration)
            : parseFloat(duration) * 1000
    );
    delay = Math.round(
        delay.indexOf("ms") > -1 ? parseFloat(delay) : parseFloat(delay) * 1000
    );
    animationDuration = Math.round(
        animationDuration.indexOf("ms") > -1
            ? parseFloat(animationDuration)
            : parseFloat(animationDuration) * 1000
    );
    animationDelay = Math.round(
        animationDelay.indexOf("ms") > -1
            ? parseFloat(animationDelay)
            : parseFloat(animationDelay) * 1000
    );

    return Math.max(duration + delay, animationDuration + animationDelay);
}
