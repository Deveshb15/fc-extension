let observer = new MutationObserver(() => {
    onChange();
});

observer.observe(document, { subtree: true, childList: true });

const getNumberInKMFormat = (num) => {
    if (num > 999 && num < 1000000) {
        return (num / 1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million
    } else if (num > 1000000) {
        return (num / 1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million
    } else if (num < 900) {
        return num?.toFixed(1); // if value < 1000, nothing to do
    }
}


function extractUsernameFromHover(parentHoverDiv) {
    let hoverDiv = parentHoverDiv?.firstChild?.firstChild?.firstChild?.firstChild;
    if (hoverDiv) {
        let username = hoverDiv?.lastChild?.firstChild?.lastChild?.innerText;
        return username.startsWith('@') ? username.slice(1) : username; // Assuming the username starts with '@'
    }
    return null;
}

async function onChange() {
    let urlPath = window.location.pathname;
    // Check if the current page is a user profile page by checking the URL path.
    // Assuming profile page URL pattern is "/username"
    let match = urlPath.match(/^\/([^\/]+)(\/.*)?$/);

    // run everytime the urlPath changes

    if (match) {
        let username = match[1]; // Capture the username part of the URL path
        console.log("USER NAME", username)
        setTimeout(() => {
            populateDataOnProfilePage(username);
        }, 2000);
    }

    let parentHoverDiv = document.querySelector('[data-radix-popper-content-wrapper]');
    if (parentHoverDiv) {
        let username = extractUsernameFromHover(parentHoverDiv);
        if (username) {
            onHoverData(username);
        }
    }
}

function truncateString(str) {
    // Check if the string length exceeds the maxLength
    if (str.length > 15) {
       return `${str.substring(0, 15)}...`;
    }
    // If the string is not longer than maxLength, return it as is
    return str;
   }

  
async function onHoverData(username) {
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
                        let response = await fetch(`https://extension-backend-steel.vercel.app/user-data/${username}`);
                        console.log("Response: ", response);
                        let data = await response.json();
                        console.log("Data: ", data);
                        if (data?.error) {
                            appendDiv.innerHTML = ''
                        }
                        if (data?.total_value !== undefined && data?.total_nft_portfolio !== undefined && data?.pnl !== undefined) {
                            appendDiv.innerHTML = `<a tabindex="-1"><span class="mr-1 font-semibold text-default">$${getNumberInKMFormat(data?.total_value)}</span><span style="color: ${data?.pnl > 0 ? 'green' : 'red'} " class="mr-1 text-sm ">${data?.pnl?.toFixed(2)}</span> <span class="text-muted text-semibold">Tokens</span></a><a tabindex="-1"><span class="mr-1 font-semibold text-default">$${getNumberInKMFormat(data?.total_nft_portfolio)}</span><span class="text-muted text-semibold">NFTs</span></a>`
                        }

                    } catch (error) {
                        if (appendParentDiv) {
                            console.log('inside the target div');
                            // const appendDiv = document.createElement('div');
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

        function trimAddress(address, startLength = 3, endLength = 3) {
            return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
        }

        const targetDiv = document.querySelector('.flex.w-full.flex-row.flex-wrap.gap-2');
        if (targetDiv) {

            let last_username = localStorage.getItem('username');
            console.log("Last Username: ", last_username);
            if (last_username !== username) {
                if(targetDiv?.nextElementSibling?.classList?.contains(`custom-header-${last_username}`)){
                    targetDiv?.nextElementSibling?.remove();
                }
            }

            if (!targetDiv?.nextElementSibling?.classList?.contains(`custom-header-${username}`)) {
                let appendDiv = document.createElement("div");
                appendDiv.classList.add('mt-2', 'flex', 'flex-row', 'gap-2', `custom-header-${username}`, 'custom-header');
                appendDiv.style.marginBottom = '100px'; // Add a margin-bottom of 50px
                appendDiv.innerHTML = `<a tabindex="-1"><span class="mr-1 font-semibold text-default">Loading...</span></a>`
                // add after appendParentDiv
                targetDiv?.parentNode?.insertBefore(appendDiv, targetDiv?.nextSibling);

                let response = await fetch(`https://extension-backend-steel.vercel.app/user-data/${username}`);
                console.log("Response: ", response);
                let data = await response.json();
                console.log("Data: ", data);
                if (data?.error) {
                    console.log('inside data error')
                    appendDiv.innerHTML = '';
                    appendDiv.style.marginBottom = ''; // Add a margin-bottom of 50px
                    return;
                }
                let address = data?.eth_addresses[0]
                let shortAddress;
                if (address) {
                    shortAddress = trimAddress(address)
                }
                async function copyAddressToClipboard(address) {
                    try {
                        console.log('copying address');
                        await navigator.clipboard.writeText(address);
                        // Optional: Display a message or trigger some action to indicate success.
                    } catch (err) {
                        console.error('Failed to copy text to clipboard', err);
                        // Optional: Display an error message or trigger some action to indicate failure.
                    }
                }

                // Create a new div element to display the fetched data
                if (data?.total_value !== undefined && data?.total_nft_portfolio !== undefined && data?.pnl !== undefined) {
                    console.log("Data: ", data);
                    appendDiv.innerHTML = `
                    <div style="width: 510px; height: 82px; position: absolute; display: flex; flex-direction: row; justify-content: space-evenly; align-items: center; margin-bottom:20px; gap: 0px; border-radius: 15px; opacity: 1; background-color: #281B37;">
                        <div style="display: flex; flex-direction: column; cursor: pointer;" onclick="(${copyAddressToClipboard(address)})">
                        <span style="display: flex; flex-direction: row;">${shortAddress}   <svg width="16" height="16" viewBox="0 0 24 24" style="fill: #86949F; margin-left: 8px;" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19,21H9a2,2,0,0,1-2-2V7H5A2,2,0,0,0,3,9V19a4,4,0,0,0,4,4H17a2,2,0,0,0,2-2V17h2v2A2,2,0,0,1,19,21Z"/>
                        <path d="M21,5H11A2,2,0,0,0,9,7V17a2,2,0,0,0,2,2h10a2,2,0,0,0,2-2V7A2,2,0,0,0,21,5Zm-1,5H12V8h8Z"/>
                    </svg> </span>
                        <span style="color:#86949F">Address</span>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span> $${getNumberInKMFormat(data.total_value)}</span>
                            <span style="color:#86949F">Tokens</span>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span>$${getNumberInKMFormat(data.total_nft_portfolio)}</span>
                            <span style="color:#86949F">NFTs</span>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <div style="display:flex;">
                            <img src="${data.top_5_channels[0].image_url}" style="height: 18px; width: 18px; border-radius: 50%; margin-right:3px;" alt="Image description 1">
                            <span style="margin-right:8px;">/${data.top_5_channels[0].name.length> 15 ? truncateString(data.top_5_channels[0].name): data.top_5_channels[0].name}</span>
                            <img src="${data.top_5_channels[1].image_url}" style="height: 18px; width: 18px; border-radius: 50%; margin-right:3px;" alt="Image description 2">
                            <span style="margin-right:8px;">/${data.top_5_channels[1].name.length> 15 ? truncateString(data.top_5_channels[1].name): data.top_5_channels[1].name}</span>
                            </div>
                            <span style="color:#86949F">Active Channels</span>
                        </div>
                        </div>

                    
                    `;

                }
                // Insert the new div right after the target div
                targetDiv?.parentNode?.insertBefore(appendDiv, targetDiv?.nextSibling);
                localStorage.setItem('username', username);
            }
        } else {
            console.error('The specified div element not found on the page.');
        }

    } catch (error) {
        console.error("Error fetching profile data:", error);
    }

    observer.observe(document, { subtree: true, childList: true }); // Start observing again
}

onChange(); // Call onChange initially to handle cases when the extension is activated while already on a profile page
