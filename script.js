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
                result.result.forEach(nft => {
                    const card = createCardElement(nft);
                    nftGallery.appendChild(card);
                });
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

    return card;
}

// Room selection event handling
document.querySelectorAll('.room-selector').forEach(item => {
    item.addEventListener('click', event => {
        var room = event.target.getAttribute('data-room');
        nftGallery.className = ''; // Clear existing classes
        nftGallery.classList.add('row', room); // Add selected room class to nftGallery
    });
});
