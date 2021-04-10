const mugControl = document.querySelector('.mug-control');
const mugContent = document.querySelector('.mug-content');

const fetchMugs = async () => {
  const response = await fetch('./api/mugs.json');
  return await response.json();
};

const addMugsIntoDom = async () => {
  const mugs = await fetchMugs();
  addthumbMugs(mugs);
  mugsTemplate(mugs);
};

const addthumbMugs = (mugs) => {
  mugs.forEach((mug) => {
    mugControl.innerHTML += `<li><img src="${mug.thumb}"></li>`;
  });
};

const mugsTemplate = (mugs) => {
  const mugsTemplate = mugs.map(({ id, name, description, img, price, stock }) => `
    <article class="mug-container">
      <h2 class="subtitle">${name}</h2>
      <p class="paragraph">${description}</p>

      <figure class="mug-image">
        <img src="${img}" alt="Foto de uma caneca preta de porcelana">
      </figure>

      <div class="buy">
        <p>Por:</p>
        <span class="price"><sup class="cipher">R$</sup>${price.toLocaleString('pt-BR', 
        {minimumFractionDigits: 2})}</span>
        <button class="sell-button" data-cart-id="${id}" data-cart="add">Adicionar ao carrinho</button>
        <span class="remaining">${stock} restantes</span>
      </div>
    </article>
  `).join('');

  mugContent.innerHTML += mugsTemplate;
  initTabNav(mugs);
};

const initTabNav = (mugs) => {
  const tabControls = mugControl.querySelectorAll('li');
  const tabContent = mugContent.querySelectorAll('article');
  const activeClass = 'active';

  const removeActiveClass = () => {
    tabControls.forEach((control) => control.classList.remove(activeClass));
    tabContent.forEach((content) => content.classList.remove(activeClass));
  };

  const addActiveClass = (index) => {
    removeActiveClass();
    tabControls[index].classList.add(activeClass);
    tabContent[index].classList.add(activeClass);
  };

  const addTabNavEvents = (controls) => {
    controls.forEach((control, index) => {
      control.addEventListener('click', () => {
        addActiveClass(index);
      });
    });
  };
    
  if (tabControls.length && tabContent.length) {
    addActiveClass(2);
    addTabNavEvents(tabControls);
    cart(mugs);
  } 
}

const cart = (mugs) => {
  const addItemToCartButton = Array.from(document.querySelectorAll('[data-cart="add"]'));
  const activeClass = 'active';
  
  const addedMessage = () => {
    const containerMessage = document.createElement('div');
    containerMessage.classList.add('added-message');
    const paragraphMessage = document.createElement('p');
    const message = 'Item adicionado ao carrinho'; 
    paragraphMessage.innerText += message;
    containerMessage.appendChild(paragraphMessage);
    document.body.appendChild(containerMessage);
    setTimeout(() => document.body.removeChild(containerMessage), 1000);
  };

  const addCartItem = (event) => {
    const { id, name, thumb, price } = mugs[+event.target.dataset.cartId];
    const cartItems = document.querySelector('.cart-items');
    let idCount = 0;
    cartItems.innerHTML += `
      <li data-cart="${idCount++}">
        <div class="cart-img"><img src="${thumb}"></div>
        <div class="cart-info">
          <h2 class="cart-info-title">${name}</h2>
          <span class="price budget-prices"><sup class="cipher budget-cipher">R$</sup>${price.toLocaleString('pt-BR', 
        {minimumFractionDigits: 2})}</span>
        </div>
        <button class="remove-item" data-cart-remove="${id}">&times;</button>
      </li>
    `;
    addEventsCart();
  };

  const cartCount = (added) => {
    const cart = document.querySelector('.carrinho');
    if (added) cart.dataset.cart++;
    if (!added) cart.dataset.cart--;
  };

  const removeCartItem = (event) => {
    const cartList = event.target.parentElement;
    cartCount(false);
    if (cartList.parentElement.children.length < 2) {
      disableCart();
    }
    cartList.remove();

    const cartId = +event.target.dataset.cartRemove;
    changeStock(cartId, true);
  };

  const addEventsCart = () => {
    const removeItemButton = document.querySelectorAll('.remove-item');
    removeItemButton.forEach((button) => {
      button.addEventListener('click', removeCartItem);
      button.addEventListener('click', totalPrice);
    });
  };

  const enableCart = () => {
    const empty = document.querySelector('.empty-cart');
    const totalCart = document.querySelector('.cart-total');
    empty.classList.remove(activeClass);
    totalCart.classList.add(activeClass);
  };

  const disableCart = () => {
    const empty = document.querySelector('.empty-cart');
    const totalCart = document.querySelector('.cart-total');
    empty.classList.add(activeClass);
    totalCart.classList.remove(activeClass);
  };

  const soldOutProduct = (button) => {
    button.classList.add('disabled');
    button.innerText = 'Produto esgotado';
    button.disabled = true;
  };

  const availableProduct = (button) => {
    button.classList.remove('disabled');
    button.innerText = 'Adicionar ao carrinho';
    button.disabled = false;
  };

  const changeStock = (itemId, change) => {
    const buyContainer = document.querySelectorAll('.sell-button');
    buyContainer.forEach((buyButton) => {
      if (+buyButton.dataset.cartId === itemId) {
        const remaining = buyButton.nextElementSibling;
        let stock = +remaining.innerText.slice(0,2);
        if (change) stock++;
        if (!change) stock--;
        remaining.innerText = `${stock} restantes`;
        if (stock < 1) {
          soldOutProduct(buyButton);
        } else {
          availableProduct(buyButton);
        }
      }
    });
  };

  const activeChangeStock = (event) => {
    const itemID = +event.target.dataset.cartId;
    changeStock(itemID, false);
  };

  const formatPrice = (priceContainer) => {
    return +priceContainer.innerText.replace('R$', '').replace(',', '.');
  };

  const totalPrice = () => {
    const listCartItem = document.querySelectorAll('.cart-items li');
    const totalContainer = document.querySelector('[data-cart="total"]');
    let total = 0;
    listCartItem.forEach((cartItem) => {
      let priceContainer = cartItem.querySelector('.budget-prices');
      let priceItems = formatPrice(priceContainer);
      total += priceItems;
      totalContainer.innerHTML = `<sup class="cipher budget-cipher">R$</sup>
        ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    });
  };

  const addEventCartButton = () => {
    addItemToCartButton.forEach((button) => {
      button.addEventListener('click', addedMessage);
      button.addEventListener('click', addCartItem);
      button.addEventListener('click', enableCart);
      button.addEventListener('click', () => cartCount(true));
      button.addEventListener('click', activeChangeStock);
      button.addEventListener('click', totalPrice);
    });
  };

  addEventCartButton();
};

export { addMugsIntoDom };
