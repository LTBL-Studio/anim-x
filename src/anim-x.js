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
 *  - rejectOnCancel Boolean Reject the promise if animation is cancelled with "clearAnimation()" (default: false)
 *  - subtree Boolean Wait for all subtree animations to finish to resolve (default: true)
 *
 * @param el HTMLElement Element to animate
 * @param animationName String name of the animation used in class names assigned to element "el"
 * @param options Object Option object for additional parameters
 * @returns {Promise<void>}
 */
export function animateElement(el, animationName, options = {rejectOnCancel: false, subtree: true}) {

    const { extraDelay, rejectOnCancel } = options

    if(Array.isArray(el) || el instanceof HTMLCollection){
        return animateStack(el,animationName, options)
    }

    const {fromClass, toClass, activeClass} = getAnimationClasses(animationName)

    if (el.$animxIsAnimating) {
        clearAnimation(el);
    }

    el.$animxIsAnimating = true;

    let eltAnimations = [];
    let animationFrameRequest = null;

    return new Promise((resolve, reject) => {

        el.$animxStopAnimation = () => {
            if (!el.$animxIsAnimating) return;
            
            eltAnimations.forEach(a => a.cancel())

            if (animationFrameRequest) {
                cancelAnimationFrame(animationFrameRequest);
            }

            el.classList.remove(fromClass);
            el.classList.remove(toClass);
            el.classList.remove(activeClass);

            if(rejectOnCancel) {
                return reject();
            } else {
                return resolve();
            }
        };

        el.classList.add(fromClass);

        let performAnimation = () => {
            animationFrameRequest = requestAnimationFrame(() => {
                animationFrameRequest = null;
                el.classList.add(activeClass);

                return (animationFrameRequest = requestAnimationFrame(() => {

                    animationFrameRequest = null;
                    el.classList.add(toClass);
                    el.classList.remove(fromClass);

                    eltAnimations = el.getAnimations({subtree: options.subtree});

                    Promise.all(eltAnimations.map(a => a.finished)).then(() => {
                        el.classList.remove(fromClass);
                        el.classList.remove(toClass);
                        el.classList.remove(activeClass);
                        el.$animxAnimateCurrentTimeout = null;
                        el.$animxStopAnimation = null;
                        el.$animxIsAnimating = false;
                        return resolve();
                    })

                }));

            });
        };
        
        return (animationFrameRequest = requestAnimationFrame(() => {
            animationFrameRequest = null;
            performAnimation();
        }));
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
    const stackClass = `animate-${animationName}-stack`;
    return {
        fromClass,
        toClass,
        activeClass,
        stackClass
    }
}

/**
 * Animate a stack of elements
 * 
 * All animations are triggered at the same time;
 * Class "animate-[animationName]-stack" is added to all elements in stack
 * CSS var "--animate-stack-index" is added to each element containing the 0-starting index of the element in stack
 * This var **MUST** be used to define the animation delay.
 * 
 * e.g. 
 *  .animate-leave-active {
 *      transition: ease-out 0.2s all;
 *      transition-delay: calc(var(--animate-stack-index) * 100ms);
 *  }
 *
 * @see animateElement
 *
 * @param animationName String name of the animation
 * @param elementList HTMLElement[] Array of elements to animate in order
 * @param options Object Option to pass to "animateElement()"
 * @returns {Promise<void[]>} Resolved when all element animations has ended
 */
export async function animateStack(elementList, animationName, options) {
    const {fromClass, toClass, stackClass} = getAnimationClasses(animationName)

    let elements = Array.from(elementList)

    let animationsProms = elements.map(async (el, i) => {

        el.classList.add(stackClass)
        el.classList.add(fromClass)
        el.style.setProperty("--animate-stack-index", i)
        await animateElement(el, animationName, options)
        el.classList.add(toClass)

    })

    await Promise.all(animationsProms);

    elements.forEach(el => {
        el.classList.remove(toClass)
        el.classList.remove(stackClass)
        el.style.removeProperty("--animate-stack-index")
    })
}