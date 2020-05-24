// ==UserScript==
// @name                Grepolis Sending Resources Hotkeys
// @version             1.0.2
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

// global variables
let townSwitchInputToogle = null;

(() => {
   tradeHotkeys();
   townSwitch();
   reportAutoIndexer();
})()

function tradeHotkeys() {
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
            switch (event.code) {
                case 'Tab': {
                    event.preventDefault();
                    const resourcesInputElements = document.querySelectorAll('.resource_selector > div.spinner > div.body > input');
                    if (resourcesInputElements.length > 0) {
                        resourcesInputElements[0].focus();
                    }
                    break;
                }
            }
        }
    });
}

function townSwitch() {
    window.addEventListener('keydown', (event) => {
        if ((event.target.tagName.toUpperCase() !== 'INPUT' && event.target.tagName.toUpperCase() !== 'TEXTAREA') || document.activeElement === document.getElementById('townSwitch')) {
            switch (event.code) {
                case 'KeyV' : {
                    // trigger only if Control key is pressed
                    if (event.ctrlKey) {
                        event.preventDefault();
                        if (townSwitchInputToogle === null) {
                            let townSwitch = document.createElement('input');
                            townSwitch.id = 'townSwitch';
                            townSwitch.style = 'margin-top: 20px;';
                            let element = document.querySelector('.culture_overview_wrapper');
                            element.appendChild(townSwitch);
                            townSwitch.focus();
                            townSwitchInputToogle = true;
                        } else {
                            const townSwitch = document.getElementById('townSwitch');
                            if (townSwitchInputToogle) {
                                hideInput(townSwitch);
                            } else {
                                showInput(townSwitch);

                            }
                            townSwitchInputToogle = !townSwitchInputToogle;
                        }
                    }
                    break;
                }
                case 'Enter': {
                    let townSwitch = document.getElementById('townSwitch');

                    // check if townSwitch is declared has focus
                    if (townSwitch && document.activeElement === townSwitch && townSwitch.value) {
                        const townId = searchForTown(townSwitch.value);
                        hideInput(townSwitch);
                        townSwitchInputToogle = !townSwitchInputToogle;
                        goToTown(townId);
                    }
                }
            }
        }
    });

    function hideInput(input) {
        input.style = 'display: none';
        input.value = '';
        input.blur();
    }

    function showInput(input) {
        input.style = 'margin-top: 20px';
        input.focus();
    }

    function searchForTown(text) {
        const townsObject = ITowns.getTowns();
        for (let [id, townObject] of Object.entries(townsObject)) {
            const { name } = townObject
            if(name.toLowerCase().includes(text.toLowerCase())) return id;
        }
        return null;
    }

    function goToTown(townId) {
        HelperTown.townSwitch(townId)
    }
}

// Automatically index opened reports. Works only if you have GrepoData user script installed
async function reportAutoIndexer() {

    let lastReportElement = null;

    const observer = new MutationObserver((mutations) => {
        const reportWindow = document.getElementById('report_report');
        const mutatedElement = mutations[0].target;

        // only if report element is not null, ajax loader is hidden (report is loaded) and report element is different than the last one
        if(reportWindow && mutatedElement.style.visibility === 'hidden' && reportWindow !== lastReportElement) {
            lastReportElement = reportWindow;

            const indexElement = document.getElementById('gd_index_rep_txt');

            // if index element is not null and it's not indexed yet (textContent === Index +)
            if(indexElement && indexElement.textContent === 'Index +') {
                indexElement.click()
            }
        }
    })

    await waitUntilElementIsLoaded('ajax_loader', 1000);

    const ajaxLoader = document.getElementById('ajax_loader')

    observer.observe(ajaxLoader, {
        attributes: true,
    })

    function wait(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async function waitUntilElementIsLoaded(selector, time) {
        if(document.getElementById(selector) === null) {
            await wait(time);
            await waitUntilElementIsLoaded(selector, time);
        }
    }
}
