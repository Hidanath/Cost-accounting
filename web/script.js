let globalId = 0 //Переменная для передачи id между функциями
let globalUser = []
let alerts = 0
window.onload = async function(){ //При полной загрузке страницы запуск python функции
    if (localStorage.getItem("id") != null){
        globalId = localStorage.getItem("id")
        await eel.start(globalId);
        globalUser = await eel.getUser(globalId)()
        openSettings()
    }
    else{
        document.getElementsByClassName("sidenav")[0].style.display = "none"
        document.location = "#modalRegister"
    }
}

eel.expose(addToTable) //Декоратор чтобы функцию можно было вызвать из python
function addToTable(title, price, date, id){
    let tr = document.createElement("tr") //Создание элемента tr
    let atr = ["title", "price", "date", "id"] //Создание массива классов
    let arrayOfValue = [title, price, date, id] //Создание массива значений
    let allTr = document.querySelectorAll(".rowExpenses") //Поиск всех элементов с классом rowExpenses

    tr.className = "rowExpenses" //Добавление класса rowExpenses объекту tr
    tr.setAttribute("onclick", 'modalEditSetValue(this.id)') //Добавления действия открытия модального окна
    tr.id = id 

    for (let x = 0; x < 4; x++){
        let td = document.createElement("td") //Создание элемента td
        td.className = atr[x] //Добавление ему класса
        td.innerHTML = arrayOfValue[x] //Добавление ему значения
        tr.append(td) //Добавление элемента td в элемент tr
    }

    allTr[allTr.length - 1].after(tr) //Добавление элемента tr в конец всех элементов
}

eel.expose(setBalance)
function setBalance(balance){
    document.getElementsByClassName("balance")[0].innerHTML = balance
}

function modalEditSetValue(id){
    document.location ="#modal1" //Открытие модального окна
    let row = document.getElementById(id) //Получение ряда по id 
    let title = row.getElementsByClassName("title") //Получение названия в ряде
    let price = row.getElementsByClassName("price") //Получение цены в ряде
    let titleEdit = document.getElementsByClassName("titleEdit") //Получение поля редактирования названия в модальном окне 
    let priceEdit = document.getElementsByClassName("priceEdit") //Получение поля редактирования цены в модальном окне
    titleEdit[0].value = title[0].textContent //Установка названия в поле редактирования в модальном окне
    priceEdit[0].value = price[0].textContent //Установка цены в поле редактирования в модальном окне
    globalId = id
}

async function updateValuesInDB(){
    let row = document.getElementById(globalId) //Получение ряда по id 
    let lastTitle = row.getElementsByClassName("title")[0].textContent //Получение названия в ряде
    let lastPrice = row.getElementsByClassName("price")[0].textContent //Получение цены в ряде
    let title = document.getElementsByClassName("titleEdit")[0].value //Получения значения из поля редактирования названия модального окна
    let price = document.getElementsByClassName("priceEdit")[0].value //Получения значения из поля редактирования цены модального окна
    let alertWarn = document.getElementById("modal1").getElementsByClassName("alert")[0] //Получение уведомления для modal1
    if (lastTitle.trim() == title.trim() && lastPrice.trim() == price.trim()){ //Проверка на идентичность значений
        alertWarn.innerHTML = "Значения идентичны"
        alertWarn.style.display = "block" //Отображение уведомления
    }
    else if (!title.trim() || !price.trim()){ //Проверка на пустые значения
        alertWarn.innerHTML = 'Заполните поля "Названия" и "Стоимости"'
        alertWarn.style.display = "block"  //Отображение уведомления
    }

    else{
        await eel.updateValues(title, price, globalId) //Вызов python функции для обновления значений
        document.getElementById(globalId).getElementsByClassName("title")[0].textContent = title //Обновления значения названия в таблице
        document.getElementById(globalId).getElementsByClassName("price")[0].textContent = price //Обновления значения цены в таблице
        newMessage("Значения обновленны") //Отправка нового сообщения
        alertWarn.style.display = "none" //Скрытие уведомления
        document.location = "#" //Закрытие модального окна
    }
}

async function deleteRowJS(){
    let result = confirm("Вы уверены что хотите удалить запись") //Подтверждение на удаление
    if (result == true){
        await eel.deleteRow(globalId) //Вызов python функции для удаления ряда
        document.getElementById(globalId).parentElement.removeChild(document.getElementById(globalId)) //Удаление ряда в таблице
        newMessage("Запись успешно удаленна") //Отправка нового сообщения
        document.location = "#" //Закрытие модального окна

    }
    else{
        document.location = "#" //Закрытие модального окна
    }
    document.getElementById('modal1').getElementsByClassName('alert')[0].style.display = 'none' //Закрытие уведомления для modal1
}

async function addNote(){
    let title = document.getElementsByClassName("titleEdit")[1] //Получения значения из поля редактирования названия модального окна
    let price = document.getElementsByClassName("priceEdit")[1] //Получения значения из поля редактирования цены модального окна
    let alertWarn = document.getElementById("modalAdd").getElementsByClassName("alert")[0] //Получение уведомления для modalAdd
    if (!title.value.trim() || !price.value.trim()){ //Проверка на пустые значения
        alertWarn.innerHTML = 'Заполните поля "название" и "стоимость"'
        alertWarn.style.display = "block" //Отображение уведомления
    }
    else{
        await eel.add(title.value, price.value)
        document.location = "#"
        newMessage("Новая запись успешно созданна") //Отправка нового сообщения
        title.value = ""
        price.value = ""
        alertWarn.style.display = "none" //Скрытие уведомления для modalAdd
    }
}

