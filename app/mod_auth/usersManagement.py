
from flask import Blueprint, render_template, request, flash, session
from flask import current_app as app
from passlib.hash import sha256_crypt
# from pymysql import escape_string as thwart
from pymysql.converters import escape_string as thwart
import json
from functools import wraps

# from app.mod_auth.scripts.createUser_form import UserCreationForm
# from app.mod_auth.scripts.dbconnect import connection

from .scripts.createUser_form import UserCreationForm
from .scripts.dbconnect import connection

###########

mod_auth = Blueprint(
    'auth', __name__,
    template_folder = 'templates',
    static_folder = 'static',
    static_url_path = '/static/mod_auth'
)

###########

def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash("You need to login first", "warning")
            return render_template("main.html", error_login = True)

    return wrap

def convert2json(cursor):
    row_headers = [x[0] for x in cursor.description]
    result = cursor.fetchall()
    json_data = []
    for res in result:
        json_data.append(dict(zip(row_headers, res)))

    return json_data

###########

@mod_auth.route('/createUser', methods = ['GET', 'POST'])
@login_required
def createUser_page():
    try:
        form = UserCreationForm(request.form)
        if request.method == "POST" and form.validate():
            fullname = form.fullname.data
            institution = form.institution.data
            email = form.email.data
            username = form.username.data
            password = form.password.data
            userlevel = int(form.userlevel.data)

            # password = sha256_crypt.encrypt(str(password))
            password = sha256_crypt.hash(str(password))
            cursor, conn = connection()

            sqlCmd = "SELECT * FROM adt_users WHERE username = (%s)"
            rep = cursor.execute(sqlCmd, thwart(username))

            if int(rep) > 0:
                flash("That username is already taken, please choose another", "warning")
                return render_template('user-management.html', form = form, registred_ok = False)

            else:
                sqlCmd = "INSERT INTO adt_users (username, password, email, fullname, institution, userlevel) VALUES (%s, %s, %s, %s, %s, %s)"
                cursor.execute(sqlCmd,
                              (
                                thwart(username),
                                thwart(password),
                                thwart(email),
                                thwart(fullname),
                                thwart(institution),
                                userlevel
                              )
                            )

                conn.commit()
                cursor.close()
                conn.close()

                flash("New User Added Successfully!", "success")
                return render_template("user-management.html", form = form, registred_ok = True)

        return render_template("user-management.html", form = form, registred_ok = False)

    except Exception as e:
        return(str(e))

###########

@mod_auth.route('/getUsers')
@login_required
def getListOfUsers():
    cursor, conn = connection()
    cursor.execute("SELECT * FROM adt_users")
    json_data = convert2json(cursor)

    cursor.close()
    conn.close()
    return json.dumps(json_data)

###########

@mod_auth.route('/removeUser', methods = ['POST'])
@login_required
def removeUser():
    username =  request.form['username']
    cursor, conn = connection()
    sqlCmd = "SELECT username, userlevel, email, fullname, institution FROM adt_users WHERE username = (%s)"
    rep = cursor.execute(sqlCmd, thwart(username))

    if int(rep) > 0:
        json_data = convert2json(cursor)
        sqlCmd = "DELETE FROM adt_users WHERE username = (%s)"
        cursor.execute(sqlCmd, thwart(username))
        conn.commit()
        cursor.close()
        conn.close()

        return json.dumps(json_data)

    else:
        return json.dumps({'fullname': 'null'})

###########

@mod_auth.route('/login', methods = ["POST"])
def loginUser():
    try:
        username = request.form['username']
        password = request.form['password']
        cursor, conn = connection()

        sqlCmd = "SELECT * FROM adt_users WHERE username = (%s)"
        rep = cursor.execute(sqlCmd, thwart(username))

        if int(rep) > 0:
            json_data = convert2json(cursor)
            json_data = json_data[0]

            if sha256_crypt.verify(password, json_data['password']):
                session['logged_in'] = True
                session['username'] = json_data['username']
                session['userlevel'] = json_data['userlevel']

                flash("You are now logged in.", "success")
                return render_template("main.html", error_login = False)
            else:
                flash("Invalid credentials, try again.", "danger")
                return render_template("main.html", error_login = True)

        else:
            flash("Invalid credentials, try again.", "danger")
            return render_template("main.html", error_login = True)

    except Exception as e:
        flash("Invalid credentials, try again.", "danger")
        return render_template("main.html", error_login = True)

###########

@mod_auth.route("/logout")
@login_required
def logoutUser():
    session.clear()
    flash("You have been logged out.", "success")
    return render_template("main.html", error_login = False)


