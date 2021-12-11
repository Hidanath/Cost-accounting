import eel, sqlite3, datetime
from os import mkdir

try:
    with sqlite3.connect("db/database.db") as db: #Проверка существует ли база данных
        cursor = db.cursor()
        try:
            cursor.execute("SELECT * FROM expenses")
            print("База расходов обнаруженна")
        except: #Если выходит ошибка то создаётся база данных по шаблону
            cursor.execute("CREATE TABLE expenses(title TEXT, price FLOAT, date TEXT, id INTEGER PRIMARY KEY AUTOINCREMENT)")
            print("База расходов не была обнаруженна поэтому была созданна новая по шаблону")

        try:
            cursor.execute("SELECT * FROM users")
            print("База пользователей обнаруженна")
        except: #Если выходит ошибка то создаётся база данных по шаблону
            cursor.execute("CREATE TABLE users(name TEXT, login TEXT, password PASSWORD, income INTEGER, balance FLOAT, date TEXT, id INTEGER PRIMARY KEY AUTOINCREMENT)")
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
            cursor.execute("CREATE TABLE expenses(title TEXT, price FLOAT, date TEXT, id INTEGER PRIMARY KEY AUTOINCREMENT)")
            print("База расходов не была обнаруженна поэтому была созданна новая по шаблону")

        try:
            cursor.execute("SELECT * FROM users")
            print("База пользователей обнаруженна")
        except: #Если выходит ошибка то создаётся база данных по шаблону
            cursor.execute("CREATE TABLE users(name TEXT, login TEXT, password PASSWORD, income INTEGER, balance FLOAT, date TEXT, id INTEGER PRIMARY KEY AUTOINCREMENT)")
            print("База пользователей не была обнаруженна поэтому была созданна новая по шаблону")
        
        cursor.close()

eel.init("web")
balance = 0 #Баланс
income = 0 #Заработок
user = [] #Массив с данными пользователя
userID = 0 #ID пользователя

@eel.expose
def start(id):
    global user, userID
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()

        #Получение значений из бд
        cursor.execute("SELECT * FROM expenses")
        info = cursor.fetchall()
        for row in info:
            eel.addToTable(row[0],row[1],row[2],row[3]) #Добавление всех данных из бд

        db.commit()
        #Получение и установка баланса
        user = getUser(id) #Получение данных пользователя
        userID = user[6]
        getBalance(id)
        eel.setBalance(balance) #Установка баланса на сайте      

def getBalance(id): #Получение баланса и заработка
    global balance, income
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT balance, income FROM users WHERE id = ?", (id, ))
        info = cursor.fetchall()
        balance = info[0][0] #Баланс
        income = info[0][1] #Заработок

def updateBalanceInDB(balance, id): #Запись нового баланса в бд
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (balance, id))
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
        updateBalanceInDB(balance, userID) #Обновление значений в бд
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
        updateBalanceInDB(balance, userID) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

@eel.expose
def add(title, price): #Добавление новой записи
    global balance
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        data = (
            str(title),
            float(price),
            str(datetime.date.today())
        )
        cursor.execute(f"INSERT INTO expenses(title, price, date) VALUES(?,?,?)", data)
        db.commit()

        #Получение значений из бд
        cursor.execute("SELECT * FROM expenses") #Общая выборка по базе
        info = cursor.fetchall() #Получение ответа
        iteration = 0 #Количество итераций
        for row in info: #Перебор ответа
            if iteration == len(info)-1: #Если итерация == последниму элементу то добавление в таблицу новую строку
                eel.addToTable(row[0],row[1],row[2],row[3]) #Добавление данных из бд
            iteration += 1

        balance -= float(price) #Отнятие от баланса цены записи
        db.commit()
        updateBalanceInDB(balance, userID) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

@eel.expose
def getUser(id): #Получение данных пользователя
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (id, )) #Общая выборка
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

        return data #Отправка ответа в js

@eel.expose
def setUser(name, login, password, income, date, id): #Обновление значений пользователя
    global balance
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT income FROM users WHERE id = ?", (id, )) #Выборка заработка по id пользователя
        balance -= cursor.fetchall()[0][0] #Отнимаем от баланса цену записи
        db.commit()
        cursor.execute("UPDATE users SET name = ?, login = ?, password = ?, income = ?, date = ?  WHERE id = ?", (name, login, password, income, date, id, )) #Обновление значений по id 
        db.commit()
        balance += float(income) #Прибавляем к балансу цену записи
        updateBalanceInDB(balance, userID) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

@eel.expose
def newUser(name, login, password, income, date): #Регистрация нового пользователя
    with sqlite3.connect("db/database.db"):
        cursor = db.cursor()
        cursor.execute("INSERT INTO users(name, login, password, income, balance, date) VALUES(?,?,?,?,?,?)", (name, login, password, income, income, date))
        db.commit()
        cursor.execute("SELECT id FROM users WHERE login = ? AND income = ? AND balance = ? AND date = ? ", (login, income, income, date))
        id = cursor.fetchall()[0][0]
        return id #Отправка в js id пользователя

@eel.expose
def checkLogin(login, password): #Проверка логина
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE login = ? AND password = ?", (login, password)) #Выборка id по логину и паролю
        info = cursor.fetchall()
        if len(info) == 0: #Если выборка пустая то возвращение False
            return False
        else:
            return [True, info[0][0]] #Если выборка не пустая то возвращение True и id пользователя

@eel.expose
def isLoginFree(login): #Проверка свободен ли логин
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE login = ?", (str(login), )) #Выборка id по логину
        info = cursor.fetchall()
        if len(info) == 0: #Если выборка пустая то возвращает True, то есть логин свободен
            return True
        else:
            return False #Если в выборке что-то есть, то возвращает False

eel.start("index.html", mode="default")