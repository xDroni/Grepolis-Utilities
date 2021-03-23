// ==UserScript==
// @name                Grepolis Sending Resources Hotkeys
// @version             1.0.5
// @author              dx droni <mrdroonix@gmail.com>
// @updateURL           https://github.com/xDroni/Grepolis-Resources-Hotkeys/raw/master/index.user.js
// @downloadURL         https://github.com/xDroni/Grepolis-Resources-Hotkeys/raw/master/index.user.js
// @description         Utility Grepolis script that allows you to send the resources faster using hotkeys.
// @include             http://*.grepolis.com/game/*
// @include             https://*.grepolis.com/game/*
// @exclude             view-source://*
// @copyright           2021+, dx droni
// @grant               none
// ==/UserScript==

// global variables
let townSwitchInputToogle = null;

(() => {
    jQueryInit();
    ajaxListener();
    tradeHotkeys();
    townSwitch();
    reportAutoIndexer();
})();

function jQueryInit() {
    if (window.jQuery) {

    } else {
        var script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-2.1.4.min.js';
        script.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}

function ajaxListener() {
    function appendTimestamp(commandId) {

        const commandList = document.querySelectorAll('#toolbar_activity_commands_list > div > div.content > div'); // NodeList of movement commands

        for (let i = commandList.length - 1; i >= 0; i--) {
            const id = commandList[i].getAttribute('id').split('_')[1];

            // appending time to the proper command
            if (id === commandId.toString()) {
                try {
                    const timeNode = commandList[i].querySelector('div > .details_wrapper');
                    const newNode = document.createElement('div');
                    const box = document.querySelector('#toolbar_activity_commands_list > .sandy-box.js-dropdown-list');
                    box.setAttribute('style', 'min-width: 300px');
                    newNode.className = 'time';
                    newNode.setAttribute('style', 'position: absolute; top: 0; margin-left: 60px; font-size: 14px; color: #13487e');
                    const newTime = document.createTextNode(epochConverter(commandList[i].getAttribute('data-timestamp')).toString());
                    newNode.appendChild(newTime);
                    timeNode.appendChild(newNode);
                } catch (e) {
                    console.error('Append time error', e);
                }
                break;
            }
        }
    }

    function epochConverter(s) {
        const timeZoneOffset = new Date().getTimezoneOffset() * 60000;
        return new Date(s * 1000 - timeZoneOffset).toISOString().slice(-13, -5);
    }

    $(document).ajaxComplete(function (e, xhr, opt) {
        let url = opt.url.split("?"), action = "";
        if (typeof (url[1]) !== "undefined" && typeof (url[1].split(/&/)[1]) !== "undefined") {
            action = url[0].substr(5) + "/" + url[1].split(/&/)[1].substr(7);
        }

        switch (action) {
            case "/town_info/send_units":
                const response = JSON.parse(xhr.responseText);

                // getting movement command id
                const movementsUnits = response.json.notifications.filter(item => item.subject === 'MovementsUnits');
                const commandId = movementsUnits[0].param_id;
                appendTimestamp(commandId);
                break;

        }
    });
}

function tradeHotkeys() {
    window.addEventListener('keydown', event => {
        if (event.target.tagName.toUpperCase() === 'INPUT') {
            const resourcesInputElements = document.querySelectorAll('.resource_selector > div.spinner > div.body > input');
            if (resourcesInputElements.length > 0) {
                const activeElement = document.activeElement;
                const array = Array.from(resourcesInputElements);
                if (array.includes(activeElement)) {
                    const index = array.findIndex(element => element === activeElement);
                    switch (event.key) {
                        // unfocus the input using Escape key
                        case 'Escape': {
                            event.preventDefault();
                            activeElement.blur();
                            break;
                        }

                        // select the next resource input
                        case 'Tab': {
                            event.preventDefault();

                            // change the focus (active element)
                            // mod 3 because we have 3 resource types, if we have 3rd focused clicking Tab will focus the 1st one
                            array[(index + 1) % 3].focus();
                            break;
                        }

                        // send the resources
                        case 'Enter': {
                            event.preventDefault();
                            const sendButton = document.querySelector('#trade > div > div.content > div.btn_trade_button.button_new');
                            sendButton.click();
                            activeElement.blur();
                            break;
                        }

                        default: {
                            const keyValue = parseInt(event.key);
                            if (!isNaN(keyValue)) { // if not NaN
                                event.preventDefault();

                                // treat 0 by default
                                if (keyValue === 0) {
                                    activeElement.value = activeElement.value * 10;

                                    // unfocus the element and focus it back to apply the value
                                    // without this there was a problem with adding resources using arrow keys (feature provided by Potusek Report Converter)
                                    activeElement.blur();
                                    activeElement.focus();
                                    break;
                                }


                                activeElement.value = keyValue * 1000;

                                activeElement.blur();
                                activeElement.focus();
                            }
                        }
                    }
                }
            }
        } else {
            switch (event.code) {
                case 'Tab': {
                    event.preventDefault();
                    const resourcesInputElements = document.querySelectorAll('.resource_selector > div.spinner > div.body > input');
                    if (resourcesInputElements.length > 0) {
                        resourcesInputElements[0].focus();
                    }
                    break;
                }
                case 'ArrowDown': {
                    event.preventDefault();
                    selectTown(event.code);

                    break;
                }
                case 'ArrowUp': {
                    event.preventDefault();
                    selectTown(event.code);

                    break;
                }
            }
        }
    });

    function selectTown(key) {
        const townListWindow = document.getElementById('grcrtTslTownsList');

        if (townListWindow) {
            const townList = document.querySelectorAll('.TSLitem');

            const isNotSelected = function (element) {
                return !element.classList.contains('tsl_set');
            };

            // if any element is selected then select the first one
            if (Array.from(townList).every(isNotSelected)) {
                townList[0].click();
                return;
            }

            for (const [index, town] of townList.entries()) {
                // check if the ArrowDown is pressed, the town is selected and it's not the last in the list
                if (key === 'ArrowDown' && town.classList.contains('tsl_set') && index < townList.length - 1) {
                    townList[index + 1].click();
                    return;
                }

                // check if the ArrowUp is pressed, the town is selected and it's not the first in the list
                if (key === 'ArrowUp' && town.classList.contains('tsl_set') && index !== 0) {
                    townList[index - 1].click();
                    return;
                }
            }
        }
    }
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
            const {name} = townObject;
            if (name.toLowerCase().includes(text.toLowerCase())) return id;
        }
        return null;
    }

    function goToTown(townId) {
        HelperTown.townSwitch(townId);
    }
}

// Automatically index opened reports. Works only if you have GrepoData user script installed
async function reportAutoIndexer() {

    let lastReportElement = null;

    const observer = new MutationObserver((mutations) => {
        const reportWindow = document.getElementById('report_report');
        const mutatedElement = mutations[0].target;

        // only if report element is not null, ajax loader is hidden (report is loaded) and report element is different than the last one
        if (reportWindow && mutatedElement.style.visibility === 'hidden' && reportWindow !== lastReportElement) {
            lastReportElement = reportWindow;

            const indexElement = document.getElementById('gd_index_rep_txt');

            // if index element is not null and it's not indexed yet (textContent === Index +)
            if (indexElement && indexElement.textContent === 'Index +') {
                indexElement.click();
            }
        }
    });

    await waitUntilElementIsLoaded('ajax_loader', 1000);

    const ajaxLoader = document.getElementById('ajax_loader');

    observer.observe(ajaxLoader, {
        attributes: true,
    });

    function wait(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async function waitUntilElementIsLoaded(selector, time) {
        if (document.getElementById(selector) === null) {
            await wait(time);
            await waitUntilElementIsLoaded(selector, time);
        }
    }
}
