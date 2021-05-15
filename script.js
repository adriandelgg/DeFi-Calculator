const url = 'https://coingecko.com/api/documentations/v3';
const allCoinsUrl =
	'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cvenus%2Cswipe%2Cusd-coin%2Ctether%2Cbinance-usd%2Cethereum%2Clitecoin%2Cripple%2Cbitcoin-cash%2Cpolkadot%2Cchainlink%2Cdai%2Cfilecoin%2Cbinancecoin%2Cbinance-eth%2Ccardano%2Cvai&vs_currencies=usd';

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
	coinAPI.then(prices => {
		for (const coin in prices) {
			const priceHtmlForSupplyCoins = document
				.getElementById('supply-side')
				.querySelector(`.${coin}price`);
			const priceHtmlForBorrowCoins = document
				.getElementById('borrow-side')
				.querySelector(`.${coin}price`);
			priceHtmlForSupplyCoins.innerHTML =
				'$' + prices[coin].usd.toLocaleString('en');
			priceHtmlForBorrowCoins.innerHTML =
				'$' + prices[coin].usd.toLocaleString('en');
		}
	});
};
startingCoinPrices(getData());

// Calculates & changes the HTML for Total & Current Price of Supply and Borrow Sides
const calculateTotalForSupplyBorrow = (event, side) => {
	startingCoinPrices(getData());
	getCoinPrice(event.target.className).then(value => {
		// Returns API Price
		total = value * event.target.value; // Multiplies the input value by the coin price
		totalAmount = event.target.className + 'total';
		currentPrice = value;
		currentPriceShown = event.target.className + 'price';

		if (side === 'supply') {
			const supplySideTotal = document
				.getElementById('supply-side')
				.querySelector('.' + totalAmount);
			const supplySideCurrentPrice = document
				.getElementById('supply-side')
				.querySelector('.' + currentPriceShown);
			supplySideTotal.innerHTML = 'Total: $' + total.toLocaleString('en');
			supplySideCurrentPrice.innerHTML =
				'$' + currentPrice.toLocaleString('en');
		} else if (side === 'borrow') {
			const borrowSideTotal = document
				.getElementById('borrow-side')
				.querySelector('.' + totalAmount);
			const borrowSideCurrentPrice = document
				.getElementById('borrow-side')
				.querySelector('.' + currentPriceShown);
			borrowSideTotal.innerHTML = 'Total: $' + total.toLocaleString('en');
			borrowSideCurrentPrice.innerHTML =
				'$' + currentPrice.toLocaleString('en');
		}
		totalSupplyBorrow();
	});
};

// Gets input value of all inputs on Supply side
const supplySide = document
	.getElementById('supply-side')
	.getElementsByTagName('input');
for (let i = 0; i < supplySide.length; i++) {
	supplySide[i].onchange = event =>
		calculateTotalForSupplyBorrow(event, 'supply');
}

// Gets input value of all inputs on Borrow Side
const borrowSide = document
	.getElementById('borrow-side')
	.getElementsByTagName('input');
for (let i = 0; i < borrowSide.length; i++) {
	borrowSide[i].onchange = event =>
		setInterval(calculateTotalForSupplyBorrow(event, 'borrow'), 10000);
}

// Calculates the total Supply & Borrow Balance
const totalSupplyBorrow = () => {
	let supplyTotal = 0;
	let borrowTotal = 0;

	total = getData().then(json => {
		for (let i = 0; i < supplySide.length; i++) {
			for (const coin in json) {
				if (supplySide[i].className == coin) {
					supplyTotal += supplySide[i].value * json[coin].usd;
				}
				if (borrowSide[i].className == coin) {
					borrowTotal += borrowSide[i].value * json[coin].usd;
				}
			}
		}
		document.getElementById('total-supply').innerHTML =
			'$' + (Math.round(supplyTotal * 100) / 100).toLocaleString('en');
		document.getElementById('total-borrow').innerHTML =
			'$' + (Math.round(borrowTotal * 100) / 100).toLocaleString('en');

		calcPercentageUsedOfAvailableCredit(borrowTotal, supplyTotal);
	});
};

