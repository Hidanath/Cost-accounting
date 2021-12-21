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
    let titleEdit = document.getElementById("modal1").getElementsByClassName("titleEdit") //Получение поля редактирования названия в модальном окне 
    let priceEdit = document.getElementById("modal1").getElementsByClassName("priceEdit") //Получение поля редактирования цены в модальном окне
    titleEdit[0].value = title[0].textContent //Установка названия в поле редактирования в модальном окне
    priceEdit[0].value = price[0].textContent //Установка цены в поле редактирования в модальном окне
    globalRowId = id
}

async function updateValuesInDB() {
    let row = document.getElementById(globalRowId) //Получение ряда по id 
    let modal = document.getElementById("modal1")
    let errorSpans = Array.from(modal.getElementsByClassName("errorSpan"))
    let inputs = Array.from(modal.querySelectorAll("input"))
    let lastTitle = row.getElementsByClassName("title")[0].textContent.trim() //Получение названия в ряде
    let lastPrice = row.getElementsByClassName("price")[0].textContent.trim() //Получение цены в ряде
    let title = inputs[0].value.trim() //Получения значения из поля редактирования названия модального окна
    let price = inputs[1].value.trim() //Получения значения из поля редактирования цены модального окна

    if (!title) {
        errorSpans[0].innerHTML = "Укажите название записи"
        errorSpans[0].style.display = "block"
        inputs[0].classList.add("errorInput")
    }
    else{
        errorSpans[0].style.display = "none"
        inputs[0].classList.remove("errorInput")
    }


    if (!price) { //Проверка на пустые значения
        errorSpans[1].innerHTML = "Укажите стоимость"
        errorSpans[1].style.display = "block"
        inputs[1].classList.add("errorInput")
    }
    else{
        errorSpans[1].style.display = "none"
        inputs[1].classList.remove("errorInput")
    }

    if((price && title) && (title != lastTitle || price != lastPrice)) {
        await eel.updateValues(title, price, globalRowId) //Вызов python функции для обновления значений
        row.getElementsByClassName("title")[0].textContent = title //Обновления значения названия в таблице
        row.getElementsByClassName("price")[0].textContent = price //Обновления значения цены в таблице
        newMessage("Значения обновленны") //Отправка нового сообщения
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
}

async function addNote() {
    let inputs = Array.from(document.getElementById("modalAdd").querySelectorAll("input"))
    let errorSpan = Array.from(document.getElementById("modalAdd").getElementsByClassName("errorSpan")) //Получение уведомления для modalAdd
    let title = inputs[0].value.trim() //Получения значения из поля редактирования названия модального окна
    let price = inputs[1].value.trim() //Получения значения из поля редактирования цены модального окна
    if (!title) { //Проверка на пустые значения
        inputs[0].classList.add("errorInput")
        errorSpan[0].innerHTML = 'Укажите название записи'
        errorSpan[0].style.display = "block" //Отображение уведомления
    }
    else{
        inputs[0].classList.remove("errorInput")
        errorSpan[0].style.display = "none"
    }

    if (!price){
        inputs[1].classList.add("errorInput")
        errorSpan[1].innerHTML = 'Укажите цену записи'
        errorSpan[1].style.display = "block" //Отображение уведомления
    }
    else{
        inputs[1].classList.remove("errorInput")
        errorSpan[1].style.display = "none"
    }

    if (title && price) {
        await eel.add(title, price, globalLogin)
        document.location = "#"
        newMessage("Новая запись успешно созданна") //Отправка нового сообщения

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

    Array.from(document.getElementById("modalSettings").getElementsByClassName("errorSpan")).map(function(el){
        el.style.display = "none"
    })
    
    Array.from(document.getElementById("modalSettings").querySelectorAll("input")).map(function(el){
        el.classList.remove("errorInput")
    })
}

async function setUserValue() {
    let modal = document.getElementById("modalSettings")
    let modalAll = modal.getElementsByClassName("all")[0]
    let modalPassword = modal.getElementsByClassName("password")[0]
    let modalBalance = modal.getElementsByClassName("balance")[0]
    let name = modal.getElementsByClassName("name")[0].value.trim()
    let login = modal.getElementsByClassName("login")[0].value.trim()
    let oldPassword = modal.getElementsByClassName("oldPassword")[0].value.trim()
    let newPassword = modal.getElementsByClassName("newPassword")[0].value.trim()
    let income = modal.getElementsByClassName("incomeEdit")[0].value.trim()
    let date = modal.getElementsByClassName("dateEdit")[0].value.trim()
    let update = false
    
    // Проверка имени
    if (name != globalUser[0] && name) {
        eel.setUserElement(name, "name", globalLogin)
        update = true
    }
    else if (!name){
        modalAll.getElementsByClassName("name")[0].classList.add("errorInput")
        modalAll.getElementsByClassName("errorSpan")[0].innerHTML = "Укажите новое имя"
        modalAll.getElementsByClassName("errorSpan")[0].style.display = "block"
    }
    else{
        modalAll.getElementsByClassName("name")[0].classList.remove("errorInput")
        modalAll.getElementsByClassName("errorSpan")[0].style.display = "none"
    }
    
    // Проверка логина
    if (login != globalUser[1] && login) {
        eel.setUserElement(login, "login", globalLogin)
        localStorage.setItem("login", login)
        globalLogin = login
        update = true
    }
    else if(!login){
        modalAll.getElementsByClassName("login")[0].classList.add("errorInput")
        modalAll.getElementsByClassName("errorSpan")[1].innerHTML = "Укажите новый логин"
        modalAll.getElementsByClassName("errorSpan")[1].style.display = "block"
    }
    else{
        modalAll.getElementsByClassName("errorSpan")[1].style.display = "none"
        modalAll.getElementsByClassName("login")[0].classList.remove("errorInput")
    }

    // Проверка пароля
    if (newPassword != globalUser[2] && oldPassword == globalUser[2] && oldPassword && newPassword) {
        eel.setUserElement(password, "password", globalLogin)
        update = true
    }
    else if(oldPassword != globalUser[2] && oldPassword){
        modalPassword.getElementsByClassName("oldPassword")[0].classList.add("errorInput")
        modalPassword.getElementsByClassName("errorSpan")[0].innerHTML = "Старый пароль неверный"
        modalPassword.getElementsByClassName("errorSpan")[0].style.display = "contents"
    }
    else if (newPassword == globalUser[2] && newPassword){
        modalPassword.getElementsByClassName("newPassword")[0].classList.add("errorInput")
        modalPassword.getElementsByClassName("errorSpan")[1].innerHTML = "Старый и новый пароль одинаковы"
        modalPassword.getElementsByClassName("errorSpan")[1].style.display = "contents"
    }
    else{
        modalPassword.getElementsByClassName("errorSpan")[0].style.display = "none"
        modalPassword.getElementsByClassName("errorSpan")[1].style.display = "none"
        modalPassword.getElementsByClassName("newPassword")[0].classList.remove("errorInput")
        modalPassword.getElementsByClassName("oldPassword")[0].classList.remove("errorInput")
    }

    // Проверка заработка
    if (income != globalUser[3] && income) {
        eel.setUserElement(income, "income", globalLogin)
        update = true
    }
    else if(!income){
        modalBalance.getElementsByClassName("incomeEdit")[0].classList.add("errorInput")
        modalBalance.getElementsByClassName("errorSpan")[0].innerHTML = "Укажите свой доход"
        modalBalance.getElementsByClassName("errorSpan")[0].style.display = "block"
    }
    else{
        modalBalance.getElementsByClassName("errorSpan")[0].style.display = "none"
        modalBalance.getElementsByClassName("incomeEdit")[0].classList.remove("errorInput")
    }

    // Проверка даты
    if (date != globalUser[5]) {
        eel.setUserElement(date, "date", globalLogin)
        update = true
    }

    if(update){
        newMessage("Настройки успешно обновленны") //Отправка нового сообщения
        globalUser = await eel.getUser(globalLogin)()
        let inputs = Array.from(modal.querySelectorAll("input"))
        let erorrSpans = Array.from(modal.querySelectorAll("i"))
        inputs.map(function(el){
            el.classList.remove("errorInput")
        })

        erorrSpans.map(function(el){
            el.style.display = "none"
        })

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
    let errorSpans = Array.from(modal.getElementsByClassName("errorSpan"))
    let inputs = Array.from(modal.querySelectorAll("input"))
    let name = inputs[0].value.trim() //Получение имени
    let login = inputs[1].value.trim() //Получение логина
    let password = inputs[2].value.trim() //Получение пароля
    let income = inputs[3].value.trim() //Получение зп
    let date = inputs[4].value.trim() //Получение даты
    let isLoginFree = null

    if (login){
        isLoginFree = await eel.isLoginFree(login)() //Проверка свободен ли логин
    }


    if (!name) { //Проверка на пустые значения
        errorSpans[0].style.display = "block"
        errorSpans[0].innerHTML = 'Укажите ваше имя'
        inputs[0].classList.add("errorInput")
    }
    else{
        errorSpans[0].style.display = "none"
        inputs[0].classList.remove("errorInput")
    }

    if (!login) { //Проверка на пустые значения
        errorSpans[1].style.display = "block"
        errorSpans[1].innerHTML = 'Укажите ваш логин'
        inputs[1].classList.add("errorInput")
    }
    else{
        errorSpans[1].style.display = "none"
        inputs[1].classList.remove("errorInput")
    }

    if (!password) { //Проверка на пустые значения
        errorSpans[2].style.display = "contents"
        errorSpans[2].innerHTML = 'Укажите ваш пароль'
        inputs[2].classList.add("errorInput")
    }
    else{
        errorSpans[2].style.display = "none"
        inputs[2].classList.remove("errorInput")
    }

    if (!income) { //Проверка на пустые значения
        errorSpans[3].style.display = "block"
        errorSpans[3].innerHTML = 'Укажите ваш доход'
        inputs[3].classList.add("errorInput")
    }
    else{
        errorSpans[3].style.display = "none"
        inputs[3].classList.remove("errorInput")
    }

    if (!date) { //Проверка на пустые значения
        errorSpans[4].style.display = "block"
        errorSpans[4].innerHTML = 'Укажите дату получения зарплаты'
        inputs[4].classList.add("errorInput")
    }
    else{
        errorSpans[4].style.display = "none"
        inputs[4].classList.remove("errorInput")
    }
    
    if (!isLoginFree && login) { //Проверка на занятость логина
        errorSpans[1].style.display = "block"
        errorSpans[1].innerHTML = 'Логин занят выберите другой'
        inputs[1].classList.add("errorInput")
    } 
    else if(isLoginFree != null || isLoginFree){
        errorSpans[1].style.display = "none"
        inputs[1].classList.remove("errorInput")
    }
    
    if(name && login && password && income && date && isLoginFree){
        await eel.newUser(name, login, password, income, date) //Создание нового пользователя
        globalLogin = login
        localStorage.setItem("login", globalLogin) //Установка login в localstorage
        clearTable() //Очистка таблицы
        await eel.start(globalLogin) //Вызов python стартовой функции
        globalUser = await eel.getUser(globalLogin)() //Получение оставшихся данных пользователя по login
        document.getElementsByClassName("sidenav")[0].style.display = "flex" //Включение левого меню
        document.location = "#" //Переход на главный экран

        //Сброс значений
        inputs.map(function(el){
            el.value = ""
        })
    }
}

function clearTable() { // Удаление всех рядов кроме 1, то есть названий
    for (let i = document.getElementsByClassName("rowExpenses").length - 1; i != 0; i--) { //i = количество рядов в таблице - 1, так как отсчёт с 0; выполняется пока i не равно 0; при каждой итерации i - 1       
        document.getElementsByClassName("rowExpenses")[i].remove() //Удаление ряда
    }
}

async function login() {
    let modal = document.getElementById("modalLogin") //Ссылка на modal окно
    let inputs = Array.from(modal.querySelectorAll("input"))
    let login = inputs[0].value.trim() //Получение логина
    let password = inputs[1].value.trim() //Получение пароля
    let errorSpans = Array.from(modal.getElementsByClassName("errorSpan"))

    if (!login) { //Проверка на пустые значения
        errorSpans[0].style.display = "block"
        errorSpans[0].innerHTML = 'Укажите логин'
        inputs[0].classList.add("errorInput")
    }
    else{
        errorSpans[0].style.display = "none"
        inputs[0].classList.remove("errorInput")
    }

    if(!password){
        errorSpans[1].style.display = "contents"
        errorSpans[1].innerHTML = 'Укажите пароль'
        inputs[1].classList.add("errorInput")
    }
    else{
        errorSpans[1].style.display = "none"
        inputs[1].classList.remove("errorInput")
    }

    if(password && login) {
        let anwer = await eel.checkLogin(login, password)() //Проверка на существование пользователя; ответ true или false
        if (anwer) { //Проверка есть ли такой пользователь
            globalUser = await eel.getUser(login)() //Получение данных о пользователе из массива ответа
            globalLogin = globalUser[1] //Установка globalLogin
            localStorage.setItem("login", globalLogin) //Установка login в localstorage
            clearTable() //Очистка таблицы
            await eel.start(globalLogin) //Запуск python стартовой функции

            document.getElementsByClassName("sidenav")[0].style.display = "flex" //Включение левого меню
            document.location = "#" //Переход на домашнюю страницу
            modal.getElementsByClassName("login")[0].value = "" //Сброс значений
            modal.getElementsByClassName("password")[0].value = "" //Сброс значений

            errorSpans[1].style.display = "none"
            inputs[0].classList.remove("errorInput")
            inputs[1].classList.remove("errorInput")
        } 
        else { //Если пользователь не был найден
            errorSpans[1].style.display = "contents"
            errorSpans[1].innerHTML = 'Логин или пароль неверен'
            inputs[0].classList.add("errorInput")
            inputs[1].classList.add("errorInput")
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
    let button = passwordInput.querySelector("i")

    if (input.type == "password") {
        input.type = "text"
        button.classList.add("hide-btn")
    } else {
        input.type = "password"
        button.classList.remove("hide-btn")
    }
}

function changeBalance(arg) {
    let modal = document.getElementById("modalSettings").getElementsByClassName("balance")[0]
    let errorSpan = modal.getElementsByClassName("errorSpan")[2]
    let input = modal.getElementsByClassName("action")[0].value.trim()
    if (input) {
        modal.getElementsByClassName("action")[0].classList.remove("errorInput")
        errorSpan.style.display = "none"

        if (arg) {
            balance = globalUser[4] + Number(input)
            eel.changeBalance(balance)
        } else {
            balance = globalUser[4] - Number(input)
            eel.changeBalance(balance)
        }
        globalUser[4] = balance
        document.getElementById("modalSettings").getElementsByClassName("action")[0].value = ""
    }
    else{
        errorSpan.style.display = "block"
        errorSpan.innerHTML = "Укажите сумму"
        modal.getElementsByClassName("action")[0].classList.add("errorInput")
    }
}