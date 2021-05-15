var crypto_list = ['BTC', 'ETH', 'BNB', 'VET', 'LINK', 'ADA', 'XLM']

var crypto_price = []
var promises = []

for (i = 0; i < crypto_list.length; i++) {
    promises.push(
        axios.get('https://api.cryptonator.com/api/full/' + crypto_list[i] + '-usd').then(response => {
            // do something with response
            crypto_price.push(response.data.ticker.price)
            //crypto_price.push(response.data.ticker.price);
        })
    )
}


Promise.all(promises).then(() => {

    console.log(crypto_price)

}