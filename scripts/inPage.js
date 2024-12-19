let observer = new MutationObserver(() => {
    onChange();
});

observer.observe(document, { subtree: true, childList: true });

// let currentUrl = window.location.href;

// // Function to check if the URL has changed
// function checkUrlChange() {
//     const newUrl = window.location.href;
//     if (currentUrl!== newUrl) {
//         console.log('Checking URL change');

//         currentUrl = newUrl;
//         onChange(); // Call your function when the URL changes
//     }
// }

// // Use setInterval to periodically check for URL changes
// const intervalId = setInterval(checkUrlChange, 500); // Check every 500 milliseconds

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
    if (str.length > 10) {
       return `${str.substring(0, 10)}...`;
    }
    // If the string is not longer than maxLength, return it as is
    return str;
   }

  
async function onHoverData(username) {
    let parentHoverDiv = document.querySelector('[data-radix-popper-content-wrapper]');

    if (parentHoverDiv) {
        let hoverDiv = parentHoverDiv?.firstChild?.firstChild?.firstChild?.firstChild
        if (hoverDiv) {
            let appendParentDiv = hoverDiv?.lastChild

            // Check if our custom header is already added
            if (!appendParentDiv.querySelector('.custom-header')) {

                // let username = hoverDiv?.lastChild?.firstChild?.lastChild?.innerText

                observer.disconnect(); // Stop observing

                let appendDiv = document.createElement("div");
                appendDiv.classList.add('mt-2', 'flex', 'flex-row', 'gap-2', 'custom-header');
                appendDiv.innerHTML = `<a tabindex="-1"><span class="mr-1 font-semibold text-default">Loading...</span></a>`
                // add after appendParentDiv
                appendParentDiv.insertBefore(appendDiv, appendParentDiv?.lastChild);

                // https://extension-backend-steel.vercel.app/user-data/prberg
                if (username?.length > 0) {
                    try {
                        let response = await fetch(`https://extension-backend-steel.vercel.app/user-data/${username}`);
                        let data = await response.json();
                        if (data?.error) {
                            appendDiv.innerHTML = ''
                        }
                        if (data?.total_value !== undefined && data?.total_nft_portfolio !== undefined && data?.pnl !== undefined) {
                            appendDiv.innerHTML = `<a tabindex="-1"><span class="mr-1 font-semibold text-default">$${getNumberInKMFormat(data?.total_value)}</span><span style="color: ${data?.pnl > 0 ? 'green' : 'red'} " class="mr-1 text-sm ">${data?.pnl?.toFixed(2)}</span> <span class="text-muted text-semibold">Tokens</span></a><a tabindex="-1"><span class="mr-1 font-semibold text-default">$${getNumberInKMFormat(data?.total_nft_portfolio)}</span><span class="text-muted text-semibold">NFTs</span></a>`
                        }

                    } catch (error) {
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

// First, let's modify the copyAddressToClipboard function to be available in the global scope
// Add this near the top of the file, with the other function declarations
function copyAddressToClipboard(address) {
    try {
        navigator.clipboard.writeText(address);
        // Optional: You could add a visual feedback here
        console.log('Address copied successfully');
    } catch (err) {
        console.error('Failed to copy text to clipboard', err);
    }
}

// Add this function near the top of the file with other utility functions
function showToast(message, duration = 2000) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.copy-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    
    // Style the toast - modified for top positioning
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',  // Changed from bottom to top
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#281B37',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease-in-out',
        fontSize: '14px',
        opacity: '0',
        transform: 'translate(-50%, -20px)'  // Start slightly higher
    });

    // Add to document
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';  // Slide down to final position
    }, 50);

    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -20px)';  // Slide up when disappearing
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

async function populateDataOnProfilePage(username) {
    observer.disconnect(); // Stop observing to avoid recursion due to DOM changes.

    try {

        function trimAddress(address, startLength = 3, endLength = 3) {
            return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
        }

        const targetDiv = document.querySelector('.flex.w-full.flex-row.flex-wrap.gap-2');
        if (targetDiv) {

            let last_username = localStorage.getItem('username');
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
                // console.log("Response: ", response);
                let data = await response.json();
                // console.log("Data: ", data);
                if (data?.error) {
                    appendDiv.innerHTML = '';
                    appendDiv.style.marginBottom = ''; // Add a margin-bottom of 50px
                    return;
                }
                let address = data?.eth_addresses[0]
                let shortAddress;
                if (address) {
                    shortAddress = trimAddress(address)
                }

                // Create a new div element to display the fetched data
                if (data?.total_value !== undefined && data?.total_nft_portfolio !== undefined && data?.pnl !== undefined) {
                    appendDiv.innerHTML = `
                    <div style="width: 510px; height: 82px; position: absolute; display: flex; flex-direction: row; justify-content: space-evenly; align-items: center; margin-bottom:20px; gap: 0px; border-radius: 15px; opacity: 1; background-color: #281B37;">
                        <div class="address-copy" style="display: flex; flex-direction: column; cursor: pointer;">
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
                            <span style="margin-right:8px;">/${data.top_5_channels[0].id ? data.top_5_channels[0].id : data.top_5_channels[0].name.length> 10 ? truncateString(data.top_5_channels[0].name): data.top_5_channels[0].name}</span>
                            <img src="${data.top_5_channels[1].image_url}" style="height: 18px; width: 18px; border-radius: 50%; margin-right:3px;" alt="Image description 2">
                            <span style="margin-right:8px;">/${data.top_5_channels[1].id ? data.top_5_channels[1].id :data.top_5_channels[1].name.length> 10 ? truncateString(data.top_5_channels[1].name): data.top_5_channels[1].name}</span>
                            </div>
                            <span style="color:#86949F">Active Channels</span>
                        </div>
                        </div>

                    
                    `;

                    // Add click handler after setting innerHTML
                    const copyButton = appendDiv.querySelector('.address-copy');
                    copyButton.addEventListener('click', () => {
                        if (address) {
                            navigator.clipboard.writeText(address)
                                .then(() => {
                                    showToast('Address copied to clipboard! 📋');
                                })
                                .catch(err => {
                                    console.error('Failed to copy text to clipboard', err);
                                    showToast('Failed to copy address 😢');
                                });
                        }
                    });
                }
                // Insert the new div right after the target div
                targetDiv?.parentNode?.insertBefore(appendDiv, targetDiv?.nextSibling);
                localStorage.setItem('username', username);
            }
        } else {
            console.error('The specified div element not found on the page.');
        }

    } catch (error) {
        console.log(error.message)
        console.error("Error fetching profile data:", error);
    }

    observer.observe(document, { subtree: true, childList: true }); // Start observing again
}

onChange(); // Call onChange initially to handle cases when the extension is activated while already on a profile page
