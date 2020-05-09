'use strict';

const cartButton = document.querySelector("#cart-button"),
  modal = document.querySelector(".modal"),
  close = document.querySelector(".close"),
  buttonAuth = document.querySelector('.button-auth'),
  modalAuth = document.querySelector('.modal-auth'),
  closeAuth = document.querySelector('.close-auth'),
  logInForm = document.querySelector('#logInForm'),
  loginInput = document.querySelector('#login'),
  passwordInput = document.querySelector('#password'),
  userName = document.querySelector('.user-name'),
  buttonOut = document.querySelector('.button-out'),
  cardsRestaurants = document.querySelector('.cards-restaurants'),
  containerPromo = document.querySelector('.container-promo'),
  restaurants = document.querySelector('.restaurants'),
  menu = document.querySelector('.menu'),
  logo = document.querySelector('.logo'),
  cardsMenu = document.querySelector('.cards-menu'),
  restaurantTitle = document.querySelector('.restaurant-title'),
  rating = document.querySelector('.rating'),
  minPrice = document.querySelector('.price'),
  category = document.querySelector('.category'),
  inputSearch = document.querySelector('.input-search'),
  modalBody = document.querySelector('.modal-body'),
  modalPrice = document.querySelector('.modal-pricetag'),
  buttonClearCart = document.querySelector('.clear-cart'),
  buttonOrder = document.querySelector('.buttom-order');

let user = {
  'login': localStorage.getItem('login'),
  'password': localStorage.getItem('password')
};

const cart = [];

const loadCart = () => {
  if (localStorage.getItem(user.login)) {
    JSON.parse(localStorage.getItem(user.login)).forEach(function(item) {
      cart.push(item);
    });
  }
};

const saveCart = () => localStorage.setItem(user.login, JSON.stringify(cart));

const getData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error response at address ${url}, statud: ${response.status}`);
  }
  return response.json();
};

const toggleModalAuth = () => modalAuth.classList.toggle('is-open');
const toggleModal = () => modal.classList.toggle("is-open");

const returnMain = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
};

function authorized() {

  function logOut() {
    user.login = null;
    user.password = null;
    cart.length = 0;
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    localStorage.removeItem('login');
    localStorage.removeItem('password');

    returnMain();  
    checkAuth();
  }

  userName.textContent = user['login'];
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  cartButton.style.display = 'flex';
  buttonOut.style.display = 'flex';

  buttonOut.addEventListener('click', logOut);
}

function notAuthorized() {

  function logIn(event) {
    event.preventDefault();
    if (loginInput.value.trim()) {
      user.login = loginInput.value;
      loginInput.style.borderColor = '';
      if (passwordInput.value.trim()) {
        user.password = passwordInput.value;
        passwordInput.style.borderColor = '';
        localStorage.setItem('login', user.login);
        localStorage.setItem('password', user.login);
        toggleModalAuth();
        buttonAuth.removeEventListener('click', toggleModalAuth);
        closeAuth.removeEventListener('click', toggleModalAuth);
        logInForm.removeEventListener('submit', logIn);
        logInForm.reset();
        checkAuth();    
      } else {
        passwordInput.style.borderColor = 'red';
      }
    } else {
      loginInput.style.borderColor = 'red';
    }
    loadCart();
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

const checkAuth = () => (user.login && user.password) ? authorized() : notAuthorized();

function createCardRestaurant({ name, time_of_delivery: timeOfDelivery, stars, price, kitchen, image, products }) {

  const card = `
  <a class="card card-restaurant" data-products=${products} data-info="${[name, stars, price, kitchen]}">
  <img src=${image} alt="image" class="card-image"/>
  <div class="card-text">
    <div class="card-heading">
      <h3 class="card-title">${name}</h3>
      <span class="card-tag tag">${timeOfDelivery} мин</span>
    </div>
    <div class="card-info">
      <div class="rating">${stars}</div>
      <div class="price">от ${price} ₽</div>
      <div class="category">${kitchen}</div>
    </div>
  </div>
  </a>
