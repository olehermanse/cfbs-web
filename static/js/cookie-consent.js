const cookieConsent = (function () {
    const
        variable = 'cookieconsent_status',
        allowedEvent = new CustomEvent('cookieconsent_allowed'),
        allowStatus = 'allow',
        denyStatus = 'deny',

        removeModal = () => {
            document.querySelector('.cookie-consent').remove();
        },

        allow = () => {
            window.localStorage.setItem(variable, allowStatus);
            document.dispatchEvent(allowedEvent);
            removeModal();
        },

        deny = () => {
            window.localStorage.setItem(variable, denyStatus);
            removeModal();
        },

        isAllowed = () => window.localStorage.getItem(variable) === allowStatus,

        isSet = () => window.localStorage.hasOwnProperty(variable),

        modalHTML = `
            <div class="cookie-consent">
                <div class="cookie-consent-text">
                    We use cookies to analyze our traffic, so we can improve our website and give you a better experience.
                    View our <a target="_blank" href="https://northern.tech/legal/cookies">cookie policy</a>
                </div>
                <div class="cookie-consent-buttons">
                    <a class="btn btn-default" onclick="cookieConsent.deny()" href="javascript:void(0)">
                        Decline
                    </a>
                    <a class="btn btn-primary" onclick="cookieConsent.allow()" href="javascript:void(0)">
                        Allow
                    </a>
                </div>
            </div>`;


    if (isAllowed()) {
        document.dispatchEvent(allowedEvent);
    }

    if (!isSet()) { // if not set then render modal window
        const wrapper = document.createElement("div");
        wrapper.innerHTML = modalHTML;
        document.body.appendChild(wrapper)
    }


    return {
        allow,
        deny,
        isAllowed
    };
}());
