'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-11-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2025-12-01T23:36:17.929Z',
    '2025-11-28T10:51:36.790Z',
  ],
  currency: 'IRR',
  locale: 'fa', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-04-05T16:33:06.386Z',
    '2020-04-06T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const settimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
}

const formattedmov = function (acc, mov) {
  return Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency
  }).format(mov)
}

const formatMovmentDate = function (date, acc) {
  const curdate = new Date()
  const calcPasDay = (date, date2) => {
    return Math.round(Math.abs((date - date2) / (1000 * 60 * 60 * 24)))
  }

  if (calcPasDay(date, curdate) == 0) return `Today`
  if (calcPasDay(date, curdate) == 1) return `yesterday`
  if (calcPasDay(date, curdate) <= 7) return `${calcPasDay(date, curdate)} days ago`
  else {
    return new Intl.DateTimeFormat(acc.locale).format(curdate)
  }
}
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const combindatemovment = acc.movements.map((mov, i) => (
    {
      movment: mov,
      movmentdate: acc.movementsDates.at(i)
    }
  ))
  if (sort) combindatemovment.sort((a, b) => a.movment - b.movment)
  combindatemovment.forEach(function (obj, i) {
    const { movment, movmentdate } = obj
    const type = movment > 0 ? 'deposit' : 'withdrawal';
    //add movment Date
    const date = new Date(movmentdate);




    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1
      } ${type}</div>
      <div class="movements__date">${formatMovmentDate(date, acc)}</div>
        <div class="movements__value">${formattedmov(acc, movment)}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formattedmov(acc, acc.balance)}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formattedmov(acc, incomes)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formattedmov(acc, Math.abs(out))}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formattedmov(acc, interest)}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );


  if (currentAccount?.pin === +(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]
      }`;
    containerApp.style.opacity = '100';

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
  const currentdate = new Date()

  labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale).format(currentdate)

  if (timer) clearInterval(timer);
  timer = settimer();


});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString())
    currentAccount.movementsDates.push(new Date().toISOString())
    // Update UI
    updateUI(currentAccount);
  }
  clearInterval(timer)
  timer = settimer()
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString())
    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
  clearInterval(timer)
  timer = settimer()
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
  clearInterval(timer)
  timer = settimer()
});

//date

// const option = {
//   houre: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'numeric',
//   year: 'numeric',
// weekday: 'long'
// }
// const year = currentdate.getFullYear();
// const month = `${currentdate.getMonth() + 1}`.padStart(2, '0');
// const day = `${currentdate.getDate()}`.padStart(2, '0');
// const houre = `${currentdate.getHours()}`.padStart(2, '0');
// const minuts = `${currentdate.getMinutes()}`.padStart(2, '0');

// const local = navigator.language
// console.log(local);

/////////////////////////////////////////////////
// labelWelcome.textContent = new Intl.DateTimeFormat('fa').format(currentAccount)
/////////////////////////////////////////////////
// LECTURES
// console.log(Math.min(12, 56, 67, 34, 34, 4));
// console.log(Math.floor(Math.PI * (5 ** 2)));


// labelBalance.addEventListener('click', function (e) {
//   e.preventDefault()
//   console.log(document.querySelectorAll('.movements__row'));
//   document.querySelectorAll('.movements__row').forEach((mov, i) => {
//     if (i % 2 === 0) {
//       mov.style.background = 'green'
//     }
//   })
// })

//192
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(typeof 23n);
// console.log(new Date(2028, 9, 16, 22, 40, 3));
// const future = new Date(2026, 9, 16, 22, 10);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getHours());
// console.log(future.getTime());



