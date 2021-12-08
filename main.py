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
            cursor.execute("CREATE TABLE users(username TEXT, income INTEGER, balance FLOAT, date TEXT, id INTEGER PRIMARY KEY AUTOINCREMENT)")
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
            cursor.execute("CREATE TABLE users(username TEXT, income INTEGER, balance FLOAT, date TEXT, id INTEGER PRIMARY KEY AUTOINCREMENT)")
            print("База пользователей не была обнаруженна поэтому была созданна новая по шаблону")
        
        cursor.close()

eel.init("web")
balance = 0 #Баланс
income = 0 #Заработок

@eel.expose
def start():
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()

        #Получение значений из бд
        cursor.execute("SELECT * FROM expenses")
        info = cursor.fetchall()
        for row in info:
            eel.addToTable(row[0],row[1],row[2],row[3]) #Добавление всех данных из бд

        db.commit()
        #Получение и проверка баланса
        getBalance()
        eel.setBalance(balance) #Установка баланса на сайте      

def getBalance(): #Получение баланса и заработка
    global balance, income
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users")
        info = cursor.fetchall()
        for row in info:
            income = row[1] #Заработок
            balance = row[2] #Баланс

def updateBalanceInDB(balance): #Запись нового баланса в бд
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (balance, 1))
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
        updateBalanceInDB(balance) #Обновление значений в бд
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
        updateBalanceInDB(balance) #Обновление значений в бд
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
        updateBalanceInDB(balance) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

@eel.expose
def getUser(): #Получение данных пользователя
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users") #Общая выборка
        info = cursor.fetchall() #Получение ответа
        data = [] #Массив ответа
        for row in info:
            data.append(row[0])
            data.append(row[1])
            data.append(row[3])
            data.append(row[4])

        return data #Отправка ответа в js

@eel.expose
def setUser(username, income, date, id): #Обновление значений пользователя
    global balance
    with sqlite3.connect("db/database.db") as db:
        cursor = db.cursor()
        cursor.execute("SELECT income FROM users WHERE id = ?", (id, )) #Выборка заработка по id пользователя
        balance -= cursor.fetchall()[0][0] #Отнимаем от баланса цену записи
        db.commit()
        cursor.execute("UPDATE users SET username = ?, income = ?, date = ?  WHERE id = ?", (username, income, date, id, )) #Обновление значений по id 
        db.commit()
        balance += float(income) #Прибавляем к балансу цену записи
        updateBalanceInDB(balance) #Обновление значений в бд
        eel.setBalance(balance) #Установка баланса на сайте

eel.start("index.html", mode="default")