async function openSettings(){
    let modal = document.getElementById("modalSettings")
    //Установка значений в поля
    modal.getElementsByClassName("name")[0].value = globalUser[0] 
    modal.getElementsByClassName("login")[0].value = globalUser[1]
    modal.getElementsByClassName("password")[0].value = globalUser[2]
    modal.getElementsByClassName("incomeEdit")[0].value = globalUser[3]
    modal.getElementsByClassName("dateEdit")[0].value = globalUser[5]
}

async function setUserValue(){
    let name = document.getElementsByClassName("name")[0].value
    let login = document.getElementsByClassName("login")[0].value
    let password = document.getElementsByClassName("password")[0].value
    let income = document.getElementsByClassName("incomeEdit")[0].value
    let date = document.getElementsByClassName("dateEdit")[0].value
    let alertWarn = document.getElementById("modalSettings").getElementsByClassName("alert")[0] //Получение уведомления для modalSettings
    if(name == globalUser[0] && login == globalUser[1] && password == globalUser[2] && income == globalUser[3] && date == globalUser[5]){
        alertWarn.innerHTML = 'Значения идентичны'
        alertWarn.style.display = "block" //Отображение уведомления
    }
    else if (!name.trim() || !income.trim() || !login.trim() || !password.trim()){
        alertWarn.innerHTML = 'Заполните поля "Имя", "Логин", "Пароль и "Зарплата"'
        alertWarn.style.display = "block" //Отображение уведомления
    }
    else{
        await eel.setUser(name, login, password, income, date, globalId) //Установка значений в бд
        newMessage("Настройки успешно обновленны") //Отправка нового сообщения
        alertWarn.style.display = "none"
        document.location = "#"
    }
}



function newMessage(msg){
    divAlert = document.createElement("div")
    lastAlert = document.getElementsByClassName("downAlert")
    divAlert.innerHTML = ' <span class="closebtn" onclick="deleteMessage(this)">&#x2715;</span>' + msg //Установка сообщения в уведомление
    if(alerts == 0){ //Если кольчество сообщений == 0 то
        divAlert.className = "downAlert newAlert" //Для нового сообщения создаётся классы
        document.getElementsByClassName("modal")[document.getElementsByClassName("modal").length - 1].after(divAlert) //Установка уведмления в конец страницы 
    }
    else if (alerts > 0 && alerts < 3){ //Если кольчество новых сообщений от 1 до 2 включительно то 
        document.getElementsByClassName("newAlert")[0].classList.remove("newAlert") //Удаление у старого сообщения класса newAlert
        divAlert.className = "downAlert newAlert" //Для нового сообщения создаётся классы
        lastAlert[0].before(divAlert) //Установка нового сообщения в начало предыдущих
    }
    else{
        document.getElementsByClassName("newAlert")[0].classList.remove("newAlert") //Удаление у старого сообщения класса newAlert
        alerts -= 1 //Минус один alert т.к. удаляется одно сообщение
        divAlert.className = "downAlert newAlert" //Для нового сообщения создаётся классы
        document.getElementsByClassName("downAlert")[document.getElementsByClassName("downAlert").length - 1].remove() //Удаляется 4 сообщение 
        lastAlert[0].before(divAlert) //Установка нового сообщения в начало предыдущих
    }
    alerts += 1
}

function deleteMessage(element){
    if(element.parentElement.classList.contains("newAlert") && alerts != 1){ //Если у сообщения есть класс newAlert и количество alerts не 1 то
        element.parentElement.remove() //Удаление сообщения
        document.getElementsByClassName("downAlert")[0].classList.add("newAlert") //Добавление верхнему сообщению класса newAlert
    }
    else{
        element.parentElement.remove() //Удаление сообщения
    }
    alerts -= 1 //Минус один alert т.к. удаляется одно сообщение
}

async function register(){
    let modal = document.getElementById("modalRegister")
    let name = modal.getElementsByClassName("name")[0].value
    let username = modal.getElementsByClassName("usernameRegister")[0].value
    let password = modal.getElementsByClassName("password")[0].value
    let income = modal.getElementsByClassName("incomeRegister")[0].value
    let date = modal.getElementsByClassName("dateRegister")[0].value

    if (!username.trim() || !password.trim() || !income.trim() || !date.trim() || !name.trim()){
        modal.getElementsByClassName("alert")[0].innerHTML = "Заполните все поля"
        modal.getElementsByClassName("alert")[0].style.display = "block"
    }
    else{
        modal.getElementsByClassName("alert")[0].display = "none"
        globalId = await eel.newUser(name, username, password, income, date)()
        localStorage.setItem("id", globalId)
        await eel.start(globalId)
        globalUser = await eel.getUser(globalId)()
        document.getElementsByClassName("sidenav")[0].style.display = "block"
        console.log(globalId)
        document.location = "#"
    }
}

async function login(){
    let modal = document.getElementById("modalLogin")
    let username = modal.getElementsByClassName("login")[0].value
    let password = modal.getElementsByClassName("password")[0].value

    if(!username.trim() || !password.trim()){
        console.log("GG")
    }
    else{
        let anwer = await eel.checkLogin(username, password)()
        if(anwer[0]){
            globalUser = await eel.getUser(anwer[1])() // Указать id замена 1
            globalId = globalUser[6]
            localStorage.setItem("id", globalId)
            await eel.start(globalId)
            document.getElementsByClassName("sidenav")[0].style.display = "block"
            document.location = "#"
        }
        else{
            console.log("Пользователь ненайден")
        }
    }
}