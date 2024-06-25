let gaInitialized = false;
document.addEventListener('cookieconsent_allowed', () => {
    console.log('allowed');
    if (gaInitialized === true) return;
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-TW89K2P8L4';
    document.head.appendChild(script);
    script.addEventListener('load', function () {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-TW89K2P8L4');
        gaInitialized = true;
    });
});
