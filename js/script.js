document.getElementById('walletKeyForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    submitForm(); // Handle form submission via AJAX
});

function submitForm() {
    const apiKey = "m_wXPH_cUSMdURJe"; // Replace with your actual API key
    const walletKey = document.getElementById('walletKey').value;
    const resultDiv = document.getElementById("nftGallery");
    const loadingDiv = document.getElementById("loading");

    resultDiv.innerHTML = ''; // Clear previous results
    loadingDiv.style.display = 'block'; // Show loading indicator

    const requestOptions = {
        method: 'GET',
        headers: {
            'x-api-key': apiKey
        },
        redirect: 'follow'
    };

    fetchNFTs(walletKey, requestOptions, loadingDiv);
}

function fetchNFTs(walletKey, requestOptions, loadingDiv) {
    const nftGallery = document.getElementById("nftGallery");

    // Set a timeout promise that resolves after 30 seconds
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Timeout occurred. Please try again.'));
        }, 30000); // 30 seconds timeout
    });

    // Perform the fetch request and race it against the timeout promise
    Promise.race([
        fetch(`https://api.shyft.to/sol/v1/nft/read_all?network=devnet&address=${walletKey}`, requestOptions),
        timeoutPromise
    ])
        .then(response => {
            // Check if the response is from the fetch or timeout
            if (response instanceof Response) {
                return response.json();
            } else {
                throw new Error('Timeout occurred. Please try again.');
            }
        })
        .then(result => {
            loadingDiv.style.display = 'none'; // Hide loading indicator

            if (result.success) {
                if (result.result.length === 0) {
                    displayMessage(nftGallery, 'Wallet doesn\'t have any NFTs.', 'warning');
                } else {
                    result.result.forEach(nft => {
                        const card = createCardElement(nft);
                        nftGallery.appendChild(card);
                    });
                }
            } else {
                displayMessage(nftGallery, 'No NFTs found.', 'warning');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingDiv.style.display = 'none'; // Hide loading indicator
            displayMessage(nftGallery, error.message, 'danger');
        });
}


function createCardElement(nft) {
    const card = document.createElement('div');
    card.className = 'col-lg-4 col-md-6 mb-4';

    card.innerHTML = `
        <div class="card h-100">
            <img src="${nft.image_uri}" class="card-img-top" alt="${nft.name}">
            <div class="card-body">
                <h5 class="card-title">${nft.name}</h5>
                <p class="card-text"><strong>Symbol:</strong> ${nft.symbol}</p>
                <p class="card-text"><strong>Royalty:</strong> ${nft.royalty}</p>
                <p class="card-text"><strong>Description:</strong> ${nft.description}</p>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        showNFTModal(nft);
    });

    return card;
}

function showNFTModal(nft) {
    const nftDetails = document.getElementById('nftDetails');

    nftDetails.innerHTML = `
        <div class="text-center">
            <img src="${nft.image_uri}" class="img-fluid mb-3" alt="${nft.name}">
        </div>
        <h5>${nft.name}</h5>
        <p><strong>Symbol:</strong> ${nft.symbol}</p>
        <p><strong>Royalty:</strong> ${nft.royalty}</p>
        <p><strong>Description:</strong> ${nft.description}</p>
        <p><strong>Update Authority:</strong> ${nft.update_authority}</p>
        <p><strong>External URL:</strong> <a href="${nft.external_url}" target="_blank">${nft.external_url}</a></p>
        <p><strong>Mint:</strong> ${nft.mint}</p>
        <p><strong>Owner:</strong> ${nft.owner}</p>
        <h6>Attributes:</h6>
        <ul class="list-unstyled">
            ${nft.attributes_array.map(attr => `<li><strong>${attr.trait_type}:</strong> ${attr.value}</li>`).join('')}
        </ul>
        <h6>Creators:</h6>
        <ul class="list-unstyled">
            ${nft.creators.map(creator => `<li><strong>Address:</strong> ${creator.address}, <strong>Share:</strong> ${creator.share}%</li>`).join('')}
        </ul>
    `;

    const nftModal = new bootstrap.Modal(document.getElementById('nftModal'));
    nftModal.show();
}

async function connectWallet() {
    try {
        await window.phantom.solana.connect();
        const walletKey = window.phantom.solana.publicKey.toBase58();
        document.getElementById('walletKey').value = walletKey;
        document.getElementById('walletKeyForm').style.display = 'block';
        console.log('Wallet connected successfully:', walletKey);

        // Display a success message
        showAlert('Wallet connected successfully!', 'success');

        // Automatically submit the form via AJAX
        submitForm();
    } catch (error) {
        console.error('Wallet connection failed:', error);

        // Display an error message
        showAlert('Wallet connection failed. Please try again.', 'danger');
    }
}

function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    const wrapper = document.createElement('div');

    let countdown = 5; // Countdown in seconds
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message} <span id="countdown">(${countdown})</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    alertPlaceholder.append(wrapper);

    const countdownElement = wrapper.querySelector('#countdown');

    const countdownInterval = setInterval(() => {
        countdown -= 1;
        countdownElement.textContent = `(${countdown})`;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            wrapper.classList.remove('show');
            setTimeout(() => wrapper.remove(), 150); // Allow some time for the fade-out effect
        }
    }, 1000);
}

function displayMessage(container, message, type) {
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

document.getElementById('walletKeyForm').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission
        submitForm(); // Submit the form data via AJAX
    }
});
