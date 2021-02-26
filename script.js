const url = 'https://coingecko.com/api/documentations/v3';
const allCoinsUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cvenus%2Cswipe%2Cusd-coin%2Ctether%2Cbinance-usd%2Cethereum%2Clitecoin%2Cripple%2Cbitcoin-cash%2Cpolkadot%2Cchainlink%2Cdai%2Cfilecoin%2Cbinancecoin%2Cbinance-eth%2Ccardano%2Cvai&vs_currencies=usd';

// Fetches the API prices
async function getData() {
    try {
        const response = await fetch(allCoinsUrl);
        if (response.ok) {
            const jsonResponse = await response.json();
            return jsonResponse;
        }
        throw new Error('Request failed!');
    } catch (err) {
        console.log(err);
    }
}

// Returns the price of the given coin
async function getCoinPrice(coin) {
    const jsonObject = await getData();
    return jsonObject[coin].usd;
}

// Gives all coins their current price when page loads
const startingCoinPrices = coinAPI => {
    coinAPI
        .then(prices => {
            for (const coin in prices) {
                const priceHtmlForSupplyCoins = document.getElementById('supply-side').querySelector(`.${coin}price`);
                const priceHtmlForBorrowCoins = document.getElementById('borrow-side').querySelector(`.${coin}price`);
                priceHtmlForSupplyCoins.innerHTML = '$' + prices[coin].usd.toLocaleString('en');
                priceHtmlForBorrowCoins.innerHTML = '$' + prices[coin].usd.toLocaleString('en');
            }
        });
}
startingCoinPrices(getData());

// Calculates & changes the HTML for Total & Current Price of Supply and Borrow Sides
const calculateTotalForSupplyBorrow = (e, side) => {
    getCoinPrice(e.target.className)
        .then(value => { // Returns API Price
            total = value * e.target.value;
            totalAmount = e.target.className + 'total';
            currentPrice = value;
            currentPriceShown = e.target.className + 'price';
            
            if (side === 'supply') {
                const supplySideTotal = document.getElementById('supply-side').querySelector('.' + totalAmount);
                const supplySideCurrentPrice = document.getElementById('supply-side').querySelector('.' + currentPriceShown);
                supplySideTotal.innerHTML = 'Total: $'+ total.toLocaleString('en');
                supplySideCurrentPrice.innerHTML = '$' + currentPrice.toLocaleString('en');
            
            } else if (side === 'borrow') {
                const borrowSideTotal = document.getElementById('borrow-side').querySelector('.' + totalAmount);
                const borrowSideCurrentPrice = document.getElementById('borrow-side').querySelector('.' + currentPriceShown);
                borrowSideTotal.innerHTML = 'Total: $'+ total.toLocaleString('en');
                borrowSideCurrentPrice.innerHTML = '$' + currentPrice.toLocaleString('en');
            }
            totalSupply(side);
        });
}

// Gets input value of all inputs on Supply side
const supplySide = document.getElementById('supply-side').getElementsByTagName("input");
for (let i = 0; i < supplySide.length; i++) {
    supplySide[i].onchange = e => calculateTotalForSupplyBorrow(e, 'supply'); 
}

// Gets input value of all inputs on Borrow Side
const borrowSide = document.getElementById('borrow-side').getElementsByTagName("input");
for (let i = 0; i < borrowSide.length; i++) {
    borrowSide[i].onchange = e => calculateTotalForSupplyBorrow(e, 'borrow');
}

// Calculates the total Supply & Borrow Balance
const totalSupply = side => {
    let supplyTotal = 0;
    let borrowTotal = 0;
    
    if (side === 'supply') {
        total = getData()
            .then(json => {
                for (let i = 0; i < supplySide.length; i++) {
                    for (const coin in json) {
                        if (supplySide[i].className == coin) {
                            supplyTotal += supplySide[i].value * json[coin].usd;
                        }
                    }
                }
                document.getElementById('total-supply').innerHTML = '$' + supplyTotal.toLocaleString('en');
                calculateAvailableCredit(supplyTotal);
                calcPercentageUsedOfAvailableCredit();
            });
    
    } else if (side === 'borrow') {
        total = getData()
            .then(json => {
                for (let i = 0; i < borrowSide.length; i++) {
                    for (const coin in json) {
                        if (borrowSide[i].className == coin) {
                            borrowTotal += borrowSide[i].value * json[coin].usd;
                        }
                    }
                }
                document.getElementById('total-borrow').innerHTML = '$' + borrowTotal.toLocaleString('en');
                calcPercentageUsedOfAvailableCredit();
            });
    }
    return borrowTotal;
};


// Calculates Total Available Credit
const calculateAvailableCredit = supplyTotal => {
    const creditAvailable = document.getElementById('available-credit');
    creditAvailable.innerHTML = '$' + (supplyTotal * 0.6).toLocaleString('en');
};

// Calculates the Percentage used of Total Available Credit
function calcPercentageUsedOfAvailableCredit() {
    const amountUsedOfCredit = document.getElementById('amount-used-ac'); // Percentage Amount
    let creditAvailable = document.getElementById('available-credit'); // Total Credit Available Number
    let borrowTotal = document.getElementById('total-borrow');
    creditAvailable = parseFloat(creditAvailable.innerHTML.replace('$','').replace(',','')); // Takes Available Credit amount & converts to a float
    borrowTotal = parseFloat(borrowTotal.innerHTML.replace('$','').replace(',',''));// Turns Borrow Balance to a float
    
    const amountUsedTotal = (borrowTotal / creditAvailable) * 100;

    if (borrowTotal != 0 && creditAvailable > borrowTotal) {
        amountUsedOfCredit.innerHTML = amountUsedTotal + '%';
    } else {
        // Make borrow balance red and say "Borrow Balance can NOT exceed available credit!"
        // Remove Available Credit & it's percentage
    }
    calcLiquidationEventAmount(borrowTotal, amountUsedTotal);
}

const calcLiquidationEventAmount = (borrowTotal,amountUsedOfAvailableCredit) => {
    let liquidEvent = document.getElementById('liquid-event');
    liquidEvent.innerHTML = '$' + (borrowTotal / 0.6).toLocaleString('en');

    let liquidPercentage = document.getElementById('liquid-percent');
    liquidPercentage.innerHTML = 1 - amountUsedOfAvailableCredit;

    calcAssetLiquidationPrice(amountUsedOfAvailableCredit);
};

const calcAssetLiquidationPrice = amountUsedOfAvailableCredit => {
    const assetLiquid = document.getElementById('asset-liquid').querySelectorAll('.liquid-coin-price');
    getData()
        .then(prices => {
            console.log(prices);
            for (let i = 0; i < assetLiquid.length; i++) {
                for (const coin in prices) {
                    console.log(assetLiquid[i].className);
                    if (assetLiquid[i].className.includes(coin)) {
                        console.group(assetLiquid[i], coin);
                        assetLiquid[i].innerHTML = amountUsedOfAvailableCredit * prices[coin].usd;
                    }
                    // Still have to figure out that if the number is 0 on either side then it won't show a number
                }
            }
        });
}
