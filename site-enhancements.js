(function () {
  var CART_KEY = "elib_cart";
  var USER_KEY = "elib_user";

  function currentPageFile() {
    var path = window.location.pathname || "";
    var file = path.split("/").pop() || "homelib.html";
    return file.toLowerCase();
  }

  function pageClassName() {
    return "elib-page-" + currentPageFile().replace(/[^a-z0-9]+/g, "-");
  }

  function addPageClass() {
    if (document.body) {
      document.body.classList.add(pageClassName());
    }
  }

  var SEARCH_INDEX = [
    { title: "Home", url: "homelib.html", keywords: "homepage" },
    { title: "Categories", url: "categories..html", keywords: "genres" },
    { title: "Profile", url: "profile.html", keywords: "account" },
    { title: "Cart", url: "cart.html", keywords: "checkout" },
    { title: "Weekly Issues", url: "weeklyissues.html", keywords: "issues" },
    { title: "Library Dues", url: "libdues.html", keywords: "dues payment" },
    { title: "Login", url: "loginlib.html", keywords: "sign in" },
    { title: "Sign Up", url: "selector.html", keywords: "register" },

    { title: "Movie Based Books", url: "movie.html", keywords: "movie" },
    { title: "Engineering", url: "engineering.html", keywords: "technical" },
    { title: "History", url: "history.html", keywords: "historical" },
    { title: "Coding Language", url: "codinglang.html", keywords: "programming coding" },
    { title: "Romance", url: "romance.html", keywords: "love" },
    { title: "Kids Books", url: "kidsbooks.html", keywords: "children" },
    { title: "Fiction", url: "fiction.html", keywords: "fantasy" },

    { title: "Harry Potter and the Philosopher's Stone", url: "lib1..html", keywords: "harry potter philosopher stone jk rowling" },
    { title: "Harry Potter and the Chamber of Secrets", url: "lib2.html", keywords: "harry potter chamber secrets" },
    { title: "Harry Potter and the Order of the Phoenix", url: "lib3.html", keywords: "harry potter phoenix" },
    { title: "The Ink Black Heart", url: "lib4..html", keywords: "ink black heart" },
    { title: "Fantastic Beasts and Where to Find Them", url: "lib5.html", keywords: "fantastic beasts" },
    { title: "The Tales of Beedle the Bard", url: "lib6.html", keywords: "beedle bard" },
    { title: "Troubled Blood", url: "lib7.html", keywords: "troubled blood" },
    { title: "Becoming", url: "lib8.html", keywords: "becoming" },
    { title: "The Light We Carry", url: "lib9.html", keywords: "light carry" },
    { title: "My Life in Full", url: "lib10.html", keywords: "my life full" },
    { title: "Unbroken", url: "lib11.html", keywords: "unbroken" },
    { title: "The War Diary", url: "lib12.html", keywords: "war diary" },
    { title: "Revolutionaries", url: "lib13.html", keywords: "revolutionaries" },
    { title: "A New Idea of India", url: "lib14.html", keywords: "new idea india" }
  ];

  function normalize(value) {
    return (value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function score(item, query) {
    var haystack = normalize(item.title + " " + item.keywords + " " + item.url);
    if (!haystack || !query) return 0;
    if (haystack === query) return 100;
    if (haystack.indexOf(query) === 0) return 70;
    if (haystack.indexOf(query) !== -1) return 40;

    var parts = query.split(" ");
    var hits = parts.filter(function (p) {
      return p && haystack.indexOf(p) !== -1;
    }).length;

    return hits > 0 ? hits * 10 : 0;
  }

  function search(query) {
    var q = normalize(query);
    return SEARCH_INDEX.map(function (item) {
      return { item: item, points: score(item, q) };
    })
      .filter(function (r) {
        return r.points > 0;
      })
      .sort(function (a, b) {
        return b.points - a.points;
      })
      .map(function (r) {
        return r.item;
      });
  }

  function suggestionHTML(results) {
    return results
      .slice(0, 6)
      .map(function (r) {
        return (
          '<button type="button" data-url="' +
          r.url +
          '">' +
          r.title +
          "</button>"
        );
      })
      .join("");
  }

  function goToBestMatch(query) {
    var results = search(query);
    if (results.length > 0) {
      window.location.href = results[0].url;
      return;
    }

    var fallback = "categories..html?q=" + encodeURIComponent(query || "");
    window.location.href = fallback;
  }

  function initSearchBars() {
    var inputs = document.querySelectorAll('input[placeholder="Search books..."]');
    if (!inputs.length) return;

    inputs.forEach(function (input) {
      input.classList.add("elib-search-input");

      var cell = input.closest("th, td, div, section") || input.parentElement;
      if (cell) cell.classList.add("elib-search-cell");

      var btn = cell ? Array.from(cell.querySelectorAll("button")).find(function (b) {
        return normalize(b.textContent) === "search";
      }) : null;

      if (!btn) {
        btn = document.createElement("button");
        btn.textContent = "Search";
        input.insertAdjacentElement("afterend", btn);
      }
      btn.classList.add("elib-search-btn");
      btn.type = "button";

      var suggestionBox = cell ? cell.querySelector(".elib-search-suggestions") : null;
      if (!suggestionBox) {
        suggestionBox = document.createElement("div");
        suggestionBox.className = "elib-search-suggestions";
        suggestionBox.setAttribute("role", "listbox");
        cell.appendChild(suggestionBox);
      }

      function refreshSuggestions() {
        var q = input.value;
        if (!q || !q.trim()) {
          suggestionBox.style.display = "none";
          suggestionBox.innerHTML = "";
          return;
        }

        var results = search(q);
        if (!results.length) {
          suggestionBox.style.display = "none";
          suggestionBox.innerHTML = "";
          return;
        }

        suggestionBox.innerHTML = suggestionHTML(results);
        suggestionBox.style.display = "block";
      }

      input.addEventListener("input", refreshSuggestions);
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          goToBestMatch(input.value);
        }
      });

      btn.addEventListener("click", function () {
        goToBestMatch(input.value);
      });

      suggestionBox.addEventListener("click", function (event) {
        var target = event.target;
        if (target && target.matches("button[data-url]")) {
          window.location.href = target.getAttribute("data-url");
        }
      });

      document.addEventListener("click", function (event) {
        if (!cell.contains(event.target)) {
          suggestionBox.style.display = "none";
        }
      });
    });
  }

  function improveFormsForStaticHosting() {
    var forms = document.querySelectorAll('form[action$=".php"]');
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var action = (form.getAttribute("action") || "").toLowerCase();
        var usernameField = form.querySelector('input[name="username"]');
        var passwordField = form.querySelector('input[name="password"]');
        var emailField = form.querySelector('input[name="email"]');
        var confirmPasswordField = form.querySelector('input[name="confirm-password"]');

        if (action.indexOf("signup") !== -1) {
          var pwd = passwordField ? passwordField.value : "";
          var confirmPwd = confirmPasswordField ? confirmPasswordField.value : "";

          if (pwd !== confirmPwd) {
            alert("Passwords do not match.");
            return;
          }

          localStorage.setItem(
            USER_KEY,
            JSON.stringify({
              username: usernameField ? usernameField.value : "",
              email: emailField ? emailField.value : "",
              password: pwd
            })
          );
          alert("Account created successfully.");
          window.location.href = "homelib.html";
          return;
        }

        if (action.indexOf("login") !== -1) {
          var savedUser = null;
          try {
            savedUser = JSON.parse(localStorage.getItem(USER_KEY) || "null");
          } catch (err) {
            savedUser = null;
          }

          if (savedUser && passwordField && usernameField) {
            var enteredUser = normalize(usernameField.value);
            var savedUsername = normalize(savedUser.username);
            var savedEmail = normalize(savedUser.email);
            var isUserMatch = enteredUser === savedUsername || enteredUser === savedEmail;
            var isPassMatch = passwordField.value === savedUser.password;

            if (!isUserMatch || !isPassMatch) {
              alert("Invalid login credentials.");
              return;
            }
          }

          alert("Login successful.");
          window.location.href = "homelib.html";
          return;
        }

        window.location.href = "homelib.html";
      });
    });
  }

  function parseAmount(textValue) {
    var match = String(textValue || "").match(/₹\s*([0-9]+)/);
    return match ? Number(match[1]) : 0;
  }

  function getCart() {
    try {
      var saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (err) {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function formatINR(amount) {
    var value = Number(amount) || 0;
    return "₹" + value.toFixed(0);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function extractBookFromPage() {
    var titleEl = document.querySelector("h1") || document.querySelector("b");
    var authorEl = document.querySelector("i");
    var imageEl = document.querySelector("table img") || document.querySelector("img");
    var bodyText = document.body ? document.body.textContent : "";

    return {
      id: window.location.pathname.split("/").pop() || "unknown-book",
      title: (titleEl ? titleEl.textContent : document.title || "Book").trim(),
      author: (authorEl ? authorEl.textContent : "").trim(),
      price: parseAmount(bodyText),
      image: imageEl ? imageEl.getAttribute("src") : "",
      qty: 1
    };
  }

  function addCurrentBookToCart() {
    var book = extractBookFromPage();
    var cart = getCart();
    var existing = cart.find(function (item) {
      return item.id === book.id;
    });

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push(book);
    }

    setCart(cart);
    var goToCart = window.confirm("Added to cart successfully. Open cart now?");
    if (goToCart) {
      window.location.href = "cart.html";
    }
  }

  function setupAddToCartButtons() {
    var addButtons = Array.from(document.querySelectorAll('input[type="submit"]')).filter(function (input) {
      return normalize(input.value).indexOf("add to cart") !== -1;
    });

    addButtons.forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        addCurrentBookToCart();
      });
    });
  }

  function setupBorrowNowButton() {
    var borrowBtn = Array.from(document.querySelectorAll('input[type="submit"]')).find(function (input) {
      return normalize(input.value) === "borrow now";
    });

    if (!borrowBtn) return;

    borrowBtn.addEventListener("click", function (event) {
      event.preventDefault();
      updateCartTotals();
      var selectedBoxes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
      var selected = selectedBoxes.length;
      if (selected === 0) {
        alert("Please select at least one book before borrowing.");
        return;
      }

      var cart = getCart();
      var selectedIds = selectedBoxes
        .map(function (box) {
          return box.getAttribute("data-cart-id");
        })
        .filter(function (value) {
          return !!value;
        });

      if (selectedIds.length > 0) {
        var nextCart = cart.filter(function (item) {
          return selectedIds.indexOf(item.id) === -1;
        });
        setCart(nextCart);
      }

      alert("Borrow request submitted successfully.");
      window.location.href = "weeklyissues.html";
    });
  }

  function updateSelectedReceipt() {
    if (currentPageFile() !== "cart.html") return;

    var receiptCell = document.querySelector("[data-elib-selected-receipt]");
    if (!receiptCell) return;

    var selectedRows = Array.from(document.querySelectorAll('tr[data-cart-row] input[type="checkbox"]:checked'))
      .map(function (box) {
        return box.closest("tr[data-cart-row]");
      })
      .filter(function (row) {
        return !!row;
      });

    if (!selectedRows.length) {
      receiptCell.innerHTML = "<b>Selected:</b> none";
      return;
    }

    var picks = selectedRows.map(function (row) {
      var title = row.getAttribute("data-title") || "Book";
      var qtyInput = row.querySelector('input[type="number"]');
      var qty = Math.max(1, Number(qtyInput && qtyInput.value ? qtyInput.value : 1));
      return title + " x" + qty;
    });

    var preview = picks.slice(0, 3).join(", ");
    if (picks.length > 3) {
      preview += " ( +" + (picks.length - 3) + " more )";
    }

    receiptCell.innerHTML = "<b>Selected:</b> " + escapeHtml(preview);
  }

  function updateCartTotals() {
    if (currentPageFile() !== "cart.html") return;

    var totalCell = document.querySelector("[data-elib-cart-total]");
    if (!totalCell) return;

    var rows = Array.from(document.querySelectorAll("tr[data-cart-row]"));
    var totals = rows.reduce(
      function (acc, row) {
        var amount = Number(row.getAttribute("data-amount") || 0);
        var qtyInput = row.querySelector('input[type="number"]');
        var checkbox = row.querySelector('input[type="checkbox"]');
        var qty = Math.max(1, Number(qtyInput && qtyInput.value ? qtyInput.value : 1));
        var lineAmount = amount * qty;

        acc.all += lineAmount;
        acc.items += qty;

        if (checkbox && checkbox.checked) {
          acc.selected += lineAmount;
          acc.selectedItems += qty;
        }
        return acc;
      },
      { all: 0, selected: 0, items: 0, selectedItems: 0 }
    );

    totalCell.innerHTML =
      "<b>Cart Total: " +
      formatINR(totals.all) +
      "</b> | <b>Selected Total: " +
      formatINR(totals.selected) +
      "</b> | <b>Selected Qty: " +
      totals.selectedItems +
      "</b>";
  }

  function persistCartQuantities() {
    if (currentPageFile() !== "cart.html") return;

    var cart = getCart();
    if (!cart.length) return;

    var updated = cart.map(function (item) {
      var input = document.querySelector('input[data-cart-id="' + item.id.replace(/"/g, "") + '"]');
      var qty = input ? Math.max(1, Number(input.value || 1)) : Math.max(1, Number(item.qty || 1));
      return Object.assign({}, item, { qty: qty });
    });

    setCart(updated);
  }

  function attachCartInteractions() {
    if (currentPageFile() !== "cart.html") return;

    var qtyInputs = Array.from(document.querySelectorAll('tr[data-cart-row] input[type="number"]'));
    var checkboxes = Array.from(document.querySelectorAll('tr[data-cart-row] input[type="checkbox"]'));

    qtyInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        if (!input.value || Number(input.value) < 1) {
          input.value = 1;
        }
        persistCartQuantities();
        updateCartTotals();
        updateSelectedReceipt();
      });
    });

    checkboxes.forEach(function (box) {
      box.addEventListener("change", function () {
        updateCartTotals();
        updateSelectedReceipt();
      });
    });

    updateCartTotals();
    updateSelectedReceipt();
  }

  function setupClearCartButton() {
    if (currentPageFile() !== "cart.html") return;

    var clearBtn = document.querySelector("[data-elib-clear-cart-btn]");
    if (!clearBtn || clearBtn.getAttribute("data-bound") === "1") return;

    clearBtn.setAttribute("data-bound", "1");
    clearBtn.addEventListener("click", function () {
      var ok = window.confirm("Clear all items from cart?");
      if (!ok) return;

      setCart([]);
      renderCartItemsFromStorage();
      attachCartInteractions();
    });
  }

  function findCartTable() {
    var tables = Array.from(document.querySelectorAll("table"));
    return tables.find(function (table) {
      var text = normalize(table.textContent || "");
      return text.indexOf("s no") !== -1 && text.indexOf("book name") !== -1 && text.indexOf("borrow now") !== -1;
    });
  }

  function renderCartItemsFromStorage() {
    if (currentPageFile() !== "cart.html") return;

    var cartTable = findCartTable();
    if (!cartTable) return;

    var rows = Array.from(cartTable.querySelectorAll("tr"));
    if (!rows.length) return;

    var headerRow = rows[0];
    var borrowRow = rows.find(function (row) {
      var submit = row.querySelector('input[type="submit"]');
      return submit && normalize(submit.value) === "borrow now";
    });

    var totalsRow = rows.find(function (row) {
      return row.querySelector("[data-elib-cart-total]");
    });

    var receiptRow = rows.find(function (row) {
      return row.querySelector("[data-elib-selected-receipt]");
    });

    var clearRow = rows.find(function (row) {
      return row.querySelector("[data-elib-clear-cart-btn]");
    });

    rows.forEach(function (row) {
      if (row !== headerRow && row !== borrowRow && row !== totalsRow && row !== receiptRow && row !== clearRow) {
        row.remove();
      }
    });

    if (!totalsRow) {
      totalsRow = document.createElement("tr");
      totalsRow.innerHTML = '<td colspan="8"><p align="center" data-elib-cart-total><b>Cart Total: ₹0</b></p></td>';
      if (borrowRow) {
        cartTable.insertBefore(totalsRow, borrowRow);
      } else {
        cartTable.appendChild(totalsRow);
      }
    }

    if (!receiptRow) {
      receiptRow = document.createElement("tr");
      receiptRow.innerHTML = '<td colspan="8"><p align="center" data-elib-selected-receipt><b>Selected:</b> none</p></td>';
      if (borrowRow) {
        cartTable.insertBefore(receiptRow, borrowRow);
      } else {
        cartTable.appendChild(receiptRow);
      }
    }

    if (!clearRow) {
      clearRow = document.createElement("tr");
      clearRow.innerHTML = '<td colspan="8"><p align="center"><button type="button" data-elib-clear-cart-btn>Clear Cart</button></p></td>';
      if (borrowRow) {
        cartTable.insertBefore(clearRow, borrowRow);
      } else {
        cartTable.appendChild(clearRow);
      }
    }

    var cart = getCart();
    if (!cart.length) {
      var emptyRow = document.createElement("tr");
      emptyRow.setAttribute("data-cart-row", "1");
      emptyRow.innerHTML = '<td colspan="8"><p align="center"><b>Your cart is empty. Add books from book pages.</b></p></td>';
      if (totalsRow) {
        cartTable.insertBefore(emptyRow, totalsRow);
      } else if (borrowRow) {
        cartTable.insertBefore(emptyRow, borrowRow);
      } else {
        cartTable.appendChild(emptyRow);
      }
      updateCartTotals();
      return;
    }

    cart.forEach(function (item, index) {
      var row = document.createElement("tr");
      var amount = Number(item.price) > 0 ? Number(item.price) : 100;
      row.setAttribute("data-cart-row", "1");
      row.setAttribute("data-amount", String(amount));
      row.setAttribute("data-title", item.title || "Book");
      row.innerHTML =
        '<th>' +
        (index + 1) +
        '.<input type="checkbox" data-cart-id="' +
        escapeHtml(item.id) +
        '"></th>' +
        '<th><img src="' +
        escapeHtml(item.image || "book-stack_3389081.png") +
        '" alt="Book"></th>' +
        '<td><p align="center">' +
        escapeHtml(item.title) +
        '<br><i>' +
        escapeHtml(item.author || "Author") +
        "</i></p></td>" +
        '<td><p align="center">Available in cart</p></td>' +
        '<td><p align="center">₹' +
        amount +
        "</p></td>" +
        '<td><p align="center">Select quantity:&nbsp<input type="number" min="1" max="10" data-cart-id="' +
        escapeHtml(item.id) +
        '" value="' +
        (Number(item.qty) > 0 ? Number(item.qty) : 1) +
        '"></p></td>' +
        '<td><p align="center"><input type="date"></p></td>' +
        '<td><p align="center"><input type="date"></p></td>';

      if (totalsRow) {
        cartTable.insertBefore(row, totalsRow);
      } else if (borrowRow) {
        cartTable.insertBefore(row, borrowRow);
      } else {
        cartTable.appendChild(row);
      }
    });

    updateCartTotals();
    updateSelectedReceipt();
  }

  function repairButtonLikeAnchors() {
    var broken = document.querySelector('a[href="login.html"]');
    if (broken) {
      broken.setAttribute("href", "loginlib.html");
    }

    var wrongBack = document.querySelector('a[href="lib11.html.html"]');
    if (wrongBack) {
      wrongBack.setAttribute("href", "lib11.html");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    addPageClass();
    repairButtonLikeAnchors();
    initSearchBars();
    improveFormsForStaticHosting();
    setupAddToCartButtons();
    renderCartItemsFromStorage();
    setupClearCartButton();
    attachCartInteractions();
    setupBorrowNowButton();
  });
})();
