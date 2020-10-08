import {animateElement} from "./anim-x.js";

/**
 * Animate an element to appear into the interface
 *
 * Calls "animateElement()" with "enter" as animation name
 *
 * @see animateElement
 * @param el HTMLElement Element to animate
 * @param options "animateElement()" options
 * @returns {Promise<void>} Resolves when animation ends
 */
export function animateEnter(el, options){
    return animateElement(el, "enter", options)
}


/**
 * Animate an element to leave the interface
 *
 * Calls "animateElement()" with "leave" as animation name
 *
 * @see animateElement
 * @param el HTMLElement element to animate
 * @param options "animateElement()" options
 * @returns {Promise<void>} Resolves when animation ends
 */
export function animateLeave(el, options){
    return animateElement(el, "leave", options)
}
