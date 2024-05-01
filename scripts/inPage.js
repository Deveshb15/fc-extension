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

async function onChange() {
    console.log("URL CHANGED");
    let parentHoverDiv = document.querySelector('[data-radix-popper-content-wrapper]');

    if (parentHoverDiv) {
        let hoverDiv = parentHoverDiv?.firstChild?.firstChild?.firstChild?.firstChild
        if (hoverDiv) {
            let appendParentDiv = hoverDiv?.lastChild

            // Check if our custom header is already added
            if (!appendParentDiv.querySelector('.custom-header')) {

                let username = hoverDiv?.lastChild?.firstChild?.lastChild?.innerText
                console.log("Username: ", username);

                observer.disconnect(); // Stop observing

                let appendDiv = document.createElement("div");
                appendDiv.classList.add('mt-2', 'flex', 'flex-row', 'gap-2', 'custom-header');
                appendDiv.innerHTML = `<a tabindex="-1"><span class="mr-1 font-semibold text-default">Loading...</span></a>`
                // add after appendParentDiv
                // parentAppendDiv.insertBefore(appendDiv, );
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