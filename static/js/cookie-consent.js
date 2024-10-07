const cookieConsent = (function () {
    const variable = 'cookieconsent_status';
    const allowedEvent = new CustomEvent('cookieconsent_allowed');
    const allowStatus = 'allow';
    const denyStatus = 'deny';

    const removeModal = () => {
        document.querySelector('.cookie-consent').remove();
    };
    const allow = () => {
        window.localStorage.setItem(variable, allowStatus);
        document.dispatchEvent(allowedEvent);
        removeModal();
    };

    const deny = () => {
        window.localStorage.setItem(variable, denyStatus);
        removeModal();
    };

    const isAllowed = () => window.localStorage.getItem(variable) === allowStatus;

    const isSet = () => window.localStorage.hasOwnProperty(variable);

    const modalHTML = `
            <div class="cookie-consent">
                <div class="cookie-consent-text">
                    We use cookies to analyze our traffic, so we can improve our website and give you a better experience.
                    View our <a target="_blank" href="https://northern.tech/legal/cookies">cookie policy</a>
                </div>
                <div class="cookie-consent-buttons">
                    <button class="btn btn-default" id="cookie-decline">
                        Decline
                    </button>
                    <button class="btn btn-primary" id="cookie-allow">
                        Allow
                    </button>
                </div>
            </div>`;


    if (isAllowed()) {
        document.dispatchEvent(allowedEvent);
    }

    if (!isSet()) { // if not set then render modal window
        const wrapper = document.createElement("div");
        wrapper.innerHTML = modalHTML;
        document.body.appendChild(wrapper)
        document.getElementById('cookie-decline').addEventListener('click', deny);
        document.getElementById('cookie-allow').addEventListener('click', allow);
    }


    return {
        allow,
        deny,
        isAllowed
    };
}());
