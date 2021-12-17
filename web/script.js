let globalLogin = 0 //Переменная для передачи login между функциями
let globalRowId = 0
let globalUser = []
let alerts = 0
window.onload = async function() { //При полной загрузке страницы запуск python функции
    if (localStorage.getItem("login") != null) {
        globalLogin = localStorage.getItem("login")
        await eel.start(globalLogin);
        globalUser = await eel.getUser(globalLogin)()
        openSettings()
        openAll()
    } else {
        document.getElementsByClassName("sidenav")[0].style.display = "none"
        document.location = "#modalRegister"
    }
}

eel.expose(addToTable) //Декоратор чтобы функцию можно было вызвать из python
function addToTable(title, price, date, id) {
    let tr = document.createElement("tr") //Создание элемента tr
    let atr = ["title", "price", "date", "id"] //Создание массива классов
    let arrayOfValue = [title, price, date, id] //Создание массива значений
    let allTr = document.querySelectorAll(".rowExpenses") //Поиск всех элементов с классом rowExpenses

    tr.className = "rowExpenses" //Добавление класса rowExpenses объекту tr
    tr.setAttribute("onclick", 'modalEditSetValue(this.id)') //Добавления действия открытия модального окна
    tr.id = id

    for (let x = 0; x < 4; x++) {
        let td = document.createElement("td") //Создание элемента td
        td.className = atr[x] //Добавление ему класса
        td.innerHTML = arrayOfValue[x] //Добавление ему значения
        tr.append(td) //Добавление элемента td в элемент tr
    }

    allTr[allTr.length - 1].after(tr) //Добавление элемента tr в конец всех элементов
}

eel.expose(setBalance)

function setBalance(balance) {
    document.getElementsByClassName("balance")[0].innerHTML = balance
    globalUser[4] = balance
}

function modalEditSetValue(id) {
    document.location = "#modal1" //Открытие модального окна
    let row = document.getElementById(id) //Получение ряда по id 
    let title = row.getElementsByClassName("title") //Получение названия в ряде
    let price = row.getElementsByClassName("price") //Получение цены в ряде
    let titleEdit = document.getElementsByClassName("titleEdit") //Получение поля редактирования названия в модальном окне 
    let priceEdit = document.getElementsByClassName("priceEdit") //Получение поля редактирования цены в модальном окне
    titleEdit[0].value = title[0].textContent //Установка названия в поле редактирования в модальном окне
    priceEdit[0].value = price[0].textContent //Установка цены в поле редактирования в модальном окне
    globalRowId = id
}

async function updateValuesInDB() {
    let row = document.getElementById(globalRowId) //Получение ряда по id 
    let lastTitle = row.getElementsByClassName("title")[0].textContent //Получение названия в ряде
    let lastPrice = row.getElementsByClassName("price")[0].textContent //Получение цены в ряде
    let title = document.getElementsByClassName("titleEdit")[0].value //Получения значения из поля редактирования названия модального окна
    let price = document.getElementsByClassName("priceEdit")[0].value //Получения значения из поля редактирования цены модального окна
    let alertWarn = document.getElementById("modal1").getElementsByClassName("alert")[0] //Получение уведомления для modal1
    if (lastTitle.trim() == title.trim() && lastPrice.trim() == price.trim()) { //Проверка на идентичность значений
        alertWarn.innerHTML = "Значения идентичны"
        alertWarn.style.display = "block" //Отображение уведомления
    } else if (!title.trim() || !price.trim()) { //Проверка на пустые значения
        alertWarn.innerHTML = 'Заполните поля "Названия" и "Стоимости"'
        alertWarn.style.display = "block" //Отображение уведомления
    } else {
        await eel.updateValues(title, price, globalRowId) //Вызов python функции для обновления значений
        document.getElementById(globalRowId).getElementsByClassName("title")[0].textContent = title //Обновления значения названия в таблице
        document.getElementById(globalRowId).getElementsByClassName("price")[0].textContent = price //Обновления значения цены в таблице
        newMessage("Значения обновленны") //Отправка нового сообщения
        alertWarn.style.display = "none" //Скрытие уведомления
        document.location = "#" //Закрытие модального окна
    }
}

async function deleteRowJS() {
    let result = confirm("Вы уверены что хотите удалить запись") //Подтверждение на удаление
    if (result == true) {
        await eel.deleteRow(globalRowId) //Вызов python функции для удаления ряда
        document.getElementById(globalRowId).parentElement.removeChild(document.getElementById(globalRowId)) //Удаление ряда в таблице
        newMessage("Запись успешно удаленна") //Отправка нового сообщения
        document.location = "#" //Закрытие модального окна

    } else {
        document.location = "#" //Закрытие модального окна
    }
    document.getElementById('modal1').getElementsByClassName('alert')[0].style.display = 'none' //Закрытие уведомления для modal1
}

