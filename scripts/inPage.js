let observer = new MutationObserver(() => {
    onChange();
});

observer.observe(document, { subtree: true, childList: true });

function onChange() {
    console.log("URL CHANGED");
    let parentHoverDiv = document.querySelector('[data-radix-popper-content-wrapper]');

    if (parentHoverDiv) {
        let hoverDiv = parentHoverDiv?.firstChild?.firstChild?.firstChild?.firstChild
        if (hoverDiv) {
            // let parentAppendDiv = hoverDiv?.lastChild?.lastChild?.previousElementSibling?.previousElementSibling
            let parentAppendDiv = hoverDiv?.lastChild?.firstChild?.nextSibling
            // Check if our custom header is already added
            if (!parentAppendDiv.querySelector('.custom-header')) {

                let name = hoverDiv?.lastChild?.firstChild?.firstChild?.innerText
                let username = hoverDiv?.lastChild?.firstChild?.lastChild?.innerText
                console.log("Username: ", username);
                observer.disconnect(); // Stop observing
                
                let test = document.createElement("div");
                test.innerHTML = `<h1 class="custom-header text-extrabold text-lg">Test ext - ${username}</h1>`; // give it a class so we can identify it later
                let testDiv = document.createElement("div");
                testDiv.appendChild(test);

                // <div><a class="relative truncate text-base font-semibold text-default hover:underline" title="Joe Blau 🎩" href="/joeblau" tabindex="-1">Joe Blau 🎩</a><div class="flex flex-row items-baseline space-x-2"><a class="relative text-muted hover:underline" title="Joe Blau 🎩" href="/joeblau" tabindex="-1">@joeblau</a></div></div>

                
                parentAppendDiv.appendChild(testDiv);
                
                observer.observe(document, { subtree: true, childList: true }); // Start observing again
            }   
        }
    }
}