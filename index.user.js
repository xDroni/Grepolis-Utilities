// ==UserScript==
// @name                Grepolis Sending Resources Hotkeys
// @version             1.0
// @author              dx droni <mrdroonix@gmail.com>
// @updateURL           https://github.com/xDroni/Grepolis-Resources-Hotkeys/raw/master/index.user.js
// @downloadURL         https://github.com/xDroni/Grepolis-Resources-Hotkeys/raw/master/index.user.js
// @description         Utility Grepolis script that allows you to send the resources faster using hotkeys.
// @include             http://*.grepolis.com/game/*
// @include             https://*.grepolis.com/game/*
// @exclude             view-source://*
// @copyright           2020+, dx droni
// @grant               none
// ==/UserScript==

window.addEventListener('keydown', event => {
    if(event.target.tagName.toUpperCase() === 'INPUT') {
        const resourcesInputElements = document.querySelectorAll('.resource_selector > div.spinner > div.body > input')
        if(resourcesInputElements.length > 0) {
            const activeElement = document.activeElement
            const array = Array.from(resourcesInputElements)
            if(array.includes(activeElement)) {
                const index = array.findIndex(element => element === activeElement)
                switch (event.key) {
                    // unfocus the input using Escape key
                    case 'Escape': {
                        event.preventDefault()
                        activeElement.blur()
                        break
                    }

                    // select the next resource input
                    case 'Tab': {
                        event.preventDefault()

                        // change the focus (active element)
                        // mod 3 because we have 3 resource types, if we have 3rd focused clicking Tab will focus the 1st one
                        array[(index+1) % 3].focus()
                        break
                    }

                    // send the resources
                    case 'Enter': {
                        event.preventDefault()
                        const sendButton = document.querySelector('#trade > div > div.content > div.btn_trade_button.button_new')
                        sendButton.click()
                        activeElement.blur()
                        break
                    }

                    default: {
                        const keyValue = parseInt(event.key)
                        if(!isNaN(keyValue)) { // if not NaN
                            event.preventDefault()

                            // treat 0 by default
                            if(keyValue === 0) {
                                activeElement.value = activeElement.value * 10

                                // unfocus the element and focus it back to apply the value
                                // without this there was a problem with adding resources using arrow keys (feature provided by Potusek Report Converter)
                                activeElement.blur()
                                activeElement.focus()
                                break
                            }


                            activeElement.value = keyValue * 1000

                            activeElement.blur()
                            activeElement.focus()
                        }
                    }
                }
            }
        }
    }
    else {
        if(event.key === 'Tab') {
            event.preventDefault()
            const resourcesInputElements = document.querySelectorAll('.resource_selector > div.spinner > div.body > input')
            if(resourcesInputElements.length > 0) {
                resourcesInputElements[0].focus()
            }
        }
    }
})