async function addNote() {
    let title = document.getElementsByClassName("titleEdit")[1] //Получения значения из поля редактирования названия модального окна
    let price = document.getElementsByClassName("priceEdit")[1] //Получения значения из поля редактирования цены модального окна
    let alertWarn = document.getElementById("modalAdd").getElementsByClassName("alert")[0] //Получение уведомления для modalAdd
    if (!title.value.trim() || !price.value.trim()) { //Проверка на пустые значения
        alertWarn.innerHTML = 'Заполните поля "название" и "стоимость"'
        alertWarn.style.display = "block" //Отображение уведомления
    } else {
        await eel.add(title.value, price.value, globalLogin)
        document.location = "#"
        newMessage("Новая запись успешно созданна") //Отправка нового сообщения
        title.value = ""
        price.value = ""
        alertWarn.style.display = "none" //Скрытие уведомления для modalAdd
    }
}



async function openSettings() {
    let modal = document.getElementById("modalSettings")
        //Установка значений в поля
    modal.getElementsByClassName("name")[0].value = globalUser[0]
    modal.getElementsByClassName("login")[0].value = globalUser[1]
    modal.getElementsByClassName("incomeEdit")[0].value = globalUser[3]
    modal.getElementsByClassName("dateEdit")[0].value = globalUser[5]
}

function openAll() { //Функция для открытия первого элемента настроек
    let modal = document.getElementById("modalSettings")
    modal.getElementsByClassName('balance')[0].style.display = 'none';
    modal.getElementsByClassName('password')[0].style.display = 'none';
    modal.getElementsByClassName('all')[0].style.display = 'block';
    modal.getElementsByClassName('allHref')[0].classList.add("active")
    modal.getElementsByClassName('passwordHref')[0].classList.remove("active")
    modal.getElementsByClassName('balanceHref')[0].classList.remove("active")
    modal.getElementsByClassName("alert")[0].style.display = ""
}

function openPassword() { //Функция для открытия второго элемента настроек
    let modal = document.getElementById("modalSettings")
    modal.getElementsByClassName('balance')[0].style.display = 'none';
    modal.getElementsByClassName('password')[0].style.display = 'block';
    modal.getElementsByClassName('all')[0].style.display = 'none';
    modal.getElementsByClassName('allHref')[0].classList.remove("active")
    modal.getElementsByClassName('passwordHref')[0].classList.add("active")
    modal.getElementsByClassName('balanceHref')[0].classList.remove("active")
    modal.getElementsByClassName("alert")[0].style.display = ""
}

function openBalance() { //Функция для открытия третьего элемента настроек
    let modal = document.getElementById("modalSettings")
    modal.getElementsByClassName('balance')[0].style.display = 'block';
    modal.getElementsByClassName('password')[0].style.display = 'none';
    modal.getElementsByClassName('all')[0].style.display = 'none';
    modal.getElementsByClassName('allHref')[0].classList.remove("active")
    modal.getElementsByClassName('passwordHref')[0].classList.remove("active")
    modal.getElementsByClassName('balanceHref')[0].classList.add("active")
    modal.getElementsByClassName("alert")[0].style.display = ""
}

function closeSettings() { //Функция для закрытия настроек
    document.location = '#';
    document.getElementById('modalSettings').getElementsByClassName('alert')[0].style.display = 'none'

    document.getElementById('modalSettings').getElementsByClassName('balance')[0].style.display = 'none';
    document.getElementById('modalSettings').getElementsByClassName('password')[0].style.display = 'none';
    document.getElementById('modalSettings').getElementsByClassName('all')[0].style.display = 'none';
    document.getElementById('modalSettings').getElementsByClassName('allHref')[0].classList.remove("active")
    document.getElementById('modalSettings').getElementsByClassName('passwordHref')[0].classList.remove("active")
    document.getElementById('modalSettings').getElementsByClassName('balanceHref')[0].classList.remove("active")
}