`;
  cardsRestaurants.insertAdjacentHTML('beforeend', card);
}

function createCardGood({id, name, description, price, image}) {
  
  const card = document.createElement('div');
  card.className = 'card';

  card.insertAdjacentHTML('beforeend', `
    <img src=${image} alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">${description}
        </div>
      </div>
      <div class="card-buttons">
        <button class="button button-primary button-add-cart" id="${id}">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price-bold card-price">${price} ₽</strong>
      </div>
    </div>
  `);
  cardsMenu.insertAdjacentElement('beforeend', card);
}

function openGoods(event) {

  const target = event.target;

  if (user.login && user.password) {

    const restaurant = target.closest('.card-restaurant');
    
    if (restaurant) {

    const info = restaurant.dataset.info.split(',');
    const [name, stars, price, kitchen] = info;

    restaurantTitle.textContent = name;
    rating.textContent = stars;
    minPrice.textContent = 'от ' + price + ' ₽';
    category.textContent = kitchen;

    cardsMenu.textContent = '';
    containerPromo.classList.add('hide');
    restaurants.classList.add('hide');
    menu.classList.remove('hide');

    getData(`./static/db/${restaurant.dataset.products}`).then(function(data) {
      data.forEach(createCardGood);
    });   

    }
  } else {
    toggleModalAuth();
  }
}

function addToCart(event) {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart')

  if (buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;

    const food = cart.find(function(item) {
      return item.id === id;
    });

    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1
      });  
    }
  }
  saveCart();
}

function renderCart() {
  modalBody.textContent = '';
  cart.forEach(function({ id, title, cost, count }) {
    const itemCart = `
      <div class="food-row">
      <span class="food-name">${title}</span>
      <strong class="food-price">${cost}</strong>
      <div class="food-counter">
        <button class="counter-button couter-minus" data-id=${id}>-</button>
        <span class="counter">${count}</span>
        <button class="counter-button couter-plus" data-id=${id}>+</button>
      </div>
    </div>
    `;
    modalBody.insertAdjacentHTML('beforeend', itemCart);
  });
  const totalPrice = cart.reduce(function(result, item) {
    return result + parseFloat(item.cost) * item.count;
  }, 0);
  modalPrice.textContent = totalPrice + ' ₽';
}

function changeCount(event) {
  const target = event.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(function(item) {
      return item.id === target.dataset.id;
    });
    if (target.classList.contains('couter-minus')) { 
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }
    if (target.classList.contains('couter-plus')) { food.count++; }
    renderCart();
  }
  saveCart();
}

function clearCart() {
  cart.length = 0;
  renderCart();
  toggleModal();
}

function init() {
  getData('./static/db/partners.json').then(function(data) {
    data.forEach(createCardRestaurant);
  });
  
  cartButton.addEventListener("click", () => {
    renderCart();
    toggleModal();
    for (let item of cart) {
      if (item) {
        localStorage.removeItem(item['id']);
      }
    }
  });
  
  buttonOrder.addEventListener('click', () => {
    saveCart();
    renderCart();
    toggleModal();
  });

  buttonClearCart.addEventListener('click', clearCart);

  modalBody.addEventListener('click', changeCount);
  close.addEventListener("click", toggleModal);
  logo.addEventListener('click', returnMain);
  cardsRestaurants.addEventListener('click', openGoods);
  cardsMenu.addEventListener('click', addToCart);

  inputSearch.addEventListener('keydown', (event) => {

    if (event.keyCode === 13) {

      const target = event.target;
      const value = target.value.toLowerCase().trim();

      target.value = '';

      if (!value || value.lenght < 3) {
        target.style.backgroundColor = 'tomato';
        setTimeout(() => {
          target.style.backgroundColor = '';
        }, 1000);
        return;
      }

      const goods = [];

      getData('./static/db/partners.json')
        .then(function(data) {
          const products = data.map((item) => {
            return item.products;
          });

          products.forEach((product) => {
            getData(`./static/db/${product}`)
            .then((data) => {
              goods.push(...data)

              const searchGood = goods.filter((item) => {
                return item.name.toLowerCase().includes(value);
              });
              
              restaurantTitle.textContent = 'Результат поиска';
              rating.textContent = '';
              minPrice.textContent = '';
              category.textContent = '';
          
              cardsMenu.textContent = '';
              containerPromo.classList.add('hide');
              restaurants.classList.add('hide');
              menu.classList.remove('hide');

              return searchGood;
            })
            .then((data) => {
              data.forEach(createCardGood);
            });
          });
        });
      }
    });

  checkAuth();
  
  new Swiper('.swiper-container', {
    speed: 1500,
    spaceBetween: 40,
    loop: true,
    autoplay: {
      delay: 1000
    },
    slidesPerView: 'auto',
  });  
}

init();