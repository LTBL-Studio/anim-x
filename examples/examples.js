import {animateElement, animateStack} from "../src/index.js";

// Example 1 (pulse)

async function example1(){
    let element = document.querySelector("#example-1 .square")
    while(true)
    {
        await animateElement(element, "pulse")
        await new Promise(res => setTimeout(res, 1000))
    }
}
example1()

// Example 2 (slide)

async function example2(){
    let element = document.querySelector("#example-2 .square")
    while(true)
    {
        await animateElement(element, "slide-right")
        await animateElement(element, "slide-left")
    }
}
example2()

// Example 3 card stack

async function example3(){
    let elements = Array.from(document.querySelectorAll("#example-3 .card"))
    while(true)
    {
        elements.forEach(el => el.classList.remove("hidden"))
        await animateStack(elements, "enter")
        await new Promise(res => setTimeout(res, 2000))
        await animateStack(elements, "leave")
        elements.forEach(el => el.classList.add("hidden"))
        await new Promise(res => setTimeout(res, 500))
    }
}
example3()

// Example 4 keyframes based

async function example4(){
    let element = document.querySelector("#example-4 .square")
    while(true)
    {
        await animateElement(element, "drop")
        await new Promise(res => setTimeout(res, 1000))
    }
}
example4()
