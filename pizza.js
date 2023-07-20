document.addEventListener("alpine:init", () => {
  Alpine.data("pizzaCart", () => {
    return {
      title: "RJ'S PIZZA API",
      pizzas: [],
      featuredPizzas: [],
      username: localStorage["username"],
      cartId: "",
      cartPizzas: [],
      paymentAmount: 0.0,
      change: 0.0,
      historical_carts: [],
      userHistory: "",
      open:false,

      cartTotal: 0.0,
      message: "",
      login() {
        if (this.username.length > 2) {
          localStorage["username"] = this.username;
          this.createCart();
        } else {
          alert("Please username is too short");
        }
      },
      logout() {
        if (confirm("Do you want to logout")) {
          this.username = "";
          this.cartId = "";
          localStorage["cartId"] = "";
          localStorage["username"] = "";
        }
      },
      createCart() {
        if (!this.username) {
          this.cartId = "No Username to create a cart for";
          return;
        }

        // Prohibits cart codes to be created each time we refresh by taking cart Id from local storage

        const cartId = localStorage["cartId"];
        if (cartId) {
          this.cartId = cartId;
        }

        // else it creates a new cart id
        else {
          const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username='${this.username}`;
          return axios.get(createCartURL).then((result) => {
            this.cartId = result.data.cart_code;

            localStorage["cartId"] = this.cartId;
          });
        }
      },

      getCart() {
        const getCarturl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
        return axios.get(getCarturl);
      },

      addPizza(pizzaId) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/add",
          {
            cart_code: this.cartId,
            pizza_id: pizzaId,
          }
        );
      },

      removePizza(pizzaId) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/remove",
          {
            cart_code: this.cartId,
            pizza_id: pizzaId,
          }
        );
      },
      pay(amount) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/pay",
          {
            cart_code: this.cartId,
            amount,
          }
        );
      },
      showCartData() {
        this.getCart().then((result) => {
          const cartData = result.data;
          this.cartPizzas = cartData.pizzas;
          this.cartTotal = cartData.total.toFixed(2);
        });
      },

      init() {
        const storedUsername = localStorage["username"];
        if (storedUsername) {
        }
        axios
          .get("https://pizza-api.projectcodex.net/api/pizzas")
          .then((result) => {
            //code here
            // console.log(result.data);
            this.pizzas = result.data.pizzas;
            //code here..
          });

        if (!this.cartId) {
          this.createCart().then(() => {
            this.showCartData();
          });
        }
      },

      // History starts here


      // History ends here

      
      

      //   Adds Pizza to card

      addPizzaToCart(pizzaId) {
        //   alert(pizzaid)
        this.addPizza(pizzaId).then(() => {
          this.showCartData();
          this.message = this.username + " , you added an item to your cart ";
          setTimeout(() => (this.message = ""), 3000);
        });
      },

      removePizzaFromCart(pizzaId) {
        //   alert(pizzaid)
        this.removePizza(pizzaId).then(() => {
          this.showCartData();
          this.message =
            this.username + " , you removed an item from your cart ";
          setTimeout(() => (this.message = ""), 3000);
        });
      },

      payForCart() {
        // alert("Pay Now :" +this.paymentAmount);

        this.pay(this.paymentAmount).then((result) => {
          if (result.data.status == "failure") {
            this.message = result.data.message;
            setTimeout(() => (this.message = ""), 3000);
          } else {
            this.message = "Payment received";
            this.message =
              this.username +
              " , made a successful purchase for his/her order!";
            this.change = this.paymentAmount - this.cartTotal;

            setTimeout(() => {
              this.message = "";
              localStorage["cartId"] = "";
              localStorage["username"] = "";
              this.change = "";
              this.cartPizzas = [];
              this.cartTotal = 0.0;
              this.cartId = "";
              this.paymentAmount = 0;
              this.createCart();
            }, 4000);
          }
        });
      },
    };
  });
});
