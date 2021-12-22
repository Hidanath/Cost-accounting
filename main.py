import eel, sqlite3, datetime
from os import curdir, mkdir

try:
    with sqlite3.connect("db/database.db") as db: #Проверка существует ли база данных
        cursor = db.cursor()
        try:
            cursor.execute("SELECT * FROM expenses")
            print("База расходов обнаруженна")
        except: #Если выходит ошибка то создаётся база данных по шаблону
            cursor.execute("CREATE TABLE expenses(title TEXT, price FLOAT, date TEXT, forWhom TEXT, id INTEGER PRIMARY KEY AUTOINCREMENT)")
            print("База расходов не была обнаруженна поэтому была созданна новая по шаблону")

        try:
            cursor.execute("SELECT * FROM users")
            print("База пользователей обнаруженна")
        except: #Если выходит ошибка то создаётся база данных по шаблону
            cursor.execute("CREATE TABLE users(name TEXT, login TEXT PRIMARY KEY, password PASSWORD, income INTEGER, balance FLOAT, date TEXT, dateOfLastUpdate TEXT, isUpdateBalanceMounth TEXT)")
            print("База пользователей не была обнаруженна поэтому была созданна новая по шаблону")
        
        cursor.close()

except:
    mkdir("db")
    with sqlite3.connect("db/database.db") as db: #Проверка существует ли база данных
        cursor = db.cursor()
        try:
            cursor.execute("SELECT * FROM expenses")
            print("База расходов обнаруженна")
        except: #Если выходит ошибка то создаётся база данных по шаблону
            cursor.execute("CREATE TABLE expenses(title TEXT, price FLOAT, date TEXT, forWhom TEXT, id INTEGER PRIMARY KEY AUTOINCREMENT)")
            print("База расходов не была обнаруженна поэтому была созданна новая по шаблону")

        try:
            cursor.execute("SELECT * FROM users")
            print("База пользователей обнаруженна")
        except: #Если выходит ошибка то создаётся база данных по шаблону
            cursor.execute("CREATE TABLE users(name TEXT, login TEXT PRIMARY KEY, password PASSWORD, income INTEGER, balance FLOAT, date TEXT, dateOfLastUpdate TEXT, isUpdateBalanceMounth TEXT)")
            print("База пользователей не была обнаруженна поэтому была созданна новая по шаблону")
        
        cursor.close()

eel.init("web")
balance = 0 #Баланс
globalIncome = 0 #Заработок
user = [] #Массив с данными пользователя
userLogin = 0 #Login пользователя

@eel.expose
def start(login):
    global user, userLogin
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()

        #Получение значений из бд
        cursor.execute("SELECT * FROM expenses WHERE forWhom = ?", (login, ))
        info = cursor.fetchall()
        for row in info:
            eel.addToTable(row[0],row[1],row[2],row[4]) #Добавление всех данных из бд

        db.commit()
        #Получение и установка баланса
        user = getUser(login) #Получение данных пользователя
        userLogin = user[1]
        getBalance(login)
        eel.setBalance(balance) #Установка баланса на сайте      

def getBalance(login): #Получение баланса и заработка
    global balance, globalIncome
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT balance, income FROM users WHERE login = ?", (login, ))
        info = cursor.fetchall()
        balance = info[0][0] #Баланс
        globalIncome = info[0][1] #Заработок

def updateBalanceInDB(balance, login): #Запись нового баланса в бд
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("UPDATE users SET balance = ? WHERE login = ?", (balance, login))
        db.commit()

@eel.expose
def updateValues(title, price, id): #Обновление значений в бд
    global balance
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT price FROM expenses WHERE id = ?", (id, )) #Выбрать цену из базы данных по id
        balance += cursor.fetchall()[0][0] #Прибавляем к балансу цену записи
        db.commit()
        cursor.execute("UPDATE expenses SET title = ?, price = ?  WHERE id = ?", (title, float(price), id)) #Обновление значений по id
        balance -= float(price) #Отнимаем от баланса овую цену записи
        db.commit()
        updateBalanceInDB(balance, userLogin) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