// Calculates the Percentage used of Total Available Credit
function calcPercentageUsedOfAvailableCredit(borrowTotal, supplyTotal) {
	const creditAvailable = document.getElementById('available-credit');
	creditAvailable.innerHTML =
		'$' + (Math.round(supplyTotal * 0.6 * 100) / 100).toLocaleString('en');
	const availableCredit = supplyTotal * 0.6;
	const amountUsedOfCredit = document.getElementById('amount-used-ac'); // Percentage Amount

	if (borrowTotal !== 0 && supplyTotal !== 0) {
		// Checks to make sure 0 / 0 is NOT NaN

		const amountUsedTotalRounded =
			Math.round((borrowTotal / availableCredit) * 100 * 1000) / 1000; // Amount Used of Available Credit in %
		const amountUsedTotal = borrowTotal / availableCredit;

		// Adds AC % and reverts back to default if else error below was triggered
		if (borrowTotal != 0 && availableCredit > borrowTotal) {
			amountUsedOfCredit.innerHTML = amountUsedTotalRounded + '%';

			borrowBalanceExceedsAvailableCreditError(1);

			// Creates a visual error to let user know Borrow Balance CAN'T exceed Available Credit
		} else {
			borrowBalanceExceedsAvailableCreditError(2);
		}
		calcLiquidationEventAmount(borrowTotal, amountUsedTotal, supplyTotal);
	}
}

// Calculates Liquidation Event & Liquidation percentage amounts
const calcLiquidationEventAmount = (
	borrowTotal,
	amountUsedOfAvailableCredit,
	supplyTotal
) => {
	let liquidEvent = document.getElementById('liquid-event');
	liquidEvent.innerHTML =
		'$' + (Math.round((borrowTotal / 0.6) * 100) / 100).toLocaleString('en'); // Calculates Liquid Event

	let liquidPercentage = document.getElementById('liquid-percent');
	liquidPercentage.innerHTML =
		Math.round((1 - amountUsedOfAvailableCredit) * 100 * 1000) / 1000 + '%'; // Calculates Liquid Percentage

	const liquidInDollar = document.getElementById('other-liquid');
	let liquidPercentTotal = 1 - amountUsedOfAvailableCredit;
	liquidInDollar.innerHTML = (
		Math.round(supplyTotal * liquidPercentTotal * 100) / 100
	).toLocaleString('en');

	calcPerCoinLiquidationPrice(amountUsedOfAvailableCredit);
};

//Calculates the Liquidation price per Coin
const calcPerCoinLiquidationPrice = amountUsedOfAvailableCredit => {
	const assetLiquid = document
		.getElementById('asset-liquid')
		.querySelectorAll('.liquid-coin-price');
	getData().then(prices => {
		for (let i = 0; i < assetLiquid.length; i++) {
			for (const coin in prices) {
				if (assetLiquid[i].className.includes(coin)) {
					assetLiquid[i].innerHTML =
						'$' +
						(
							Math.round(
								amountUsedOfAvailableCredit * prices[coin].usd * 100
							) / 100
						).toLocaleString('en');
				}
			}
		}
	});
};

// Make Borrow Balance Red w/ Error Message if it exceeds Available Credit
const borrowBalanceExceedsAvailableCreditError = num => {
	const borrowBalanceText = document.getElementsByClassName(
		'borrow-balance-text'
	);

	if (num === 1) {
		borrowBalanceText[0].innerHTML = 'Borrow Balance';
		borrowBalanceText[0].classList.remove('borrow-balance-error');
		borrowBalanceText[1].classList.remove('borrow-balance-error');
	} else {
		borrowBalanceText[0].classList.add('borrow-balance-error');
		borrowBalanceText[1].classList.add('borrow-balance-error');
		borrowBalanceText[0].innerHTML = "Can't exceed <br>Available Credit!";
	}
};
