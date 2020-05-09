inputSearch.addEventListener('keydown', function(event) {

    if (event.keyCode === 13) {
        const target = event.target;
        
        const value = target.value.toLowerCase().trim();

        target.value = '';

        if (!value || value.length < 3) {
            target.style.backgroundColor = 'tomato';
            setTimeout(function(){
                target.style.backgroundColor = '';
            }, 2000);
            return;
        }

        const goods = [];
        
        getData('./db/partners.json')
            .then(function(data) {
                
                const products = data.map(function(item){
                    return item.products;
                });


                products.forEach(function(product){
                    getData(`./db/${product}`)
                        .then(function(data){
                            
                            goods.push(...data);

                            const searchGoods = goods.filter(function(item) {
                                return item.name.toLowerCase().includes(value)
                            })

                            console.log(searchGoods);
                            
                            cardsMenu.textContent = '';

                            containerPromo.classList.add('hide');
                            restaurants.classList.add('hide');
                            menu.classList.remove('hide');

                            restaurantTitle.textContent = 'Результат поиска';
                            rating.textContent = '';
                            minPrice.textContent = '';
                            category.textContent = '';

                            return searchGoods;
                        })
                        .then(function(data){
                            data.forEach(createCardGood);
                        })
                })
                
                
            });

        
            
    }
    
});