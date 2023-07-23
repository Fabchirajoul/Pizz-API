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
      open: false,
      displayHistory: false,
      historyCartsIds: [],
      pastOrderedPizzas: [],

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

      pizzaImage(pizza) {
        return `./images/${pizza.size}.png`;
      },
      showCartData() {
        this.getCart().then((result) => {
          const cartData = result.data;
          this.cartPizzas = cartData.pizzas;
          this.cartTotal = cartData.total.toFixed(2);
        });
      },

      featuredpizzas() {
        axios
          .get(
            "https://pizza-api.projectcodex.net/api/pizzas/featured?username=XolaniSibisi"
          )
          .then((result) => {
            this.featuredpizzas = result.data.pizzas;
          });
      },

      postfeaturedpizzas() {
        axios
          .post("https://pizza-api.projectcodex.net/api/pizzas/featured", {
            username: "Fabchirajoul",
            pizza_id: pizzaId,
          })
          .then(() => this.featuredPizzas());
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
        this.featuredPizzas();
      },
      orderHistory() {
        const orderHistoryUrrl = `https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}`;
        axios.get(orderHistoryUrrl).then((result) => {
          this.historyCartsIds = result.data.filter(
            (cart) => cart.status === "paid"
          );
          this.activateDisplayHistory();
        });
      },
      historyPizzas() {
        this.orderHistory();
        this.orderHistory();
      },

      getPastOrders(CartCode) {
        const getCartURLl = `https://pizza-api.projectcodex.net/api/pizza-cart/${CartCode}/get`;
        return axios.get(getCartURLl).then((result) => {
          this.pastOrderedPizzas.push({
            pizzas: result.data.pizzas,
            total: result.data.total,
            cartId: result.data.id,
          });
        });
      },
      activateDisplayHistory() {
        this.displayHistory = true;
        this.cartDisplayed = true;
      },
      newOrder() {
        this.displayHistory = false;
        this.cartDisplayed = false;
      },

      //   Adds Pizza to card

      addPizzaToCart(pizzaId) {
        //   alert(pizzaid)
        this.addPizza(pizzaId).then(() => {
          this.showCartData();

          this.message =
            this.username +
            " , you added " +
            this.pizza.flavour +
            " to your cart";
          setTimeout(() => (this.message = ""), 3000);
        });
        return this.featuredPizzas();
      },

      removePizzaFromCart(pizzaId) {
        //   alert(pizzaid)
        this.removePizza(pizzaId).then(() => {
          this.showCartData();
          this.message = this.message =
            this.username +
            " , you removed " +
            this.pizza.flavour +
            " from your cart";
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