async function setUserValue() {
    let name = document.getElementsByClassName("name")[0].value
    let login = document.getElementsByClassName("login")[0].value
    let password = document.getElementsByClassName("password")[0].value
    let income = document.getElementsByClassName("incomeEdit")[0].value
    let date = document.getElementsByClassName("dateEdit")[0].value
    let alertWarn = document.getElementById("modalSettings").getElementsByClassName("alert")[0] //Получение уведомления для modalSettings
    if (name == globalUser[0] && login == globalUser[1] && password == globalUser[2] && income == globalUser[3] && date == globalUser[5]) {
        alertWarn.innerHTML = 'Значения идентичны'
        alertWarn.style.display = "block" //Отображение уведомления
    } else if (!name.trim() || !income.trim() || !login.trim() || !password.trim()) {
        alertWarn.innerHTML = 'Заполните поля "Имя", "Логин", "Пароль и "Зарплата"'
        alertWarn.style.display = "block" //Отображение уведомления
    } else if (login != globalUser[1] && await eel.isLoginFree(login)() == false) {
        alertWarn.innerHTML = 'Логин занят'
        alertWarn.style.display = "block" //Отображение уведомления 
    } else {
        await eel.setUser(name, login, password, income, date, globalUser[1]) //Установка значений в бд
        if (login != globalLogin[1]) {
            localStorage.setItem("login", login)
        }
        newMessage("Настройки успешно обновленны") //Отправка нового сообщения
        globalLogin = login
        globalUser = await eel.getUser(globalLogin)()
        alertWarn.style.display = "none"
        document.location = "#"
    }
}

async function deleteUser() {
    let password = prompt("Для удаления аккаунта введите ваш пароль") //Подтверждение на удаление
    if (password == globalUser[2]) {
        await eel.deleteUser(globalLogin)
        document.location = "#modalRegister"
        exit()
    } else {
        document.location = "#"
    }
}


function newMessage(msg) {
    divAlert = document.createElement("div")
    lastAlert = document.getElementsByClassName("downAlert")
    divAlert.innerHTML = ' <span class="closebtn" onclick="deleteMessage(this)">&#x2715;</span>' + msg //Установка сообщения в уведомление
    if (alerts == 0) { //Если кольчество сообщений == 0 то
        divAlert.className = "downAlert newAlert" //Для нового сообщения создаётся классы
        document.getElementsByClassName("modal")[document.getElementsByClassName("modal").length - 1].after(divAlert) //Установка уведмления в конец страницы 
    } else if (alerts > 0 && alerts < 3) { //Если кольчество новых сообщений от 1 до 2 включительно то 
        document.getElementsByClassName("newAlert")[0].classList.remove("newAlert") //Удаление у старого сообщения класса newAlert
        divAlert.className = "downAlert newAlert" //Для нового сообщения создаётся классы
        lastAlert[0].before(divAlert) //Установка нового сообщения в начало предыдущих
    } else {
        document.getElementsByClassName("newAlert")[0].classList.remove("newAlert") //Удаление у старого сообщения класса newAlert
        alerts -= 1 //Минус один alert т.к. удаляется одно сообщение
        divAlert.className = "downAlert newAlert" //Для нового сообщения создаётся классы
        document.getElementsByClassName("downAlert")[document.getElementsByClassName("downAlert").length - 1].remove() //Удаляется 4 сообщение 
        lastAlert[0].before(divAlert) //Установка нового сообщения в начало предыдущих
    }
    alerts += 1
}

function deleteMessage(element) {
    if (element.parentElement.classList.contains("newAlert") && alerts != 1) { //Если у сообщения есть класс newAlert и количество alerts не 1 то
        element.parentElement.remove() //Удаление сообщения
        document.getElementsByClassName("downAlert")[0].classList.add("newAlert") //Добавление верхнему сообщению класса newAlert
    } else {
        element.parentElement.remove() //Удаление сообщения
    }
    alerts -= 1 //Минус один alert т.к. удаляется одно сообщение
}

