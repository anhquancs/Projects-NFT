// script.js

document.getElementById('walletKeyForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    var apiKey = "m_wXPH_cUSMdURJe"; // Replace with your actual API key
    var walletKey = document.getElementById('walletKey').value;
    var resultDiv = document.getElementById("nftGallery");
    
    var loadingDiv = document.getElementById("loading");

    resultDiv.innerHTML = ''; // Clear previous results
    loadingDiv.style.display = 'block'; // Show loading indicator

    var myHeaders = new Headers();
    myHeaders.append("x-api-key", apiKey);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetchNFTs(walletKey, requestOptions, loadingDiv); // Pass loadingDiv as parameter
});

// Function to fetch NFTs based on wallet key and display them
function fetchNFTs(walletKey, requestOptions, loadingDiv) {
    var nftGallery = document.getElementById("nftGallery"); // Added for clarity, assuming it's defined globally or elsewhere

    fetch(`https://api.shyft.to/sol/v1/nft/read_all?network=devnet&address=${walletKey}`, requestOptions)
        .then(response => response.json()) // Parse the JSON response
        .then(result => {
            console.log(result);
            loadingDiv.style.display = 'none'; // Hide loading indicator

            if (result.success) {
                if (result.result.length === 0) {
                    nftGallery.innerHTML = '<div class="alert alert-warning">Wallet doesn\'t have any NFTs.</div>';
                } else {
                    result.result.forEach(nft => {
                        const card = createCardElement(nft);
                        nftGallery.appendChild(card);
                    });
                }
            } else {
                nftGallery.innerHTML = '<div class="alert alert-warning">No NFTs found.</div>';
            }
        })
        .catch(error => {
            console.log('error', error);
            loadingDiv.style.display = 'none'; // Hide loading indicator
            nftGallery.innerHTML = '<div class="alert alert-danger">An error occurred while fetching the data. Please try again.</div>';
        });
}


// Function to create a card element for displaying an NFT
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

    // Add click event listener to show modal with NFT details
    card.addEventListener('click', () => {
        showNFTModal(nft);
    });

    return card;
}

// Function to show the modal with NFT details
function showNFTModal(nft) {
    const nftDetails = document.getElementById('nftDetails');

    // Populate modal with NFT details
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

    // Show the modal
    const nftModal = new bootstrap.Modal(document.getElementById('nftModal'));
    nftModal.show();
}



