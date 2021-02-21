const url = 'https://coingecko.com/api/documentations/v3';
const allCoinsUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cvenus%2Cswipe%2Cusd-coin%2Ctether%2Cbinance-usd%2Cethereum%2Clitecoin%2Cripple%2Cbitcoin-cash%2Cpolkadot%2Cchainlink%2Cdai%2Cfilecoin%2Cbinancecoin%2Cbinance-eth&vs_currencies=usd';

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

async function getCoinPrice(coin) {
    const jsonObject = await getData();
    return jsonObject[coin].usd;
}

getData();
getCoinPrice('venus');