async function register() {
    let modal = document.getElementById("modalRegister") //Ссылка на modal окно
    let name = modal.getElementsByClassName("name")[0].value //Получение имени
    let login = modal.getElementsByClassName("loginRegister")[0].value //Получение логина
    let password = modal.getElementsByClassName("password")[0].value //Получение пароля
    let income = modal.getElementsByClassName("incomeRegister")[0].value //Получение зп
    let date = modal.getElementsByClassName("dateRegister")[0].value //Получение даты

    let isLoginFree = await eel.isLoginFree(login)() //Проверка свободен ли логин

    if (!login.trim() || !password.trim() || !income.trim() || !date.trim() || !name.trim()) { //Проверка на пустые строки
        modal.getElementsByClassName("alert")[0].innerHTML = "Заполните все поля"
        modal.getElementsByClassName("alert")[0].style.display = "block"
    } else if (isLoginFree == false) { //Проверка на занятость логина
        modal.getElementsByClassName("alert")[0].innerHTML = "Логин занят выберите другой"
        modal.getElementsByClassName("alert")[0].style.display = "block"
    } else {
        await eel.newUser(name, login, password, income, date) //Создание нового пользователя
        globalLogin = login
        localStorage.setItem("login", globalLogin) //Установка login в localstorage
        clearTable() //Очистка таблицы
        await eel.start(globalLogin) //Вызов python стартовой функции
        globalUser = await eel.getUser(globalLogin)() //Получение оставшихся данных пользователя по login
        modal.getElementsByClassName("alert")[0].display = "none" //Отключение сообщения об ошибке
        document.getElementsByClassName("sidenav")[0].style.display = "flex" //Включение левого меню
        document.location = "#" //Переход на главный экран

        //Сброс значений
        modal.getElementsByClassName("name")[0].value = ""
        modal.getElementsByClassName("loginRegister")[0].value = ""
        modal.getElementsByClassName("password")[0].value = ""
        modal.getElementsByClassName("incomeRegister")[0].value = ""
        modal.getElementsByClassName("dateRegister")[0].value = ""
    }
}

function clearTable() { // Удаление всех рядов кроме 1, то есть названий
    for (let i = document.getElementsByClassName("rowExpenses").length - 1; i != 0; i--) { //i = количество рядов в таблице - 1, так как отсчёт с 0; выполняется пока i не равно 0; при каждой итерации i - 1       
        document.getElementsByClassName("rowExpenses")[i].remove() //Удаление ряда
    }
}

async function login() {
    let modal = document.getElementById("modalLogin") //Ссылка на modal окно
    let login = modal.getElementsByClassName("login")[0].value //Получение логина
    let password = modal.getElementsByClassName("password")[0].value //Получение пароля
    let alert = modal.getElementsByClassName("alert")[0] //Сообщение об ошибке

    if (!login.trim() || !password.trim()) { //Проверка на пустые значения
        alert.style.display = "block"
        alert.innerHTML = 'Заполните поля "Логин" и "Пароль"'

    } else {
        let anwer = await eel.checkLogin(login, password)() //Проверка на существование пользователя; ответ true или false
        if (anwer) { //Проверка есть ли такой пользователь
            globalUser = await eel.getUser(login)() //Получение данных о пользователе из массива ответа
            globalLogin = globalUser[1] //Установка globalLogin
            localStorage.setItem("login", globalLogin) //Установка login в localstorage
            clearTable() //Очистка таблицы
            await eel.start(globalLogin) //Запуск python стартовой функции

            alert.style.display = "none" //Отключение уведомления об ошибке
            document.getElementsByClassName("sidenav")[0].style.display = "flex" //Включение левого меню
            document.location = "#" //Переход на домашнюю страницу
            modal.getElementsByClassName("login")[0].value = "" //Сброс значений
            modal.getElementsByClassName("password")[0].value = "" //Сброс значений
        } else { //Если пользователь не был найден
            alert.style.display = "block"
            alert.innerHTML = 'Логин или пароль неверны'
        }
    }
}

function exit() {
    localStorage.removeItem('login') //Удаление логина из localstorage
    document.getElementsByClassName('sidenav')[0].style.display = 'none' //Отключение левого меню
    let messages = document.getElementsByClassName("downAlert") //Поиск всех сообщений
    messages = Array.from(messages) //Перевод htmlCollection в array
    messages.map(function(alert) { //Удаление каждого элемента массива
        return alert.remove()
    })
    alerts = 0
}

//Функция для скрытия/показа пароля; Аргумент родительский div
function showHidePassword(passwordInput) {
    let input = passwordInput.getElementsByClassName("password")[0]
    let button = passwordInput.querySelector("span i")

    if (input.type == "password") {
        input.type = "text"
        button.classList.add("hide-btn")
    } else {
        input.type = "password"
        button.classList.remove("hide-btn")
    }
}

function changeBalance(arg) {
    modal = document.getElementById("modalSettings")
    input = modal.getElementsByClassName("action")[0].value
    if (input.trim()) {
        if (arg) {
            balance = globalUser[4] + Number(input)
            eel.changeBalance(balance)
        } else {
            balance = globalUser[4] - Number(input)
            eel.changeBalance(balance)
        }
        modal.getElementsByClassName("alert")[0].style.display = "none"
        globalUser[4] = balance
        document.getElementById("modalSettings").getElementsByClassName("action")[0].value = ""
    }
    else{
        modal.getElementsByClassName("alert")[0].style.display = "block"
        modal.getElementsByClassName("alert")[0].innerHTML = "Заполните поле"
    }
}