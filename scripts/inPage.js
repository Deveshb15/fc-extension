let observer = new MutationObserver(() => {
    onChange();
});

observer.observe(document, { subtree: true, childList: true });

const getNumberInKMFormat = (num) => {
    // ... existing code ...
};


function extractUsernameFromHover(parentHoverDiv) {
    let hoverDiv = parentHoverDiv.firstChild.firstChild.firstChild.firstChild;
    if (hoverDiv) {
        let username = hoverDiv.lastChild.firstChild.lastChild.innerText;
        return username.startsWith('@') ? username.slice(1) : username; // Assuming the username starts with '@'
    }
    return null;
}

async function onChange() {
    let urlPath = window.location.pathname;
    // Check if the current page is a user profile page by checking the URL path.
    // Assuming profile page URL pattern is "/username"
    let match = urlPath.match(/^\/([^\/]+)(\/.*)?$/);
    if (match) {
        let username = match[1]; // Capture the username part of the URL path
        populateDataOnProfilePage(username);
    }

    let parentHoverDiv = document.querySelector('[data-radix-popper-content-wrapper]');
    if (parentHoverDiv) {
        let username = extractUsernameFromHover(parentHoverDiv);
        if (username) {
            onHoverData(username);
        }
    }


}

async function  onHoverData(username) {
    console.log("URL CHANGED");
    let parentHoverDiv = document.querySelector('[data-radix-popper-content-wrapper]');

    if (parentHoverDiv) {
        let hoverDiv = parentHoverDiv?.firstChild?.firstChild?.firstChild?.firstChild
        if (hoverDiv) {
            let appendParentDiv = hoverDiv?.lastChild

            // Check if our custom header is already added
            if (!appendParentDiv.querySelector('.custom-header')) {

                // let username = hoverDiv?.lastChild?.firstChild?.lastChild?.innerText
                console.log("Username: ", username);

                observer.disconnect(); // Stop observing

                let appendDiv = document.createElement("div");
                appendDiv.classList.add('mt-2', 'flex', 'flex-row', 'gap-2', 'custom-header');
                appendDiv.innerHTML = `<a tabindex="-1"><span class="mr-1 font-semibold text-default">Loading...</span></a>`
                // add after appendParentDiv
                appendParentDiv.insertBefore(appendDiv, appendParentDiv?.lastChild);

                // https://extension-backend-steel.vercel.app/user-data/prberg
                if (username?.length > 0) {
                    try {
                        console.log("Fetching data for: ", username);
                        let response = await fetch(`https://extension-backend-steel.vercel.app/user-data/${username?.slice(1)}`);
                        console.log("Response: ", response);
                        let data = await response.json();
                        console.log("Data: ", data);
                        appendDiv.innerHTML = `<a tabindex="-1"><span class="mr-1 font-semibold text-default">$${getNumberInKMFormat(data?.total_value)}</span><span style="color: ${data?.pnl > 0 ? 'green' : 'red'} " class="mr-1 text-sm ">${data?.pnl?.toFixed(2)}</span> <span class="text-muted text-semibold">Net Worth</span></a><a tabindex="-1"><span class="mr-1 font-semibold text-default">$${getNumberInKMFormat(data?.total_nft_portfolio)}</span><span class="text-muted text-semibold">NFTs</span></a>`

                    } catch (error) {
                        if(appendParentDiv){
                            console.log('inside the target div');
                            // const appendDiv = document.createElement('div');
                            appendDiv.classList.add('custom-user-data');
                            appendDiv.classList.add('mt-2', 'flex', 'flex-row', 'gap-2', 'custom-header');
                            appendDiv.innerHTML = `  <span class="net-worth">Net Worth: $ra anna</span>`;
                            targetDiv.parentNode.insertBefore(appendDiv, targetDiv.nextSibling);
                
                    
                        }
                
                        console.error("Error: ", error);
                    }
                }
                // setTimeout(() => {
                // }, 2000)

                observer.observe(document, { subtree: true, childList: true }); // Start observing again
            }
        }
    }
}

async function populateDataOnProfilePage(username) {
    console.log("Populating profile page for username:", username);

    observer.disconnect(); // Stop observing to avoid recursion due to DOM changes.

    try {

        // Query the DOM for the specified div with the class
        let parentHoverDiv = document.querySelector('[data-radix-popper-content-wrapper]');

        if (parentHoverDiv) {
            let hoverDiv = parentHoverDiv?.firstChild?.firstChild?.firstChild?.firstChild
            let appendParentDiv = hoverDiv?.lastChild
            let appendDiv = document.createElement("div");
            appendDiv.classList.add('mt-2', 'flex', 'flex-row', 'gap-2', 'custom-header');
            appendDiv.innerHTML = `<a tabindex="-1"><span class="mr-1 font-semibold text-default">Loading...</span></a>`
            // add after appendParentDiv
            appendParentDiv.insertBefore(appendDiv, appendParentDiv?.lastChild);
        }
        let response = await fetch(`https://extension-backend-steel.vercel.app/user-data/${username}`);
        let data = await response.json();
        const targetDiv = document.querySelector('.flex.w-full.flex-row.flex-wrap.gap-2');
        if (targetDiv) {

            // Create a new div element to display the fetched data
            const appendDiv = document.createElement('div');
            appendDiv.classList.add('custom-user-data');
            appendDiv.classList.add('mt-2', 'flex', 'flex-row', 'gap-2', 'custom-header');
            appendDiv.innerHTML = `
                <span class="net-worth">Net Worth: $${getNumberInKMFormat(data.total_value)}</span>
                <span class="pnl" style="color: ${data.pnl > 0 ? 'green' : 'red'}">${data.pnl.toFixed(2)}</span>
                <span class="nft-portfolio">NFTs: $${getNumberInKMFormat(data.total_nft_portfolio)}</span>
            `;
            // Insert the new div right after the target div
            targetDiv.parentNode.insertBefore(appendDiv, targetDiv.nextSibling);
        } else {

            console.error('The specified div element not found on the page.');
        }

    } catch (error) {
        const targetDiv = document.querySelector('.flex.w-full.flex-row.flex-wrap.gap-2');
        if(targetDiv){
            console.log('inside the target div');
            const appendDiv = document.createElement('div');
            appendDiv.classList.add('custom-user-data');
            appendDiv.classList.add('mt-2', 'flex', 'flex-row', 'gap-2', 'custom-header');
            appendDiv.innerHTML = `  <span class="net-worth">Net Worth: $ra anna</span>`;
            targetDiv.parentNode.insertBefore(appendDiv, targetDiv.nextSibling);

    
        }
        console.error("Error fetching profile data:", error);
    }

    observer.observe(document, { subtree: true, childList: true }); // Start observing again
}

onChange(); // Call onChange initially to handle cases when the extension is activated while already on a profile page