@eel.expose
def deleteRow(id): #Удаление записи из бд
    global balance
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT price FROM expenses WHERE id = ?", (id, ))
        balance += cursor.fetchall()[0][0] #Прибавляем к балансу цену записи
        db.commit()
        cursor.execute("DELETE from expenses WHERE id = ?", (id, )) #Удаление записи по id
        db.commit()
        updateBalanceInDB(balance, userLogin) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

@eel.expose
def add(title, price, login): #Добавление новой записи
    global balance
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        data = (
            str(title),
            float(price),
            str(datetime.date.today()),
            str(login)
        )
        cursor.execute(f"INSERT INTO expenses(title, price, date, forWhom) VALUES(?,?,?,?)", data)
        db.commit()

        #Получение значений из бд
        cursor.execute("SELECT * FROM expenses WHERE forWhom = ?", (login, )) #Общая выборка по базе
        info = cursor.fetchall() #Получение ответа
        iteration = 0 #Количество итераций
        for row in info: #Перебор ответа
            if iteration == len(info)-1: #Если итерация == последниму элементу то добавление в таблицу новую строку
                eel.addToTable(row[0],row[1],row[2],row[4]) #Добавление данных из бд
            iteration += 1

        balance -= float(price) #Отнятие от баланса цены записи
        db.commit()
        updateBalanceInDB(balance, userLogin) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

@eel.expose
def getUser(login): #Получение данных пользователя
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE login = ?", (login, )) #Общая выборка
        info = cursor.fetchall() #Получение ответа
        data = [] #Массив ответа
        for row in info: #Добавление данных в массив
            data.append(row[0])
            data.append(row[1])
            data.append(row[2])
            data.append(row[3])
            data.append(row[4])
            data.append(row[5])
            data.append(row[6])
            if int(row[7]) == True:
                data.append(True)
            else:
                data.append(False)

        return data #Отправка ответа в js

@eel.expose
def setUserElement(element, typeOfElement, login): #Обновление значений пользователя
    global balance, userLogin, globalIncome
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        balance -= globalIncome #Отнимаем от баланса цену записи

        if typeOfElement == "income":
            globalIncome = float(element)

        db.commit()
        cursor.execute(f"UPDATE users SET {typeOfElement} = ? WHERE login = ?", (element, login)) #Обновление значений по login 
        db.commit()

        if element != login and typeOfElement == "login":
            cursor.execute("UPDATE expenses SET forWhom = ? WHERE forWhom = ?", (element, login))
            db.commit()
            userLogin = login

        balance += float(globalIncome) #Прибавляем к балансу цену записи
        updateBalanceInDB(balance, userLogin) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

@eel.expose
def newUser(name, login, password, income, date): #Регистрация нового пользователя 
    with sqlite3.connect("db/database.db"):
        cursor = db.cursor()
        cursor.execute("INSERT INTO users(name, login, password, income, balance, date, dateOfLastUpdate, isUpdateBalanceMounth) VALUES(?,?,?,?,?,?,?,?)", (name, login, password, income, income, date, None, False))
        db.commit()

@eel.expose
def deleteUser(login):
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("DELETE FROM users WHERE login = ?", (login, ))
        db.commit()
        cursor.execute("DELETE FROM expenses WHERE forWhom = ?", (login, ))

@eel.expose
def checkLogin(login, password): #Проверка пользователя 
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT login FROM users WHERE login = ? AND password = ?", (login, password)) #Выборка login по логину и паролю
        info = cursor.fetchall()
        if len(info) == 0: #Если выборка пустая то возвращение False
            return False
        else:
            return True #Если выборка не пустая то возвращение True

@eel.expose
def isLoginFree(login): #Проверка свободен ли логин
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT login FROM users WHERE login = ?", (str(login), )) #Выборка login по логину
        info = cursor.fetchall()
        if len(info) == 0: #Если выборка пустая то возвращает True, то есть логин свободен
            return True
        else:
            return False #Если в выборке что-то есть, то возвращает False

@eel.expose
def changeBalance(balance):
    updateBalanceInDB(balance, userLogin)
    eel.setBalance(balance)

eel.start("index.html", mode="default")