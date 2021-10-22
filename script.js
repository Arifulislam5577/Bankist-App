'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Ariful Islam',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Abul Hossen',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Babul Mia',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Opi Korim',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

const now = new Date();
const day = now.getDay();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const date = `${now.getDate()}`;
const min = `${now.getMinutes()}`;
const hours = `${now.getHours()}`;
const second = now.getSeconds();

const DateFormat = element => {
  return `${element}` >= 10 ? `${element}` : `0${element}`;
};


// labelDate.textContent= new Intl.DateTimeFormat('bn-BD').format(now)



labelDate.textContent = `${DateFormat(date)}/${DateFormat(month)}/${year}, 
${hours > 12 ? DateFormat(hours - 12) : hours}:${DateFormat(min)}:${DateFormat(second)}`;

const displayMovements = (movements, sort = false) => {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1}${type}</div>
          <div class="movements__date">${DateFormat(date)} / ${DateFormat(month)} / ${year}</div>
          <div class="movements__value">${mov} €</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};



const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce(
    (currentValue, totalValue) => currentValue + totalValue,0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((value, total) => value + total, 0);
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((value, total) => value + total, 0);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((value, total) => value + total, 0);

  labelSumIn.textContent = `${incomes}€`;
  labelSumOut.textContent = `${Math.abs(out)}€`;
  labelSumInterest.textContent = `${interest}€`;
};

const createUserName = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserName(accounts);

const UpdateUI = acc => {
  //display movement
  displayMovements(acc.movements);
  //display Balance
  calcDisplayBalance(acc);
  //display summary
  calcDisplaySummary(acc);
};

let currentAccount;


btnLogin.addEventListener('click', e => {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    //Clear input value
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    UpdateUI(currentAccount);
  }
});

//Transfer amount

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const reciverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    reciverAcc &&
    reciverAcc?.username !== currentAccount.username
  ) {
    reciverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);
    UpdateUI(currentAccount);
  }
  inputTransferAmount.value = inputTransferTo.value = '';
});

// Get Loan

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    currentAccount.movements.push(loanAmount);
    UpdateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

//Delect account

btnClose.addEventListener('click', e => {
  e.preventDefault();

  const deleteAcc = accounts.find(
    acc => acc.username === inputCloseUsername.value
  );

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

//Sorting Movement

let sorted = false;

btnSort.addEventListener('click', e => {
  e.preventDefault();

  displayMovements(currentAccount.movements, !sorted);

  sorted = !sorted;
});
